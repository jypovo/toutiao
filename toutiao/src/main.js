import Vue from 'vue'
import App from './App.vue'
// import App from './test/Test.vue'
import router from './router'
import store from './store'

// 配置 Vant 组件库
import Vant, { Lazyload } from 'vant'
// 只有 less 文件支持主题定制
import 'vant/lib/index.less'
// 导入 rem 适配的包
import 'amfe-flexible'

// 导入 dayjs 的核心模块
import dayjs from 'dayjs'
// 导入计算相对时间的插件
import relativeTime from 'dayjs/plugin/relativeTime'
// 导入中文语言包
import zh from 'dayjs/locale/zh-cn'

// 配置“计算相对时间”的插件
dayjs.extend(relativeTime)
// 配置中文语言包
dayjs.locale(zh)

Vue.use(Vant)
// 将 Vant 中的 Lazyload 注册为全局自定义指令，注册好以后每个组件中，都可以使用 v-lazy 这个指令啦
Vue.use(Lazyload)

// 过滤器本质上是函数，第一个形参，永远都是待处理的数据   {{ 待处理的数据 | 过滤器 }}
Vue.filter('dateFormat', function(time) {
  // 基于 dayjs 进行相对时间的计算
  return dayjs().to(time)
})

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

console.log('ok')
