module.exports = {
  title: '数学与计算科学学院创新实践基地',
  tagline: '热爱技术、热爱分享',
  url: 'https://your-docusaurus-test-site.com',
  baseUrl: '/',
  favicon: 'img/logo.png',
  organizationName: 'SevenInnovationBase', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: '数学与计算科学学院创新实践基地',
      logo: {
        alt: 'Site Logo',
        src: 'img/logo.png',
      },
      links: [{
          to: 'docs/',
          activeBasePath: 'docs',
          label: '文档',
          position: 'left',
        },
        {
          to: 'blog',
          label: '博客',
          position: 'left'
        },
        {
          href: 'https://github.com/seven-innovation-base/',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [{
          title: 'Docs',
          items: [{
              label: 'Style Guide',
              to: 'docs/',
            },
            {
              label: '老版本文档',
              to: 'https://seveninnovationbasedoc.readthedocs.io/zh_CN/latest/',
            },
          ],
        },
        {
          title: 'Community',
          items: [{
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/docusaurus',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/docusaurus',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/docusaurus',
            },
          ],
        },
        {
          title: 'More',
          items: [{
              label: 'Blog',
              to: 'blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/facebook/docusaurus',
            },
          ],
        },
      ],
      copyright: `Copyright © 2003-${new Date().getFullYear()} Seven Innovation Base. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          // It is recommended to set document id as docs home page (`docs/` path).
          homePageId: 'doc1',
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/facebook/docusaurus/edit/master/website/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl: 'https://github.com/facebook/docusaurus/edit/master/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};