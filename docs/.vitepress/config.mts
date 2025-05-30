import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Mortis',
  description: 'A VitePress Site',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/c2.png',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],
    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/vuejs/vitepress' }],
    footer: {
      message: '基于 MIT 许可发布',
      copyright: `Copyright © ${new Date().getFullYear()} Flame_Y`
    }
  },
  head: [['meta', { name: 'theme-color', content: '#bd34fe' }]]
})
