<template>
  <div class="container">
    <!-- 固定导航 -->
    <van-nav-bar fixed left-arrow @click-left="$router.back()" title="小思同学"></van-nav-bar>

    <!-- 聊天主体区域 -->
    <div class="chat-list">
      <div v-for="(item, i) in list" :key="i">
        <!-- 左侧是机器人小思 -->
        <div class="chat-item left" v-if="item.name === 'xs'">
          <van-image fit="cover" round src="https://img.yzcdn.cn/vant/cat.jpeg" />
          <div class="chat-pao">{{ item.msg }}</div>
        </div>

        <!-- 右侧是当前用户 -->
        <div class="chat-item right" v-else>
          <div class="chat-pao">{{ item.msg }}</div>
          <van-image fit="cover" round :src="avatar" />
        </div>
      </div>
    </div>

    <!-- 对话区域 -->
    <div class="reply-container van-hairline--top">
      <van-field v-model.trim="word" placeholder="说点什么...">
        <template #button>
          <span @click="send()" style="font-size:12px;color:#999">提交</span>
        </template>
      </van-field>
    </div>
  </div>
</template>

<script>
// 从 vuex 中按需导入辅助函数
import { mapGetters } from 'vuex'
// 按需导入 io 方法
import { io } from 'socket.io-client'
let socket = null
// 什么时候创建连接：刚进入 Chat.vue 组件的时候，应该立即创建连接

export default {
  name: 'Chat',
  data() {
    return {
      // 用户输入的聊天内容
      word: '',
      // 这个 list 中存放着所有的聊天消息（机器人和用户的聊天内容，都在这个数组中存着）
      list: [
        // 规定：每一条聊天消息，都由两个属性组成，分别是 name 和 msg
        // 其中，name 的值如果是 xs，证明是机器人的聊天消息，应该被渲染到左侧
        // 如果 name 的值是 me，证明是用户的聊天消息，应该被渲染到右侧
        // { name: 'xs', msg: 'Hi！你好，我是小思同学~' },
        // { name: 'me', msg: '你好啊，我是编程小王子' }
      ]
    }
  },
  // 组件在内存中创建好了
  created() {
    // 创建连接
    socket = io('ws://www.liulongbin.top:9999')

    // 监听连接创建的事件
    socket.on('connect', () => console.log('socket 连接创建完成！'))

    // 监听 message 事件可以获取到服务器发给客户端的消息
    // 只要 message 事件被触发，就证明服务器给客户端发消息了
    socket.on('message', msg => {
      // 形参中的 msg 就是服务器发给客户端的消息
      this.list.push({ name: 'xs', msg })
    })

    // 监听连接被关闭的事件
    socket.on('disconnect', () => console.log('socket 连接已关闭！'))
  },
  // 将要销毁组件
  beforeDestroy() {
    // 关闭连接
    socket.close()
    // 手动释放内存
    socket = null
  },
  methods: {
    // 提交按钮的点击事件处理函数
    send() {
      // 如果输入的聊天内容为空，则 return 出去
      if (!this.word) return

      // 把消息发给服务器
      socket.emit('send', this.word)
      // 把消息渲染到页面上
      this.list.push({ name: 'me', msg: this.word })
      this.word = ''
    },
    // 调用此方法，可以把最新的一条聊天消息，呈现到可视区域的最底部
    scrollToBottom() {
      // 1. 获取到页面上所有的聊天消息 DOM 元素
      const chatItems = document.querySelectorAll('.chat-item')
      // 2. 获取到最新一条聊天消息的 DOM 元素
      const lastItem = chatItems[chatItems.length - 1]
      // 3. 调用 scrollIntoView 方法即可
      lastItem.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      })
    }
  },
  watch: {
    // 监视 list 数组的变化
    list() {
      this.$nextTick(() => {
        // 外层一定要包裹一层 this.$nextTick()，这样能保证滚动的是最新一条的消息
        this.scrollToBottom()
      })
    }
  },
  computed: {
    ...mapGetters(['avatar'])
  }
}
</script>

<style lang="less" scoped>
.container {
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  box-sizing: border-box;
  background: #fafafa;
  padding: 46px 0 50px 0;
  .chat-list {
    height: 100%;
    overflow-y: scroll;
    .chat-item {
      padding: 10px;
      .van-image {
        vertical-align: top;
        width: 40px;
        height: 40px;
      }
      .chat-pao {
        vertical-align: top;
        display: inline-block;
        min-width: 40px;
        max-width: 70%;
        min-height: 40px;
        line-height: 38px;
        border: 0.5px solid #c2d9ea;
        border-radius: 4px;
        position: relative;
        padding: 0 10px;
        background-color: #e0effb;
        word-break: break-all;
        font-size: 14px;
        color: #333;
        &::before {
          content: '';
          width: 10px;
          height: 10px;
          position: absolute;
          top: 12px;
          border-top: 0.5px solid #c2d9ea;
          border-right: 0.5px solid #c2d9ea;
          background: #e0effb;
        }
      }
    }
  }
}
.chat-item.right {
  text-align: right;
  .chat-pao {
    margin-left: 0;
    margin-right: 15px;
    &::before {
      right: -6px;
      transform: rotate(45deg);
    }
  }
}
.chat-item.left {
  text-align: left;
  .chat-pao {
    margin-left: 15px;
    margin-right: 0;
    &::before {
      left: -5px;
      transform: rotate(-135deg);
    }
  }
}
.reply-container {
  position: fixed;
  left: 0;
  bottom: 0;
  height: 44px;
  width: 100%;
  background: #f5f5f5;
  z-index: 9999;
}
</style>
