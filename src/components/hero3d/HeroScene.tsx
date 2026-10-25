"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

export type SceneVariant = "network" | "nebula" | "combo" | "halo" | "converge" | "waves";
export type SceneQuality = "high" | "medium";

/**
 * 性能策略（对齐三院科协"顺滑"标准）：
 * - 不使用后处理（Bloom 全屏多通道是卡顿主因），辉光感由"大尺寸柔边光晕粒子 + 加色混合"直接渲染；
 * - DPR 上限 1.5（高配）/ 1.25（中配），控制填充率；
 * - 滚出视口或标签页隐藏时暂停渲染循环。
 */

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
    gl_FragColor = vec4(vColor, alpha * (0.55 + 0.3 * vBoost));
  }
`;

const SOFT_VERT = /* glsl */ `
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

const SOFT_FRAG = /* glsl */ `
  uniform float uAlpha;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    float alpha = smoothstep(0.5, 0.06, d);
    gl_FragColor = vec4(vColor, alpha * vTwinkle * uAlpha);
  }
`;

/* ---------------- 粒子网络层（前景） ---------------- */

function NetworkLayer({ count }: { count: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const { points, lines, material } = useMemo(() => {
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
      opacity: 0.16,
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

/* ---------------- 柔边粒子层：星云 & 光晕共用 ---------------- */

type SoftLayerProps = {
  count: number;
  /** 半径范围 [min, max] */
  radiusRange: [number, number];
  /** 粒子基础尺寸倍率 */
  sizeScale: number;
  /** 附加透明度（光晕用低值） */
  alpha?: number;
  /** 缓慢自转速度 */
  spin?: number;
  zOffset?: number;
};

function SoftLayer({ count, radiusRange, sizeScale, alpha = 0.5, spin = -0.013, zOffset = 0 }: SoftLayerProps) {
  const groupRef = useRef<THREE.Group>(null);

  const { points, material } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const radius = radiusRange[0] + Math.pow(Math.random(), 0.6) * (radiusRange[1] - radiusRange[0]);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.62;
      positions[i * 3 + 2] = radius * Math.cos(phi) * 0.55 + zOffset;
      pickColor(color);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      sizes[i] = (0.8 + Math.random() * 2.4) * sizeScale;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: SOFT_VERT,
      fragmentShader: SOFT_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uAlpha: { value: alpha },
      },
    });

    return { points: new THREE.Points(geometry, mat), material: mat };
  }, [count, radiusRange, sizeScale, alpha, zOffset]);

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
      groupRef.current.rotation.y = clock.elapsedTime * spin;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={points} />
    </group>
  );
}

/* ---------------- Logo 粒子汇聚层 ---------------- */

type LogoSample = { targets: Float32Array; colors: Float32Array; count: number };

/** 浏览器端采样 logo.png 像素 → 目标点位与颜色（保持 logo 原色） */
function useLogoSample(maxPoints: number): LogoSample | null {
  const [sample, setSample] = useState<LogoSample | null>(null);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.src = "/images/logo.png";
    img.onload = () => {
      if (cancelled) return;
      const S = 140; // 采样画布边长
      const WORLD_W = 7.5; // logo 在场景中的宽度
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = S;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, S, S);
      const { data } = ctx.getImageData(0, 0, S, S);
      const pts: number[] = [];
      const cols: number[] = [];
      const scale = WORLD_W / S;
      for (let y = 0; y < S; y += 2) {
        for (let x = 0; x < S; x += 2) {
          const i = (y * S + x) * 4;
          if (data[i + 3] > 140) {
            pts.push((x - S / 2) * scale, (S / 2 - y) * scale, 0);
            cols.push(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255);
          }
        }
      }
      const total = pts.length / 3;
      if (total === 0) return;
      // 超出配额时等距抽稀
      const count = Math.min(total, maxPoints);
      const targets = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const stride = total / count;
      for (let k = 0; k < count; k++) {
        const src = Math.floor(k * stride) * 3;
        targets[k * 3] = pts[src];
        targets[k * 3 + 1] = pts[src + 1];
        targets[k * 3 + 2] = pts[src + 2];
        colors[k * 3] = cols[src];
        colors[k * 3 + 1] = cols[src + 1];
        colors[k * 3 + 2] = cols[src + 2];
      }
      setSample({ targets, colors, count });
    };
    return () => {
      cancelled = true;
    };
  }, [maxPoints]);

  return sample;
}

function LogoLayer({ maxPoints }: { maxPoints: number }) {
  const sample = useLogoSample(maxPoints);
  if (!sample) return null;
  return <LogoPoints key={sample.count} sample={sample} />;
}

function LogoPoints({ sample }: { sample: LogoSample }) {
  const groupRef = useRef<THREE.Group>(null);

  const { points, geometry, material } = useMemo(() => {
    const count = sample.count;
    // 初始位置：随机球面（粒子从四面八方飞来）
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      const r = 15 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = r * Math.cos(phi) * 0.6;
    }
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      sizes[i] = 1.0 + Math.random() * 0.9;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(sample.colors, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: SOFT_VERT,
      fragmentShader: SOFT_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uAlpha: { value: 0.95 },
      },
    });

    return { points: new THREE.Points(geo, mat), geometry: geo, material: mat };
  }, [sample]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame(({ clock, gl }) => {
    const t = clock.elapsedTime;
    material.uniforms.uTime.value = t;
    material.uniforms.uPixelRatio.value = gl.getPixelRatio();

    // 粒子向目标点渐进汇聚，到位后叠加呼吸微动
    const attr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const k = 0.022;
    for (let i = 0; i < sample.count; i++) {
      const i3 = i * 3;
      const phase = i * 0.37;
      arr[i3] += (sample.targets[i3] + Math.sin(t * 0.8 + phase) * 0.05 - arr[i3]) * k;
      arr[i3 + 1] += (sample.targets[i3 + 1] + Math.cos(t * 0.7 + phase) * 0.05 - arr[i3 + 1]) * k;
      arr[i3 + 2] += (sample.targets[i3 + 2] + Math.sin(t * 0.6 + phase * 1.3) * 0.04 - arr[i3 + 2]) * k;
    }
    attr.needsUpdate = true;

    // 轻微左右摆动（保持 logo 图形可读，不做整周自转）
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.12) * 0.32;
    }
  });

  // logo 成形位置：标题上方（避开中央文字区，配合 Loader 的变体遮罩）
  return (
    <group ref={groupRef} position={[0, 5.4, -1]}>
      <primitive object={points} />
    </group>
  );
}

/* ---------------- 正弦波场层（数学函数曲面） ---------------- */

const WAVES_VERT = /* glsl */ `
  uniform float uTime;
  varying float vH;
  void main() {
    vec3 p = position;
    float w =
      sin(p.x * 0.55 + uTime * 0.8) * 0.9 +
      sin(p.y * 0.7 + uTime * 0.55) * 0.7 +
      sin((p.x + p.y) * 0.32 + uTime * 0.4) * 0.9;
    p.z += w;
    vH = w;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const WAVES_FRAG = /* glsl */ `
  varying float vH;
  void main() {
    vec3 lo = vec3(0.06, 0.24, 0.61); // 藏青
    vec3 hi = vec3(0.075, 0.76, 0.76); // 点缀青
    float h = smoothstep(-1.8, 2.4, vH);
    vec3 c = mix(lo, hi, h);
    gl_FragColor = vec4(c, 0.16 + 0.3 * h);
  }
`;

function WavesLayer({ segments }: { segments: number }) {
  const { mesh, geometry, material } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(52, 28, segments, Math.round(segments * 0.55));
    const mat = new THREE.ShaderMaterial({
      vertexShader: WAVES_VERT,
      fragmentShader: WAVES_FRAG,
      wireframe: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 } },
    });
    const m = new THREE.Mesh(geo, mat);
    return { mesh: m, geometry: geo, material: mat };
  }, [segments]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.z = clock.elapsedTime * 0.015;
    }
  });

  // 波面铺在画面下半部并倾斜，形成"数学曲面地平线"
  return (
    <group ref={groupRef} position={[0, -7.5, -3]} rotation={[0.5, 0, 0]}>
      <primitive object={mesh} />
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

  // 滚出视口 / 标签页隐藏 → 暂停渲染循环
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      threshold: 0.02,
    });
    observer.observe(el);
    const onVisibility = () => setActive(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const networkCount = quality === "high" ? 2400 : 1300;
  const nebulaCount = quality === "high" ? 12000 : 6000;

  return (
    <div ref={wrapRef} className="absolute inset-0" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 16], fov: 55 }}
        dpr={[1, quality === "high" ? 1.5 : 1.25]}
        frameloop={active ? "always" : "never"}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      >
        {variant === "halo" && (
          /* 光晕：少量大尺寸柔边光斑缓慢漂浮——最接近三院科协 halo 的观感，成本最低 */
          <>
            <SoftLayer count={quality === "high" ? 14 : 9} radiusRange={[6, 15]} sizeScale={16} alpha={0.16} spin={0.02} zOffset={-3} />
            <SoftLayer count={quality === "high" ? 500 : 300} radiusRange={[8, 22]} sizeScale={0.7} alpha={0.4} spin={-0.01} zOffset={-2} />
          </>
        )}
        {variant === "nebula" && (
          <SoftLayer count={nebulaCount} radiusRange={[11, 27]} sizeScale={1.15} alpha={0.5} spin={-0.013} zOffset={-4} />
        )}
        {variant === "combo" && (
          <>
            <SoftLayer count={Math.round(nebulaCount * 0.6)} radiusRange={[11, 27]} sizeScale={1.1} alpha={0.45} spin={-0.012} zOffset={-4} />
            <SoftLayer count={10} radiusRange={[7, 16]} sizeScale={12} alpha={0.14} spin={0.018} zOffset={-3} />
            <NetworkLayer count={networkCount} />
          </>
        )}
        {variant === "network" && (
          <>
            <SoftLayer count={8} radiusRange={[8, 18]} sizeScale={14} alpha={0.12} spin={0.016} zOffset={-5} />
            <NetworkLayer count={networkCount} />
          </>
        )}
        {variant === "converge" && (
          /* 汇聚：粒子从四方飞来拼成基地 Logo（保留 logo 原色），悬于标题上方 */
          <>
            <LogoLayer maxPoints={quality === "high" ? 3800 : 2000} />
            <SoftLayer count={quality === "high" ? 600 : 350} radiusRange={[10, 24]} sizeScale={0.8} alpha={0.35} spin={-0.01} zOffset={-6} />
          </>
        )}
        {variant === "waves" && (
          /* 波形：正弦叠加的函数曲面线框，数学与计算科学学院的"数形"表达 */
          <>
            <WavesLayer segments={quality === "high" ? 110 : 70} />
            <SoftLayer count={quality === "high" ? 900 : 500} radiusRange={[10, 24]} sizeScale={0.7} alpha={0.4} spin={-0.008} zOffset={-5} />
          </>
        )}
        <CameraRig />
      </Canvas>
    </div>
  );
}
