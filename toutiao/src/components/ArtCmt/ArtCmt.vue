<template>
  <div>
    <!-- 评论列表 -->
    <van-list
      v-model="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
      class="cmt-list"
      :immediate-check="false"
    >
      <!-- 评论的 Item 项 -->
      <div class="cmt-item" v-for="item in cmtList" :key="item.com_id">
        <!-- 头部区域 -->
        <div class="cmt-header">
          <!-- 头部左侧 -->
          <div class="cmt-header-left">
            <img :src="item.aut_photo" alt="" class="avatar" />
            <span class="uname">{{ item.aut_name }}</span>
          </div>
          <!-- 头部右侧 -->
          <div class="cmt-header-right">
            <van-icon name="like" size="16" color="red" v-if="item.is_liking" />
            <van-icon name="like-o" size="16" color="gray" v-else />
          </div>
        </div>
        <!-- 主体区域 -->
        <div class="cmt-body">
          {{ item.content }}
        </div>
        <!-- 尾部区域 -->
        <div class="cmt-footer">{{ item.pubdate | dateFormat }}</div>
      </div>
    </van-list>

    <!-- 底部添加评论区域 - 1 -->
    <div class="add-cmt-box van-hairline--top" v-if="isShowBox1">
      <van-icon name="arrow-left" size="18" @click="$router.back()" />
      <div class="ipt-cmt-div" @click="showBox2">发表评论</div>
      <div class="icon-box">
        <van-badge :content="totalCount" :max="99">
          <van-icon name="comment-o" size="20" @click="gotoCmtList" />
        </van-badge>
        <van-icon name="star-o" size="20" />
        <van-icon name="share-o" size="20" />
      </div>
    </div>

    <!-- 底部添加评论区域 - 2 -->
    <div class="cmt-box van-hairline--top" v-else>
      <textarea
        placeholder="友善评论、理性发言、阳光心灵"
        @blur="hideBox2"
        ref="iptCmt"
        v-model.trim="iptValue"
      ></textarea>
      <van-button type="default" :disabled="iptValue.length === 0" @click="onPublish">发布</van-button>
    </div>
  </div>
</template>

<script>
// 按需导入 API 接口
import { getCmtListAPI, publishCommentAPI } from '@/api/articleAPI.js'
import { Toast } from 'vant'
// 按需导入 animate 函数
import { animate } from 'popmotion'

export default {
  name: 'ArtCmt',
  props: {
    // 父组件通过属性绑定，传递过来的文章的 id
    // 子组件中接收到 artId 之后，就可以请求文章下的评论数据啦
    artId: {
      // 补充：自定义属性，如果允许有多种值类型，可以通过数组来定义
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      // 偏移量，默认值为 null，表示请求第一页的评论数据
      offset: null,
      // 评论的列表数据
      cmtList: [],
      // 总评论条数
      totalCount: 0,
      loading: true,
      finished: false,
      // 是否展示区域1
      isShowBox1: true,
      // 用户输入的评论内容
      iptValue: ''
    }
  },
  created() {
    this.initCmtList()
  },
  methods: {
    // 初始化文章的评论列表数据
    async initCmtList() {
      const { data: res } = await getCmtListAPI(this.artId, this.offset)
      if (res.message === 'OK') {
        // 为偏移量赋值
        this.offset = res.data.last_id
        // 为评论的列表数据赋值【新旧数据的拼接，旧数据在前，新数据在后】
        this.cmtList = [...this.cmtList, ...res.data.results]
        // 为总评论条数赋值
        this.totalCount = res.data.total_count

        // 要把 loading 重置为 false，否则无法加载下一页的数据
        this.loading = false

        // 判断是否还有下一页数据，如果这俩值相等，证明没有下一页数据了
        if (res.data.last_id === res.data.end_id) {
          // 证明没有下一页数据了
          console.log('没有下一页数据了！！！')
          this.finished = true
        }
      }
    },
    // 触发了上拉加载更多的事件
    onLoad() {
      console.log('onLoad')
      // 请求下一页的评论列表数据
      this.initCmtList()
    },
    // 展示区域2
    showBox2() {
      this.isShowBox1 = false
      // 因为 Vue 在更新 DOM 的时候，是异步的

      // $nextTick 的作用：把回调函数延迟执行
      // 延迟到什么时候呢：等下次 DOM 更新完毕之后，再执行回调中的代码
      // 好处：能够保证回调中的代码，能操作到更新完毕后，最新的 DOM 元素
      this.$nextTick(() => {
        // 让 textarea 获取焦点
        this.$refs.iptCmt.focus()
      })
    },
    // 隐藏区域2
    hideBox2() {
      setTimeout(() => {
        this.isShowBox1 = true
      }, 100)
    },
    // 点击了发布按钮
    async onPublish() {
      // 如果评论内容为空，则不请求接口
      if (this.iptValue.length === 0) return
      // 调用 API 接口
      const { data: res } = await publishCommentAPI(this.artId, this.iptValue)
      if (res.message === 'OK') {
        // 评论发表成功
        Toast.success('评论成功！')
        // 把服务器响应的 res.data.new_obj 追加到评论列表的头部
        // 因为 res.data.new_obj 就是最新发表的那一条评论的信息对象
        this.cmtList.unshift(res.data.new_obj)
        // 在客户端浏览器，让 this.totalCount 自增 +1
        this.totalCount += 1

        // 清空文本框的内容
        this.iptValue = ''
      }
    },
    // 滚动到评论区域
    gotoCmtList() {
      // 注意：from 是起始位置，就是滚动条当前的位置
      // 注意：to 是目标位置，就是 div.article-container 元素的整体高度
      animate({
        from: window.scrollY,
        to: document.querySelector('div.article-container').offsetHeight,
        // 只要值发生了变化，就会触发 onUpdate 函数，通过形参 latest 可以拿到当前最新的值
        onUpdate: function(latest) {
          // 调用 window.scrollTo(x, y) 来让滚动条滚动到目标位置
          // x 是横向滚动的位置
          // y 是纵向滚动的位置
          window.scrollTo(0, latest)
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.cmt-list {
  padding: 10px;
  .cmt-item {
    padding: 15px 0;
    + .cmt-item {
      border-top: 1px solid #f8f8f8;
    }
    .cmt-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .cmt-header-left {
        display: flex;
        align-items: center;
        .avatar {
          width: 40px;
          height: 40px;
          background-color: #f8f8f8;
          border-radius: 50%;
          margin-right: 15px;
        }
        .uname {
          font-size: 12px;
        }
      }
    }
    .cmt-body {
      font-size: 14px;
      line-height: 28px;
      text-indent: 2em;
      margin-top: 6px;
      word-break: break-all;
    }
    .cmt-footer {
      font-size: 12px;
      color: gray;
      margin-top: 10px;
    }
  }
}

// 外层容器
.art-cmt-container-1 {
  padding-bottom: 46px;
}
.art-cmt-container-2 {
  padding-bottom: 80px;
}

// 发布评论的盒子 - 1
.add-cmt-box {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  box-sizing: border-box;
  background-color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 46px;
  line-height: 46px;
  padding-left: 10px;
  .ipt-cmt-div {
    flex: 1;
    border: 1px solid #efefef;
    border-radius: 15px;
    height: 30px;
    font-size: 12px;
    line-height: 30px;
    padding-left: 15px;
    margin-left: 10px;
    background-color: #f8f8f8;
  }
  .icon-box {
    width: 40%;
    display: flex;
    justify-content: space-evenly;
    line-height: 0;
  }
}

.child {
  width: 20px;
  height: 20px;
  background: #f2f3f5;
}

// 发布评论的盒子 - 2
.cmt-box {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  padding-left: 10px;
  box-sizing: border-box;
  background-color: white;
  textarea {
    flex: 1;
    height: 66%;
    border: 1px solid #efefef;
    background-color: #f8f8f8;
    resize: none;
    border-radius: 6px;
    padding: 5px;
  }
  .van-button {
    height: 100%;
    border: none;
  }
}
</style>
