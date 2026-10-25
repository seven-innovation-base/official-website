"use client";

/**
 * 进阶场景组 A：黑曜石金（黄金比例之门）/ 深松石绿（分形算法林）/ 午夜梅子（量子棱镜潮汐）。
 * 均带交互 uniforms（uMouse 引力扰动 + 点击能量波），配合 InteractionRig 使用。
 */

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

import {
  GLSL_MOUSE_APPLY,
  GLSL_MOUSE_VERT,
  GLSL_RIPPLE_FRAG,
  GLSL_RIPPLE_GLOW,
  interactionUniforms,
  updateInteractionUniforms,
} from "./interaction";

/* ================================================================
 * 1. 黄金比例之门：黑曜石 × 香槟金，多层 φ 比例框架 + 黄金螺旋光线
 * ================================================================ */

const GOLD_FRAME_VERT = /* glsl */ `
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
    vF = pow(1.0 - abs(dot(n, normalize(-mv.xyz))), 1.8);
    vWpos = (modelMatrix * im * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const GOLD_FRAME_FRAG = /* glsl */ `
  ${GLSL_RIPPLE_FRAG}
  varying float vF;
  varying vec3 vWpos;
  void main() {
    vec3 obsidian = vec3(0.090, 0.071, 0.043);   // #17120B
    vec3 champagne = vec3(0.784, 0.635, 0.373);  // #C8A25F
    vec3 ivory = vec3(0.949, 0.875, 0.722);      // #F2DFB8
    vec3 col = mix(obsidian, champagne, pow(vF, 1.4) * 0.95);
    col += ivory * pow(vF, 6.0) * 0.55;
    float alpha = 0.38 + vF * 0.55;
    float rippleGlow;
    ${GLSL_RIPPLE_GLOW}
    col = mix(col, ivory, rippleGlow * 0.7);
    alpha += rippleGlow * 0.3;
    gl_FragColor = vec4(col, alpha);
  }
`;

const GOLD_SPIRAL_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  ${GLSL_MOUSE_VERT}
  attribute float aT;
  attribute float aSize;
  varying float vT;
  void main() {
    vec3 p = position;
    ${GLSL_MOUSE_APPLY}
    vT = aT;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = aSize * uPixelRatio * (320.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const GOLD_SPIRAL_FRAG = /* glsl */ `
  uniform float uTime;
  ${GLSL_RIPPLE_FRAG}
  varying float vT;
  varying vec3 vWpos;
  void main() {
    float f = fract(vT * 1.5 - uTime * 0.05);
    float comet = pow(1.0 - f, 3.5);
    float d = length(gl_PointCoord - vec2(0.5));
    float alpha = smoothstep(0.5, 0.06, d) * (0.10 + 0.85 * comet);
    vec3 champagne = vec3(0.784, 0.635, 0.373);
    vec3 ivory = vec3(0.980, 0.937, 0.824);
    vec3 col = mix(champagne, ivory, comet);
    float rippleGlow;
    ${GLSL_RIPPLE_GLOW}
    alpha += rippleGlow * 0.5;
    gl_FragColor = vec4(col, alpha);
  }
`;

function GoldenRatioLayer({ quality }: { quality: "high" | "medium" }) {
  const groupRef = useRef<THREE.Group>(null);
  const framesRef = useRef<THREE.InstancedMesh>(null);
  const panelsRef = useRef<THREE.InstancedMesh>(null);
  const frameCount = quality === "high" ? 8 : 5;
  const PHI = 1.618;

  const { edgeGeo, edgeMat, panelGeo, panelMat, spiral, spiralGeo, spiralMat } = useMemo(() => {
    const edgeGeo = new THREE.BoxGeometry(0.15, 1, 0.15);
    const panelGeo = new THREE.PlaneGeometry(1, 1);

    const edgeMat = new THREE.ShaderMaterial({
      vertexShader: GOLD_FRAME_VERT,
      fragmentShader: GOLD_FRAME_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { ...interactionUniforms() },
    });
    const panelMat = new THREE.MeshBasicMaterial({
      color: "#0a0805",
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });

    // 黄金螺旋：r = a·e^(bθ)，从外缘旋入再展出
    const N = quality === "high" ? 720 : 420;
    const pos = new Float32Array(N * 3);
    const aT = new Float32Array(N);
    const aS = new Float32Array(N);
    const b = 0.19;
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const th = t * Math.PI * 5.2;
      const r = 0.5 * Math.exp(b * th);
      pos[i * 3] = -2.2 + Math.cos(th) * r;
      pos[i * 3 + 1] = 1.6 + Math.sin(th) * r * 0.85;
      pos[i * 3 + 2] = -1.5 - t * 2.0;
      aT[i] = t;
      aS[i] = 1.2 + Math.random() * 1.6;
    }
    const spiralGeo = new THREE.BufferGeometry();
    spiralGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    spiralGeo.setAttribute("aT", new THREE.BufferAttribute(aT, 1));
    spiralGeo.setAttribute("aSize", new THREE.BufferAttribute(aS, 1));
    const spiralMat = new THREE.ShaderMaterial({
      vertexShader: GOLD_SPIRAL_VERT,
      fragmentShader: GOLD_SPIRAL_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 }, ...interactionUniforms() },
    });
    const spiral = new THREE.Points(spiralGeo, spiralMat);
    spiral.frustumCulled = false;

    return { edgeGeo, edgeMat, panelGeo, panelMat, spiral, spiralGeo, spiralMat };
  }, [quality]);

  // 框架静态实例矩阵：左右交替切入、φ 逐层缩放、旋转错位
  useEffect(() => {
    const dummy = new THREE.Object3D();
    const frames = framesRef.current;
    const panels = panelsRef.current;
    if (!frames) return;

    let edgeIdx = 0;
    for (let i = 0; i < frameCount; i++) {
      const w = 13 / Math.pow(PHI, i * 0.75);
      const h = w / PHI;
      const side = i % 2 === 0 ? -1 : 1;
      const cx = side * (5.2 + i * 0.9);
      const cy = 0.4 - i * 0.5;
      const cz = -1.5 - i * 1.1;
      const rotZ = side * (0.08 + i * 0.1);

      // 四条边：左右竖边 + 上下横边
      const edges: Array<[number, number, number, number]> = [
        [cx - w / 2, cy, h, 0],
        [cx + w / 2, cy, h, 0],
        [cx, cy + h / 2, w, Math.PI / 2],
        [cx, cy - h / 2, w, Math.PI / 2],
      ];
      for (const [x, y, len, rz] of edges) {
        dummy.position.set(x, y, cz);
        dummy.rotation.set(0, 0, rotZ + rz);
        dummy.scale.set(1, len, 1);
        dummy.updateMatrix();
        frames.setMatrixAt(edgeIdx++, dummy.matrix);
      }
      frames.instanceMatrix.needsUpdate = true;
      frames.frustumCulled = false;

      if (panels) {
        dummy.position.set(cx, cy, cz - 0.05);
        dummy.rotation.set(0, 0, rotZ);
        dummy.scale.set(w, h, 1);
        dummy.updateMatrix();
        panels.setMatrixAt(i, dummy.matrix);
        panels.instanceMatrix.needsUpdate = true;
        panels.frustumCulled = false;
      }
    }
  }, [frameCount]);

  useEffect(
    () => () => {
      edgeGeo.dispose();
      edgeMat.dispose();
      panelGeo.dispose();
      panelMat.dispose();
      spiralGeo.dispose();
      spiralMat.dispose();
    },
    [edgeGeo, edgeMat, panelGeo, panelMat, spiralGeo, spiralMat],
  );

  useFrame(({ clock, gl }) => {
    const t = clock.elapsedTime;
    updateInteractionUniforms(edgeMat);
    spiralMat.uniforms.uTime.value = t;
    spiralMat.uniforms.uPixelRatio.value = gl.getPixelRatio();
    updateInteractionUniforms(spiralMat);
    if (groupRef.current) {
      // ~60s 呼吸 + 轻微旋转
      groupRef.current.rotation.z = Math.sin(t * 0.105) * 0.05;
      groupRef.current.scale.setScalar(1 + 0.02 * Math.sin(t * 0.105));
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={framesRef} args={[edgeGeo, edgeMat, frameCount * 4]} frustumCulled={false} />
      <instancedMesh ref={panelsRef} args={[panelGeo, panelMat, frameCount]} frustumCulled={false} />
      <primitive object={spiral} />
    </group>
  );
}

/* ================================================================
 * 2. 分形算法林：递归分形枝干（实例化）+ 内部流动光线 + 露珠节点
 * ================================================================ */

type Branch = {
  pos: THREE.Vector3;
  dir: THREE.Vector3;
  len: number;
  depth: number;
};

function growBranches(maxDepth: number): Branch[] {
  const branches: Branch[] = [];
  const grow = (pos: THREE.Vector3, dir: THREE.Vector3, len: number, depth: number) => {
    branches.push({ pos: pos.clone(), dir: dir.clone().normalize(), len, depth });
    if (depth >= maxDepth) return;
    const spread = 0.42 + Math.random() * 0.18;
    for (const side of [-1, 1]) {
      const nd = dir.clone();
      nd.applyAxisAngle(new THREE.Vector3(0, 0, 1), side * spread);
      nd.x += side * 0.12;
      grow(pos.clone().add(dir.clone().multiplyScalar(len)), nd, len * 0.72, depth + 1);
    }
  };
  // 左右两株，从底部两侧向内向上生长
  grow(new THREE.Vector3(-10.5, -9, -2), new THREE.Vector3(0.55, 1, 0.06), 4.6, 0);
  grow(new THREE.Vector3(10.5, -9, -4), new THREE.Vector3(-0.55, 1, -0.06), 4.4, 0);
  return branches;
}

const FOREST_FLOW_VERT = /* glsl */ `
  uniform float uTime;
  ${GLSL_MOUSE_VERT}
  attribute float aT;
  varying float vT;
  void main() {
    vec3 p = position;
    ${GLSL_MOUSE_APPLY}
    vT = aT;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const FOREST_FLOW_FRAG = /* glsl */ `
  uniform float uTime;
  ${GLSL_RIPPLE_FRAG}
  varying float vT;
  varying vec3 vWpos;
  void main() {
    float f = fract(vT - uTime * 0.07);
    float comet = pow(1.0 - f, 3.0);
    vec3 mint = vec3(0.490, 0.976, 0.776);  // #7DF9C6
    vec3 coldWhite = vec3(0.957, 1.0, 0.984); // #F4FFFB
    vec3 col = mix(mint, coldWhite, comet * 0.7);
    float alpha = 0.07 + 0.5 * comet;
    float rippleGlow;
    ${GLSL_RIPPLE_GLOW}
    col = mix(col, coldWhite, rippleGlow * 0.6);
    alpha += rippleGlow * 0.35;
    gl_FragColor = vec4(col, alpha);
  }
`;

const FOREST_BARK_VERT = /* glsl */ `
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
    vF = pow(1.0 - abs(dot(n, normalize(-mv.xyz))), 2.0);
    vWpos = (modelMatrix * im * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const FOREST_BARK_FRAG = /* glsl */ `
  ${GLSL_RIPPLE_FRAG}
  varying float vF;
  varying vec3 vWpos;
  void main() {
    vec3 deepGreen = vec3(0.024, 0.157, 0.122);  // #06281F
    vec3 mint = vec3(0.490, 0.976, 0.776);       // #7DF9C6
    vec3 col = mix(deepGreen, mint, pow(vF, 1.6) * 0.85);
    float alpha = 0.30 + vF * 0.5;
    float rippleGlow;
    ${GLSL_RIPPLE_GLOW}
    col = mix(col, mint, rippleGlow * 0.6);
    alpha += rippleGlow * 0.3;
    gl_FragColor = vec4(col, alpha);
  }
`;

function FractalForestLayer({ quality }: { quality: "high" | "medium" }) {
  const groupRef = useRef<THREE.Group>(null);
  const barkRef = useRef<THREE.InstancedMesh>(null);
  const maxDepth = quality === "high" ? 5 : 4;

  const { branches, barkGeo, barkMat, flowGeo, flowMat, flow, dewGeo, dewMat, dew } = useMemo(() => {
    const branches = growBranches(maxDepth);

    const barkGeo = new THREE.BoxGeometry(1, 1, 1);
    const barkMat = new THREE.ShaderMaterial({
      vertexShader: FOREST_BARK_VERT,
      fragmentShader: FOREST_BARK_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { ...interactionUniforms() },
    });

    // 枝内流动光线：沿枝干路径的线段
    const flowPos: number[] = [];
    const flowT: number[] = [];
    branches.forEach((b, i) => {
      const end = b.pos.clone().add(b.dir.clone().multiplyScalar(b.len));
      flowPos.push(b.pos.x, b.pos.y, b.pos.z, end.x, end.y, end.z);
      const t = (i * 0.618) % 1;
      flowT.push(t, t);
    });
    const flowGeo = new THREE.BufferGeometry();
    flowGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(flowPos), 3));
    flowGeo.setAttribute("aT", new THREE.BufferAttribute(new Float32Array(flowT), 1));
    const flowMat = new THREE.ShaderMaterial({
      vertexShader: FOREST_FLOW_VERT,
      fragmentShader: FOREST_FLOW_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, ...interactionUniforms() },
    });
    const flow = new THREE.LineSegments(flowGeo, flowMat);
    flow.frustumCulled = false;

    // 顶端露珠：最深层枝干末端
    const tips = branches.filter((b) => b.depth === maxDepth);
    const dewPos = new Float32Array(tips.length * 3);
    const phases = new Float32Array(tips.length);
    const sizes = new Float32Array(tips.length);
    tips.forEach((b, i) => {
      const end = b.pos.clone().add(b.dir.clone().multiplyScalar(b.len));
      dewPos.set([end.x, end.y, end.z], i * 3);
      phases[i] = Math.random() * 6.283;
      sizes[i] = 2.0 + Math.random() * 1.6;
    });
    const dewGeo = new THREE.BufferGeometry();
    dewGeo.setAttribute("position", new THREE.BufferAttribute(dewPos, 3));
    dewGeo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    dewGeo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    const dewMat = new THREE.ShaderMaterial({
      vertexShader: `uniform float uTime; uniform float uPixelRatio; attribute float aSize; attribute float aPhase; varying float vTw;
        void main(){ vTw = 0.55 + 0.45 * sin(uTime * 0.8 + aPhase); vec4 mv = modelViewMatrix * vec4(position,1.0);
        gl_PointSize = aSize * uPixelRatio * (320.0 / -mv.z); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `varying float vTw; void main(){ float d = length(gl_PointCoord - vec2(0.5));
        float a = smoothstep(0.5, 0.08, d) * vTw * 0.7; gl_FragColor = vec4(vec3(0.957,1.0,0.984), a); }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 } },
    });
    const dew = new THREE.Points(dewGeo, dewMat);
    dew.frustumCulled = false;

    return { branches, barkGeo, barkMat, flowGeo, flowMat, flow, dewGeo, dewMat, dew };
  }, [maxDepth]);

  // 枝干静态实例矩阵
  useEffect(() => {
    const inst = barkRef.current;
    if (!inst) return;
    const dummy = new THREE.Object3D();
    const yAxis = new THREE.Vector3(0, 1, 0);
    branches.forEach((b, i) => {
      const end = b.pos.clone().add(b.dir.clone().multiplyScalar(b.len));
      const mid = b.pos.clone().add(end).multiplyScalar(0.5);
      const thick = 0.22 * Math.pow(0.7, b.depth);
      dummy.position.copy(mid);
      dummy.quaternion.setFromUnitVectors(yAxis, b.dir.clone().normalize());
      dummy.scale.set(thick, b.len, thick);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    });
    inst.instanceMatrix.needsUpdate = true;
    inst.frustumCulled = false;
  }, [branches]);

  useEffect(
    () => () => {
      barkGeo.dispose();
      barkMat.dispose();
      flowGeo.dispose();
      flowMat.dispose();
      dewGeo.dispose();
      dewMat.dispose();
    },
    [barkGeo, barkMat, flowGeo, flowMat, dewGeo, dewMat],
  );

  useFrame(({ clock, gl }) => {
    const t = clock.elapsedTime;
    flowMat.uniforms.uTime.value = t;
    updateInteractionUniforms(flowMat);
    updateInteractionUniforms(barkMat);
    dewMat.uniforms.uTime.value = t;
    dewMat.uniforms.uPixelRatio.value = gl.getPixelRatio();
    if (groupRef.current) {
      // ~31s 生长呼吸
      const breathe = 1 + 0.018 * Math.sin(t * 0.2);
      groupRef.current.scale.set(breathe, 1 + 0.028 * Math.sin(t * 0.2), breathe);
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={barkRef} args={[barkGeo, barkMat, branches.length]} frustumCulled={false} />
      <primitive object={flow} />
      <primitive object={dew} />
    </group>
  );
}

/* ================================================================
 * 3. 量子棱镜潮汐：折叠玻璃丝带 + 菲涅尔虹彩 + 棱镜碎片
 * ================================================================ */

const RIBBON_VERT = /* glsl */ `
  uniform float uTime;
  uniform vec3 uMouse;
  attribute float aU;
  attribute float aV;
  attribute vec3 aNormal;
  varying float vU;
  varying float vV;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vWpos;
  void main() {
    vec3 p = position;
    // 30s 周期缓慢折叠：沿路径起伏 + 扭转
    float fold = sin(aU * 9.0 + uTime * 0.21) * 1.15 + sin(aU * 4.0 - uTime * 0.13) * 0.7;
    p.z += fold * (1.0 - abs(aV * 2.0 - 1.0) * 0.6);
    p.y += sin(aU * 6.0 + uTime * 0.17) * 0.5;
    // 鼠标扰流（排斥，半径 ~2.4）
    vec2 toMouse = p.xy - uMouse.xy;
    float md = length(toMouse);
    p.xy += (md > 0.0001 ? normalize(toMouse) : vec2(0.0)) * smoothstep(2.4, 0.0, md) * 0.55;
    vU = aU;
    vV = aV;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vNormal = normalize(normalMatrix * aNormal);
    vView = normalize(-mv.xyz);
    vWpos = (modelMatrix * vec4(p, 1.0)).xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const RIBBON_FRAG = /* glsl */ `
  ${GLSL_RIPPLE_FRAG}
  uniform vec3 uMouse;
  varying float vU;
  varying float vV;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vWpos;
  void main() {
    vec3 deepPlum = vec3(0.106, 0.059, 0.176);   // #1B0F2D
    vec3 violet = vec3(0.420, 0.275, 0.757);     // #6B46C1
    vec3 icePurple = vec3(0.714, 0.612, 1.0);    // #B69CFF
    vec3 mist = vec3(0.961, 0.941, 1.0);         // #F5F0FF
    float fres = pow(1.0 - abs(dot(normalize(vNormal), vView)), 2.2);
    // 轻微虹彩：视角与位置共同决定色偏
    float iri = 0.5 + 0.5 * sin(vU * 14.0 + fres * 5.0);
    vec3 col = mix(deepPlum, violet, fres * 0.8);
    col = mix(col, icePurple, pow(fres, 2.0) * 0.7);
    col += mist * iri * 0.06;
    // 鼠标驱动的柔和反光
    vec3 lightDir = normalize(vec3(uMouse.xy, 5.0) + vec3(0.0, 0.0, 6.0));
    float spec = pow(max(dot(reflect(-lightDir, normalize(vNormal)), vView), 0.0), 26.0);
    col += icePurple * spec * 0.5;
    float alpha = 0.16 + fres * 0.5 + spec * 0.25;
    float rippleGlow;
    ${GLSL_RIPPLE_GLOW}
    col = mix(col, mist, rippleGlow * 0.6);
    alpha += rippleGlow * 0.3;
    gl_FragColor = vec4(col, alpha);
  }
`;

function QuantumRibbonLayer({ quality }: { quality: "high" | "medium" }) {
  const groupRef = useRef<THREE.Group>(null);
  const shardsRef = useRef<THREE.InstancedMesh>(null);
  const shardCount = quality === "high" ? 14 : 8;

  const { ribbonGeo, ribbonMat, ribbon, shardGeo, shardMat, curve } = useMemo(() => {
    // 折线路径：左上进入 → 绕行中央 → 右下穿出
    const curve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-15, 7.5, -2),
        new THREE.Vector3(-6, 4, 0),
        new THREE.Vector3(2, 5.8, -2),
        new THREE.Vector3(7.2, 0.5, 0),
        new THREE.Vector3(2, -4, -2),
        new THREE.Vector3(-5, -3.6, 0),
        new THREE.Vector3(3, -8.6, -2),
        new THREE.Vector3(14, -9.5, -1),
      ].map((v) => v),
    );

    const segU = quality === "high" ? 150 : 100;
    const segV = 8;
    const halfW = 1.3;
    const pos: number[] = [];
    const nor: number[] = [];
    const uvs: number[] = [];
    const idx: number[] = [];
    for (let i = 0; i <= segU; i++) {
      const u = i / segU;
      const pt = curve.getPointAt(u);
      const tan = curve.getTangentAt(u);
      const side = new THREE.Vector3().crossVectors(tan, new THREE.Vector3(0, 0, 1)).normalize();
      for (let j = 0; j <= segV; j++) {
        const v = j / segV;
        const offset = side.clone().multiplyScalar((v - 0.5) * 2 * halfW);
        pos.push(pt.x + offset.x, pt.y + offset.y, pt.z + offset.z);
        nor.push(0, 0, 1);
        uvs.push(u, v);
      }
    }
    for (let i = 0; i < segU; i++) {
      for (let j = 0; j < segV; j++) {
        const a = i * (segV + 1) + j;
        const b = a + segV + 1;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    const ribbonGeo = new THREE.BufferGeometry();
    ribbonGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3));
    ribbonGeo.setAttribute("aNormal", new THREE.BufferAttribute(new Float32Array(nor), 3));
    ribbonGeo.setAttribute("aU", new THREE.BufferAttribute(new Float32Array(uvs.filter((_, k) => k % 2 === 0)), 1));
    ribbonGeo.setAttribute("aV", new THREE.BufferAttribute(new Float32Array(uvs.filter((_, k) => k % 2 === 1)), 1));
    ribbonGeo.setIndex(idx);

    const ribbonMat = new THREE.ShaderMaterial({
      vertexShader: RIBBON_VERT,
      fragmentShader: RIBBON_FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: { uTime: { value: 0 }, ...interactionUniforms() },
    });
    const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbon.frustumCulled = false;

    // 棱镜碎片（静态位置，随组缓慢公转）
    const shardGeo = new THREE.OctahedronGeometry(0.32, 0);
    const shardMat = ribbonMat;

    return { ribbonGeo, ribbonMat, ribbon, shardGeo, shardMat, curve };
  }, [quality]);

  useEffect(() => {
    const inst = shardsRef.current;
    if (!inst) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < shardCount; i++) {
      const pt = curve.getPointAt((i * 0.618) % 1);
      dummy.position.set(pt.x + (Math.random() - 0.5) * 5, pt.y + (Math.random() - 0.5) * 4, pt.z + (Math.random() - 0.5) * 3 - 1);
      dummy.rotation.set(Math.random() * 6.28, Math.random() * 6.28, 0);
      dummy.scale.setScalar(0.5 + Math.random());
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
    inst.frustumCulled = false;
  }, [shardCount, curve]);

  useEffect(
    () => () => {
      ribbonGeo.dispose();
      ribbonMat.dispose();
      shardGeo.dispose();
    },
    [ribbonGeo, ribbonMat, shardGeo],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    ribbonMat.uniforms.uTime.value = t;
    updateInteractionUniforms(ribbonMat);
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.048) * 0.18;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={ribbon} />
      <instancedMesh ref={shardsRef} args={[shardGeo, shardMat, shardCount]} frustumCulled={false} />
    </group>
  );
}

export { GoldenRatioLayer, FractalForestLayer, QuantumRibbonLayer };
