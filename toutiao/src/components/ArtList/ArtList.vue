<template>
  <div>
    <!-- 下拉刷新 -->
    <van-pull-refresh v-model="isLoading" @refresh="onRefresh" :disabled="finished">
      <!-- 上拉加载更多 -->
      <!-- :immediate-check="false" 防止刚进入组件就触发 load 事件 -->
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
        :immediate-check="false"
      >
        <!-- 循环生成文章的 Item 项组件 -->
        <ArtItem v-for="item in artList" :key="item.art_id" :article="item" @remove-article="removeArticle"></ArtItem>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
// 导入需要的 API 接口
import { getArtListAPI } from '@/api/homeAPI.js'
// 导入文章的 Item 项组件
import ArtItem from '@/components/ArtItem/ArtItem.vue'

export default {
  name: 'ArtList',
  // 为文章列表组件，封装名为 channelId 的 props，表示要加载哪个频道下的文章列表数据
  props: {
    // 频道的 Id
    channelId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      // 文章列表的数据
      artList: [],
      // 调用 API 接口要传递的时间戳
      timestamp: Date.now(),
      // 是否正在加载数据
      loading: true,
      // 所有数据是否加载完毕
      finished: false,
      // 是否正在请求下拉刷新的数据
      isLoading: false
    }
  },
  created() {
    console.log('在 created 中发起了请求')
    this.initArtList()
  },
  methods: {
    // 初始化文章的列表数据
    // isPullDown 是一个布尔值，如果为 true，表示用户执行的“下拉刷新”的动作
    async initArtList(isPullDown) {
      const { data: res } = await getArtListAPI(this.channelId, this.timestamp)
      console.log(res)
      if (res.message === 'OK') {
        // 数据请求成功之后，要做两件事情：
        // 1. 为 timestamp 赋值
        this.timestamp = res.data.pre_timestamp
        // 2. 为 artList 赋值
        if (isPullDown) {
          // 下拉刷新
          // this.artList = [...新数据, ...旧数据]
          this.artList = [...res.data.results, ...this.artList]
        } else {
          // 上拉加载更多
          // this.artList = [...旧数据, ...新数据]
          this.artList = [...this.artList, ...res.data.results]
        }

        // 当数据请求回来以后，一定要把 loading 重置为 false。
        // 否则，无法发起下一次的请求
        this.loading = false
        // 把 isLoading 重置为 false，否则无法触发下次的下拉刷新效果
        this.isLoading = false

        // 判断所有数据是否加载完毕了
        if (res.data.pre_timestamp === null) {
          this.finished = true
        }
      }
    },
    // 触发了上拉加载更多的 load 事件
    onLoad() {
      // console.log('上拉加载更多')
      console.log('在 load 事件中发起了请求')
      // 在 load 事件中，调用 initArtList 方法，加载下一页数据
      // 问题：下一页数据请求回来以后，应该拼接到上一页数据的后面
      this.initArtList()
    },
    // 触发了下拉刷新
    onRefresh() {
      console.log('下拉刷新')
      // 请求下拉刷新的数据，并且要把请求到的数据拼接到头部
      this.initArtList(true)
    },
    // 炸楼
    removeArticle(id) {
      console.log(id)
      this.artList = this.artList.filter(item => item.art_id !== id)
      // 每次删除了一条文章数据之后，立即判断剩下的数据条数是否小于 10
      // 如果小于 10，则自动请求下一页数据，防止页面空白，导致上拉加载更多不生效的问题
      if (this.artList.length < 10) {
        this.initArtList()
      }
    }
  },
  // 注册组件
  components: {
    ArtItem
  }
}
</script>

<style lang="less" scoped></style>
