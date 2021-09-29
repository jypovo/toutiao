<template>
  <div class="user-edit-container">
    <!-- Header 区域 -->
    <van-nav-bar title="编辑资料" left-arrow @click-left="$router.back()" fixed />

    <!-- 用户资料 -->
    <van-cell-group class="action-card">
      <van-cell title="头像" is-link center @click="onPhotoClick">
        <template #default>
          <!-- 文件选择器的 change 事件中，可以监听用户选择了文件的操作 -->
          <input type="file" accept="image/*" style="display: none;" ref="iptFile" @change="onFileChange" />
          <van-image round class="avatar" :src="userProfile.photo" />
        </template>
      </van-cell>
      <van-cell title="名称" is-link :value="userProfile.name" @click="showName" />
      <van-cell title="生日" is-link :value="userProfile.birthday" @click="showBirth" />
    </van-cell-group>

    <!-- 修改名称的对话框 -->
    <van-dialog v-model="showNameDialog" title="修改名称" show-cancel-button :before-close="beforeClose">
      <!-- input-align 文本横向的对其方式 -->
      <van-field v-model.trim="name" placeholder="请输入用户名" input-align="center" maxlength="11" ref="iptNameRef" />
    </van-dialog>

    <!-- 修改生日的动作面板 -->
    <van-action-sheet v-model="showBirthSheet">
      <div class="content">
        <!-- 日期组件 -->
        <van-datetime-picker
          v-model="currentDate"
          type="date"
          title="选择生日"
          :min-date="minDate"
          :max-date="maxDate"
          @cancel="onCancel"
          @confirm="onConfirm"
        />
      </div>
    </van-action-sheet>
  </div>
</template>

<script>
// 导入辅助函数
import { mapActions, mapState } from 'vuex'
// 按需导入 Vant 的 Notify 消息通知组件
import { Notify } from 'vant'
// 按需导入 API 接口
import { updateUserProfileAPI, updateUserAvatarAPI } from '@/api/userAPI.js'
// 导入 dayjs 进行日期格式化
import dayjs from 'dayjs'

export default {
  name: 'UserEdit',
  data() {
    return {
      // 是否展示修改名称的对话框
      showNameDialog: false,
      // 用户填写的名称
      name: '',
      // 是否展示修改生日的动作面板
      showBirthSheet: false,
      // 当前的日期
      currentDate: new Date(),
      // 最小的可选日期
      minDate: new Date(1949, 9, 1),
      // 最大的可选日期
      maxDate: new Date()
    }
  },
  created() {
    this.initUserProfile()
  },
  methods: {
    ...mapActions(['initUserProfile']),
    // 展示修改名称的对话框
    showName() {
      // 给 data 中的 name 赋初始值
      this.name = this.userProfile.name
      this.showNameDialog = true

      this.$nextTick(() => {
        this.$refs.iptNameRef.focus()
      })
    },
    // 修改名称对话框关闭前的回调
    // 如果点击了取消，则 action 的值是字符串 calcel
    // 如果点击了确定，则 action 的值是字符串 confirm
    async beforeClose(action, done) {
      if (action === 'cancel') {
        // 证明用户点击了取消按钮
        // 直接调用 done() 会关闭对话框
        done()
      } else {
        // 证明用户点击了确定按钮
        // TODO：判断文本框的值是否为空，如果为空：
        // 1. 阻止对话框的关闭
        // 2. 让文本框持续获得焦点
        // 3. 提示用户一个警告消息
        if (this.name.length === 0 || this.name.length > 11) {
          // 内容不合法，阻止对话框的关闭
          done(false)
          this.$refs.iptNameRef.focus()
          Notify({ type: 'warning', message: '名称的长度为 1-11 个字符' })
        } else {
          // 内容合法：
          // 1. 调用接口，修改用户的名称
          // 2. 当接口调用成功之后，关闭对话框
          // 3. 提示用户更新成功
          // 4. 刷新用户的简介数据
          const { data: res } = await updateUserProfileAPI({ name: this.name })
          if (res.message === 'OK') {
            done()
            Notify({ type: 'success', message: '更新成功！' })
            // 调用映射过来的 Action 方法，重新发起请求，刷新用户的简介信息
            this.initUserProfile()
          }
        }
      }
    },
    // 展示修改生日的动作面板
    showBirth() {
      // 在展示弹出层的时候，为生日赋初始值
      this.currentDate = new Date(this.userProfile.birthday)
      this.showBirthSheet = true
    },
    // 点击了日期组件的取消按钮
    onCancel() {
      this.showBirthSheet = false
    },
    // 点击了日期组件的确认按钮
    async onConfirm(value) {
      // TODO: 对 value 时间进行格式化
      // 1. 基于 value 创建出一个 dayjs 的日期对象
      // 2. 调用 dayjs 日期对象的 .format() 方法进行格式化，返回值就是格式化好的时间字符串
      const birthday = dayjs(value).format('YYYY-MM-DD')
      // moment(给定的时间).format('格式')
      const { data: res } = await updateUserProfileAPI({ birthday })
      if (res.message === 'OK') {
        // 1. 隐藏 ActionSheet
        this.showBirthSheet = false
        // 2. 更新用户的简介数据
        this.initUserProfile()
        // 3. 提示用户更新成功
        Notify({ type: 'success', message: '更新成功！' })
      }
    },
    // 点击了选择头像这一行
    onPhotoClick() {
      // 模拟文件选择器的点击行为
      this.$refs.iptFile.click()
    },
    // 触发了文件选择器的 change 事件处理函数
    async onFileChange(e) {
      // 通过 e.currentTarget.files 可以获取到伪数组，存储的是用户选择的文件
      const files = e.currentTarget.files
      if (files.length === 0) return

      // 创建 FormData 的实例对象，得到的 fd 就是请求体数据
      const fd = new FormData()
      // 调用 append 方法，可以向 fd 中追加请求体数据
      fd.append('photo', files[0])

      const { data: res } = await updateUserAvatarAPI(fd)
      if (res.message === 'OK') {
        // 头像更新成功
        // 1. 更新用户的简介信息
        this.initUserProfile()
        // 2. 提示用户
        Notify({ type: 'success', message: '头像更新成功！' })
      }
    }
  },
  computed: {
    ...mapState(['userProfile'])
  }
}
</script>

<style lang="less" scoped>
.user-edit-container {
  padding-top: 46px;
}

.user-edit-container {
  padding-top: 46px;
  .avatar {
    width: 50px;
    height: 50px;
  }
}

.content {
  padding: 16px;
}
</style>
