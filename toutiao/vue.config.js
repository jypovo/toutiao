// vue.config.js
// 1. 导入 node 中的 path 模块来处理路径
const path = require('path')

// __dirname 表示当前文件的存放目录
// 动态生成 cover.less 文件的绝对路径
const coverPath = path.join(__dirname, './src/cover.less')

// 当 npm run serve 的时候，process.env.NODE_ENV 的值是字符串 development
// 当 npm run build 的时候，process.env.NODE_ENV 的值是字符串 production
// process.env.NODE_ENV 是一个环境变量，读取 NODE_ENV 的值，就可以判断当前的运行模式
console.log(process.env.NODE_ENV)
const obj = {
  // import 时的包名称: window 全局的成员名称
  'highlight.js': 'hljs',
  vue: 'Vue',
  'vue-router': 'VueRouter',
  vuex: 'Vuex',
  axios: 'axios',
  vant: 'vant',
  dayjs: 'dayjs',
  'socket.io-client': 'io',
  popmotion: 'popmotion'
}

module.exports = {
  publicPath: './',
  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          // 或者可以通过 less 文件覆盖（文件路径为绝对路径）
          hack: `true; @import "${coverPath}";`
        }
      }
    }
  },
  // 增强 vue-cli 的 webpack 配置项
  configureWebpack: {
    // 打包优化
    externals: process.env.NODE_ENV === 'development' ? {} : obj
  },
  // 通过 chainWebpack 来修改 webpack 的配置
  chainWebpack: config => {
    // 1. config.plugin('html') 的作用：拿到 html-webpack-plugin 插件的当前配置项
    // 2. 通过 .tap() 方法，可以修改插件的配置项 
    // 3. 在 .tap(fn) 方法中，接收一个 function 回调，在这个回调中进行修改
    // 4. 在 .tap() 的 function 回调中，args 就是当前的配置项。最终修改完之后，一定要 return 修改后最新的配置项
    config.plugin('html').tap(args => {
      args[0].title = '头条-129'
      // 根据当前的编译模式，动态为 mode 赋值。
      // 如果是 npm run serve，则 mode 的值是 development
      // 如果是 npm run build，则 mode 的值是 production
      args[0].mode = process.env.NODE_ENV
      console.log(args)
      return args
    })
  },
  lintOnSave: false
}

// npm run serve
// npm run build
