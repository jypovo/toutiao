<template>
  <div v-if="article !== null">
    <!-- Header 区域 -->
    <van-nav-bar fixed title="文章详情" left-arrow @click-left="$router.back()" />

    <!-- 文章信息区域 -->
    <div class="article-container">
      <!-- 文章标题 -->
      <h1 class="art-title">{{ article.title }}</h1>

      <!-- 用户信息 -->
      <van-cell center :title="article.aut_name" :label="article.pubdate | dateFormat">
        <template #icon>
          <!-- 头像 -->
          <img :src="article.aut_photo" alt="" class="avatar" />
        </template>
        <template #default>
          <div>
            <!-- 是否关注了作者 -->
            <van-button type="info" size="mini" v-if="article.is_followed" @click="unfollowUser">已关注</van-button>
            <van-button icon="plus" type="info" size="mini" plain v-else @click="followUser">关注</van-button>
          </div>
        </template>
      </van-cell>

      <!-- 分割线 -->
      <van-divider></van-divider>

      <!-- 文章内容 -->
      <div class="art-content" v-html="article.content"></div>

      <!-- 分割线 -->
      <van-divider>End</van-divider>

      <!-- 点赞 -->
      <div class="like-box">
        <van-button icon="good-job" type="danger" size="small" v-if="article.attitude === 1" @click="dislikeArticle"
          >已点赞</van-button
        >
        <van-button icon="good-job-o" type="danger" plain size="small" v-else @click="likeArticle">点赞</van-button>
      </div>
    </div>

    <!-- 评论组件 -->
    <ArtCmt :art-id="article.art_id"></ArtCmt>
  </div>
</template>

<script>
// 按需导入 API 接口
import {
  getArticleInfoAPI,
  followUserAPI,
  unfollowUserAPI,
  likeArticleAPI,
  dislikeArticleAPI
} from '@/api/articleAPI.js'
import { Toast } from 'vant'
// 导入文章评论组件
import ArtCmt from '@/components/ArtCmt/ArtCmt.vue'
import mix from '@/mixins/scroll.js'
// 默认情况下：凡是通过 import 引入的第三方包，都会被打包到最终生成的文件中
import hljs1 from 'highlight.js'

export default {
  name: 'ArticleDetail',
  mixins: [mix],
  props: ['id'],
  watch: {
    id() {
      this.article = null
      this.initArticleInfo()
    }
  },
  data() {
    return {
      // 文章的详情对象
      article: null
    }
  },
  created() {
    this.initArticleInfo()
  },
  // 只要执行了 updated，就表示组件已经渲染完毕了
  updated() {
    // 如果 this.article 信息对象不为 null，证明页面上的 DOM 已经根据数据渲染好了
    if (this.article) {
      hljs1.highlightAll()
    }
  },
  methods: {
    // 初始化文章的信息
    async initArticleInfo() {
      const { data: res } = await getArticleInfoAPI(this.id)
      if (res.message === 'OK') {
        this.article = res.data
      }
    },
    // 关注作者
    async followUser() {
      const { data: res } = await followUserAPI(this.article.aut_id)
      if (res.message === 'OK') {
        Toast.success('关注成功！')
        // 手动把 is_followed 改为 true，证明已经关注了
        this.article.is_followed = true
      }
    },
    //  取关作者
    async unfollowUser() {
      // 这一次没必要使用解构赋值，因为这次请求没有响应体
      const res = await unfollowUserAPI(this.article.aut_id)
      if (res.status === 204) {
        Toast.success('取关成功！')
        // 手动把 is_followed 改为 false，证明已经取关成功
        this.article.is_followed = false
      }
    },
    // 为喜欢的文章点赞
    async likeArticle() {
      const { data: res } = await likeArticleAPI(this.article.art_id)
      if (res.message === 'OK') {
        // 1. Toast 提示用户点赞成功！
        Toast.success('点赞成功！')
        // 2. 在客户端直接修改文章的点赞状态
        this.article.attitude = 1
      }
    },
    async dislikeArticle() {
      // 这里不需要使用解构赋值，因为没有响应体
      const res = await dislikeArticleAPI(this.article.art_id)
      if (res.status === 204) {
        // 1. Toast 提示用户取消点赞成功！
        Toast.success('取消点赞成功！')
        // 2. 在客户端直接修改文章的点赞状态
        this.article.attitude = -1
      }
    }
  },
  // 注册组件
  components: {
    ArtCmt
  }
}
</script>

<style lang="less" scoped>
.article-container {
  padding: 10px;
  margin-top: 46px;
}
.art-title {
  font-size: 16px;
  font-weight: bold;
  margin: 10px 0;
}

.art-content {
  font-size: 12px;
  line-height: 24px;
  width: 100%;
  overflow-x: scroll;
  word-break: break-all;
}

.van-cell {
  padding: 5px 0;
  &::after {
    display: none;
  }
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #f8f8f8;
  margin-right: 5px;
  border: none;
}

.like-box {
  display: flex;
  justify-content: center;
}
</style>
