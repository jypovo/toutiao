<template>
  <div>
    <!-- Header 头部区域 -->
    <div class="search-header">
      <!-- 后退图标 -->
      <van-icon name="arrow-left" color="white" size="18" class="goback" @click="$router.back()" />
      <!-- 搜索组件 -->
      <!-- 监听搜索组件的 input 输入事件 -->
      <van-search
        v-model.trim="kw"
        placeholder="请输入搜索关键词"
        background="#007BFF"
        shape="round"
        @input="onInput"
      />
    </div>

    <!-- 搜索建议 -->
    <div class="sugg-list" v-if="kw.length !== 0">
      <!-- <div class="sugg-item" v-for="(item, i) in suggList" :key="i">{{ item }}</div> -->
      <div class="sugg-item" v-for="(item, i) in suggList" :key="i" v-html="item" @click="gotoSearchResult"></div>
    </div>

    <!-- 搜索历史 -->
    <div class="search-history" v-else>
      <!-- 标题 -->
      <van-cell title="搜索历史">
        <!-- 使用 right-icon 插槽来自定义右侧图标 -->
        <template #right-icon>
          <van-icon name="delete" class="search-icon" @click="history = []" />
        </template>
      </van-cell>

      <!-- 历史列表 -->
      <div class="history-list">
        <span class="history-item" v-for="(tag, i) in history" :key="i" @click="gotoSearchResult">{{ tag }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { getSuggListAPI } from '@/api/searchAPI.js'

export default {
  name: 'Search',
  data() {
    return {
      // 搜索关键词
      kw: '',
      // 关闭延时器的 id
      timerId: null,
      // 搜索建议的列表数据
      suggList: [],
      // 搜索历史
      history: JSON.parse(localStorage.getItem('history')) || []
    }
  },
  mounted() {
    // 尽量不要直接调用获取 DOM 元素的 API，尽量使用 ref 来获取元素的引用（程序员要有一个取舍）
    // 1. 获取文本框的 DOM 元素
    const ipt = document.querySelector('input')
    // 2. 让文本框获取焦点
    ipt.focus()

    // this.$refs.searchRef.querySelector('input').focus()
  },
  methods: {
    // 触发了搜索框的输入事件
    onInput() {
      // 每次触发 onInput 都清除上次的延时器
      clearTimeout(this.timerId)

      // 如果输入的关键词为空字符串，则没有必要开启延时器
      if (this.kw.length === 0) {
        this.suggList = []
        return
      }

      // 开启延时器，重新计时
      this.timerId = setTimeout(() => {
        console.log(this.kw)
        // TODO：根据搜索关键词，查询搜索建议的列表数据
        this.initSuggList()
      }, 500)
    },
    // 初始化建议的列表数据
    async initSuggList() {
      const { data: res } = await getSuggListAPI(this.kw)
      if (res.message === 'OK') {
        // 调用一个 hlightKeywords 的函数，对 options 数组中的每一项，进行高亮
        this.hlightKeywords(res.data.options)
        this.suggList = res.data.options

        const newHistory = this.history.filter(item => item !== this.kw)
        // 搜索关键词，存入 history 数组中
        newHistory.unshift(this.kw)
        this.history = newHistory
      }
    },
    // 对数组中的每一项，进行高亮的处理
    hlightKeywords(arr) {
      // 1. 创建正则
      const reg = new RegExp(this.kw, 'ig')
      // 2. 循环 arr 中的每一项，进行高亮处理
      arr.forEach((item, i) => {
        // arr[i] = 高亮的结果
        arr[i] = item.replace(reg, function(val) {
          return `<span style="color: red; font-weight: bold;">${val}</span>`
        })
      })
    },
    // 点击搜索历史、或搜索建议，都能够跳转到搜索结果页
    gotoSearchResult(e) {
      // console.log(e.target.innerHTML)
      // console.log(e.target.innerText)
      // 接下来，一起区分一下 e.target 和 e.currentTarget 的区别
      this.$router.push('/search/' + e.currentTarget.innerText)
    }
  },
  // 侦听器
  watch: {
    history(newVal) {
      localStorage.setItem('history', JSON.stringify(newVal))
    }
  }
}
</script>

<style lang="less" scoped>
.search-header {
  height: 46px;
  display: flex;
  align-items: center;
  background-color: #007bff;
  overflow: hidden;
  // 后退按钮
  .goback {
    padding-left: 14px;
  }
  // 搜索组件
  .van-search {
    flex: 1;
  }
}

.sugg-list {
  .sugg-item {
    padding: 0 15px;
    border-bottom: 1px solid #f8f8f8;
    font-size: 14px;
    line-height: 50px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.search-icon {
  font-size: 16px;
  line-height: inherit;
}

.history-list {
  padding: 0 10px;
  .history-item {
    display: inline-block;
    font-size: 12px;
    padding: 8px 14px;
    background-color: #efefef;
    margin: 10px 8px 0px 8px;
    border-radius: 10px;
  }
}
</style>
