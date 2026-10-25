"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";

export type SceneVariant = "network" | "nebula" | "combo";
export type SceneQuality = "high" | "medium";

/** 品牌色板（藏青蓝系 + 点缀青，与 Tailwind token 同源） */
const PALETTE: Array<[string, number]> = [
  ["#13c2c2", 0.3], // accent 青
  ["#2e7bc4", 0.28], // primary-light
  ["#4a9fe8", 0.22], // sky
  ["#8fd0ff", 0.12], // 冰蓝
  ["#eaf5fe", 0.08], // 高光白
];

function pickColor(target: THREE.Color): THREE.Color {
  let r = Math.random();
  for (const [hex, weight] of PALETTE) {
    r -= weight;
    if (r <= 0) return target.set(hex);
  }
  return target.set(PALETTE[0][0]);
}

/* ---------------- 着色器 ---------------- */

const NETWORK_VERT = /* glsl */ `
  uniform float uTime;
  uniform vec3 uMouse;
  uniform float uPixelRatio;
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vBoost;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float d = distance(position, uMouse);
    float boost = 1.0 + smoothstep(4.5, 0.0, d) * 1.9;
    vBoost = boost;
    vColor = aColor;
    gl_PointSize = aSize * uPixelRatio * boost * (320.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const NETWORK_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vBoost;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    float alpha = smoothstep(0.5, 0.08, d);
    gl_FragColor = vec4(vColor, alpha * (0.5 + 0.32 * vBoost));
  }
`;

const NEBULA_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vColor = aColor;
    vTwinkle = 0.62 + 0.38 * sin(uTime * 0.7 + aPhase);
    gl_PointSize = aSize * uPixelRatio * (320.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const NEBULA_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    float alpha = smoothstep(0.5, 0.06, d);
    gl_FragColor = vec4(vColor, alpha * vTwinkle * 0.55);
  }
`;

/* ---------------- 粒子网络层（前景） ---------------- */

function NetworkLayer({ count }: { count: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const { points, lines, material } = useMemo(() => {
    // 球形分布的节点（z 轴压扁，形成"星系盘"感）
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const radius = 3.5 + Math.pow(Math.random(), 0.7) * 6.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.72;
      positions[i * 3 + 2] = radius * Math.cos(phi) * 0.6;
      pickColor(color);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      sizes[i] = (Math.random() < 0.06 ? 2.6 : 1.0) + Math.random() * 1.6;
    }

    // 邻近连线：每节点最多 2 条，阈值内
    const linePos: number[] = [];
    const maxDist2 = 3.4 * 3.4;
    for (let i = 0; i < count; i++) {
      let links = 0;
      for (let j = i + 1; j < count && links < 2; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < maxDist2) {
          linePos.push(
            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2],
          );
          links++;
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(linePos), 3));

    const mat = new THREE.ShaderMaterial({
      vertexShader: NETWORK_VERT,
      fragmentShader: NETWORK_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uMouse: { value: new THREE.Vector3(999, 999, 999) },
      },
    });

    const lineMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color("#2e7bc4"),
      transparent: true,
      opacity: 0.13,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return {
      points: new THREE.Points(geometry, mat),
      lines: new THREE.LineSegments(lineGeometry, lineMaterial),
      material: mat,
    };
  }, [count]);

  useEffect(
    () => () => {
      points.geometry.dispose();
      lines.geometry.dispose();
      material.dispose();
      (lines.material as THREE.Material).dispose();
    },
    [points, lines, material],
  );

  useFrame(({ clock, pointer, gl }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
    material.uniforms.uPixelRatio.value = gl.getPixelRatio();
    // 指针 NDC → 场景 z≈0 平面的近似世界坐标（视场 55° / 相机 z=16）
    material.uniforms.uMouse.value.set(pointer.x * 13, pointer.y * 8, 0);
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.032;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={points} />
      <primitive object={lines} />
    </group>
  );
}

/* ---------------- 深空星云层（背景） ---------------- */

function NebulaLayer({ count }: { count: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const { points, material } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const radius = 11 + Math.pow(Math.random(), 0.6) * 16;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.62;
      positions[i * 3 + 2] = radius * Math.cos(phi) * 0.55 - 4;
      pickColor(color);
      // 星云整体色调压暗，突出前景
      colors[i * 3] = color.r * 0.85;
      colors[i * 3 + 1] = color.g * 0.85;
      colors[i * 3 + 2] = color.b * 0.9;
      sizes[i] = 0.8 + Math.random() * 2.4;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: NEBULA_VERT,
      fragmentShader: NEBULA_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
      },
    });

    return { points: new THREE.Points(geometry, mat), material: mat };
  }, [count]);

  useEffect(
    () => () => {
      points.geometry.dispose();
      material.dispose();
    },
    [points, material],
  );

  useFrame(({ clock, gl }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
    material.uniforms.uPixelRatio.value = gl.getPixelRatio();
    if (groupRef.current) {
      groupRef.current.rotation.y = -clock.elapsedTime * 0.013;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={points} />
    </group>
  );
}

/* ---------------- 相机视差 ---------------- */

function CameraRig() {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 16));

  useFrame(({ pointer }) => {
    target.current.set(pointer.x * 1.5, pointer.y * 0.9, 16);
    camera.position.lerp(target.current, 0.03);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ---------------- 场景入口 ---------------- */

export default function HeroScene({ variant, quality }: { variant: SceneVariant; quality: SceneQuality }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);

  // 滚出视口即暂停渲染循环（省电省 CPU）
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      threshold: 0.02,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const networkCount = quality === "high" ? 3200 : 1700;
  const nebulaCount = quality === "high" ? 22000 : 9000;

  return (
    <div ref={wrapRef} className="absolute inset-0" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 16], fov: 55 }}
        dpr={[1, quality === "high" ? 2 : 1.5]}
        frameloop={active ? "always" : "never"}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      >
        {variant !== "nebula" && <NetworkLayer count={networkCount} />}
        {variant !== "network" && <NebulaLayer count={nebulaCount} />}
        <CameraRig />
        <EffectComposer>
          <Bloom
            mipmapBlur
            intensity={quality === "high" ? 1.0 : 0.6}
            luminanceThreshold={0.08}
            luminanceSmoothing={0.25}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
