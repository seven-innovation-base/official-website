# Hero 3D「时间算法」调参手册

> D4 定稿场景：青铜绿 × 铜金的浑天仪数学装置。
> 落选的六个候选场景存档在 `archive/hero3d/`（含恢复说明）。
> 改动后 `pnpm dev` 即时预览；提交前跑 `pnpm lint && pnpm build`。

## 文件地图

| 文件 | 内容 |
|------|------|
| `sceneArmillary.tsx` | 场景本体：轨道环、刻度、轨道粒子 |
| `HeroScene.tsx` | 装配：尘埃层、交互刚体、能量波、Canvas |
| `Hero3DLoader.tsx` | 专属配色、中心镂空遮罩、拖拽换算、懒加载 |
| `interaction.ts` | 全局速度 `ANIM_SPEED`、鼠标扰动、点击波 |
| `../app/page.tsx` | Hero 文字 / 按钮 / Logo / 兜底渐变 |

## 全局

| 参数 | 位置 | 当前值 | 效果 |
|------|------|--------|------|
| 动效总速度 | `interaction.ts` → `ANIM_SPEED` | `2` | 全场景统一倍率 |
| 鼠标扰动半径 | `interaction.ts` → `GLSL_MOUSE_APPLY` 的 `2.4` | ≈150px | 指针影响范围 |
| 扰动强度 | 同上 `* 0.7` | 0.7 | 吸引力度 |
| 点击波波速/寿命 | `interaction.ts` → `18.0` / `0.45`（RippleFx 同步 0.45） | — | 两处一起改 |
| 中心镂空遮罩 | `Hero3DLoader.tsx` → `mask` | 椭圆 58%×52%，内洞 32% | 文字保护区；嫌挡字加大 transparent |
| 画质分档 | `Hero3DLoader.tsx` → `detectTier()` | ≥8核/8G=high；<768px=medium | 数量参数两档成对 |
| 场景配色 | `Hero3DLoader.tsx` → `ARMILLARY_PALETTE` | 三段渐变 + 铜金 accent | Hero 底色与能量波 |

## 场景本体（sceneArmillary.tsx）

| 参数 | 位置 | 当前值 | 效果 |
|------|------|--------|------|
| 四环半径 | `base` 数组 `r` | 7.4 / 9 / 10.6 / 12.2 | 环的大小 |
| 环管粗细 | `tube` | 0.1 → 0.065 | 越外环越细 |
| 各环倾角 | `tilt` 三元组 | 各不相同 | 空间姿态（弧度） |
| 各环转速 | `speed: ±2π/86 等` | 86/62/52/74 秒一圈 | 负值反向 |
| 刻度密度 | `ticks` | 144/168/192/216 | `i % 6` 控制长刻度间隔 |
| 铜色亮度 | `BRONZE_FRAG` 的 `0.32 + 0.52` | — | 环底亮 / 边缘亮 |
| 金/白比例 | 同上 `pow(vF,1.5)*0.9` 与 `pow(vF,5.0)*0.45` | — | 边缘偏金还是偏象牙白 |
| 轨道粒子数 | `orbitCount` 与 `orbiters`（两处！） | high 368 / med 208 | 沿轨光点 |
| 粒子速度 | `speed: (0.1+rand*0.18) * 4` | 累计 ×4 | 沿轨快慢 |
| 粒子大小/闪烁 | `sizes 1.8+1.8`、`uTime * 1.1` | — | 光点颗粒感与明灭 |

## 尘埃与交互（HeroScene.tsx）

| 参数 | 位置 | 当前值 | 效果 |
|------|------|--------|------|
| 背景尘埃数 | SoftLayer `count` | high 520 / med 320 | 苔绿雾感 |
| 尘埃配色 | `colors` 数组 | 铜金/灰绿/象牙 | 权重即配比 |
| 视差角度 | `InteractionRig` 的 `0.07 / 0.045` | ±4°/±2.6° | 结构摆动幅度 |
| 拖拽范围/换算 | `Hero3DLoader` 的 `0.315` / `0.63` | ±18° | 按住拖动 |
| 回中速度 | `InteractionUpdater` 的 `0.3` / `0.02` | — | 松手弹回 |

## Hero 文字与按钮（../app/page.tsx）

| 参数 | 位置 | 当前值 |
|------|------|--------|
| 主标题字号 | h1 `text-4xl sm:text-5xl md:text-6xl` | 36/48/60px |
| 副标题字号 | p `text-sm md:text-base` | 14/16px |
| 按钮 | `px-5 py-2.5 text-sm md:px-6 md:py-3 md:text-base` | 统一白描边样式 |
| Logo | `h-20 w-20`（logo2.png） | 80px |
| 兜底渐变 | section `from-[#07130f] via-[#12281f] to-[#0a1a14]` | 与场景配色一致 |

## 注意事项

1. **颜色两套写法**：JS 十六进制（`"#C58A4A"`）vs GLSL 浮点（`vec3(0.773,0.541,0.290)`），改色自己换算（÷255）。
2. **数量参数成对**（high/medium），桌面开发跑 high 档。
3. 改 GLSL 后不生效就 `Ctrl+Shift+R` 强刷或重启 dev。
4. **亮度 = alpha**（加色混合），调亮改 alpha；猛加颜色值会过曝。
5. **别改名字**：attribute（aT…）/varying（vWpos…）/uniform（uTime…）顶点片元成对出现，单独改名黑屏。
6. 提交纪律：`pnpm lint && pnpm build` 双绿才 commit，构建不过不推送。
