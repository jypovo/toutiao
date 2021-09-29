import request from '@/utils/request.js'

// 获取用户频道列表数据的 API
export const getUserChannelsAPI = function() {
  return request.get('/v1_0/user/channels')
}

// 根据频道 Id 和时间戳请求文章列表数据的 API
// id 是频道的 Id
// time 是时间戳（首页的值是 Date.now()、其它页面的值是上次请求拿到的 pre_timestamp 的值）
export const getArtListAPI = function(id, time) {
  return request.get('/v1_0/articles', {
    // params 指向的才是 GET 的参数对象
    params: {
      // 频道的 Id
      channel_id: id,
      // 时间戳
      timestamp: time
    }
  })
}

// 将文章设置为不感兴趣
// 形参中的 id，是文章的 Id
export const dislikeArticleAPI = function(id) {
  return request.post('/v1_0/article/dislikes', { target: id })
}

// 举报文章的 API
// target 是要举报的文章的 Id；type 是要举报的类型
export const reportArticleAPI = function(target, type) {
  return request.post('/v1_0/article/reports', { target, type })
}

// 获取所有的频道列表数据
export const getAllChennelAPI = function() {
  return request.get('/v1_0/channels')
}

// 更新用户的频道列表数据
// channels 是数组，数组中每一项的格式为 { id, seq }
export const updateUserChannelAPI = function(channels) {
  return request.put('/v1_0/user/channels', { channels })
}
