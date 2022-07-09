![Site CI](https://github.com/seven-innovation-base/official-website/workflows/Site%20CI/badge.svg) ![pr badgen](https://badgen.net/github/open-prs/seven-innovation-base/official-website/) ![last commit](https://badgen.net/github/last-commit/seven-innovation-base/official-website/main) ![contributors](https://badgen.net/github/contributors/seven-innovation-base/official-website) <!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-5-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

> 国内 GitHub 访问缓慢问题解决方案：https://github.com/521xueweihan/GitHub520

# 简介

这里是桂林电子科技大学数学与计算科学学院创新创业实践基地的官方站点。站点基于 Facebook 开源站点生成器 [Docusaurus](https://github.com/facebook/docusaurus) 构建，当前使用版本：[2.0.0-beta.18](https://v2.docusaurus.io/)。项目使用 [GitHub Action](https://github.com/seven-innovation-base/official-website/actions) 进行 CI/CD。

项目的 GitHub Actions 简介 - [.github/intro.md)](.github/intro.md)

# 参与站点的维护

加入站点的维护并无任何门槛，你只需要懂那么一点点的 Git 操作「即可参与站点文档部分的维护」，还不熟悉 Git 协作的同学可到此练习仓练习 -> [Git2Github-practice](https://github.com/seven-innovation-base/Git2Github-practice)。

加入站点的开发还是微微有点门槛的，熟悉 Web 前端（特别是熟悉 [React](https://zh-hans.reactjs.org/)）的同学，读个文档就能快速上手，对站点进行定制开发。具体可以参考 Docusaurus@v2 官方文档 -> [🔗v2.docusaurus🌹](https://v2.docusaurus.io/docs/)。

## 开发环境说明

你可以选用 yarn 或 npm 任意一款包管理工具进行本地开发。

[Node.js](http://nodejs.cn/) 版本 >= 10.15.1，[Yarn](https://www.yarnpkg.cn/getting-started/usage) 版本 >= 1.22.10

```bash
# 安装 yarn
npm install -g yarn
```

## 参与贡献

以下示范基于基地项目 ——> [Git2Github-practice 的协作之道](https://github.com/seven-innovation-base/Git2Github-practice#%E5%8D%8F%E4%BD%9C%E4%B9%8B%E9%81%93pr)。

- Step 1：[fork「戳我」](https://github.com/seven-innovation-base/official-website/fork) 本仓库，clone 项目到本地进行开发。

```bash
git clone https://github.com/your-username/official-website
cd official-website
```

- Step 2：新建 Git 分支，基于新分支进行开发

```bash
git branch branch-name
```

安装项目依赖

```bash
yarn
# or
npm install
```

- Step 3：启动开发服务器，进行开发

```bash
yarn run start
# or
npm run start
```

- Step 4：将变更提交至 GitHub，然后向本仓库（main branch）发起 pull reqeust

```bash
git add .
git commit -m "feat: xxxxxx"
git push origin branch-name
```

## 贡献者 ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://redhat123456.github.io/"><img src="https://avatars.githubusercontent.com/u/57751257?v=4?s=100" width="100px;" alt=""/><br /><sub><b>redhat123456</b></sub></a><br /><a href="https://github.com/seven-innovation-base/official-website/commits?author=redhat123456" title="Documentation">📖</a> <a href="#maintenance-redhat123456" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://zy68.top"><img src="https://avatars.githubusercontent.com/u/53072382?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sustart</b></sub></a><br /><a href="https://github.com/seven-innovation-base/official-website/commits?author=MrGo123" title="Documentation">📖</a></td>
    <td align="center"><a href="http://higgins995.top"><img src="https://avatars.githubusercontent.com/u/67410832?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Higgins995</b></sub></a><br /><a href="https://github.com/seven-innovation-base/official-website/commits?author=Higgins995" title="Documentation">📖</a> <a href="https://github.com/seven-innovation-base/official-website/issues?q=author%3AHiggins995" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/Z233"><img src="https://avatars.githubusercontent.com/u/7451883?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Z233</b></sub></a><br /><a href="https://github.com/seven-innovation-base/official-website/commits?author=Z233" title="Code">💻</a></td>
    <td align="center"><a href="http://yuuza.net"><img src="https://avatars.githubusercontent.com/u/14901890?v=4?s=100" width="100px;" alt=""/><br /><sub><b>lideming</b></sub></a><br /><a href="https://github.com/seven-innovation-base/official-website/commits?author=lideming" title="Code">💻</a> <a href="https://github.com/seven-innovation-base/official-website/issues?q=author%3Alideming" title="Bug reports">🐛</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
