<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showDialog } from 'vant';
import { usePlayerStore } from '@/store/modules/player';
import { formatDate } from '@/utils/tools';
import { isWeixinBrowser, showWxOpenTip } from '@/utils/h5-wx.js';
import { storeToRefs } from 'pinia';

const router = useRouter();
const playerStore = usePlayerStore();
// 使用storeToRefs保持响应性
const { playHistory } = storeToRefs(playerStore);

// 作者信息
const authorInfo = {
  avatar: 'https://avatars.githubusercontent.com/u/123456789',
  nickname: '前端码农',
  email: '869710179@qq.com',
  github: 'https://github.com/mhxy13867806343',
  juejin: 'https://juejin.cn/user/1310273588955581',
  blog: 'https://blog.lcs200.icu/',
  website: 'https://lcs200.icu/#/',
  cnblogs: 'https://home.cnblogs.com/u/mhxy13867806343'
};

// 社交媒体链接
const socialLinks = [
  { name: '博客', url: authorInfo.blog, icon: 'bookmark-o' },
  { name: '个人网站', url: authorInfo.website, icon: 'home-o' },
  { name: 'GitHub', url: authorInfo.github, icon: 'friends-o' },
  { name: '掘金', url: authorInfo.juejin, icon: 'gem-o' },
  { name: '博客园', url: authorInfo.cnblogs, icon: 'notes-o' }
];

// 功能列表
const featureList = [
  { id: 1, icon: 'music-o', text: '音乐历史', type: 'music' },
  { id: 2, icon: 'video-o', text: 'MV历史', type: 'mv' },
  { id: 3, icon: 'info-o', text: '关于作者', type: 'about' },
  { id: 4, icon: 'share-o', text: '分享', type: 'share' }
];

// 当前活跃的历史类型
const activeHistoryType = ref('music');

// 过滤后的历史记录
const filteredHistory = computed(() => {
  if (activeHistoryType.value === 'mv') {
    return playHistory.value.filter(item => item.type === 'mv');
  } else {
    return playHistory.value.filter(item => item.type === 'music');
  }
});

// 处理功能点击
const handleFeatureClick = (feature) => {
  if (feature.type === 'music' || feature.type === 'mv') {
    // 切换历史类型
    activeHistoryType.value = feature.type;
  } else if (feature.type === 'about') {
    // 滚动到关于作者部分
    document.querySelector('.about-section').scrollIntoView({ behavior: 'smooth' });
  } else if (feature.type === 'share') {
    // 分享功能
    showToast('分享功能开发中...');
  }
};

// 播放历史歌曲
const playHistorySong = (song) => {
  if (!song) return;
  playerStore.playSong(song);
  showToast(`正在播放: ${song.name}`);
};

// 播放历史MV
const playHistoryMv = (mv) => {
  if (!mv) return;
  router.push(`/mv?id=${mv.id}`);
};

// 清空历史记录
const clearHistory = () => {
  showDialog({
    title: '确认清空',
    message: `确定要清空${activeHistoryType.value === 'mv' ? 'MV' : '音乐'}播放历史吗？`,
    showCancelButton: true
  })
    .then(() => {
      if (activeHistoryType.value === 'mv') {
        playerStore.clearMvHistory();
      } else {
        playerStore.clearSongHistory();
      }
      showToast('已清空播放历史');
    })
    .catch(() => {
      // 取消操作
    });
};

// 打开社交媒体链接
const openSocialLink = (link) => {
  window.open(link.url, '_blank');
};

// 页面加载时检查微信环境
onMounted(() => {
  // 如果在微信浏览器中打开，显示提示
  if (isWeixinBrowser()) {
    showWxOpenTip();
  }
});
</script>

<template>
  <div class="user-container">
    <!-- 页面标题 -->
    <van-nav-bar
      title="播放历史"
      left-arrow
      fixed 
      placeholder
      @click-left="router.back()"
    />
    
    <!-- 作者信息头部 -->
    <div class="author-header">
      <div class="author-info">
        <van-image
          round
          width="64"
          height="64"
          :src="authorInfo.avatar"
          fit="cover"
        />
        <div class="author-meta">
          <div class="author-name">{{ authorInfo.nickname }}</div>
          <div class="author-desc">全栈前端开发者</div>
        </div>
      </div>
    </div>
    
    <!-- 功能快捷入口 -->
    <div class="feature-section">
      <van-grid :column-num="4" :border="false">
        <van-grid-item
          v-for="feature in featureList"
          :key="feature.id"
          :icon="feature.icon"
          :text="feature.text"
          @click="handleFeatureClick(feature)"
          :class="{ active: feature.type === activeHistoryType }"
        />
      </van-grid>
    </div>
    
    <!-- 播放历史记录 -->
    <div class="history-section" :class="filteredHistory.length === 0 ? 'empty-history' : ''">
      <div class="history-header">
        <div class="history-title">
          {{ activeHistoryType === 'mv' ? 'MV播放历史' : '音乐播放历史' }}
        </div>
        <van-button v-if="filteredHistory.length > 0" plain hairline size="small" type="primary" @click="clearHistory">清空</van-button>
      </div>
      
      <!-- 无历史数据时展示 -->
      <van-empty v-if="filteredHistory.length === 0" description="还没有播放记录" />
      
      <!-- 播放历史列表 -->
      <div class="history-list" v-else>
        <div
          v-for="item in filteredHistory"
          :key="item.id"
          class="history-item"
          @click="item.type === 'mv' ? playHistoryMv(item) : playHistorySong(item)"
        >
          <div class="history-cover">
            <van-image :src="item.picUrl || item.cover || item.al?.picUrl" radius="4" width="60" height="60" fit="cover" />
            <div class="history-type-icon" v-if="item.type === 'mv'">
              <van-icon name="play-circle-o" size="20" color="#fff" />
            </div>
          </div>
          <div class="history-content">
            <div class="history-name text-ellipsis">{{ item.name }}</div>
            <div class="history-artist text-ellipsis" v-if="item.ar || item.artists">
              {{ (item.ar?.[0]?.name || item.artists?.[0]?.name || '') }}
            </div>
            <div class="history-time">
              {{ formatDate(item.playedAt) }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 关于作者 -->
    <div class="about-section">
      <div class="section-title">关于作者</div>
      <div class="contact-info">
        <div class="social-links">
          <van-button 
            v-for="link in socialLinks" 
            :key="link.name"
            class="social-btn"
            size="small" 
            icon="link" 
            plain 
            hairline 
            @click="openSocialLink(link)"
          >{{ link.name }}</van-button>
        </div>
        <div class="email-info">
          <van-icon name="envelop-o" /> {{ authorInfo.email }}
        </div>
      </div>
      
      <!-- 微信和QQ -->
      <div class="connect-section">
        <div class="connect-title">联系方式</div>
        <div class="connect-items">
          <div class="connect-item">
            <div class="qrcode">
              <van-image src="/src/assets/wx.jpg" width="100" height="100" fit="cover" />
            </div>
            <div class="connect-name">微信</div>
          </div>
          <div class="connect-item">
            <div class="qrcode">
              <van-image src="/src/assets/qq.jpg" width="100" height="100" fit="cover" />
            </div>
            <div class="connect-name">QQ</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 这个项目使用 Windsurf 开发 -->
    <div class="powered-by">
      <div class="powered-text">由 Windsurf 提供技术支持</div>
      <div class="powered-link" @click="window.open('https://windsurf.com/', '_blank')">
        <van-icon name="guide-o" /> 访问 Windsurf
      </div>
    </div>
    
    <!-- 底部导航栏 -->
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

.author-header {
  padding: 20px 16px;
  padding-top: 30px; /* 增加顶部内边距，确保不被导航栏遮挡 */
  background: linear-gradient(to right, #2979ff, #56ccf2);
  margin-bottom: 15px;
  margin-top: 46px; /* 添加顶部外边距，为固定导航栏腾出空间 */
  
  .author-info {
    display: flex;
    align-items: center;
    
    .author-meta {
      margin-left: 15px;
      color: #fff;
      
      .author-name {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 4px;
      }
      
      .author-desc {
        font-size: 14px;
        opacity: 0.8;
      }
    }
  }
}

// 功能区块样式
.feature-section {
  margin: 0 0 15px 0;
  padding: 0 8px;
  
  :deep(.van-grid-item) {
    &.active {
      .van-grid-item__icon {
        color: #2979ff;
      }
      .van-grid-item__text {
        color: #2979ff;
        font-weight: bold;
      }
    }
  }
}

// 历史区块样式
.history-section {
  margin: 0 16px 20px;
  
  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .history-title {
      font-size: 16px;
      font-weight: bold;
    }
  }
  
  .history-list {
    background: #fff;
    border-radius: 8px;
    padding: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  .history-item {
    display: flex;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #f3f3f3;
    
    &:last-child {
      border-bottom: none;
    }
    
    &:active {
      background-color: #f9f9f9;
    }
    
    .history-cover {
      width: 60px;
      height: 60px;
      border-radius: 4px;
      overflow: hidden;
      margin-right: 12px;
      position: relative;
      
      .history-type-icon {
        position: absolute;
        bottom: 0;
        right: 0;
        background-color: rgba(0, 0, 0, 0.5);
        width: 24px;
        height: 24px;
        border-radius: 0 0 4px 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    
    .history-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 60px;
      overflow: hidden;
      
      .history-name {
        font-size: 15px;
        font-weight: bold;
        margin-bottom: 3px;
      }
      
      .history-artist {
        font-size: 13px;
        color: #666;
        margin-bottom: 3px;
      }
      
      .history-time {
        font-size: 12px;
        color: #999;
      }
    }
  }
  
  &.empty-history {
    padding: 20px 0;
  }
}

// 关于作者部分
.about-section {
  margin: 0 16px 20px;
  
  .section-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 12px;
  }
  
  .contact-info {
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    
    .social-links {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 10px;
      
      .social-btn {
        margin-right: 8px;
        margin-bottom: 8px;
      }
    }
    
    .email-info {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: #666;
      
      .van-icon {
        margin-right: 6px;
      }
    }
  }
  
  .connect-section {
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    
    .connect-title {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 12px;
      color: #333;
    }
    
    .connect-items {
      display: flex;
      justify-content: space-around;
      
      .connect-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        
        .qrcode {
          margin-bottom: 8px;
          border: 1px solid #eee;
          padding: 4px;
        }
        
        .connect-name {
          font-size: 14px;
          color: #666;
        }
      }
    }
  }
}

// 由 Windsurf 提供技术支持
.powered-by {
  text-align: center;
  padding: 16px;
  margin-top: auto;
  color: #999;
  font-size: 12px;
  
  .powered-text {
    margin-bottom: 4px;
  }
  
  .powered-link {
    color: #2979ff;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .van-icon {
      margin-right: 4px;
    }
  }
}

// 工具类
.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
