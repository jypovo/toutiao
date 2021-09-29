<template>
  <div class="login-container">
    <!-- 头部区域 -->
    <van-nav-bar title="黑马头条 - 登录" fixed />

    <!-- 登录的表单 -->
    <van-form @submit="onSubmit">
      <!-- label 属性表示左侧描述性质的文本 -->
      <!-- required 用来渲染 label 左侧的 * 号 -->
      <van-field
        v-model="form.mobile"
        label="手机号码"
        placeholder="请输入手机号"
        required
        :rules="[
          { required: true, message: '请填写手机号' },
          { pattern: /^1\d{10}$/, message: '请填写正确的手机号' }
        ]"
      />
      <van-field
        v-model="form.code"
        type="password"
        label="登录密码"
        placeholder="请输入密码"
        required
        :rules="[{ required: true, message: '请填写密码' }]"
      />
      <div style="margin: 16px;">
        <van-button round block type="info" native-type="submit">提交</van-button>
      </div>
    </van-form>
  </div>
</template>

<script>
// 按需导入 API 接口
import { loginAPI } from "@/api/userAPI.js";
// 从 vuex 中按需导入 mapMutations
import { mapMutations } from "vuex";

export default {
  // 组件的 name 属性的值，要首字母大写
  name: "Login",
  data() {
    return {
      // 用户填写的表单数据
      form: {
        // 手机号
        mobile: "13888888123",
        // 登录密码
        code: "246810"
      }
    };
  },
  methods: {
    ...mapMutations(["updateTokenInfo"]),
    // 表单的提交事件
    async onSubmit() {
      // 1. 获取到用户填写的登录信息对象
      console.log(this.form);
      // 2. 封装并调用登录的 API 接口
      // 2.1 如果调用某个方法的返回值是 Promise 对象，则可以在方法之前添加 await 关键字
      // 2.2 await 只能用在被 async 修饰的方法内
      const { data: res } = await loginAPI(this.form);
      if (res.message === "OK") {
        // 证明登录成功
        // 1. 要把 token 存储到本地
        // localStorage.setItem('token', JSON.stringify(res.data))
        // 把 token 信息存储到 vuex 中
        this.updateTokenInfo(res.data);
        // 2. 要跳转到首页
        // 动态获取登录成功之后要导航到哪个地址
        const navPath = this.$route.query.pre || "/";
        this.$router.replace(navPath);
      }
    }
  }
};
</script>

<style lang="less" scoped>
.login-container {
  padding-top: 46px;
}
</style>
