"use client";

/**
 * 五个进阶 Hero 场景层（纯 Shader/实例化实现，无后处理）：
 * 统一遵循——中心镂空遮罩由 Loader 处理 / DPR≤1.5 / 离开视口暂停 / reduced-motion 整体降级；
 * 色彩纪律：深海军蓝 / 藏青 / 青 / 冰蓝 / 冷白，无紫粉霓虹。
 */

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/* ================================================================
 * 1. 洛伦兹风暴眼：真实洛伦兹吸引子双翼 + 层叠玻璃光带 + 彗星流点
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
  const ribbons = quality === "high" ? 9 : 6;

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
      const shift = (r * 137) % 9;
      for (let i = 0; i < N - 1; i++) {
        for (const k of [i, i + 1]) {
          v.set(base[k * 3], base[k * 3 + 1], base[k * 3 + 2]).applyMatrix4(m);
          linePos.push(v.x, v.y, v.z);
          lineT.push(k / N);
          lineR.push(r);
        }
        if ((i + shift) % 9 === 0) {
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
    const t = clock.elapsedTime;
    lineMat.uniforms.uTime.value = t;
    flowMat.uniforms.uTime.value = t;
    flowMat.uniforms.uPixelRatio.value = gl.getPixelRatio();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.03;
      const breathe = 1 + 0.025 * Math.sin(t * 0.2); // ~31s 呼吸
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
 * 2. 超立方折光门：真 4D 旋转投影 + 磨砂玻璃棱柱（实例化菲涅尔）
 * ================================================================ */

const FROSTED_VERT = /* glsl */ `
  varying float vF;
  void main() {
    #ifdef USE_INSTANCING
      mat4 im = instanceMatrix;
    #else
      mat4 im = mat4(1.0);
    #endif
    vec4 mv = modelViewMatrix * im * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * mat3(im) * normal);
    vF = pow(1.0 - abs(dot(n, normalize(-mv.xyz))), 2.4);
    gl_Position = projectionMatrix * mv;
  }
`;

const FROSTED_FRAG = /* glsl */ `
  varying float vF;
  void main() {
    vec3 coldWhite = vec3(0.85, 0.93, 1.0);
    vec3 cyan = vec3(0.075, 0.76, 0.76);
    vec3 col = mix(coldWhite, cyan, 0.45);
    gl_FragColor = vec4(col, 0.05 + vF * 0.8);
  }
`;

function project4d(v: number[], a: number, b: number): THREE.Vector3 {
  // XW 平面旋转 a，ZW 平面旋转 b，透视投影到 3D
  const [x, y, z, w] = v;
  const x1 = x * Math.cos(a) - w * Math.sin(a);
  const w1 = x * Math.sin(a) + w * Math.cos(a);
  const z1 = z * Math.cos(b) - w1 * Math.sin(b);
  const w2 = z * Math.sin(b) + w1 * Math.cos(b);
  const k = 2.8 / (3.4 - w2);
  return new THREE.Vector3(x1 * k, y * k, z1 * k);
}

function TesseractLayer({ quality }: { quality: "high" | "medium" }) {
  const edgesRef = useRef<THREE.InstancedMesh>(null);
  const shardsRef = useRef<THREE.InstancedMesh>(null);
  const vertsRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);

  const { vertices, edges, frostMat, shardCount, shards, edgeGeo, shardGeo } = useMemo(() => {
    // 16 个 4D 顶点，32 条棱（按一个坐标不同配对）
    const vertices: number[][] = [];
    for (let i = 0; i < 16; i++) {
      vertices.push([(i & 1) * 2 - 1, (i & 2) * 2 - 1, (i & 4) * 2 - 1, (i & 8) * 2 - 1]);
    }
    const edges: Array<[number, number]> = [];
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        const d = i ^ j;
        if ((d & (d - 1)) === 0) edges.push([i, j]);
      }
    }
    const frostMat = new THREE.ShaderMaterial({
      vertexShader: FROSTED_VERT,
      fragmentShader: FROSTED_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const edgeGeo = new THREE.BoxGeometry(0.085, 1, 0.085);
    const shardGeo = new THREE.OctahedronGeometry(1, 0);
    // 环绕碎片：半径 / 相位 / 转速 / 尺寸 / 翻滚
    const shardCount = quality === "high" ? 18 : 10;
    const shards = Array.from({ length: shardCount }, () => ({
      radius: 8.5 + Math.random() * 6,
      phase: Math.random() * Math.PI * 2,
      speed: 0.02 + Math.random() * 0.05,
      y: (Math.random() - 0.5) * 10,
      scale: 0.22 + Math.random() * 0.42,
      tumble: Math.random() * 6.28,
    }));
    return { vertices, edges, frostMat, shardCount, shards, edgeGeo, shardGeo };
  }, [quality]);

  useEffect(
    () => () => {
      frostMat.dispose();
      edgeGeo.dispose();
      shardGeo.dispose();
    },
    [frostMat, edgeGeo, shardGeo],
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const yAxis = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const projected = useMemo(() => Array.from({ length: 16 }, () => new THREE.Vector3()), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const a4 = t * (Math.PI * 2 / 80); // 60–90s 完成一次四维变化
    const b4 = t * (Math.PI * 2 / 117);
    for (let i = 0; i < 16; i++) projected[i].copy(project4d(vertices[i], a4, b4));

    // 顶点微光
    const pts = vertsRef.current;
    if (pts) {
      const attr = pts.geometry.getAttribute("position") as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      for (let i = 0; i < 16; i++) {
        arr[i * 3] = projected[i].x;
        arr[i * 3 + 1] = projected[i].y;
        arr[i * 3 + 2] = projected[i].z;
      }
      attr.needsUpdate = true;
      pts.frustumCulled = false;
    }

    // 32 条棱 → 实例化玻璃棱柱
    const inst = edgesRef.current;
    if (inst) {
      for (let e = 0; e < edges.length; e++) {
        const [i, j] = edges[e];
        const pa = projected[i];
        const pb = projected[j];
        const mid = pa.clone().add(pb).multiplyScalar(0.5);
        const dir = pb.clone().sub(pa);
        const len = dir.length() + 0.06;
        dummy.position.copy(mid);
        dummy.quaternion.setFromUnitVectors(yAxis, dir.normalize());
        dummy.scale.set(1, len, 1);
        dummy.updateMatrix();
        inst.setMatrixAt(e, dummy.matrix);
      }
      inst.instanceMatrix.needsUpdate = true;
      inst.frustumCulled = false;
    }

    // 碎片公转
    const sh = shardsRef.current;
    if (sh) {
      shards.forEach((s, i) => {
        const ang = s.phase + t * s.speed;
        dummy.position.set(Math.cos(ang) * s.radius, s.y + Math.sin(t * 0.1 + s.tumble) * 0.8, Math.sin(ang) * s.radius * 0.7 - 2);
        dummy.rotation.set(s.tumble + t * 0.1, ang, s.tumble * 0.7);
        dummy.scale.setScalar(s.scale);
        dummy.updateMatrix();
        sh.setMatrixAt(i, dummy.matrix);
      });
      sh.instanceMatrix.needsUpdate = true;
      sh.frustumCulled = false;
    }

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.05) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -2]}>
      <instancedMesh ref={edgesRef} args={[edgeGeo, frostMat, 32]} frustumCulled={false} />
      <instancedMesh ref={shardsRef} args={[shardGeo, frostMat, shardCount]} frustumCulled={false} />
      <points ref={vertsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[new Float32Array(48), 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={2.6}
          sizeAttenuation={false}
          color="#bfe8ff"
          transparent
          opacity={0.85}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

/* ================================================================
 * 3. 算法织机：经纬丝线织物（GPU 起伏）+ 滑行光梭（纯 GPU 路径）
 * ================================================================ */

const LOOM_VERT = /* glsl */ `
  uniform float uTime;
  attribute float aU;
  attribute float aV;
  attribute float aKind;
  varying float vU;
  varying float vV;
  varying float vKind;
  void main() {
    vec3 p = position;
    vec3 dir = normalize(vec3(p.x, 0.0, p.z + 2.5));
    p += dir * (sin(aU * 9.0 + uTime * 0.31 + aV * 1.3) * 0.4 + sin(aV * 6.0 - uTime * 0.23 + aKind * 3.0) * 0.3);
    p.y += sin(uTime * 0.2 + aU * 12.0) * 0.18;
    vU = aU;
    vV = aV;
    vKind = aKind;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const LOOM_FRAG = /* glsl */ `
  varying float vU;
  varying float vV;
  varying float vKind;
  void main() {
    float h = fract(vU * 7.31 + vV * 3.77 + vKind * 0.5);
    vec3 col = mix(vec3(0.075, 0.76, 0.76), vec3(0.56, 0.82, 1.0), h);
    col = mix(col, vec3(0.93, 0.97, 1.0), step(0.93, fract(h * 7.0)) * 0.6);
    float fadeV = smoothstep(0.0, 0.12, vV) * smoothstep(1.0, 0.88, vV);
    float fadeU = smoothstep(0.0, 0.06, vU) * smoothstep(1.0, 0.94, vU);
    float moire = 0.82 + 0.18 * sin(vU * 60.0) * sin(vV * 80.0);
    gl_FragColor = vec4(col, (0.10 + 0.08 * moire) * fadeV * fadeU);
  }
`;

const SHUTTLE_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aTrail;
  attribute float aSize;
  varying float vA;
  void main() {
    float u = fract(uTime * 0.043);
    float uu = u - aTrail * 0.012;
    float v = sin(uTime * 0.13) * 0.5 + 0.5;
    float th = 2.007 + uu * 4.363;
    float R = 13.8 + 0.9 * sin(uu * 3.1416);
    vec3 p = vec3(cos(th) * R, (v - 0.5) * 9.2 + 0.5 * sin(uu * 6.2832 + th), sin(th) * 0.62 * R - 2.5);
    vec3 dir = normalize(vec3(p.x, 0.0, p.z + 2.5));
    p += dir * 0.4;
    vA = pow(1.0 - aTrail, 2.2);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = aSize * uPixelRatio * (320.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const SHUTTLE_FRAG = /* glsl */ `
  varying float vA;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    float alpha = smoothstep(0.5, 0.06, d) * vA * 0.95;
    gl_FragColor = vec4(vec3(0.93, 0.98, 1.0), alpha);
  }
`;

function loomPoint(u01: number, v01: number): [number, number, number] {
  const th = 2.007 + u01 * 4.363;
  const R = 13.8 + 0.9 * Math.sin(u01 * Math.PI);
  return [Math.cos(th) * R, (v01 - 0.5) * 9.2 + 0.5 * Math.sin(u01 * 6.2832 + th), Math.sin(th) * 0.62 * R - 2.5];
}

function LoomLayer({ quality }: { quality: "high" | "medium" }) {
  const { fabric, shuttle, geometry, fabricMat, shuttleGeo, shuttleMat } = useMemo(() => {
    const warpCount = quality === "high" ? 150 : 90;
    const weftCount = quality === "high" ? 96 : 60;
    const pos: number[] = [];
    const aU: number[] = [];
    const aV: number[] = [];
    const aK: number[] = [];

    const pushSeg = (p0: [number, number, number], p1: [number, number, number], u: number, v: number, kind: number) => {
      pos.push(...p0, ...p1);
      aU.push(u, u);
      aV.push(v, v);
      aK.push(kind, kind);
    };
    // 经线（固定 u，沿 v）
    for (let w = 0; w < warpCount; w++) {
      const u = w / (warpCount - 1);
      let prev = loomPoint(u, 0);
      for (let s = 1; s <= 16; s++) {
        const cur = loomPoint(u, s / 16);
        pushSeg(prev, cur, u, s / 16, 0);
        prev = cur;
      }
    }
    // 纬线（固定 v，沿 u）
    for (let w = 0; w < weftCount; w++) {
      const v = w / (weftCount - 1);
      let prev = loomPoint(0, v);
      for (let s = 1; s <= 46; s++) {
        const cur = loomPoint(s / 46, v);
        pushSeg(prev, cur, s / 46, v, 1);
        prev = cur;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3));
    geometry.setAttribute("aU", new THREE.BufferAttribute(new Float32Array(aU), 1));
    geometry.setAttribute("aV", new THREE.BufferAttribute(new Float32Array(aV), 1));
    geometry.setAttribute("aKind", new THREE.BufferAttribute(new Float32Array(aK), 1));

    const fabricMat = new THREE.ShaderMaterial({
      vertexShader: LOOM_VERT,
      fragmentShader: LOOM_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 } },
    });
    const fabric = new THREE.LineSegments(geometry, fabricMat);
    fabric.frustumCulled = false;

    // 光梭：头 + 25 节尾迹（路径在 shader 内计算，零 CPU）
    const M = 26;
    const sPos = new Float32Array(M * 3);
    const sTrail = new Float32Array(M);
    const sSize = new Float32Array(M);
    for (let i = 0; i < M; i++) {
      sTrail[i] = i / (M - 1);
      sSize[i] = i === 0 ? 5.2 : 1.6 + 1.8 * (1 - sTrail[i]);
    }
    const shuttleGeo = new THREE.BufferGeometry();
    shuttleGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
    shuttleGeo.setAttribute("aTrail", new THREE.BufferAttribute(sTrail, 1));
    shuttleGeo.setAttribute("aSize", new THREE.BufferAttribute(sSize, 1));
    const shuttleMat = new THREE.ShaderMaterial({
      vertexShader: SHUTTLE_VERT,
      fragmentShader: SHUTTLE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 } },
    });
    const shuttle = new THREE.Points(shuttleGeo, shuttleMat);
    shuttle.frustumCulled = false;

    return { fabric, shuttle, geometry, fabricMat, shuttleGeo, shuttleMat };
  }, [quality]);

  useEffect(
    () => () => {
      geometry.dispose();
      shuttleGeo.dispose();
      fabricMat.dispose();
      shuttleMat.dispose();
    },
    [geometry, shuttleGeo, fabricMat, shuttleMat],
  );

  useFrame(({ clock, gl }) => {
    const t = clock.elapsedTime;
    fabricMat.uniforms.uTime.value = t;
    shuttleMat.uniforms.uTime.value = t;
    shuttleMat.uniforms.uPixelRatio.value = gl.getPixelRatio();
  });

  return (
    <>
      <primitive object={fabric} />
      <primitive object={shuttle} />
    </>
  );
}

/* ================================================================
 * 4. 向量场之茧：curl noise 流线（边缘密、中心疏）+ 能量粒子
 * ================================================================ */

function fieldVec(x: number, y: number, z: number): [number, number, number] {
  const ax = (px: number, py: number, pz: number) =>
    Math.sin(px * 0.32 + 1.7) * Math.cos(py * 0.28) +
    0.6 * Math.sin(pz * 0.21 - 0.4);
  const ay = (px: number, py: number, pz: number) =>
    Math.sin(py * 0.3 - 0.8) * Math.cos(pz * 0.34) +
    0.6 * Math.sin(px * 0.19 + 0.9);
  const az = (px: number, py: number, pz: number) =>
    Math.sin(pz * 0.31 + 0.5) * Math.cos(px * 0.29) +
    0.6 * Math.sin(py * 0.23 + 1.1);
  const e = 0.35;
  const vx = (ay(x, y + e, z) - ay(x, y - e, z)) - (az(x, y, z + e) - az(x, y, z - e));
  const vy = (az(x + e, y, z) - az(x - e, y, z)) - (ax(x, y, z + e) - ax(x, y, z - e));
  const vz = (ax(x, y + e, z) - ax(x, y - e, z)) - (ay(x + e, y, z) - ay(x - e, y, z));
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
  const streamCount = quality === "high" ? 1500 : 850;
  const particleCount = quality === "high" ? 56 : 30;

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

    // 能量粒子（CPU 沿流线插值，数量极少）
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
    const t = clock.elapsedTime;
    material.uniforms.uTime.value = t;
    energyMat.uniforms.uTime.value = t;
    energyMat.uniforms.uPixelRatio.value = gl.getPixelRatio();

    const attr = energyGeo.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    particles.forEach((p, i) => {
      p.param += p.speed * 0.016;
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

/* ================================================================
 * 5. 日蚀 · 深空磁场：暗天体 + 冰青锐缘 + 日冕流线 + 磁弧
 * ================================================================ */

const ECLIPSE_CENTER = new THREE.Vector3(-6.8, 5.6, -7.5);

const CORONA_VERT = /* glsl */ `
  uniform float uTime;
  attribute float aAng;
  attribute float aR0;
  attribute float aT;
  attribute float aLen;
  attribute float aSeed;
  varying float vT;
  varying float vSeed;
  void main() {
    float breath = 1.0 + 0.10 * sin(uTime * 0.314); // ~20s 呼吸
    float r = aR0 + aT * aLen * breath;
    float ang = aAng + aT * 0.25;
    vec3 p = vec3(cos(ang) * r, sin(ang) * r, 0.0);
    vT = aT;
    vSeed = aSeed;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const CORONA_FRAG = /* glsl */ `
  uniform float uTime;
  varying float vT;
  varying float vSeed;
  void main() {
    float pulse = 0.30 + 0.30 * sin(uTime * 0.5 + vSeed * 7.0);
    vec3 cyan = vec3(0.075, 0.76, 0.76);
    vec3 ice = vec3(0.88, 0.96, 1.0);
    vec3 col = mix(cyan, ice, fract(vSeed * 0.618));
    gl_FragColor = vec4(col, pulse * (1.0 - vT));
  }
`;

const RIM_VERT = /* glsl */ `
  varying float vR;
  void main() {
    vR = length(position.xy);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const RIM_FRAG = /* glsl */ `
  varying float vR;
  void main() {
    float t = clamp((vR - 5.42) / (6.6 - 5.42), 0.0, 1.0);
    float alpha = pow(1.0 - t, 2.4) * 0.6;
    gl_FragColor = vec4(vec3(0.5, 0.9, 0.95), alpha);
  }
`;

function EclipseLayer({ quality }: { quality: "high" | "medium" }) {
  const coronaGroupRef = useRef<THREE.Group>(null);
  const groupRef = useRef<THREE.Group>(null);

  const { disc, rimSharp, rimSoft, corona, coronaMat, arcs, arcMat, disposables } = useMemo(() => {
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(5.3, 72),
      new THREE.MeshBasicMaterial({ color: "#04101f" }),
    );

    const rimSharp = new THREE.Mesh(
      new THREE.RingGeometry(5.3, 5.4, 160),
      new THREE.MeshBasicMaterial({
        color: "#dff4ff",
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );

    const rimSoft = new THREE.Mesh(
      new THREE.RingGeometry(5.42, 6.6, 160),
      new THREE.ShaderMaterial({
        vertexShader: RIM_VERT,
        fragmentShader: RIM_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    );

    // 日冕流线：角度/半径/长度打包进 attribute，位置在 shader 中算
    const n = quality === "high" ? 400 : 230;
    const pos = new Float32Array(n * 2 * 3);
    const aAng = new Float32Array(n * 2);
    const aR0 = new Float32Array(n * 2);
    const aT = new Float32Array(n * 2);
    const aLen = new Float32Array(n * 2);
    const aSeed = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2;
      const r0 = 5.55 + Math.random() * 0.25;
      const len = 0.5 + Math.pow(Math.random(), 2.2) * 2.8;
      const seed = Math.random() * 6.283;
      for (let k = 0; k < 2; k++) {
        const idx = i * 2 + k;
        aAng[idx] = ang;
        aR0[idx] = r0;
        aT[idx] = k;
        aLen[idx] = len;
        aSeed[idx] = seed;
      }
    }
    const coronaGeo = new THREE.BufferGeometry();
    coronaGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    coronaGeo.setAttribute("aAng", new THREE.BufferAttribute(aAng, 1));
    coronaGeo.setAttribute("aR0", new THREE.BufferAttribute(aR0, 1));
    coronaGeo.setAttribute("aT", new THREE.BufferAttribute(aT, 1));
    coronaGeo.setAttribute("aLen", new THREE.BufferAttribute(aLen, 1));
    coronaGeo.setAttribute("aSeed", new THREE.BufferAttribute(aSeed, 1));
    const coronaMat = new THREE.ShaderMaterial({
      vertexShader: CORONA_VERT,
      fragmentShader: CORONA_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 } },
    });
    const corona = new THREE.LineSegments(coronaGeo, coronaMat);
    corona.frustumCulled = false;

    // 磁弧：三条掠过右侧与底部的大弧
    const arcMat = new THREE.ShaderMaterial({
      vertexShader: `attribute float aT; attribute float aArc; varying float vT; varying float vArc;
        void main(){ vT = aT; vArc = aArc; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform float uTime; varying float vT; varying float vArc;
        void main(){ float a = pow(sin(3.1416 * vT), 0.7) * (0.20 + 0.10 * sin(uTime * 0.4 + vArc * 5.0));
        vec3 col = mix(vec3(0.075,0.76,0.76), vec3(0.85,0.95,1.0), vT); gl_FragColor = vec4(col, a); }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 } },
    });
    const arcPos: number[] = [];
    const arcT: number[] = [];
    const arcA: number[] = [];
    for (let arc = 0; arc < 3; arc++) {
      const R = 13.5 + arc * 2.6;
      const segs = 64;
      let prev: [number, number, number] | null = null;
      for (let s = 0; s <= segs; s++) {
        const t = s / segs;
        const ang = -1.9 + t * 1.9; // 右侧 → 底部掠过
        const p: [number, number, number] = [Math.cos(ang) * R, Math.sin(ang) * R, arc * 1.2 - 2];
        if (prev) {
          arcPos.push(...prev, ...p);
          arcT.push((s - 1) / segs, t);
          arcA.push(arc, arc);
        }
        prev = p;
      }
    }
    const arcGeo = new THREE.BufferGeometry();
    arcGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(arcPos), 3));
    arcGeo.setAttribute("aT", new THREE.BufferAttribute(new Float32Array(arcT), 1));
    arcGeo.setAttribute("aArc", new THREE.BufferAttribute(new Float32Array(arcA), 1));
    const arcs = new THREE.LineSegments(arcGeo, arcMat);
    arcs.frustumCulled = false;

    const disposables = [
      disc.geometry,
      disc.material as THREE.Material,
      rimSharp.geometry,
      rimSharp.material as THREE.Material,
      rimSoft.geometry,
      rimSoft.material as THREE.Material,
      coronaGeo,
      coronaMat,
      arcGeo,
      arcMat,
    ];

    return { disc, rimSharp, rimSoft, corona, coronaMat, arcs, arcMat, disposables };
  }, [quality]);

  useEffect(
    () => () => {
      disposables.forEach((d) => d.dispose());
    },
    [disposables],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    coronaMat.uniforms.uTime.value = t;
    arcMat.uniforms.uTime.value = t;
    if (coronaGroupRef.current) {
      coronaGroupRef.current.rotation.z = t * 0.01;
    }
    if (groupRef.current) {
      groupRef.current.scale.setScalar(1 + 0.015 * Math.sin(t * 0.314));
    }
  });

  return (
    <>
      <group ref={groupRef} position={ECLIPSE_CENTER.toArray()}>
        <primitive object={disc} />
        <primitive object={rimSharp} />
        <primitive object={rimSoft} />
        <group ref={coronaGroupRef}>
          <primitive object={corona} />
        </group>
      </group>
      <primitive object={arcs} />
    </>
  );
}

export { LorenzLayer, TesseractLayer, LoomLayer, FieldLayer, EclipseLayer };
