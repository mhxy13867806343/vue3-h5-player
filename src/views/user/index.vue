<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showDialog } from 'vant';
import { useUserStore } from '@/store/modules/user';

// 获取用户状态
const userStore = useUserStore();
const router = useRouter();

// 模拟用户信息
const userInfo = ref({
  avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
  nickname: '用户' + Math.floor(Math.random() * 1000),
  level: '普通会员',
  playHistory: []
});

// 播放历史（模拟数据）
const playHistory = ref([
  {
    id: 1,
    title: '最近播放的视频1',
    cover: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    progress: 80
  },
  {
    id: 2,
    title: '最近播放的视频2',
    cover: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg',
    progress: 45
  }
]);

// 功能列表
const featureList = [
  { id: 'favorite', icon: 'star-o', text: '我的收藏', badge: 12 },
  { id: 'download', icon: 'down', text: '我的下载', badge: 5 },
  { id: 'history', icon: 'clock-o', text: '播放历史' },
  { id: 'settings', icon: 'setting-o', text: '设置' }
];

// 是否已登录
const isLogin = computed(() => userStore.isLogin);

// 点击功能项
const handleFeatureClick = (feature) => {
  if (!isLogin.value) {
    showToast('请先登录');
    return;
  }
  
  switch (feature.id) {
    case 'favorite':
      showToast('暂未开放，敬请期待');
      break;
    case 'download':
      showToast('暂未开放，敬请期待');
      break;
    case 'history':
      router.push('/history');
      break;
    case 'settings':
      router.push('/settings');
      break;
    default:
      break;
  }
};

// 登录/登出
const handleLoginAction = () => {
  if (isLogin.value) {
    // 已登录，则显示退出登录对话框
    showDialog({
      title: '提示',
      message: '确定要退出登录吗？',
      showCancelButton: true,
    }).then(() => {
      // 点击确认按钮
      userStore.logout();
      showToast('已退出登录');
    }).catch(() => {
      // 点击取消按钮
    });
  } else {
    // 未登录，则跳转到登录页
    showToast('请先登录');
    // 模拟登录成功
    setTimeout(() => {
      userStore.setUserInfo(userInfo.value);
      userStore.setLoginState(true);
      userStore.setToken('mock_token_' + Date.now());
      showToast('登录成功');
    }, 1000);
  }
};
</script>

<template>
  <div class="user-container">
    <div class="user-header">
      <div class="user-info">
        <van-image
          round
          width="80"
          height="80"
          :src="userInfo.avatar"
          @click="handleLoginAction"
        />
        <div class="user-meta">
          <template v-if="isLogin">
            <div class="user-name">{{ userInfo.nickname }}</div>
            <div class="user-level">{{ userInfo.level }}</div>
          </template>
          <template v-else>
            <div class="login-tip" @click="handleLoginAction">点击登录</div>
          </template>
        </div>
      </div>
    </div>
    
    <div class="feature-section">
      <van-cell-group inset title="我的服务">
        <van-grid :column-num="4" :border="false">
          <van-grid-item
            v-for="feature in featureList"
            :key="feature.id"
            :icon="feature.icon"
            :text="feature.text"
            :badge="feature.badge"
            @click="handleFeatureClick(feature)"
          />
        </van-grid>
      </van-cell-group>
    </div>
    
    <div class="history-section" v-if="playHistory.length > 0">
      <van-cell-group inset title="最近播放">
        <van-cell
          v-for="item in playHistory"
          :key="item.id"
          class="history-item"
        >
          <template #icon>
            <div class="history-cover">
              <van-image :src="item.cover" width="60" height="40" fit="cover" />
            </div>
          </template>
          <template #title>
            <div class="history-title">{{ item.title }}</div>
          </template>
          <template #label>
            <van-progress
              :percentage="item.progress"
              :show-pivot="false"
              color="#2979ff"
            />
          </template>
        </van-cell>
      </van-cell-group>
    </div>
    
    <div class="action-section">
      <van-cell-group inset>
        <van-cell title="关于我们" is-link />
        <van-cell title="意见反馈" is-link />
        <van-cell title="检查更新" is-link />
      </van-cell-group>
      
      <div class="logout-btn" v-if="isLogin">
        <van-button block type="danger" @click="handleLoginAction">退出登录</van-button>
      </div>
    </div>
    
    <van-tabbar route>
      <van-tabbar-item replace to="/home" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item replace to="/user" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style lang="scss" scoped>
.user-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: $bg-color;
  padding-bottom: 50px;
  overflow-y: auto;
}

.user-header {
  padding: 20px 16px;
  background: linear-gradient(to right, #2979ff, #56ccf2);
  
  .user-info {
    display: flex;
    align-items: center;
    
    .user-meta {
      margin-left: 16px;
      color: #fff;
      
      .user-name {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 4px;
      }
      
      .user-level {
        font-size: 14px;
        opacity: 0.8;
      }
      
      .login-tip {
        font-size: 16px;
        font-weight: 500;
      }
    }
  }
}

.feature-section {
  margin-top: -20px;
}

.history-section {
  margin-top: 12px;
  
  .history-item {
    .history-cover {
      margin-right: 12px;
    }
    
    .history-title {
      font-size: 14px;
      @include text-ellipsis;
      max-width: 200px;
    }
  }
}

.action-section {
  margin-top: 12px;
  
  .logout-btn {
    margin: 20px 16px;
  }
}
</style>
