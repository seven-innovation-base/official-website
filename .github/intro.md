
# 项目 GitHub Actions CI/CD 介绍

## 约定式提交检查`pr-lint-title.yaml`

GitHub Action **Lint PR title** 用于检查 pull request 的 title 和 commit message 格式是否符合约定式提交的规范。

约定式提交规范文档 -> [Conventional Commits](https://www.conventionalcommits.org/zh-hans/v1.0.0/)

## 产物构建检查与站点部署`site-ci.yaml`

GitHub Action **Site CI** 有两个 job：

- job **check-pull-request**：针对项目的每一个 pull request 检查 Doc 站点构建是否顺利；
- job **github-pages-release**：用于构建网站推送到仓库 [seven-innovation-base/seven-innovation-base.github.io](https://github.com/seven-innovation-base/seven-innovation-base.github.io)，站点由 [https://pages.github.com/](GitHub Pages) Serving。



