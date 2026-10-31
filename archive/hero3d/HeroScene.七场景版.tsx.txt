"use client";

/**
 * Hero 3D 场景（D4 候选七个：红移星环 / 时间算法 / 洛伦兹风暴眼 / 向量场之茧 /
 * 正弦波场 / 深空星云 / 网格星球）。
 * 性能策略：无后处理、DPR≤1.5、LCP 后懒加载、滚出视口/标签页隐藏暂停、
 * reduced-motion 整体降级为静态渐变；中心镂空遮罩由 Loader 统一处理。
 */

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

import { heroInteraction, ANIM_SPEED } from "./interaction";
import { FieldLayer, LorenzLayer } from "./sceneExtras";
import { ArmillaryLayer, RedshiftLayer } from "./sceneExtras3";

export type SceneVariant =
  | "lorenz"
  | "field"
  | "waves"
  | "nebula"
  | "globe"
  | "redshift"
  | "armillary";
export type SceneQuality = "high" | "medium";

/** 进阶场景（专属配色 + 完整交互：结构视差 + 拖拽 + 引力扰动 + 点击能量波） */
const ADVANCED_VARIANTS: SceneVariant[] = ["redshift", "armillary"];

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

/* ---------------- 柔边粒子层：星云 & 光晕 & 尘埃共用 ---------------- */

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
  /** 自定义色板（默认品牌藏青蓝色板） */
  colors?: Array<[string, number]>;
};

export function SoftLayer({
  count,
  radiusRange,
  sizeScale,
  alpha = 0.5,
  spin = -0.013,
  zOffset = 0,
  colors,
}: SoftLayerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const palette = colors ?? PALETTE;

  const { points, material } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colorsArr = new Float32Array(count * 3);
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
      let r = Math.random();
      let picked = palette[0][0];
      for (const [hex, weight] of palette) {
        r -= weight;
        if (r <= 0) {
          picked = hex;
          break;
        }
      }
      color.set(picked);
      colorsArr[i * 3] = color.r;
      colorsArr[i * 3 + 1] = color.g;
      colorsArr[i * 3 + 2] = color.b;
      sizes[i] = (0.8 + Math.random() * 2.4) * sizeScale;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colorsArr, 3));
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
  }, [count, radiusRange, sizeScale, alpha, zOffset, palette]);

  useEffect(
    () => () => {
      points.geometry.dispose();
      material.dispose();
    },
    [points, material],
  );

  useFrame(({ clock, gl }) => {
    material.uniforms.uTime.value = clock.elapsedTime * ANIM_SPEED;
    material.uniforms.uPixelRatio.value = gl.getPixelRatio();
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * spin * ANIM_SPEED;
    }
  });

  return (
    <group ref={groupRef}>
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
    material.uniforms.uTime.value = clock.elapsedTime * ANIM_SPEED;
    if (groupRef.current) {
      groupRef.current.rotation.z = clock.elapsedTime * 0.015 * ANIM_SPEED;
    }
  });

  // 波面铺在画面下半部并倾斜，形成"数学曲面地平线"
  return (
    <group ref={groupRef} position={[0, -7.5, -3]} rotation={[0.5, 0, 0]}>
      <primitive object={mesh} />
    </group>
  );
}

/* ---------------- 网格星球层 ---------------- */

function GlobeLayer() {
  const groupRef = useRef<THREE.Group>(null);

  const { wireframe, surfacePoints, ring, disposables } = useMemo(() => {
    // detail 3：线框与顶点密度约为 detail 2 的 4 倍（D4 优化：密度加倍再加倍观感）
    const geo = new THREE.IcosahedronGeometry(7.2, 3);
    const wire = new THREE.WireframeGeometry(geo);
    const wireMat = new THREE.LineBasicMaterial({
      color: new THREE.Color("#2e7bc4"),
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const wireframe = new THREE.LineSegments(wire, wireMat);

    // 顶点发光点
    const vAttr = geo.getAttribute("position");
    const vCount = vAttr.count;
    const colors = new Float32Array(vCount * 3);
    const sizes = new Float32Array(vCount);
    const color = new THREE.Color();
    for (let i = 0; i < vCount; i++) {
      pickColor(color);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      sizes[i] = 2.2 + Math.random() * 1.4;
    }
    const ptsGeo = new THREE.BufferGeometry();
    ptsGeo.setAttribute("position", vAttr.clone());
    ptsGeo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    ptsGeo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    const phases = new Float32Array(vCount).map(() => Math.random() * Math.PI * 2);
    ptsGeo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    const ptsMat = new THREE.ShaderMaterial({
      vertexShader: SOFT_VERT,
      fragmentShader: SOFT_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uAlpha: { value: 0.9 },
      },
    });
    const surfacePoints = new THREE.Points(ptsGeo, ptsMat);

    // 倾斜光环
    const ringCount = 840;
    const ringPos = new Float32Array(ringCount * 3);
    const ringCol = new Float32Array(ringCount * 3);
    const ringSize = new Float32Array(ringCount);
    const ringPhase = new Float32Array(ringCount);
    for (let i = 0; i < ringCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 9.6 + Math.random() * 1.6;
      ringPos[i * 3] = Math.cos(a) * r;
      ringPos[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      ringPos[i * 3 + 2] = Math.sin(a) * r;
      color.set("#13c2c2").lerp(new THREE.Color("#8fd0ff"), Math.random() * 0.5);
      ringCol[i * 3] = color.r;
      ringCol[i * 3 + 1] = color.g;
      ringCol[i * 3 + 2] = color.b;
      ringSize[i] = 1.2 + Math.random() * 1.8;
      ringPhase[i] = Math.random() * Math.PI * 2;
    }
    const ringGeo = new THREE.BufferGeometry();
    ringGeo.setAttribute("position", new THREE.BufferAttribute(ringPos, 3));
    ringGeo.setAttribute("aColor", new THREE.BufferAttribute(ringCol, 3));
    ringGeo.setAttribute("aSize", new THREE.BufferAttribute(ringSize, 1));
    ringGeo.setAttribute("aPhase", new THREE.BufferAttribute(ringPhase, 1));
    const ringMat = new THREE.ShaderMaterial({
      vertexShader: SOFT_VERT,
      fragmentShader: SOFT_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uAlpha: { value: 0.75 },
      },
    });
    const ring = new THREE.Points(ringGeo, ringMat);

    return {
      wireframe,
      surfacePoints,
      ring,
      disposables: [geo, wire, wireMat, ptsGeo, ptsMat, ringGeo, ringMat],
    };
  }, []);

  useEffect(
    () => () => {
      disposables.forEach((d) => d.dispose());
    },
    [disposables],
  );

  const ringRef = useRef<THREE.Group>(null);
  useFrame(({ clock, gl }) => {
    const t = clock.elapsedTime * ANIM_SPEED;
    const mat = surfacePoints.material as THREE.ShaderMaterial;
    mat.uniforms.uTime.value = t;
    mat.uniforms.uPixelRatio.value = gl.getPixelRatio();
    const rMat = ring.material as THREE.ShaderMaterial;
    rMat.uniforms.uTime.value = t;
    rMat.uniforms.uPixelRatio.value = gl.getPixelRatio();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.06;
    }
    if (ringRef.current) {
      ringRef.current.rotation.y = -t * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.5, -2]} rotation={[0.35, 0, 0]}>
      <primitive object={wireframe} />
      <primitive object={surfacePoints} />
      <group ref={ringRef} rotation={[1.05, 0, 0.2]}>
        <primitive object={ring} />
      </group>
    </group>
  );
}

/* ---------------- 相机视差（非进阶场景） ---------------- */

function CameraRig() {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 16));

  useFrame(({ pointer }) => {
    target.current.set(pointer.x * 1.5, pointer.y * 0.9, 16);
    camera.position.lerp(target.current, 0.06);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ---------------- 交互系统 ---------------- */

/** 交互状态更新器：世界坐标换算、涟漪推进、拖拽惯性回中（所有场景生效） */
function InteractionUpdater() {
  useFrame(({ pointer, viewport }, delta) => {
    const dt = Math.min(delta, 0.05);
    const it = heroInteraction;
    it.mouseWorld.set((pointer.x * viewport.width) / 2, (pointer.y * viewport.height) / 2, 0);
    if (it.rippleTime < 5) {
      if (it.rippleTime < 0.001) {
        it.rippleCenter.set((it.rippleNx * viewport.width) / 2, (it.rippleNy * viewport.height) / 2);
      }
      it.rippleTime += dt;
    }
    if (!it.dragging) {
      it.dragOffset += it.dragVel * dt;
      it.dragVel *= Math.pow(0.02, dt * 2.4);
      it.dragOffset *= Math.pow(0.3, dt);
      if (Math.abs(it.dragOffset) < 0.0004) {
        it.dragOffset = 0;
        it.dragVel = 0;
      }
    }
  });
  return null;
}

/** 进阶场景交互刚体：±4° 阻尼视差 + ±18° 拖拽旋转（松手惯性回中） */
function InteractionRig({ children }: { children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  useFrame(() => {
    const it = heroInteraction;
    const targetY = (it.inside ? it.px * 0.07 : 0) + it.dragOffset;
    const targetX = it.inside ? -it.py * 0.045 : 0;
    if (!g.current) return;
    const k = 1 - Math.pow(0.0015, 0.016);
    g.current.rotation.y += (targetY - g.current.rotation.y) * k;
    g.current.rotation.x += (targetX - g.current.rotation.x) * k;
  });
  return <group ref={g}>{children}</group>;
}

/** 点击能量波：从点击位置扩散的柔和光环（配色随场景） */
function RippleFx() {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    const it = heroInteraction;
    const mesh = meshRef.current;
    const mat = matRef.current;
    if (!mesh || !mat) return;
    if (it.rippleTime < 0.45) {
      const e = 1 - Math.pow(1 - it.rippleTime / 0.45, 3);
      mesh.visible = true;
      mesh.position.set(it.rippleCenter.x, it.rippleCenter.y, 0.5);
      mesh.scale.setScalar(0.4 + e * 14);
      mat.opacity = (1 - it.rippleTime / 0.45) * 0.5;
      mat.color.set(it.rippleColor);
    } else {
      mesh.visible = false;
    }
  });

  return (
    <mesh ref={meshRef} visible={false} frustumCulled={false}>
      <ringGeometry args={[0.94, 1, 64]} />
      <meshBasicMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
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

  const nebulaCount = quality === "high" ? 24000 : 12000;

  return (
    <div ref={wrapRef} className="absolute inset-0" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 16], fov: 55 }}
        dpr={[1, quality === "high" ? 1.5 : 1.25]}
        frameloop={active ? "always" : "never"}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      >
        {variant === "lorenz" && (
          /* 洛伦兹风暴眼：真实吸引子双翼 + 玻璃光带 + 彗星流点 */
          <>
            <LorenzLayer quality={quality} />
            <SoftLayer count={quality === "high" ? 840 : 520} radiusRange={[12, 26]} sizeScale={0.55} alpha={0.26} spin={-0.006} zOffset={-12} />
          </>
        )}
        {variant === "field" && (
          /* 向量场之茧：curl noise 流线 + 能量粒子 */
          <>
            <FieldLayer quality={quality} />
            <SoftLayer count={quality === "high" ? 600 : 360} radiusRange={[14, 28]} sizeScale={0.5} alpha={0.22} spin={-0.005} zOffset={-12} />
          </>
        )}
        {variant === "waves" && (
          /* 正弦波场：正弦叠加的函数曲面线框，数学与计算科学学院的"数形"表达 */
          <>
            <WavesLayer segments={quality === "high" ? 220 : 140} />
            <SoftLayer count={quality === "high" ? 1800 : 1000} radiusRange={[10, 24]} sizeScale={0.7} alpha={0.4} spin={-0.008} zOffset={-5} />
          </>
        )}
        {variant === "nebula" && (
          /* 深空星云：星尘漂移 */
          <SoftLayer count={nebulaCount} radiusRange={[11, 27]} sizeScale={1.15} alpha={0.5} spin={-0.013} zOffset={-4} />
        )}
        {variant === "globe" && (
          /* 网格星球：线框行星 + 倾斜光环，经典科技感 */
          <GlobeLayer />
        )}

        {/* —— 进阶场景组（专属配色 + 完整交互）—— */}
        {ADVANCED_VARIANTS.includes(variant) && (
          <InteractionRig>
            {variant === "redshift" && (
              /* 红移星环：勃艮第酒红 × 珊瑚金 */
              <>
                <RedshiftLayer quality={quality} />
                <SoftLayer
                  count={quality === "high" ? 520 : 320}
                  radiusRange={[11, 26]}
                  sizeScale={0.6}
                  alpha={0.16}
                  spin={-0.004}
                  zOffset={-11}
                  colors={[
                    ["#FF6B5E", 0.35],
                    ["#8F1D2C", 0.4],
                    ["#FFD4B8", 0.25],
                  ]}
                />
              </>
            )}
            {variant === "armillary" && (
              /* 时间算法：青铜绿 × 铜金 */
              <>
                <ArmillaryLayer quality={quality} />
                <SoftLayer
                  count={quality === "high" ? 520 : 320}
                  radiusRange={[12, 27]}
                  sizeScale={0.5}
                  alpha={0.16}
                  spin={-0.004}
                  zOffset={-12}
                  colors={[
                    ["#C58A4A", 0.4],
                    ["#4F7B67", 0.35],
                    ["#F1DDBA", 0.25],
                  ]}
                />
              </>
            )}
          </InteractionRig>
        )}

        {/* 交互系统（所有场景生效） */}
        <InteractionUpdater />
        <RippleFx />
        {!ADVANCED_VARIANTS.includes(variant) && <CameraRig />}
      </Canvas>
    </div>
  );
}
