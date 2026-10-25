"use client";

/**
 * 「时间算法」——官网 Hero 定稿场景（D4，2026-10-25）。
 * 古代浑天仪 × 未来数学装置：同心轨道环 + 刻度 + 沿轨铜色粒子。
 * 带完整交互（±4° 视差 / ±18° 拖拽 / 鼠标引力扰动 / 点击能量波）。
 * 其他候选场景见 archive/hero3d/。
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
    vec3 oxide = vec3(0.071, 0.157, 0.122);   // #12281F 氧化铜绿
    vec3 copper = vec3(0.773, 0.541, 0.290);  // #C58A4A 古铜金
    vec3 ivory = vec3(0.945, 0.867, 0.729);   // #F1DDBA 暖象牙
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

    // 四层轨道：半径 / 管径 / 倾角 / 自转周期 / 刻度数
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
      // 刻度：沿环分布的小方块，每 6 格一个长刻度
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

    // 沿轨铜色粒子（CPU 更新，D4 定稿：368/208 颗）
    const orbitCount = quality === "high" ? 368 : 208;
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

  // 轨道粒子参数（含各环倾斜四元数；D4 定稿：速度累计 ×4）
  const orbiters = useMemo(
    () =>
      Array.from({ length: quality === "high" ? 368 : 208 }, () => {
        const ring = Math.floor(Math.random() * ringCount);
        const def = ringDefs[ring];
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(def.tilt[0], def.tilt[1], def.tilt[2]));
        return {
          ring,
          q,
          radius: def.r,
          angle: Math.random() * Math.PI * 2,
          speed: (0.1 + Math.random() * 0.18) * 4,
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

export { ArmillaryLayer };
