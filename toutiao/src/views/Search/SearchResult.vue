<template>
  <div class="search-result-container">
    <!-- 点击实现后退效果 -->
    <van-nav-bar title="搜索结果" left-arrow @click-left="$router.back()" fixed />

    <!-- 当拿到下一页数据之后，一定要记得把 loading 重置为 false -->
    <van-list v-model="loading" :finished="finished" finished-text="没有更多了" @load="onLoad" :immediate-check="false">
      <!-- 循环渲染文章的 Item 项组件 -->
      <!-- ArtItem 在封装的时候，封装了一个自定义属性 closable，用来指定是否显示“叉号”的小图标 -->
      <!-- true 表示展示“叉号”的小图标 -->
      <!-- false 表示不展示展示“叉号”的小图标 -->
      <ArtItem v-for="item in artList" :key="item.art_id" :article="item" :closable="false"></ArtItem>
    </van-list>
  </div>
</template>

<script>
// 按需导入 API 接口
import { getSuggResultAPI } from '@/api/searchAPI.js'
// 导入文章的 Item 项组件
import ArtItem from '@/components/ArtItem/ArtItem.vue'
import mix from '@/mixins/scroll.js'

export default {
  name: 'SearchResult',
  mixins: [mix],
  props: ['kw'],
  watch: {
    kw() {
      this.page = 1
      this.artList = []
      this.loading = false
      this.finished = false

      this.initSearchResult()
    }
  },
  data() {
    return {
      // 页码值，默认请求第一页数据
      page: 1,
      // 文章的列表数据
      artList: [],
      // 是否正在请求数据
      loading: true,
      // 所有数据是否加载完毕了
      finished: false
    }
  },
  created() {
    this.initSearchResult()
  },
  methods: {
    // 初始化搜索结果的方法
    async initSearchResult() {
      const { data: res } = await getSuggResultAPI(this.kw, this.page)
      if (res.message === 'OK') {
        // this.artList = res.data.results
        // this.artList = [旧数据, 新数据]
        this.artList = [...this.artList, ...res.data.results]

        // 重置 loading 的值为 false，否则无法发起下一页的数据请求
        this.loading = false

        if (res.data.results.length === 0) {
          // 证明没有下一页数据了
          this.finished = true
        }
      }
    },
    // 快滚动到页面底部的时候，会自动调用这个函数
    onLoad() {
      console.log('触发了 load 事件')
      // 1. 先让页码值自增 +1
      this.page += 1
      // 2. 再次调用 initSearchResult 方法
      this.initSearchResult()
    }
  },
  components: {
    ArtItem
  }
  // 在即将通过路由离开 SearchResult 组件的时候，把滚动条的位置，记录到 from 的 meta 元信息中
  // beforeRouteLeave(to, from, next) {
  //   from.meta.top = window.scrollY
  //   console.log(from.meta.top)
  //   next()
  // }
}
</script>

<style lang="less" scoped>
.search-result-container {
  padding-top: 46px;
}
</style>
