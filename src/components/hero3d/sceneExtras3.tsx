"use client";

/**
 * 进阶场景：红移星环（勃艮第酒红 × 珊瑚金）/ 时间算法（青铜绿 × 铜金）。
 * 带交互 uniforms（uMouse 扰动 + 点击能量波），配合 InteractionRig 使用。
 */

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

import {
  ANIM_SPEED,
  GLSL_RIPPLE_FRAG,
  GLSL_RIPPLE_GLOW,
  interactionUniforms,
  updateInteractionUniforms,
} from "./interaction";

/* ================================================================
 * 红移星环：暗天体 + 猩红日冕 + 引力弧 + 旋转星环
 * ================================================================ */

const RED_CORONA_VERT = /* glsl */ `
  uniform float uTime;
  attribute float aAng;
  attribute float aR0;
  attribute float aT;
  attribute float aLen;
  attribute float aSeed;
  varying float vT;
  varying float vSeed;
  varying vec3 vWpos;
  void main() {
    float breath = 1.0 + 0.10 * sin(uTime * 0.314); // ~20s 脉动
    float r = aR0 + aT * aLen * breath;
    float ang = aAng + aT * 0.22;
    vec3 p = vec3(cos(ang) * r, sin(ang) * r, 0.0);
    vT = aT;
    vSeed = aSeed;
    vWpos = (modelMatrix * vec4(p, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const RED_CORONA_FRAG = /* glsl */ `
  uniform float uTime;
  ${GLSL_RIPPLE_FRAG}
  varying float vT;
  varying float vSeed;
  varying vec3 vWpos;
  void main() {
    float pulse = 0.28 + 0.30 * sin(uTime * 0.5 + vSeed * 7.0);
    vec3 coral = vec3(1.0, 0.42, 0.369);      // #FF6B5E
    vec3 ivory = vec3(1.0, 0.831, 0.722);     // #FFD4B8
    vec3 darkRed = vec3(0.561, 0.114, 0.173); // #8F1D2C
    vec3 col = mix(darkRed, coral, fract(vSeed * 0.618));
    col = mix(col, ivory, 0.15);
    float rippleGlow;
    ${GLSL_RIPPLE_GLOW}
    col = mix(col, ivory, rippleGlow * 0.6);
    gl_FragColor = vec4(col, (pulse + rippleGlow * 0.4) * (1.0 - vT));
  }
`;

const RED_RING_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aPhase;
  attribute float aSize;
  varying float vTw;
  void main() {
    vTw = 0.55 + 0.45 * sin(uTime * 0.9 + aPhase);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio * (320.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const RED_RING_FRAG = /* glsl */ `
  varying float vTw;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    float a = smoothstep(0.5, 0.06, d) * vTw * 0.65;
    vec3 coral = vec3(1.0, 0.42, 0.369);
    vec3 ivory = vec3(1.0, 0.831, 0.722);
    gl_FragColor = vec4(mix(coral, ivory, 0.3), a);
  }
`;

function RedshiftLayer({ quality }: { quality: "high" | "medium" }) {
  const CENTER = useMemo(() => new THREE.Vector3(-7.2, 6.2, -7), []);
  const groupRef = useRef<THREE.Group>(null);
  const coronaGroupRef = useRef<THREE.Group>(null);
  const ringGroupRef = useRef<THREE.Group>(null);

  const { disc, rimSharp, rimSoft, corona, coronaMat, arcs, arcMat, ringPts, ringMat, disposables } =
    useMemo(() => {
      const disc = new THREE.Mesh(
        new THREE.CircleGeometry(5.6, 72),
        new THREE.MeshBasicMaterial({ color: "#1a0507" }),
      );
      const rimSharp = new THREE.Mesh(
        new THREE.RingGeometry(5.6, 5.7, 160),
        new THREE.MeshBasicMaterial({
          color: "#FF6B5E",
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      const rimSoft = new THREE.Mesh(
        new THREE.RingGeometry(5.72, 7.0, 160),
        new THREE.ShaderMaterial({
          vertexShader: `varying float vR; void main(){ vR = length(position.xy); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
          fragmentShader: `varying float vR; void main(){ float t = clamp((vR - 5.72) / (7.0 - 5.72), 0.0, 1.0);
            gl_FragColor = vec4(vec3(0.561,0.114,0.173), pow(1.0 - t, 2.2) * 0.55); }`,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
        }),
      );

      // 日冕
      const n = quality === "high" ? 760 : 420;
      const pos = new Float32Array(n * 2 * 3);
      const aAng = new Float32Array(n * 2);
      const aR0 = new Float32Array(n * 2);
      const aT = new Float32Array(n * 2);
      const aLen = new Float32Array(n * 2);
      const aSeed = new Float32Array(n * 2);
      for (let i = 0; i < n; i++) {
        const ang = Math.random() * Math.PI * 2;
        const r0 = 5.85 + Math.random() * 0.25;
        const len = 0.5 + Math.pow(Math.random(), 2.2) * 2.6;
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
        vertexShader: RED_CORONA_VERT,
        fragmentShader: RED_CORONA_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, ...interactionUniforms() },
      });
      const corona = new THREE.LineSegments(coronaGeo, coronaMat);
      corona.frustumCulled = false;

      // 引力弧 ×3
      const arcMat = new THREE.ShaderMaterial({
        vertexShader: `attribute float aT; varying float vT; void main(){ vT = aT; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform float uTime; varying float vT;
          void main(){ float a = pow(sin(3.1416 * vT), 0.65) * (0.16 + 0.08 * sin(uTime * 0.35 + vT * 9.0));
          gl_FragColor = vec4(vec3(1.0, 0.42, 0.369), a); }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 } },
      });
      const arcPos: number[] = [];
      const arcT: number[] = [];
      for (let arc = 0; arc < 3; arc++) {
        const R = 14 + arc * 2.8;
        const segs = 72;
        let prev: [number, number, number] | null = null;
        for (let s = 0; s <= segs; s++) {
          const t = s / segs;
          const ang = -1.75 + t * 1.85;
          const p: [number, number, number] = [Math.cos(ang) * R, Math.sin(ang) * R, arc * 1.4 - 2.5];
          if (prev) {
            arcPos.push(...prev, ...p);
            arcT.push((s - 1) / segs, t);
          }
          prev = p;
        }
      }
      const arcGeo = new THREE.BufferGeometry();
      arcGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(arcPos), 3));
      arcGeo.setAttribute("aT", new THREE.BufferAttribute(new Float32Array(arcT), 1));
      const arcs = new THREE.LineSegments(arcGeo, arcMat);
      arcs.frustumCulled = false;

      // 星环（椭圆尘埃环，60–80s 自转）
      const ringCount = quality === "high" ? 1040 : 600;
      const rp = new Float32Array(ringCount * 3);
      const rPhase = new Float32Array(ringCount);
      const rSize = new Float32Array(ringCount);
      for (let i = 0; i < ringCount; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 10 + Math.random() * 3.2;
        rp[i * 3] = Math.cos(a) * r;
        rp[i * 3 + 1] = Math.sin(a) * r * 0.32; // 椭圆
        rp[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
        rPhase[i] = Math.random() * 6.283;
        rSize[i] = 1.0 + Math.random() * 1.8;
      }
      const ringGeo = new THREE.BufferGeometry();
      ringGeo.setAttribute("position", new THREE.BufferAttribute(rp, 3));
      ringGeo.setAttribute("aPhase", new THREE.BufferAttribute(rPhase, 1));
      ringGeo.setAttribute("aSize", new THREE.BufferAttribute(rSize, 1));
      const ringMat = new THREE.ShaderMaterial({
        vertexShader: RED_RING_VERT,
        fragmentShader: RED_RING_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 } },
      });
      const ringPts = new THREE.Points(ringGeo, ringMat);
      ringPts.frustumCulled = false;

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
        ringGeo,
        ringMat,
      ];
      return { disc, rimSharp, rimSoft, corona, coronaMat, arcs, arcMat, ringPts, ringMat, disposables };
    }, [quality]);

  useEffect(
    () => () => {
      disposables.forEach((d) => d.dispose());
    },
    [disposables],
  );

  useFrame(({ clock, gl }) => {
    const t = clock.elapsedTime * ANIM_SPEED;
    coronaMat.uniforms.uTime.value = t;
    updateInteractionUniforms(coronaMat);
    arcMat.uniforms.uTime.value = t;
    ringMat.uniforms.uTime.value = t;
    ringMat.uniforms.uPixelRatio.value = gl.getPixelRatio();
    if (coronaGroupRef.current) coronaGroupRef.current.rotation.z = t * 0.009;
    if (ringGroupRef.current) ringGroupRef.current.rotation.z = t * 0.085;
    if (groupRef.current) groupRef.current.scale.setScalar(1 + 0.012 * Math.sin(t * 0.314));
  });

  return (
    <>
      <group ref={groupRef} position={CENTER.toArray()}>
        <primitive object={disc} />
        <primitive object={rimSharp} />
        <primitive object={rimSoft} />
        <group ref={coronaGroupRef}>
          <primitive object={corona} />
        </group>
      </group>
      <group ref={ringGroupRef} position={[1.5, -1, -5]} rotation={[0.35, 0.2, -0.3]}>
        <primitive object={ringPts} />
      </group>
      <primitive object={arcs} />
    </>
  );
}

/* ================================================================
 * 时间算法：浑天仪轨道环 + 刻度 + 沿轨铜色粒子
 * ================================================================ */

const BRONZE_VERT = /* glsl */ `
  varying float vF;
  varying vec3 vWpos;
  void main() {
    #ifdef USE_INSTANCING
      mat4 im = instanceMatrix;
    #else
      mat4 im = mat4(1.0);
    #endif
    vec4 mv = modelViewMatrix * im * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * mat3(im) * normal);
    vF = pow(1.0 - abs(dot(n, normalize(-mv.xyz))), 1.9);
    vWpos = (modelMatrix * im * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const BRONZE_FRAG = /* glsl */ `
  ${GLSL_RIPPLE_FRAG}
  varying float vF;
  varying vec3 vWpos;
  void main() {
    vec3 oxide = vec3(0.071, 0.157, 0.122);   // #12281F
    vec3 copper = vec3(0.773, 0.541, 0.290);  // #C58A4A
    vec3 ivory = vec3(0.945, 0.867, 0.729);   // #F1DDBA
    vec3 col = mix(oxide, copper, pow(vF, 1.5) * 0.9);
    col += ivory * pow(vF, 5.0) * 0.45;
    float alpha = 0.32 + vF * 0.52;
    float rippleGlow;
    ${GLSL_RIPPLE_GLOW}
    col = mix(col, ivory, rippleGlow * 0.6);
    alpha += rippleGlow * 0.3;
    gl_FragColor = vec4(col, alpha);
  }
`;

function ArmillaryLayer({ quality }: { quality: "high" | "medium" }) {
  const groupRef = useRef<THREE.Group>(null);
  const ringGroups = useRef<Array<THREE.Group | null>>([]);
  const ringCount = quality === "high" ? 4 : 3;

  const { ringDefs, bronzeMat, ringGeos, tickGeos, orbitGeo, orbitMat, orbitPts } = useMemo(() => {
    const bronzeMat = new THREE.ShaderMaterial({
      vertexShader: BRONZE_VERT,
      fragmentShader: BRONZE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { ...interactionUniforms() },
    });

    const base = [
      { r: 7.4, tube: 0.1, tilt: [1.15, 0.0, 0.0], speed: (2 * Math.PI) / 86, ticks: 144 },
      { r: 9.0, tube: 0.085, tilt: [0.5, 0.4, -0.3], speed: -(2 * Math.PI) / 62, ticks: 168 },
      { r: 10.6, tube: 0.075, tilt: [1.35, -0.3, 0.2], speed: (2 * Math.PI) / 52, ticks: 192 },
      { r: 12.2, tube: 0.065, tilt: [0.9, 0.6, -0.5], speed: -(2 * Math.PI) / 74, ticks: 216 },
    ];
    const ringDefs = base.slice(0, ringCount);
    const ringGeos: THREE.BufferGeometry[] = [];
    const tickGeos: THREE.BufferGeometry[] = [];
    ringDefs.forEach((def) => {
      ringGeos.push(new THREE.TorusGeometry(def.r, def.tube, 10, 110));
      // 刻度：沿环分布的小方块
      const dummy = new THREE.Object3D();
      const tickList: Array<{ m: THREE.Matrix4 }> = [];
      for (let i = 0; i < def.ticks; i++) {
        const a = (i / def.ticks) * Math.PI * 2;
        dummy.position.set(Math.cos(a) * def.r, Math.sin(a) * def.r, 0);
        dummy.rotation.set(0, 0, a);
        const s = i % 6 === 0 ? 1.9 : 1.0;
        dummy.scale.set(0.5, s * 0.6, 0.5);
        dummy.updateMatrix();
        tickList.push({ m: dummy.matrix.clone() });
      }
      tickGeos.push(new THREE.BoxGeometry(def.tube * 2.4, def.tube * 6, def.tube * 2.4));
      (def as { tickList?: Array<{ m: THREE.Matrix4 }> }).tickList = tickList;
    });

    // 沿轨铜色粒子（CPU 更新）
    const orbitCount = quality === "high" ? 92 : 52;
    const orbitGeo = new THREE.BufferGeometry();
    orbitGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(orbitCount * 3), 3));
    const phases = new Float32Array(orbitCount);
    const sizes = new Float32Array(orbitCount);
    for (let i = 0; i < orbitCount; i++) {
      phases[i] = Math.random() * 6.283;
      sizes[i] = 1.8 + Math.random() * 1.8;
    }
    orbitGeo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    orbitGeo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    const orbitMat = new THREE.ShaderMaterial({
      vertexShader: `uniform float uTime; uniform float uPixelRatio; attribute float aSize; attribute float aPhase; varying float vTw;
        void main(){ vTw = 0.6 + 0.4 * sin(uTime * 1.1 + aPhase); vec4 mv = modelViewMatrix * vec4(position,1.0);
        gl_PointSize = aSize * uPixelRatio * (320.0 / -mv.z); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `varying float vTw; void main(){ float d = length(gl_PointCoord - vec2(0.5));
        float a = smoothstep(0.5, 0.06, d) * vTw * 0.85; gl_FragColor = vec4(vec3(0.945,0.867,0.729), a); }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 } },
    });
    const orbitPts = new THREE.Points(orbitGeo, orbitMat);
    orbitPts.frustumCulled = false;

    return { ringDefs, bronzeMat, ringGeos, tickGeos, orbitGeo, orbitMat, orbitPts };
  }, [ringCount, quality]);

  // 轨道粒子参数（含各环倾斜四元数，保证粒子沿倾斜轨道运行）
  const orbiters = useMemo(
    () =>
      Array.from({ length: quality === "high" ? 92 : 52 }, () => {
        const ring = Math.floor(Math.random() * ringCount);
        const def = ringDefs[ring];
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(def.tilt[0], def.tilt[1], def.tilt[2]));
        return {
          ring,
          q,
          radius: def.r,
          angle: Math.random() * Math.PI * 2,
          speed: 0.1 + Math.random() * 0.18,
        };
      }),
    [ringCount, quality, ringDefs],
  );

  useEffect(
    () => () => {
      ringGeos.forEach((g) => g.dispose());
      tickGeos.forEach((g) => g.dispose());
      bronzeMat.dispose();
      orbitGeo.dispose();
      orbitMat.dispose();
    },
    [ringGeos, tickGeos, bronzeMat, orbitGeo, orbitMat],
  );

  useFrame(({ clock, gl }) => {
    const t = clock.elapsedTime * ANIM_SPEED;
    updateInteractionUniforms(bronzeMat);
    orbitMat.uniforms.uTime.value = t;
    orbitMat.uniforms.uPixelRatio.value = gl.getPixelRatio();

    // 各环自转（局部 z 轴 = 环平面法线）
    ringGroups.current.forEach((g, i) => {
      if (g) g.rotation.z = ringDefs[i].speed * t;
    });

    // 轨道粒子沿倾斜环运行
    const attr = orbitGeo.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const tmp = new THREE.Vector3();
    orbiters.forEach((o, i) => {
      const a = o.angle + t * o.speed;
      tmp.set(Math.cos(a) * o.radius, Math.sin(a) * o.radius, 0).applyQuaternion(o.q);
      arr[i * 3] = tmp.x;
      arr[i * 3 + 1] = tmp.y;
      arr[i * 3 + 2] = tmp.z;
    });
    attr.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      {ringDefs.map((def, i) => (
        <group
          key={i}
          rotation={def.tilt as [number, number, number]}
          ref={(g) => {
            ringGroups.current[i] = g;
          }}
        >
          <mesh geometry={ringGeos[i]} material={bronzeMat} />
          <instancedMesh
            args={[tickGeos[i], bronzeMat, def.ticks]}
            frustumCulled={false}
            ref={(inst) => {
              if (!inst) return;
              const list = (def as { tickList?: Array<{ m: THREE.Matrix4 }> }).tickList;
              if (!list || (inst as unknown as { _ticked?: boolean })._ticked) return;
              list.forEach((tk, k) => inst.setMatrixAt(k, tk.m));
              inst.instanceMatrix.needsUpdate = true;
              (inst as unknown as { _ticked?: boolean })._ticked = true;
            }}
          />
        </group>
      ))}
      <primitive object={orbitPts} />
    </group>
  );
}

export { RedshiftLayer, ArmillaryLayer };
