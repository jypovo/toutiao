<template>
  <div class="user-container">
    <!-- 用户基本信息面板 -->
    <div class="user-card">
      <!-- 用户头像、姓名 -->
      <van-cell>
        <!-- 使用 title 插槽来自定义标题 -->
        <template #icon>
          <img :src="userInfo.photo" alt="" class="avatar" />
        </template>
        <template #title>
          <span class="username">{{ userInfo.name }}</span>
        </template>
        <template #label>
          <van-tag color="#fff" text-color="#007bff">申请认证</van-tag>
        </template>
      </van-cell>
      <!-- 动态、关注、粉丝 -->
      <div class="user-data">
        <div class="user-data-item">
          <span>{{ userInfo.art_count }}</span>
          <span>动态</span>
        </div>
        <div class="user-data-item">
          <span>{{ userInfo.follow_count }}</span>
          <span>关注</span>
        </div>
        <div class="user-data-item">
          <span>{{ userInfo.fans_count }}</span>
          <span>粉丝</span>
        </div>
      </div>
    </div>

    <!-- 操作面板 -->
    <van-cell-group class="action-card">
      <van-cell icon="edit" title="编辑资料" is-link @click="$router.push({ name: 'user-edit' })" />
      <van-cell icon="chat-o" title="小思同学" is-link @click="$router.push({ name: 'chat' })" />
      <van-cell icon="warning-o" title="退出登录" is-link @click="onLogout" />
    </van-cell-group>
  </div>
</template>

<script>
// 按需导入 vuex 的辅助函数
import { mapActions, mapState, mapMutations } from 'vuex'
// 按需导入 Dialog 弹框组件
import { Dialog } from 'vant'

export default {
  name: 'User',
  // created() {
  //   console.log('执行了 created')
  //   this.initUserInfo()
  // },
  activated() {
    console.log('执行了 activated')
    this.initUserInfo()
  },
  methods: {
    // 映射需要的 action 方法
    ...mapActions(['initUserInfo']),
    ...mapMutations(['cleanState']),
    // 点击了退出登录的链接
    async onLogout() {
      // 询问用户是否退出登录
      // 通过 .catch 可以捕获 Promise 中产生的错误，并且，在 .catch 中 return 出去
      // .catch return 的值，会被 confirmResult 所接收
      const confirmResult = await Dialog.confirm({
        title: '提示',
        message: '确认退出登录吗？'
      }).catch(err => err)

      // 如果用户点了取消，则 return 出去，不执行后续的代码
      if (confirmResult === 'cancel') return

      console.log('点了确认。需要执行退出登录的操作！')
      this.cleanState()
      this.$router.push('/login')
    }
  },
  computed: {
    ...mapState(['userInfo'])
  }
}
</script>

<style lang="less" scoped>
.user-container {
  .user-card {
    background-color: #007bff;
    color: white;
    padding-top: 20px;
    .van-cell {
      background: #007bff;
      color: white;
      &::after {
        display: none;
      }
      .avatar {
        width: 60px;
        height: 60px;
        background-color: #fff;
        border-radius: 50%;
        margin-right: 10px;
      }
      .username {
        font-size: 14px;
        font-weight: bold;
      }
    }
  }
  .user-data {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    font-size: 14px;
    padding: 30px 0;
    .user-data-item {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 33.33%;
    }
  }
}
</style>
