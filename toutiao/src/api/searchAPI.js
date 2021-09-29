import request from '@/utils/request.js'

// 根据关键词请求搜索建议的 API 接口
export const getSuggListAPI = function(q) {
  return request.get('/v1_0/suggestion', {
    params: { q }
  })
}

// 根据搜索关键词和页码值请求搜索结果的 API
// q 是搜索关键字
// page 是页码值
export const getSuggResultAPI = function(q, page) {
  return request.get('/v1_0/search', {
    params: { q, page }
  })
}
