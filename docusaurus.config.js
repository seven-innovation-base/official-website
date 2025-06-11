module.exports = {
  // plugins: [require.resolve("docusaurus-plugin-less")],
  title: '数学与计算科学学院创新实践基地',
  tagline: '真实、专注、卓越、不设限、创新',
  url: 'https://seven-innovation-base.github.io',
  baseUrl: '/',
  favicon: 'img/logo.png',
  organizationName: 'seven-innovation-base', // Usually your GitHub org/user name.
  projectName: 'seven-innovation-base.github.io', // Usually your repo name.
  deploymentBranch: 'master',
  themeConfig: {
    navbar: {
      title: '数学与计算科学学院创新实践基地',
      logo: {
        alt: 'Site Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: '文档',
          position: 'left',
        },
        {
          to: 'blog',
          label: '博客',
          position: 'left',
        },
        {
          to: 'members',
          label: '团队成员',
          position: 'left',
        },
        {
          to: 'HistoricalHonor',
          label: '历史荣誉',
          position: 'left',
        },
        {
          href: 'https://github.com/seven-innovation-base/',
          className: 'header-github-link',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '文档',
          items: [
            {
              label: 'Git协作练习',
              to: 'https://seven-innovation-base.github.io/Git2Github-practice/',
            },
            {
              label: '老版本文档',
              to: 'https://seveninnovationbasedoc.readthedocs.io/zh_CN/latest/',
            },
          ],
        },
        {
          title: '社区',
          items: [
            {
              label: 'QQ 群',
              href: 'https://mypic-1258313760.cos.ap-guangzhou.myqcloud.com/img/20200530125127.jpg',
            },
            {
              label: '站点问题反馈',
              href: 'https://github.com/seven-innovation-base/official-website/issues',
            },
            /*
            {
              html: `
              <a href="https://www.netlify.com" target="_blank" rel="noreferrer noopener" aria-label="Deploys by Netlify">
                <img src="https://www.netlify.com/img/global/badges/netlify-color-accent.svg" alt="Deploys by Netlify" />
              </a>
              `,
            }
            */
          ],
        },
        {
          title: '更多',
          items: [
            {
              label: '博客',
              to: 'blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/facebook/docusaurus/',
            },
          ],
        },
        {
          title: '常用链接',
          items: [
            {
              label: '桂电官网',
              href: 'https://www.guet.edu.cn/',
            },
            {
              label: '学院官网',
              href: 'https://www.guet.edu.cn/dept7/',
            },
            {
              label: '桂电信技中心',
              href: 'https://www.guet.edu.cn/xjzx/index.htm',
            },
          ],
        },
        {
          title: '友情链接',
          items: [
            {
              label: '三院科协',
              href: 'https://hello.kexie.space/',
            },
            {
              label: '校基地软件部',
              href: 'https://csd.moe/',
            },
          ],
        },
        {
          title: '社区合作伙伴',
          items: [
            {
              label: '牛客网',
              href: 'https://www.nowcoder.com/',
            },
          ],
        },
      ],
      /*
      logo: {
        alt: 'Seven Innovation Base Logo',
        src: 'img/logo.png',
        href: '',
      },
      */
      copyright: `Copyright © 2003-${new Date().getFullYear()} Seven Innovation Base. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/seven-innovation-base/official-website/tree/main',
        },
        blog: {
          showReadingTime: true,
          editUrl:
            'https://github.com/seven-innovation-base/official-website/tree/main',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
}
