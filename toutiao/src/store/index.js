import Vue from 'vue'
import Vuex from 'vuex'
// 按需导入 API 接口
import { getUserInfoAPI, getUserProfileAPI } from '@/api/userAPI.js'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [createPersistedState()],
  // state 的值会有两种情况：
  // 1. 它的值是从 localStorage 中读出来的
  // 2. localStorage 中没有值，state 的值应该是初始值
  state: {
    // tokenInfo 对象的格式为 { token, refresh_token }
    tokenInfo: {
      token: '',
      refresh_token: ''
    },
    // 用户的基本信息
    userInfo: {},
    // 用户的简介
    userProfile: {}
  },
  mutations: {
    // 专门用来修改 tokenInfo 的方法
    // payload 的格式为 { token, refresh_token }
    // 在组件中调用 Mutation 方法有两种方式：
    // this.$store.commit('方法名', 参数)
    // ...mapMutations(['updateTokenInfo'])
    updateTokenInfo(state, payload) {
      state.tokenInfo = payload
    },
    // 更新用户的基本信息。形参中的 payload 就是用户的信息对象
    updateUserInfo(state, payload) {
      state.userInfo = payload
    },
    // 清空 State 和本地的数据
    cleanState(state) {
      // 1. 清空 state
      state.tokenInfo = {}
      state.userInfo = {}
      // 退出登录的时候，要清空用户的简介信息
      state.userProfile = {}
    },
    // 更新用户的简介信息
    updateUserProfile(state, payload) {
      state.userProfile = payload
    }
  },
  actions: {
    // 初始化用户的基本信息
    async initUserInfo(ctx) {
      const { data: res } = await getUserInfoAPI()
      if (res.message === 'OK') {
        ctx.commit('updateUserInfo', res.data)
      }
    },
    // 初始化用户简介的信息
    async initUserProfile(ctx) {
      const { data: res } = await getUserProfileAPI()
      if (res.message === 'OK') {
        ctx.commit('updateUserProfile', res.data)
      }
    }
  },
  getters: {
    // getter 本质上就是一个计算属性
    avatar(state) {
      return state.userInfo.photo || 'https://img.yzcdn.cn/vant/cat.jpeg'
    }
  },
  // 今后的人资后台管理项目，会大量使用 vuex 中的模块
  // 现阶段，我们刚入手 vuex，就不拆模块了
  modules: {}
})
