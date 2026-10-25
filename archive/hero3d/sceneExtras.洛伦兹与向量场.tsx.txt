"use client";

/**
 * 进阶场景：洛伦兹风暴眼 / 向量场之茧。
 * 纯 Shader/实例化实现，无后处理；DPR≤1.5；离开视口由 HeroScene 暂停。
 */

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

import { ANIM_SPEED } from "./interaction";

/* ================================================================
 * 洛伦兹风暴眼：真实洛伦兹吸引子双翼 + 层叠玻璃光带 + 彗星流点
 * ================================================================ */

function buildLorenz(count: number, scale: number): Float32Array {
  const pts = new Float32Array(count * 3);
  let x = 0.1,
    y = 0,
    z = 0;
  const sigma = 10,
    rho = 28,
    beta = 8 / 3,
    dt = 0.004;
  for (let i = 0; i < 1200; i++) {
    const dx = sigma * (y - x),
      dy = x * (rho - z) - y,
      dz = x * y - beta * z;
    x += dx * dt;
    y += dy * dt;
    z += dz * dt;
  }
  for (let i = 0; i < count; i++) {
    const dx = sigma * (y - x),
      dy = x * (rho - z) - y,
      dz = x * y - beta * z;
    x += dx * dt;
    y += dy * dt;
    z += dz * dt;
    pts[i * 3] = x * scale;
    pts[i * 3 + 1] = (z - 25) * scale; // 交换 y/z：双翼面向镜头并居中
    pts[i * 3 + 2] = y * scale;
  }
  return pts;
}

const LORENZ_LINE_VERT = /* glsl */ `
  uniform float uTime;
  attribute float aT;
  attribute float aRibbon;
  varying float vT;
  varying float vRibbon;
  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.25 + aT * 6.2831 + aRibbon * 2.1) * 0.14;
    vT = aT;
    vRibbon = aRibbon;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const LORENZ_LINE_FRAG = /* glsl */ `
  uniform float uTime;
  varying float vT;
  varying float vRibbon;
  void main() {
    vec3 base = mix(vec3(0.42, 0.66, 0.94), vec3(0.075, 0.76, 0.76), fract(vRibbon * 0.618));
    float flow = fract(vT * 3.0 - uTime * 0.045 + vRibbon * 0.37);
    float whiteCore = smoothstep(0.12, 0.0, abs(flow - 0.5) - 0.38);
    vec3 col = mix(base, vec3(0.92, 0.97, 1.0), whiteCore * 0.85);
    gl_FragColor = vec4(col, 0.10 + 0.16 * whiteCore);
  }
`;

const LORENZ_FLOW_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aT;
  attribute float aRibbon;
  attribute float aSize;
  varying float vT;
  varying float vRibbon;
  void main() {
    vT = aT;
    vRibbon = aRibbon;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio * (320.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const LORENZ_FLOW_FRAG = /* glsl */ `
  uniform float uTime;
  varying float vT;
  varying float vRibbon;
  void main() {
    float f = fract(vT - uTime * (0.012 + 0.005 * fract(vRibbon * 0.317)) - vRibbon * 0.21);
    float comet = pow(1.0 - f, 4.0);
    float d = length(gl_PointCoord - vec2(0.5));
    float alpha = smoothstep(0.5, 0.08, d) * comet * 0.85;
    vec3 col = mix(vec3(0.55, 0.9, 0.95), vec3(0.95, 0.99, 1.0), comet);
    gl_FragColor = vec4(col, alpha);
  }
`;

function LorenzLayer({ quality }: { quality: "high" | "medium" }) {
  const groupRef = useRef<THREE.Group>(null);
  const ribbons = quality === "high" ? 16 : 10;

  const { lines, flow, geometry, lineMat, flowGeo, flowMat } = useMemo(() => {
    const N = 2400;
    const base = buildLorenz(N, 0.42);

    const linePos: number[] = [];
    const lineT: number[] = [];
    const lineR: number[] = [];
    const flowPos: number[] = [];
    const flowT: number[] = [];
    const flowR: number[] = [];
    const flowS: number[] = [];

    const m = new THREE.Matrix4();
    const v = new THREE.Vector3();
    for (let r = 0; r < ribbons; r++) {
      const rotY = (r - (ribbons - 1) / 2) * 0.14;
      const s = 0.92 + 0.16 * ((r * 0.618) % 1);
      m.makeRotationY(rotY);
      m.scale(new THREE.Vector3(s, s, s));
      const shift = (r * 137) % 4;
      for (let i = 0; i < N - 1; i++) {
        for (const k of [i, i + 1]) {
          v.set(base[k * 3], base[k * 3 + 1], base[k * 3 + 2]).applyMatrix4(m);
          linePos.push(v.x, v.y, v.z);
          lineT.push(k / N);
          lineR.push(r);
        }
        if ((i + shift) % 4 === 0) {
          v.set(base[i * 3], base[i * 3 + 1], base[i * 3 + 2]).applyMatrix4(m);
          flowPos.push(v.x, v.y, v.z);
          flowT.push(i / N);
          flowR.push(r);
          flowS.push(1.6 + Math.random() * 1.6);
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(linePos), 3));
    geometry.setAttribute("aT", new THREE.BufferAttribute(new Float32Array(lineT), 1));
    geometry.setAttribute("aRibbon", new THREE.BufferAttribute(new Float32Array(lineR), 1));

    const flowGeo = new THREE.BufferGeometry();
    flowGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(flowPos), 3));
    flowGeo.setAttribute("aT", new THREE.BufferAttribute(new Float32Array(flowT), 1));
    flowGeo.setAttribute("aRibbon", new THREE.BufferAttribute(new Float32Array(flowR), 1));
    flowGeo.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(flowS), 1));

    const lineMat = new THREE.ShaderMaterial({
      vertexShader: LORENZ_LINE_VERT,
      fragmentShader: LORENZ_LINE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 } },
    });
    const flowMat = new THREE.ShaderMaterial({
      vertexShader: LORENZ_FLOW_VERT,
      fragmentShader: LORENZ_FLOW_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 } },
    });

    const lines = new THREE.LineSegments(geometry, lineMat);
    lines.frustumCulled = false;
    const flow = new THREE.Points(flowGeo, flowMat);
    flow.frustumCulled = false;
    return { lines, flow, geometry, lineMat, flowGeo, flowMat };
  }, [ribbons]);

  useEffect(
    () => () => {
      geometry.dispose();
      flowGeo.dispose();
      lineMat.dispose();
      flowMat.dispose();
    },
    [geometry, flowGeo, lineMat, flowMat],
  );

  useFrame(({ clock, gl }) => {
    const t = clock.elapsedTime * ANIM_SPEED;
    lineMat.uniforms.uTime.value = t;
    flowMat.uniforms.uTime.value = t;
    flowMat.uniforms.uPixelRatio.value = gl.getPixelRatio();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.03;
      const breathe = 1 + 0.025 * Math.sin(t * 0.2);
      groupRef.current.scale.setScalar(breathe);
    }
  });

  return (
    <group ref={groupRef} rotation={[0.12, 0, 0]}>
      <primitive object={lines} />
      <primitive object={flow} />
    </group>
  );
}

/* ================================================================
 * 向量场之茧：curl noise 流线（边缘密、中心疏）+ 能量粒子
 * ================================================================ */

function fieldVec(x: number, y: number, z: number): [number, number, number] {
  const ax = (px: number, py: number, pz: number) =>
    Math.sin(px * 0.32 + 1.7) * Math.cos(py * 0.28) + 0.6 * Math.sin(pz * 0.21 - 0.4);
  const ay = (px: number, py: number, pz: number) =>
    Math.sin(py * 0.3 - 0.8) * Math.cos(pz * 0.34) + 0.6 * Math.sin(px * 0.19 + 0.9);
  const az = (px: number, py: number, pz: number) =>
    Math.sin(pz * 0.31 + 0.5) * Math.cos(px * 0.29) + 0.6 * Math.sin(py * 0.23 + 1.1);
  const e = 0.35;
  const vx = ay(x, y + e, z) - ay(x, y - e, z) - (az(x, y, z + e) - az(x, y, z - e));
  const vy = az(x + e, y, z) - az(x - e, y, z) - (ax(x, y, z + e) - ax(x, y, z - e));
  const vz = ax(x, y + e, z) - ax(x, y - e, z) - (ay(x + e, y, z) - ay(x - e, y, z));
  return [vx / (2 * e), vy / (2 * e), vz / (2 * e)];
}

const FIELD_VERT = /* glsl */ `
  uniform float uTime;
  attribute float aT;
  attribute float aSeed;
  attribute float aR;
  attribute float aZ;
  varying float vT;
  varying float vSeed;
  varying float vR;
  varying float vZ;
  void main() {
    vec3 p = position + vec3(
      sin(uTime * 0.4 + aSeed) * 0.18,
      cos(uTime * 0.37 + aSeed * 1.3) * 0.18,
      sin(uTime * 0.33 + aSeed * 0.7) * 0.18
    );
    vT = aT;
    vSeed = aSeed;
    vR = aR;
    vZ = aZ;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const FIELD_FRAG = /* glsl */ `
  uniform float uTime;
  varying float vT;
  varying float vSeed;
  varying float vR;
  varying float vZ;
  void main() {
    // 中央稀疏：靠近中心的场线淡出
    float centerFade = smoothstep(3.5, 8.5, vR);
    float shimmer = 0.5 + 0.5 * sin(vT * 6.2831 + uTime * 0.5 + vSeed * 6.0);
    vec3 deep = vec3(0.09, 0.24, 0.55);
    vec3 cyan = vec3(0.075, 0.76, 0.76);
    vec3 col = mix(deep, cyan, smoothstep(8.0, 16.0, vR));
    float alpha = (0.10 + 0.14 * shimmer) * centerFade * (0.7 + 0.3 * vZ);
    gl_FragColor = vec4(col, alpha);
  }
`;

function FieldLayer({ quality }: { quality: "high" | "medium" }) {
  const streamCount = quality === "high" ? 3000 : 1700;
  const particleCount = quality === "high" ? 112 : 60;

  const { lines, streams, geometry, material, energyGeo } = useMemo(() => {
    const pos: number[] = [];
    const aT: number[] = [];
    const aSeed: number[] = [];
    const aR: number[] = [];
    const aZ: number[] = [];
    const streams: Float32Array[] = [];

    for (let s = 0; s < streamCount; s++) {
      const r = 7 + 12 * Math.pow(Math.random(), 1.4);
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      let px = r * Math.sin(ph) * Math.cos(th);
      let py = r * Math.sin(ph) * Math.sin(th) * 0.75;
      let pz = r * Math.cos(ph) * 0.6 - 1;
      const seed = Math.random() * 6.283;
      const steps = 8 + Math.floor(Math.random() * 6);
      const h = 0.55;
      const stream = new Float32Array((steps + 1) * 3);
      for (let i = 0; i <= steps; i++) {
        stream[i * 3] = px;
        stream[i * 3 + 1] = py;
        stream[i * 3 + 2] = pz;
        const radial = Math.sqrt(px * px + py * py + (pz + 1) * (pz + 1));
        const nz = (pz + 12) / 24;
        if (i > 0) {
          pos.push(stream[(i - 1) * 3], stream[(i - 1) * 3 + 1], stream[(i - 1) * 3 + 2], px, py, pz);
          aT.push((i - 1) / steps, i / steps);
          aSeed.push(seed, seed);
          aR.push(radial, radial);
          aZ.push(nz, nz);
        }
        const [vx, vy, vz] = fieldVec(px, py, pz);
        const len = Math.hypot(vx, vy, vz) || 1;
        px += (vx / len) * h;
        py += (vy / len) * h;
        pz += (vz / len) * h;
      }
      streams.push(stream);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3));
    geometry.setAttribute("aT", new THREE.BufferAttribute(new Float32Array(aT), 1));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(new Float32Array(aSeed), 1));
    geometry.setAttribute("aR", new THREE.BufferAttribute(new Float32Array(aR), 1));
    geometry.setAttribute("aZ", new THREE.BufferAttribute(new Float32Array(aZ), 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: FIELD_VERT,
      fragmentShader: FIELD_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 } },
    });
    const lines = new THREE.LineSegments(geometry, material);
    lines.frustumCulled = false;

    const energyGeo = new THREE.BufferGeometry();
    energyGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(particleCount * 3), 3));
    const phases = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      phases[i] = Math.random() * 6.283;
      sizes[i] = 2.4 + Math.random() * 1.6;
    }
    energyGeo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    energyGeo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    return { lines, streams, geometry, material, energyGeo };
  }, [streamCount, particleCount]);

  const energyMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: `uniform float uTime; uniform float uPixelRatio; attribute float aSize; attribute float aPhase; varying float vTw;
          void main(){ vTw = 0.7 + 0.3 * sin(uTime * 1.2 + aPhase); vec4 mv = modelViewMatrix * vec4(position,1.0);
          gl_PointSize = aSize * uPixelRatio * (320.0 / -mv.z); gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `varying float vTw; void main(){ float d = length(gl_PointCoord - vec2(0.5));
          float a = smoothstep(0.5, 0.05, d); gl_FragColor = vec4(vec3(0.9, 0.98, 1.0), a * vTw * 0.9); }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 } },
      }),
    [],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      energyGeo.dispose();
      material.dispose();
      energyMat.dispose();
    },
    [geometry, energyGeo, material, energyMat],
  );

  const particles = useMemo(
    () =>
      Array.from({ length: particleCount }, () => ({
        stream: Math.floor(Math.random() * streams.length),
        param: Math.random(),
        speed: 0.12 + Math.random() * 0.16,
      })),
    [particleCount, streams],
  );

  useFrame(({ clock, gl }) => {
    const t = clock.elapsedTime * ANIM_SPEED;
    material.uniforms.uTime.value = t;
    energyMat.uniforms.uTime.value = t;
    energyMat.uniforms.uPixelRatio.value = gl.getPixelRatio();

    const attr = energyGeo.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    particles.forEach((p, i) => {
      p.param += p.speed * 0.032;
      if (p.param > 1) {
        p.param = 0;
        p.stream = Math.floor(Math.random() * streams.length);
      }
      const s = streams[p.stream];
      const n = s.length / 3 - 1;
      const f = p.param * n;
      const i0 = Math.floor(f);
      const i1 = Math.min(n, i0 + 1);
      const k2 = f - i0;
      arr[i * 3] = s[i0 * 3] + (s[i1 * 3] - s[i0 * 3]) * k2;
      arr[i * 3 + 1] = s[i0 * 3 + 1] + (s[i1 * 3 + 1] - s[i0 * 3 + 1]) * k2;
      arr[i * 3 + 2] = s[i0 * 3 + 2] + (s[i1 * 3 + 2] - s[i0 * 3 + 2]) * k2;
    });
    attr.needsUpdate = true;
  });

  return (
    <>
      <primitive object={lines} />
      <points geometry={energyGeo} material={energyMat} frustumCulled={false} />
    </>
  );
}

export { LorenzLayer, FieldLayer };
