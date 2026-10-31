# 七院创新基地官网 · 维护手册

> 写给下一届维护者：不需要精通编程也能完成日常更新。本手册覆盖日常维护的全部操作，照着抄即可。

## 一、这个项目是什么

- **技术栈**：Next.js 15（静态导出）+ TypeScript + Tailwind CSS v4 + three.js（Hero 3D「时间算法」场景）+ GitHub Issue 评论区
- **代码仓库**：`seven-innovation-base/official-website`（GitHub 官方仓库，推送 / 合并到 main 即触发 CI 检查与发布）
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

| 字段 | 必填 | 说明 |
|------|------|------|
| `name` | ✅ | 昵称 |
| `role` | | 职务（如「2026级主席」「软件部部长」） |
| `description` | | 自我描述 |
| `avatar` | | 头像链接；**也可写 `github:用户名` 自动取 GitHub 头像** |
| `github` | | GitHub 主页链接（注意是主页，不是头像地址） |
| `blog` | | 博客链接或其他媒体链接 |
| `email` | | 邮箱 |

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

### 7. 配置百度统计（可选）

1. 到 [百度统计](https://tongji.baidu.com) 注册账号 → 「管理」→「网站列表」→ 新增网站（填站点域名）；
2. 新建后拿到一段代码，形如 `hm.js?` 后面那串 32 位字符——**这串字符就是 token**（不是整段代码）；
3. 填入 `content/site-config.json` 的 `analytics.baiduToken`，重新构建部署即生效（留空则完全不加载统计脚本）。

**数据在哪看**：网站上不会有任何统计展示。访问数据全部在 `tongji.baidu.com` 登录后的后台里看——「报告」→ 实时访客 / 趋势分析 / 来源分析 / 页面分析 / 访客分析。刚接入时数据有几分钟延迟，第二天起才会有完整报表。

## 四、性能红线（改 3D / 加内容前看一眼）

- Hero 3D 独立懒加载 chunk ≤ 250KB（gzip），主包不含 three.js；
- 首页 First Load JS 约 108KB，别引入大型 UI 库；
- 图片进 `public/` 前压一压（当前 logo 71KB、Hero 徽章 119KB、二维码 80KB、视频封面 127KB）；
- 验收标准：Lighthouse 移动端 ≥ 90、LCP < 2.5s。
