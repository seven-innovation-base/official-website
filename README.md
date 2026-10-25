# 桂电七院创新基地官网（重构版）

桂林电子科技大学数学与计算科学学院大学生数学应用及创新基地官方网站。
原站基于 Docusaurus（2020–2026），本仓库为 2026 年重构版本。

## 技术栈

Next.js 15（静态导出）· TypeScript（strict）· Tailwind CSS v4 · pnpm · zod
Hero 3D 场景：three + @react-three/fiber（Phase 2 接入）
评论系统：Waline（自托管，Phase 4 接入）

## 开发

```bash
pnpm install
pnpm dev      # 开发服务器 http://localhost:3000
pnpm build    # 静态导出到 ./out
pnpm lint     # ESLint 检查
```

## 结构

```
content/            站点内容数据（改数据不改代码）
  members.json        成员墙
  honors.json         历史荣誉
  departments.json    三大部门介绍
  site-config.json    站点配置（口号/QQ群/视频/OJ/链接）
src/app/           页面路由
src/components/    组件
public/images/     静态图片
content-source/    内容素材来源（PPT 提取等，供文案参考）
scripts/migration/ 历史数据迁移脚本与备份
```

## 相关文档

- 重构方案：`../refactor/REFACTOR_PLAN_2.0.md`（含决策记录与阶段计划）
- 旧站点：`../official-website`（Docusaurus，重构期间仍为生产站）
