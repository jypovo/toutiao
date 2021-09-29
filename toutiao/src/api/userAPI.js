// 用户相关的 API 接口
import request from '@/utils/request.js'

// 登录的 API 接口
// obj 参数的格式 { mobile, code }
export const loginAPI = function(obj) {
  return request.post('/v1_0/authorizations', obj)
}

// 请求用户基本信息的 API
export const getUserInfoAPI = function() {
  return request.get('/v1_0/user')
}

// 请求用户的简介信息
export const getUserProfileAPI = function() {
  return request.get('/v1_0/user/profile')
}

// 部分更新用户的简介信息
// data 的格式为 {name: 'xxx'} 或 {birthday: '2012-12-12'}
export const updateUserProfileAPI = function(data) {
  return request.patch('/v1_0/user/profile', data)
}

// 更新用户头像的 API
// 形参中的 fd 必须是 FormData 格式的请求体数据
export const updateUserAvatarAPI = function(fd) {
  return request.patch('/v1_0/user/photo', fd)
}
