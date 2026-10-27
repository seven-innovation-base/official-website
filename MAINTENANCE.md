# 七院创新基地官网 · 维护手册

> 写给下一届维护者：不需要精通编程也能完成日常更新。遇到本手册没覆盖的情况，先看「四、进阶」和文末求助渠道。

## 一、这个项目是什么

- **技术栈**：Next.js 15（静态导出）+ TypeScript + Tailwind CSS v4 + three.js（Hero 3D「时间算法」场景）+ GitHub Issue 评论区
- **代码仓库**：`xiaoxiaoyu-123/official-website-new`（GitHub，main 分支推送即触发 CI 检查）
- **旧站（2020–2026）**：归档在 `/legacy/` 路径，只读不再更新（`pnpm dev` 下请用 `/legacy/index.html` 访问——开发服务器不解析 public 目录索引，生产环境两种写法都可以）
- **核心设计**：**内容与代码分离**——成员、荣誉、部门介绍、站点配置全部是 `content/` 下的 JSON 文件，改内容 = 改 JSON + 提交，不用碰任何代码

## 二、目录速览

```
content/              ★ 内容数据（最常改的就是这里）
  members.json          成员墙
  honors.json           历史荣誉
  departments.json      三大部门介绍
  site-config.json      站点配置（QQ群/视频/OJ/评论服务地址/统计token）
public/
  images/               图片（logo、部门插画、二维码）
  videos/               宣传视频（本地自托管）
  data/ftp-catalog.json FTP 资料库目录树（脚本生成，勿手改）
  legacy/               旧站归档（勿动）
src/
  app/                  页面路由
  components/           组件（hero3d/ 内含 3D 调参手册 TUNING.md）
  lib/content.ts        数据加载与校验
scripts/
  ftp/extract_catalog.py   FTP 编目生成脚本
  migration/            历史留言迁移脚本与数据备份
```

## 三、日常维护任务（照抄即可）

### 1. 加一个成员（"送我上墙"）

编辑 `content/members.json`，在对应届的 `memberList` 里加一段（没有对应届就新建一组）：

```json
{
  "name": "新成员昵称",
  "role": "2026级主席",
  "description": "一句话自我介绍",
  "avatar": "https://avatars.githubusercontent.com/GitHub用户名",
  "github": "https://github.com/GitHub用户名",
  "blog": "https://博客地址（可选）",
  "email": "邮箱（可选）"
}
```

### 2. 加一条荣誉

编辑 `content/honors.json`，**加在最上面**（页面按数组顺序展示）：

```json
{
  "names": ["张三", "李四"],
  "contest": "2026年第X届XX大赛",
  "tags": ["[1人] · 国一", "[1人] · 省二"]
}
```

> tags 的格式 `[N人] · 级别` 是老站约定，级别（国一/国二/国三/省一/…）决定标签颜色，自动匹配。

### 3. 换宣传视频

1. 把新视频放 `public/videos/`（建议 ≤50MB，mp4），封面图同目录；
2. 改 `content/site-config.json` 的 `video.src` / `video.poster`；
3. 如果只想换封面：替换 `public/videos/promo.jpg` 即可。

### 4. 换 QQ 群 / 二维码

- 群号：`content/site-config.json` → `qqGroup`；
- 二维码图：替换 `public/images/qq-qrcode.jpg`（保持文件名不变最省事）。

### 5. 更新 FTP 资料库编目（资料库有新增/整理后）

```bash
# 前提：FTP 服务器上重新扫描生成 ftp_files9.txt / ftp_dirs9.txt 放到
#       E:\A 创新基地\FTP\05-扫描数据\最新\
python scripts/ftp/extract_catalog.py
```

脚本会输出各分区统计和与上一版的数量对比，确认变化合理后提交 `public/data/ftp-catalog.json`。**脱敏规则已内置**（密码/账号等关键词自动跳过），如需调整黑名单改脚本顶部 `SKIP_*_KEYWORDS`。

### 6. 改 Hero 文字（站名/口号/按钮）

全部在 `src/app/page.tsx` 的 Hero 区块和 `content/site-config.json`（`siteName`/`tagline`）。3D 场景的粒子数、速度、配色 → 见 `src/components/hero3d/TUNING.md`（每个参数的位置和效果都列了表）。

### 7. 评论系统（GitHub Issue 模式）

- **数据存放**：官方仓库 `seven-innovation-base/official-website` 的 **Issue #86**，前端直接读 GitHub API 展示
- **新留言**：访客点「去 GitHub 留言」跳到 Issue 页发表，需要 GitHub 账号（基地成员标配，天然防灌水）
- **管理**：删除/隐藏评论都在 GitHub 的 Issue 页面操作，无需登录任何后台
- **历史留言**：22 条（2022–2026）一直在 Issue #86 原地保留，重构前后无缝衔接
- **缓存机制**：前端把评论缓存到浏览器 localStorage（10 分钟 TTL），GitHub API 限流（60 次/小时/IP）时展示缓存不白屏
- **历史沿革**：2026-10 曾短暂启用过自托管 Waline，后综合考虑维护成本与留言门槛退回 Issue 模式；完整踩坑记录见文档区 `refactor/WALINE部署踩坑记录.md`，迁移数据备份在 `scripts/migration/data/`
- **服务器侧**：如曾部署过 Waline 容器，确认不再使用后可 `docker stop` 并移除，安全组同时关闭 8360 端口

### 8. 配置百度统计（可选）

到百度统计注册站点拿到 token → 填入 `site-config.json` → `analytics.baiduToken`，即自动生效（留空则不加载）。

## 四、本地开发与发布流程

```bash
pnpm install        # 首次
pnpm dev            # 本地预览 http://localhost:3000
pnpm lint           # 代码检查
pnpm build          # 构建静态站到 out/
```

**发布**：提交并推送到 GitHub main 分支 → CI 自动跑 lint + build，红了会拦住 → （Phase 5 部署流水线接入后：自动发布到服务器）。

**提交纪律**：
- 改完先 `pnpm lint && pnpm build` 双绿再提交；
- 内容类改动（JSON）commit message 用 `docs:` 前缀，功能用 `feat:`，修 bug 用 `fix:`。

## 五、性能红线（改 3D / 加内容前看一眼）

- Hero 3D 独立懒加载 chunk ≤ 250KB（gzip），主包不含 three.js；
- 首页 First Load JS 约 108KB，别引入大型 UI 库；
- 图片进 `public/` 前压一压（logo2.png 282KB、二维码 147KB 已偏大，后续可优化为 WebP）；
- 部署验收标准：Lighthouse 移动端 ≥ 90、LCP < 2.5s。

## 六、待办与已知问题

- [ ] Phase 5：部署流水线（CI → 阿里云服务器）、域名切换（见 `refactor/REFACTOR_PLAN_2.0.md` §8/§9）
- [ ] 域名切换后：`site-config.json` 的 `siteUrl`、百度统计 token 要同步更新
- [ ] logo2.png / qq-qrcode.jpg 图片压缩（Phase 5 前做）
- [ ] 旧站 301：`/HistoricalHonor/ → /honors/` 等映射在部署层配置（nginx）

## 求助渠道

- 重构方案与决策记录：`refactor/REFACTOR_PLAN_2.0.md`（含 D1–D9 决策）
- 历史参考（Waline 时期）：`refactor/WALINE部署踩坑记录.md`
- 3D 调参：`src/components/hero3d/TUNING.md`
- 项目历史：git log（中文 commit message，按模块分组）
