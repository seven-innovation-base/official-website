![Site CI](https://github.com/seven-innovation-base/official-website/workflows/Site%20CI/badge.svg) ![pr badgen](https://badgen.net/github/open-prs/seven-innovation-base/official-website/) ![last commit](https://badgen.net/github/last-commit/seven-innovation-base/official-website) ![contributors](https://badgen.net/github/contributors/seven-innovation-base/official-website)

# 简介

这里是桂林电子科技大学数学与计算科学学院创新实践基地的官方站点。站点基于 Facebook 开源站点生成器 [Docusaurus](https://github.com/facebook/docusaurus) 构建，当前使用版本：v2.0.0-alpha.69。项目使用 [GItHub Action](https://github.com/seven-innovation-base/official-website/actions) 进行 CI/CD。

# 参与站点的维护

加入站点的维护并无任何门槛，你只需要懂那么一点点的 Git 操作「即可参与站点文档部分的维护」，还不熟悉 Git 协作的同学可到此练习仓练习 -> [Git2Github-practice](https://github.com/seven-innovation-base/Git2Github-practice)。当然，熟悉前端的同学，能快速上手，对站点进行定制开发。具体可以参考 Docusaurus 官方文档 -> [🔗🌹](https://v2.docusaurus.io/docs/)。

## 开发环境说明

你可以选用 yarn 或 npm 任意一款包管理工具。

[Node.js](http://nodejs.cn/) 版本 >= 10.15.1，[Yarn](https://yarn.org.cn/) 版本 >= 1.5

```bash
# 安装 yarn
npm install -g yarn@1.5.1
```

## 参与贡献

以下示范基于 [Git2Github-practice 的协作之道](https://github.com/seven-innovation-base/Git2Github-practice#%E5%8D%8F%E4%BD%9C%E4%B9%8B%E9%81%93pr)。

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
git push
```
