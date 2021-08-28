export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'ui',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxt/content'
  ],

  generate: {
    routes() {
      const mainZone = [
        "中港台劇集",
        "韓日歐美劇集",
        "綜藝節目",
        "電影交流",
        "動畫交流",
        "體育節目交流",
        "電台節目交流",
        "音樂交流",
        "貼圖及設計素材",
        "遊戲及軟件交流"
      ]
      const otherZone = ["閒談影視娛樂", "吹水/話題討論/問題發表"]
      const completedZone = [
        "中港台劇集 (全集)",
        "韓日歐美劇集 (全集)",
        "本地綜藝節目 (全集)",
        "其它綜藝節目 (全集)"
      ]
      return [...mainZone, ...otherZone,...completedZone].map(encodeURIComponent).map(s => `/${s}`)
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  }
}
