<template>
  <div>
    <keep-alive>
      <!-- 路由的占位符 -->
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {}
  }
}
</script>

<style lang="less" scoped>
h1 {
  font-size: 12px;
}
</style>
