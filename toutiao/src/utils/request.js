import axios from 'axios'
// 从 vant 组件库中按需导入 Toast 提示消息组件
import { Toast } from 'vant'
// 导入 vuex 模块
import store from '@/store/index.js'
// 导入 router 模块
import router from '@/router/index.js'

// 这是线上地址
const root = 'http://www.liulongbin.top:8000'
// 这是局域网的线下地址
// const root = 'http://192.168.141.47:8000'

// 创建 axios 的实例对象，并共享出去
const request = axios.create({
  // 请求的根路径
  baseURL: root
})

// 1. 拦截器的挂载，一定要放到 request 实例创建之后
// 2. 由于我们在项目中是基于 request 实例对象发起的请求，因此，拦截器一定要挂载给 request，而不是 axios！！！

// 添加请求拦截器
// 在请求拦截器的第一个 function 中，形参 config 就是每次请求时候的配置选项
request.interceptors.request.use(
  function(config) {
    // 在发送请求之前做些什么
    // 展示 loading 效果
    Toast.loading({
      message: '加载中...',
      // 防止自动关闭
      duration: 0
    })

    // 从 vuex 中获取 token 的值
    const tokenStr = store.state.tokenInfo.token
    if (tokenStr) {
      // 只有 tokenStr 的值存在，才有必要挂载到请求头的 Authorization 属性中
      config.headers.Authorization = 'Bearer ' + tokenStr
    }

    return config
  },
  function(error) {
    // 对请求错误做些什么
    // 隐藏 loading 效果
    Toast.clear()
    return Promise.reject(error)
  }
)

// 添加响应拦截器
request.interceptors.response.use(
  function(response) {
    // 对响应数据做点什么
    // 隐藏 loading 效果
    Toast.clear()
    return response
  },
  async function(error) {
    // 对响应错误做点什么
    // 隐藏 loading 效果
    Toast.clear()

    // 从 vuex 中获取 refresh_token 的值
    const refreshToken = store.state.tokenInfo.refresh_token
    // 如果 refresh_token 有值，且响应状态码为 401，则应该执行换取 token 的操作
    if (error.response.status === 401 && refreshToken) {
      console.log('换取 token 的操作')
      try {
        // 大坑1：千万不要在这里直接使用 request 对象，来发起换取 Token 的请求
        const { data: res } = await axios({
          method: 'PUT',
          // 大坑2：直接使用 axios 发起请求的时候，必须给定完整的 URL 地址，因为 axios 没有配置 baseURL
          url: root + '/v1_0/authorizations',
          headers: {
            // 大坑3：Authorization 的值格式必须为 Bearer xxx
            Authorization: 'Bearer ' + refreshToken
          }
        })
        console.log('token 换取成功！')
        console.log(res)
        // TODO1：用新 token 替换到 vuex 和 localStorage 中的旧 token
        store.commit('updateTokenInfo', { token: res.data.token, refresh_token: refreshToken })
        // TODO2：继续完成上次失败的那个请求
        return request(error.config)
      } catch {
        // 只要能够执行到 catch 中的代码，证明 token 和 refresh_token 都过期了
        store.commit('cleanState')
        // 强制用户跳转到登录页
        router.replace('/login?pre=' + router.currentRoute.fullPath)
      }
    }

    return Promise.reject(error)
  }
)

export default request
