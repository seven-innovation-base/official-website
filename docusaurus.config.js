module.exports = {
  title: '数学与计算科学学院创新实践基地',
  tagline: '真实、专注、卓越、不设限、创新',
  url: 'https://https://seven-innovation-base.github.io/',
  baseUrl: '/',
  favicon: 'img/logo.png',
  organizationName: 'seven-innovation-base', // Usually your GitHub org/user name.
  projectName: 'seven-innovation-base.github.io', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: '数学与计算科学学院创新实践基地',
      logo: {
        alt: 'Site Logo',
        src: 'img/logo.png',
      },
      items: [{
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
          title: '文档',
          items: [{
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
          items: [{
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
          items: [{
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
          items: [{
              label: '桂电官网',
              href: 'https://www.guet.edu.cn/',
            },
            {
              label: '学院官网',
              href: 'https://www.guet.edu.cn/dept7/',
            },
          ],
        },
        {
          title: '友情链接',
          items: [{
              label: '三院科协',
              href: 'https://github.com/sanyuankexie/',
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
          // It is recommended to set document id as docs home page (`docs/` path).
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/seven-innovation-base/official-website/tree/master',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl: 'https://github.com/seven-innovation-base/official-website/tree/master',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};