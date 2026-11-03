# 桂电七院创新基地官网

> 桂林电子科技大学 · 数学与计算科学学院 · 大学生数学应用及创新基地 官方网站
>
> **2026 重构版**：从 2020 年的 Docusaurus 站点重写为 Next.js 静态站，本站为现行版本。

---

## 项目简介

这是基地的官方网站，承担四件事：

1. **对外展示**：基地介绍、三大部门方向、成员墙、历年荣誉
2. **招新入口**：招新流程、QQ 群、二维码
3. **资源聚合**：FTP 资料库编目（11,455 份 / 132.7 GB）、OJ 练习系统入口
4. **内容存档**：旧站（2020–2026）文档与博客的只读归档

### 核心特点

- **纯静态**：`next build` 导出静态文件，无后端、无数据库，部署成本与运维成本都极低
- **内容即数据**：成员、荣誉、部门、站点配置全部是 `content/` 下的 JSON，改内容不用写代码
- **3D 首屏**：Hero 使用 three.js「时间算法」浑天仪场景，带分级质量与懒加载，不拖累首屏指标
- **零门槛维护**：配套《维护手册》，非开发同学也能按文档更新内容

---

## 技术栈

| 分类 | 选择 | 说明 |
|------|------|------|
| 框架 | **Next.js 15**（App Router） | `output: "export"` 静态导出 |
| 语言 | **TypeScript**（strict） | |
| 样式 | **Tailwind CSS v4** | 设计 token 见 `src/app/globals.css` |
| 包管理 | **pnpm** | 单一锁文件 |
| 3D | **three.js + @react-three/fiber** | Hero 场景，独立懒加载 chunk |
| 数据校验 | **zod** | `src/lib/content.ts` 校验 JSON 结构 |
| 评论 | **GitHub Issue** | 复用官方仓库 Issue #86，前端直读 GitHub API |

运行时依赖：Node.js ≥ 20。

---

## 快速开始

```bash
# 1. 安装依赖
pnpm install

# 2. 本地开发（默认 http://localhost:3000）
pnpm dev

# 3. 代码检查
pnpm lint

# 4. 构建静态站（产物在 out/）
pnpm build
```

构建产物 `out/` 是完整的静态站点（无服务端依赖），可直接用于任何静态托管。

> 预览构建产物：`npx serve out`，然后访问终端提示的地址。

---

## 项目结构

```text
.
├── content/                    ★ 站点内容（改内容只动这里）
│   ├── members.json              成员墙（按届分组）
│   ├── honors.json               历史荣誉（合并去重后的完整数据）
│   ├── departments.json          三大部门介绍（名称/方向/职责/工具/成长目标）
│   └── site-config.json          站点配置（站名/口号/QQ群/视频/OJ/评论源/统计）
│
├── src/
│   ├── app/                    页面路由（App Router）
│   │   ├── page.tsx              首页：Hero → 视频 → 三大部门 → 荣誉 → 留言板
│   │   ├── members/page.tsx      团队成员（按届时间线）
│   │   ├── honors/page.tsx       历史荣誉（桌面表格 / 移动卡片）
│   │   ├── ftp/page.tsx          FTP 资料库（目录树 + 搜索）
│   │   ├── oj/page.tsx           OJ 中转页（校园网可达性探测）
│   │   ├── join/page.tsx         加入我们（招新群二维码）
│   │   ├── sitemap.ts            sitemap.xml
│   │   ├── robots.ts             robots.txt
│   │   ├── not-found.tsx         404 页
│   │   ├── layout.tsx            全局布局（页脚 / SEO / 统计）
│   │   └── globals.css           设计 token（藏青蓝 / 冰蓝主题）
│   │
│   ├── components/
│   │   ├── hero3d/               Hero 3D 场景
│   │   │   ├── Hero3DLoader.tsx    分级质量探测 + 懒加载 + 交互监听
│   │   │   ├── HeroScene.tsx       场景装配（Canvas / 相机 / 交互）
│   │   │   ├── sceneArmillary.tsx  「时间算法」浑天仪场景本体
│   │   │   ├── interaction.ts      交互状态与着色器片段（视差/拖拽/能量波）
│   │   │   └── TUNING.md           ★ 3D 调参手册
│   │   ├── home/                 首页区块（视频 / 评论区）
│   │   ├── honors/               荣誉表格（桌面/移动双布局）
│   │   ├── ftp/                  FTP 目录浏览器
│   │   ├── oj/                   校园网探测卡片
│   │   ├── join/                 二维码灯箱
│   │   └── site/                 导航页脚 / 滚动渐显 / 播放统计
│   │
│   └── lib/content.ts           内容加载（zod 校验后导出类型化数据）
│
├── public/                     静态资源（原样输出到 out/）
│   ├── images/                   图片（logo / 部门插画 / 招新二维码）
│   ├── videos/                   宣传视频与封面（promo.mp4 / promo.jpg）
│   ├── data/ftp-catalog.json     FTP 编目（脚本生成，勿手改）
│   ├── legacy/                 ★ 旧站归档（Docusaurus 构建产物，只读）
│   ├── CNAME                     GitHub Pages 自定义域名
│   └── favicon.ico
│
├── scripts/
│   ├── ftp/extract_catalog.py    FTP 编目生成（扫描清单 → JSON，含脱敏黑名单）
│   └── migration/                Waline 时期的留言迁移脚本与数据备份（存档）
│
├── archive/hero3d/             Hero 3D 落选场景存档（含恢复说明）
├── .github/workflows/site-ci.yaml  CI：lint + build；官方仓库 push 时自动发布
└── MAINTENANCE.md              ★ 维护手册（日常更新 / 排障入口）
```

---

## 核心功能说明

### 1. 首页（`src/app/page.tsx`）

自上而下五个区块：

- **Hero 3D**：three.js「时间算法」浑天仪场景。含分级质量（high/medium/low，low 直接回退静态渐变）、鼠标视差（±4°）、拖拽旋转（±18°）、点击能量波、滚出视口自动暂停。**调整参数见 `src/components/hero3d/TUNING.md`**
- **宣传视频**：本地自托管 mp4，点封面才加载播放器
- **三大部门**：软件部 / 大数据部 / 算法部，文案来自 `content/departments.json`
- **历史荣誉**：桌面三列表格、移动端卡片列表
- **留言板**：读官方仓库 Issue #86 的评论，分页展示；「我也来说几句」跳转 GitHub 留言

### 2. FTP 资料库（`/ftp`）

把 11,455 份资料 / 132.7 GB 的编目做成官网原生页面：

- 八分区折叠树，目录展开时才渲染文件清单（初始 DOM 很轻）
- 全局搜索 + 命中高亮
- 任意文件/目录一键复制 `ftp://` 完整路径
- 数据来源：`scripts/ftp/extract_catalog.py` 扫描生成 `public/data/ftp-catalog.json`（含脱敏黑名单，密码/账号类文件自动排除）

### 3. OJ 中转页（`/oj`）

OJ 部署在校园网内网、全站需登录，因此**不做内嵌**，只做导航：

- 打开页自动探测可达性（`fetch no-cors` + `img` 双手段）
- 可达 → 亮出「进入 OJ」按钮；不可达 → 给校园网/VPN 连接指引
- 同时永远提供可复制的地址（探测结果仅作参考）

### 4. 评论区（GitHub Issue 模式）

- 数据：`seven-innovation-base/official-website` 的 **Issue #86** 评论列表（GitHub API，免认证）
- 留言：需要 GitHub 账号（基地成员标配，天然防灌水），点「我也来说几句」跳转 Issue
- 容错：评论缓存到 localStorage（10 分钟 TTL，不消耗 API 配额）；限流或断网时展示缓存 + 重试按钮，不白屏
- 楼中楼：沿用旧站约定，正文中以 `>` 开头的行视为引用，挂在对应主评论下

### 5. 旧站归档（`/legacy/`）

旧站（Docusaurus 3.8）完整构建产物，共 133 个文件，只读保留，顶部带「历史归档」横幅。

> 开发模式下请访问 `/legacy/index.html`（Next 开发服务器不解析 `public/` 的目录索引）；生产环境两种写法均可。

---

## 内容维护（不含代码）

| 要改什么 | 改哪个文件 | 注意事项 |
|---------|-----------|---------|
| 加成员 | `content/members.json` | 按届分组，`avatar` 支持 `github:用户名` |
| 加荣誉 | `content/honors.json` | 加在数组最前；`tags` 格式 `[N人] · 级别` |
| 改部门介绍 | `content/departments.json` | |
| 换宣传视频 / 封面 | 替换 `public/videos/promo.mp4` / `promo.jpg` | 封面建议 ≤200 KB |
| 换招新二维码 | 替换 `public/images/qq-qrcode.jpg` | |
| 改站名/口号/QQ群/OJ 地址 | `content/site-config.json` | |
| 更新 FTP 编目 | 跑 `python scripts/ftp/extract_catalog.py` | 需先准备最新扫描清单 |
| 开百度统计 | `site-config.json` → `analytics.baiduToken` | 留空则不加载 |

完整操作流程（含发布、备份、排障）见 **[MAINTENANCE.md](./MAINTENANCE.md)**。

---

## 注意事项（改代码前必读）

1. **构建必须全绿**：`pnpm lint && pnpm build` 双绿再提交；
2. **`public/legacy/**` 是归档产物**，不要手改（已在 `.gitattributes` 里标记为生成文件）；
3. **`public/data/ftp-catalog.json` 由脚本生成**，手改会在下次生成时被覆盖；
4. **3D 参数改动**请先读 `src/components/hero3d/TUNING.md`——里面写了每个参数在哪、调什么效果，以及性能红线；
5. **`content/` 的 JSON 有 zod 校验**，字段写错构建会直接报错（这是有意设计，防止内容静默出错）；
6. 性能红线：首页 First Load JS 约 108 KB，3D 独立 chunk ≤ 250 KB（gzip），勿引入大型 UI 库。

---

## 相关文档

| 文档 | 位置 | 内容 |
|------|------|------|
| 维护手册 | `MAINTENANCE.md` | 日常任务清单、性能红线、已知问题 |
| 3D 调参手册 | `src/components/hero3d/TUNING.md` | 场景参数表与注意事项 |

---

## 历史

| 时间 | 事件 |
|------|------|
| 2020-05 | 旧站上线（Docusaurus 2.0-beta） |
| 2025-06 | 旧站升级至 Docusaurus 3.8.1 |
| 2026-10 | 重构为 Next.js 静态站：全新首页 3D、内容 JSON 化、FTP/OJ 整合、旧站归档 |
