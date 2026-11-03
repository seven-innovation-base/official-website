import * as THREE from "three";

/**
 * 全局动效速度倍率（D4 优化指令：2 倍速）。所有 uTime 与旋转动画统一乘此值，
 * 后续想整体调速只改这一处。
 */
export const ANIM_SPEED = 2;

/**
 * Hero 交互共享状态（模块级单例，DOM 侧写入、Canvas 侧每帧读取）。
 * 设计约束：屏幕空间计算、无逐粒子 Raycast、Shader 内处理鼠标影响。
 */
export const heroInteraction = {
  /** 归一化指针坐标 NDC（-1..1），仅指针在 Hero 内时有效 */
  px: 0,
  py: 0,
  inside: false,
  /** 拖拽（仅桌面鼠标）：dragOffset 为目标附加旋转（弧度），松手后由装置衰减回中 */
  dragging: false,
  dragOffset: 0,
  dragVel: 0,
  /** 指针在 z≈0 平面的世界坐标（引力源，供 Shader 局部扰动） */
  mouseWorld: new THREE.Vector3(999, 999, 999),
  /** 点击能量波：触发时的 NDC 坐标 + 世界坐标中心 + 时间（秒，>1 视为已消散） */
  rippleNx: 999,
  rippleNy: 999,
  rippleCenter: new THREE.Vector2(999, 999),
  rippleTime: 10,
  rippleColor: new THREE.Color("#13c2c2"),
};

/** 供各场景 useFrame 统一刷新交互 uniforms（材质需声明同名 uniforms） */
export function updateInteractionUniforms(mat: THREE.ShaderMaterial) {
  const u = mat.uniforms;
  if (u.uMouse) (u.uMouse.value as THREE.Vector3).copy(heroInteraction.mouseWorld);
  if (u.uRippleCenter) (u.uRippleCenter.value as THREE.Vector2).copy(heroInteraction.rippleCenter);
  if (u.uRippleTime) u.uRippleTime.value = heroInteraction.rippleTime;
}

/** 交互 uniforms 的标准声明（创建 ShaderMaterial 时展开到 uniforms） */
export function interactionUniforms() {
  return {
    uMouse: { value: new THREE.Vector3(999, 999, 999) },
    uRippleCenter: { value: new THREE.Vector2(999, 999) },
    uRippleTime: { value: 10 },
  };
}

/* ---------- 可注入 Shader 的 GLSL 片段 ---------- */

/** 顶点着色器：声明世界坐标 varying + 鼠标引力扰动（吸引，半径 ~2.4 世界单位 ≈ 150px） */
export const GLSL_MOUSE_VERT = /* glsl */ `
  uniform vec3 uMouse;
  varying vec3 vWpos;
`;

/** 与 GLSL_MOUSE_VERT 配套：在计算出最终位置 p 之后调用 */
export const GLSL_MOUSE_APPLY = /* glsl */ `
  vec2 toMouse = uMouse.xy - p.xy;
  float md = length(toMouse);
  p.xy += (md > 0.0001 ? normalize(toMouse) : vec2(0.0)) * smoothstep(2.4, 0.0, md) * 0.7;
  vWpos = (modelMatrix * vec4(p, 1.0)).xyz;
`;

/** 片元着色器：点击能量波提亮（与 interactionUniforms 的 uRipple* 配套） */
export const GLSL_RIPPLE_FRAG = /* glsl */ `
  uniform vec2 uRippleCenter;
  uniform float uRippleTime;
`;

export const GLSL_RIPPLE_GLOW = /* glsl */ `
  float dRip = distance(vWpos.xy, uRippleCenter.xy);
  float rRip = uRippleTime * 18.0;
  rippleGlow = smoothstep(1.8, 0.0, abs(dRip - rRip)) * max(0.0, 1.0 - uRippleTime / 0.45);
`;
