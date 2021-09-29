<template>
  <div class="home-container">
    <!-- 头部区域 -->
    <van-nav-bar fixed>
      <!-- 右侧的插槽 -->
      <template #right>
        <!-- this.$router.push('地址') -->
        <!-- 注意：在模板结构中调用 this.$router.push() 方法的时候，前面的 this. 必须被省略，否则会报错 -->
        <van-icon name="search" size="18" @click="$router.push('/search')" />
      </template>
      <!-- 左侧的插槽 -->
      <template #left>
        <img src="../../assets/toutiao_logo.png" alt="" class="logo" />
      </template>
    </van-nav-bar>

    <!-- 频道列表区域 -->
    <!-- before-change 的回调，会在将要切换标签页的时候被触发。此时还没有真正的切换 -->
    <van-tabs v-model="active" sticky offset-top="1.22667rem" :before-change="beforeChange" @change="onTabsChange">
      <van-tab :title="item.name" v-for="item in channels" :key="item.id">
        <!-- 文章的列表组件 -->
        <!-- <ArtList :channelId="item.id"></ArtList> -->
        <ArtList :channel-id="item.id"></ArtList>
      </van-tab>
    </van-tabs>

    <!-- Popup 弹出层 -->
    <van-popup v-model="show" :close-on-click-overlay="false" @closed="isDel = false">
      <div class="popup-container">
        <!-- 弹出层的头部区域 -->
        <van-nav-bar title="频道管理">
          <template #right>
            <van-icon name="cross" size="14" color="white" @click="show = false" />
          </template>
        </van-nav-bar>

        <!-- 弹出层的主体区域 -->
        <div class="pop-body">
          <!-- 我的频道 -->
          <div class="my-channel-box">
            <div class="channel-title">
              <div>
                <span class="title-bold">已添加频道：</span>
                <span class="title-gray">{{ isDel ? '点击移除频道' : '点击进入频道' }}</span>
              </div>
              <span class="btn-edit" @click="isDel = !isDel">{{ isDel ? '完成' : '编辑' }}</span>
            </div>
            <!-- 我的频道列表 -->
            <van-row type="flex">
              <van-col span="6" v-for="(item, i) in channels" :key="item.id">
                <!-- 用户的频道 Item 项 -->
                <div class="channel-item van-hairline--surround" @click="onUserChannelClick(item, i)">
                  {{ item.name }}
                  <!-- 删除的图标 -->
                  <van-badge
                    color="transparent"
                    class="cross-badge"
                    v-if="isDel && item.name !== '推荐' && channels.length > 2"
                  >
                    <template #content>
                      <van-icon name="cross" class="badge-icon" color="#cfcfcf" size="12" />
                    </template>
                  </van-badge>
                </div>
              </van-col>
            </van-row>
          </div>

          <!-- 分隔线 -->
          <div class="van-hairline--top sp-line"></div>

          <!-- 更多频道 -->
          <div class="more-channel-box">
            <div class="channel-title">
              <div>
                <span class="title-bold">可添加频道：</span>
                <span class="title-gray">点击添加频道</span>
              </div>
            </div>
            <!-- 更多频道列表 -->
            <van-row type="flex">
              <van-col span="6" v-for="item in moreChannel" :key="item.id">
                <div class="channel-item van-hairline--surround" @click="addToChannel(item)">{{ item.name }}</div>
              </van-col>
            </van-row>
          </div>
        </div>
      </div>
    </van-popup>
    <!-- 频道管理的小图标 -->
    <van-icon name="plus" size="16" class="plus" @click="show = true" />
  </div>
</template>

<script>
// 导入需要的 API 接口
import { getUserChannelsAPI, getAllChennelAPI, updateUserChannelAPI } from '@/api/homeAPI.js'
// 导入文章的列表组件
import ArtList from '@/components/ArtList/ArtList.vue'
import { Notify } from 'vant'
// 1. 导入需要混入的模块
import mix from '@/mixins/scroll.js'

// 定义一个对象，存储“频道名称”和“滚动位置”的对应关系
const nameMapTop = {}

export default {
  name: 'Home',
  // 2. 通过 mixins 数组，把导入过来的模块成员，混入到当前组件中
  mixins: [mix],
  data() {
    return {
      // 标签页的激活项索引
      active: 0,
      // 用户的频道列表数据
      channels: [],
      // 控制 popup 的显示与隐藏
      show: false,
      // 所有的频道列表数据
      allChannel: [],
      // 是否处于删除状态（默认不处于删除状态，此时点击频道，会进入频道中）
      isDel: false
    }
  },
  computed: {
    // 动态计算出未关注的频道列表数据
    moreChannel() {
      const newArr = []
      // 1. 循环全部频道
      // 2. 判断是否在 channels 数组中
      // 3. 如果不在，则添加到新数组中
      // 4. return 结果
      this.allChannel.forEach(item => {
        const r = this.channels.every(x => x.id !== item.id)
        if (r) {
          newArr.push(item)
        }
      })
      return newArr
    }
  },
  created() {
    this.initUserChannels()
    this.initAllChannel()
  },
  methods: {
    // 初始化用户的频道列表数据
    async initUserChannels() {
      const { data: res } = await getUserChannelsAPI()
      console.log(res)
      if (res.message === 'OK') {
        // 把数据转存到组件的 data 中，供渲染模板时使用
        this.channels = res.data.channels
      }
    },
    // 初始化所有的频道列表数据
    async initAllChannel() {
      const { data: res } = await getAllChennelAPI()
      if (res.message === 'OK') {
        this.allChannel = res.data.channels
        console.log(this.allChannel)
      }
    },
    // 点击未关注的频道，将它添加到已关注的列表中
    addToChannel(item) {
      this.channels.push(item)
      this.saveUserChannel()
    },
    // 点击了用户频道的 Item 项
    onUserChannelClick(item, i) {
      if (this.isDel) {
        // 如果点击项的名字为 推荐，则不进行删除
        if (item.name === '推荐' || this.channels.length === 2) {
          return
        }
        // 开启了删除状态   删除频道
        this.channels = this.channels.filter(x => x.id !== item.id)
        this.saveUserChannel()
      } else {
        // 没有开启删除的状态  进入频道
        this.active = i
        this.show = false
      }
    },
    // 把用户最新的频道列表，保存到服务器
    async saveUserChannel() {
      // 准备参数
      const newArr = this.channels.map((item, i) => {
        return { id: item.id, seq: i }
      })
      // 调用接口
      const { data: res } = await updateUserChannelAPI(newArr)
      if (res.message === 'OK') {
        // 提示用户接口调用成功
        Notify({ type: 'success', message: '更新频道成功！' })
      }
    },
    // 将要实现标签页的切换，此时还没有实现切换
    beforeChange() {
      // 获取当前激活的频道的名称
      const name = this.channels[this.active].name
      // 获取当前激活的频道的滚动位置
      const top = window.scrollY

      // 把频道的名称和滚动的位置，记录到 nameMapTop 对象中
      nameMapTop[name] = top
      console.log(nameMapTop)

      // return true 表示允许标签页进行切换
      return true
    },
    // 监听标签页切换完成的事件
    async onTabsChange() {
      // 当前激活的标签页的名字
      const name = this.channels[this.active].name
      const top = nameMapTop[name] || 0

      await this.$nextTick()
      console.log(top)
      window.scrollTo(0, top)
    }
  },
  // 注册组件
  components: {
    ArtList
  }
  // // 组件内的导航守卫
  // beforeRouteLeave(to, from, next) {
  //   // 导航离开该组件的对应路由时调用
  //   // 可以访问组件实例 `this`
  //   console.log('触发了 Home 组件的 beforeRouteLeave')
  //   // 在通过路由导航的方式，离开 Home.vue 组件的时候
  //   // 把滚动条的位置，记录到当前路由规则的 meta 元信息中
  //   this.$route.meta.top = window.scrollY
  //   next()
  // }
}
</script>

<style lang="less" scoped>
.logo {
  height: 80%;
}

.home-container {
  padding-top: 46px;
  padding-bottom: 50px;
}

// 频道管理小图标的定位
.plus {
  position: fixed;
  top: 58px;
  right: 10px;
  z-index: 999;
}

// 为 tabs 容器设置右 padding
/deep/ .van-tabs__wrap {
  padding-right: 36px;
  background-color: white;
}

.van-popup,
.popup-container {
  background-color: transparent;
  height: 100%;
  width: 100%;
}

.popup-container {
  display: flex;
  flex-direction: column;
}

.pop-body {
  flex: 1;
  overflow: scroll;
  padding: 8px;
  background-color: white;
}

.my-channel-box,
.more-channel-box {
  .channel-title {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    line-height: 28px;
    padding: 0 6px;
    .title-bold {
      font-weight: bold;
    }
    .title-gray {
      color: gray;
      font-size: 12px;
    }
  }
}

.btn-edit {
  border: 1px solid #a3a2a2;
  padding: 0 10px;
  line-height: 20px;
  height: 20px;
  border-radius: 6px;
  font-size: 12px;
}

.channel-item {
  font-size: 12px;
  text-align: center;
  line-height: 36px;
  background-color: #fafafa;
  margin: 6px;
}

.cross-badge {
  position: absolute;
  right: -3px;
  top: 0;
  border: none;
}

.sp-line {
  margin: 10px 0 20px 0;
}
</style>
