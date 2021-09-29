import request from '@/utils/request.js'

// 获取文章详情的 API 接口
// 形参中的 id 是文章的 Id
export const getArticleInfoAPI = function(id) {
  return request.get('/v1_0/articles/' + id)
}

// 关注作者的 API 接口
// target 是文章“作者的 Id”
export const followUserAPI = function(target) {
  return request.post('/v1_0/user/followings', { target })
}

// 取关作者的 API 接口
// id 是文章作者的 id
export const unfollowUserAPI = function(id) {
  return request.delete('/v1_0/user/followings/' + id)
}

// 给文章点赞的 API
// 注意：target 是文章的 Id
export const likeArticleAPI = function(target) {
  return request.post('/v1_0/article/likings', { target })
}

// 取消给文章点赞的 API
// id 是文章的 Id
export const dislikeArticleAPI = function(id) {
  return request.delete('/v1_0/article/likings/' + id)
}

// 根据文章 id 请求文章下评论的接口
export const getCmtListAPI = function(source, offset) {
  return request.get('/v1_0/comments', {
    params: {
      type: 'a',
      // 文章的 Id
      source,
      // 偏移量，用来实现分页的
      offset
    }
  })
}

// 发表评论的 API 接口
// target 是文章的 Id
// content 评论的内容
export const publishCommentAPI = function(target, content) {
  return request.post('/v1_0/comments', {
    target,
    content
  })
}
