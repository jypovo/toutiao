import Vue from 'vue'
import VueRouter from 'vue-router'
// 导入 vuex 模块
import store from '@/store/index.js'

// 导入登录的组件页面
// import Login from '@/views/Login/Login.vue'
const Login = () => import('@/views/Login/Login.vue')
// 导入 Main 主页
// import Main from '@/views/Main/Main.vue'
const Main = () => import('@/views/Main/Main.vue')
// 导入 Home 和 User 两个子路由组件
// import Home from '@/views/Main/Home.vue'
const Home = () => import('@/views/Main/Home.vue')
// import User from '@/views/Main/User.vue'
const User = () => import('@/views/Main/User.vue')
// 导入搜索的组件
// import Search from '@/views/Search/Search.vue'
const Search = () => import('@/views/Search/Search.vue')
// 导入搜索结果页
// import SearchResult from '@/views/Search/SearchResult.vue'
const SearchResult = () => import('@/views/Search/SearchResult.vue')
// 导入文章详情的路由组件
// import ArticleDetail from '@/views/ArticleDetail/ArticleDetail.vue'
const ArticleDetail = () => import('@/views/ArticleDetail/ArticleDetail.vue')
// 导入修改用户信息的组件
// import UserEdit from '@/views/UserEdit/UserEdit.vue'
const UserEdit = () => import('@/views/UserEdit/UserEdit.vue')
// 智能聊天组件页面
// import Chat from '@/views/Chat/Chat.vue'
const Chat = () => import('@/views/Chat/Chat.vue')

// 1. 将 VueRouter 本身提供的 $router.push 方法转存到常量中
const originalPush = VueRouter.prototype.push
// 2. 自定义 $router.push 方法，在内部调用原生的 originalPush 方法进行路由跳转；并通过 .catch 捕获错误
VueRouter.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
  // 通过 .catch 捕获错误
  return originalPush.call(this, location).catch(err => err)
}

// 把 VueRouter 安装为 Vue 的插件
Vue.use(VueRouter)

// 路由规则的数组
const routes = [
  // 带有 name 属性的路由规则，叫做 “命名路由”
  { path: '/login', component: Login, name: 'login' },
  // 主页的路由规则
  {
    path: '/',
    component: Main,
    // 规则：如果通过 children 加载了默认子路由，则父路由规则不需要加 name 属性
    // name: 'main',
    children: [
      // 子路由规则，path 为空字符串的子路由规则，叫做“默认子路由”
      { path: '', component: Home, name: 'home', meta: { isRecord: true, top: 0 } },
      // 注意：子路由规则，不建议以 / 开头
      { path: 'user', component: User, name: 'user' }
    ]
  },
  // 搜索页面的路由规则
  { path: '/search', component: Search, name: 'search' },
  // 搜索结果页的路由规则
  // /search/app
  // /search/java
  // props: true 表示为当前路由开启 props 传参；
  // 开启成功之后，就可以在 component 指向的组件中，通过 props 来接收路由参数了！
  {
    path: '/search/:kw',
    component: SearchResult,
    name: 'search-result',
    props: true,
    meta: { isRecord: true, top: 0 }
  },
  // 文章详情的路由规则
  { path: '/article/:id', component: ArticleDetail, name: 'art-detail', props: true, meta: { isRecord: true, top: 0 } },
  // 编辑用户信息的路由规则
  { path: '/user/edit', component: UserEdit, name: 'user-edit' },
  // 智能聊天的路由规则
  { path: '/chat', component: Chat, name: 'chat' }
]

// 创建路由实例对象
const router = new VueRouter({
  routes
})

// 挂载全局前置导航守卫
router.beforeEach((to, from, next) => {
  // 判断用户访问的 path 地址是否为 /user 或 /user/edit
  // 如果是，应该应该判断用户是否登录了
  // 如何判断用户是否登录了呢？可以从 vuex 中读取一下 token 的值，如果有值，证明登录了，放行即可
  // 如果没有 token 的值，则证明没有登录，强制用户跳转登录页
  if (to.path === '/user' || to.path === '/user/edit') {
    // 访问的是有权限的页面，需要判断用户是否登录了
    const tokenStr = store.state.tokenInfo.token
    if (tokenStr) {
      // 有 token，放行
      next()
    } else {
      // 要访问有权限的页面，但是没登录，强制跳转到登录页面
      next('/login?pre=' + to.fullPath)
    }
  } else {
    // 访问的不需要权限的页面，直接放行即可
    next()
  }
})

// 挂载全局后置导航守卫
router.afterEach((to, from) => {
  if (to.meta.isRecord) {
    // 证明 to 这个路由中保存了元信息
    // 把元信息读取出来，赋值给浏览器的滚动条即可
    console.log('滚动条的纵向位置：' + to.meta.top)
    /* setTimeout(function() {
      window.scrollTo(0, to.meta.top)
    }, 0) */

    Vue.nextTick(function() {
      window.scrollTo(0, to.meta.top)
    })
  }
})

export default router

// 1. 学习分析问题的思维方式，模仿老师思考问题的方式，变成自己的！
// 2. 自己制造的 bug，尽量能够通过自己的调试，找到原因，并解决掉！
// 3. 学习自己看文档的能力！
