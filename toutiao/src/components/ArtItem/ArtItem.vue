<template>
  <!-- this.$route 路由"参数对象" -->
  <!-- this.$router 路由“导航对象” -->
  <div @click="$router.push('/article/' + article.art_id)">
    <van-cell>
      <!-- 标题区域的插槽 -->
      <template #title>
        <div class="title-box">
          <!-- 标题 -->
          <span>{{ article.title }}</span>
          <!-- 单张图片 -->
          <img v-lazy="article.cover.images[0]" alt="" class="thumb" v-if="article.cover.type === 1" />
        </div>
        <!-- 三张图片 -->
        <div class="thumb-box" v-if="article.cover.type === 3">
          <!-- 循环渲染三张封面 -->
          <img v-lazy="item" alt="" class="thumb" v-for="(item, i) in article.cover.images" :key="i" />
        </div>
      </template>
      <!-- label 区域的插槽 -->
      <template #label>
        <div class="label-box">
          <span
            >作者 {{ article.aut_name }}&nbsp;&nbsp; {{ article.comm_count }} 评论 &nbsp;&nbsp; 发布日期
            {{ article.pubdate | dateFormat }}</span
          >
          <!-- 关闭按钮 -->
          <van-icon name="cross" @click.stop="onClose" v-if="closable" />
        </div>
      </template>
    </van-cell>

    <!-- 第一个层：3 个选项 -->
    <van-action-sheet v-model="show" cancel-text="取消" get-container="body">
      <!-- 第一级反馈面板的选项 -->
      <van-cell
        :title="item.name"
        clickable
        class="center-title"
        v-for="(item, i) in actions"
        :key="i"
        @click="onAction1Click(item)"
      />
    </van-action-sheet>

    <!-- 第二个层：9 个选项 -->
    <van-action-sheet v-model="show2" cancel-text="返回" @cancel="onAction2Cancel" get-container="body">
      <van-cell
        :title="item.label"
        clickable
        class="center-title"
        v-for="(item, i) in reports"
        :key="i"
        @click="reportArticle(item.type)"
      />
    </van-action-sheet>
  </div>
</template>

<script>
// 导入可选项
import reports from '@/api/reports.js'
// 导入 API 接口
import { dislikeArticleAPI, reportArticleAPI } from '@/api/homeAPI.js'

export default {
  name: 'ArtItem',
  props: {
    // 文章的信息对象
    article: {
      type: Object,
      required: true
    },
    // 控制是否展示“叉号”的小图标
    closable: {
      type: Boolean,
      // 默认值为 true，表示展示“叉号”的小图标
      default: true
    }
  },
  data() {
    return {
      // 控制第一个层的展示与隐藏
      show: false,
      // 控制第二个面板的展示与隐藏
      show2: false,
      // 第一个面板的可选项列表
      actions: [{ name: '不感兴趣' }, { name: '反馈垃圾内容' }, { name: '拉黑作者' }],
      // 第二个面板的可选项列表
      reports
    }
  },
  methods: {
    // 点击了第一个面板中的可选项
    async onAction1Click(item) {
      if (item.name === '不感兴趣') {
        // 调用不感兴趣的 API
        const { data: res } = await dislikeArticleAPI(this.article.art_id)
        if (res.message === 'OK') {
          console.log('不感兴趣的接口调用成功')
          // 触发自定义事件
          this.$emit('remove-article', this.article.art_id)
        }
        // 隐藏第一个面板
        this.show = false
      } else if (item.name === '反馈垃圾内容') {
        // 隐藏第一个面板
        this.show = false
        // 展示第二个面板
        this.show2 = true
      } else if (item.name === '拉黑作者') {
        console.log('假装拉黑了作者！')
      }
    },
    // 点击了第二个面板的取消按钮
    onAction2Cancel() {
      this.show = true
      this.show2 = false
    },
    // 点击了关闭的小图标
    onClose() {
      this.show = !this.show
    },
    // 举报文章
    async reportArticle(type) {
      // 调用 API 接口
      const { data: res } = await reportArticleAPI(this.article.art_id, type)
      if (res.message === 'OK') {
        console.log('举报文章成功！')
        // 炸楼
        this.$emit('remove-article', this.article.art_id)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.label-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.thumb {
  // 矩形黄金比例：0.618
  width: 113px;
  height: 70px;
  background-color: #f8f8f8;
  object-fit: cover;
}

.title-box {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.thumb-box {
  display: flex;
  justify-content: space-between;
}

.center-title {
  text-align: center;
}
</style>
