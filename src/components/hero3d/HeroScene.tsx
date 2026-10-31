"use client";

/**
 * Hero 3D 场景装配（D4 定稿：时间算法）。
 * 性能策略：无后处理、DPR≤1.5、LCP 后懒加载、滚出视口/标签页隐藏暂停、
 * reduced-motion 整体降级为静态渐变；中心镂空遮罩由 Loader 统一处理。
 * 落选候选场景存档见 archive/hero3d/。
 */

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";

import { heroInteraction, ANIM_SPEED } from "./interaction";
import { ArmillaryLayer } from "./sceneArmillary";

export type SceneQuality = "high" | "medium";

/* ---------------- 柔边粒子层（尘埃/雾） ---------------- */

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

type SoftLayerProps = {
  count: number;
  radiusRange: [number, number];
  sizeScale: number;
  alpha?: number;
  spin?: number;
  zOffset?: number;
  colors: Array<[string, number]>;
};

function SoftLayer({ count, radiusRange, sizeScale, alpha = 0.5, spin = -0.013, zOffset = 0, colors }: SoftLayerProps) {
  const groupRef = useRef<THREE.Group>(null);

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
      let picked = colors[0][0];
      for (const [hex, weight] of colors) {
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
  }, [count, radiusRange, sizeScale, alpha, zOffset, colors]);

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

/* ---------------- 交互系统 ---------------- */

/** 交互状态更新器：世界坐标换算、涟漪推进、拖拽惯性回中 */
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

/** 交互刚体：±4° 阻尼视差 + ±18° 拖拽旋转（松手惯性回中） */
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

/** 点击能量波：从点击位置扩散的柔和冰蓝光环 */
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

export default function HeroScene({ quality }: { quality: SceneQuality }) {
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

  return (
    <div ref={wrapRef} className="absolute inset-0" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 16], fov: 55 }}
        dpr={[1, quality === "high" ? 1.5 : 1.25]}
        frameloop={active ? "always" : "never"}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      >
        <InteractionRig>
          <ArmillaryLayer quality={quality} />
          <SoftLayer
            count={quality === "high" ? 520 : 320}
            radiusRange={[12, 27]}
            sizeScale={0.5}
            alpha={0.16}
            spin={-0.004}
            zOffset={-12}
            colors={[
              ["#7CC4F2", 0.4],
              ["#2E7BC4", 0.35],
              ["#F4FAFF", 0.25],
            ]}
          />
        </InteractionRig>
        <InteractionUpdater />
        <RippleFx />
      </Canvas>
    </div>
  );
}
