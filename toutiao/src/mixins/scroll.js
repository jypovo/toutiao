export default {
  activated() {
    // 为 window 对象，绑定 scroll 事件的监听
    window.addEventListener('scroll', this.scrollHandler)
  },
  deactivated() {
    // 为 window 对象，移除 scroll 事件的监听
    window.removeEventListener('scroll', this.scrollHandler)
  },
  methods: {
    // 滚动的事件监听处理函数
    scrollHandler() {
      // console.log(window.scrollY)
      this.$route.meta.top = window.scrollY
    }
  }
}
