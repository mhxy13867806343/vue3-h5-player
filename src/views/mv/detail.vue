<template>
  <div class="mv-detail-page">
    <van-nav-bar
      title="MV详情"
      left-arrow
      @click-left="goBack"
      fixed
    />
    
    <div class="content-wrapper">
      <!-- 加载中 -->
      <div class="loading-wrapper" v-if="loading">
        <van-loading color="#1989fa" size="24px">加载中...</van-loading>
      </div>
      
      <!-- MV详情 -->
      <div class="mv-container" v-else-if="mvDetail">
        <!-- 视频播放器 -->
        <div class="video-container">
          <video
            ref="videoRef"
            controls
            :src="mvUrl"
            poster=""
            class="video-player"
          ></video>
          <!-- 清晰度标识 -->
          <div class="resolution-tag" @click="showResolutionSheet = true">
            <van-icon name="video" />
            <span>{{ getCurrentResolutionLabel() }}</span>
          </div>
          
          <!-- 分辨率选择面板 -->
          <van-action-sheet
            v-model:show="showResolutionSheet"
            title="选择清晰度"
            :actions="resolutionActions"
            cancel-text="取消"
            @select="onSelectResolution"
            @cancel="showResolutionSheet = false"
          />
        </div>
        
        <!-- MV信息 -->
        <div class="mv-info-card">
          <div class="mv-title">{{ mvDetail.name }}</div>
          <div class="mv-stats">
            <span class="play-count">
              <van-icon name="play-circle-o" />
              {{ formatPlayCount(mvDetail.playCount) }}播放
            </span>
            <span class="publish-time">{{ mvDetail.publishTime }}</span>
          </div>
          <div class="artist-info">
            <div class="artist-avatar" @click="goToArtist(mvDetail.artistId)">
              <img :src="mvDetail.artistCover || mvDetail.cover" alt="歌手头像" />
            </div>
            <div class="artist-name" @click="goToArtist(mvDetail.artistId)">
              {{ mvDetail.artistName }}
            </div>
          </div>
          
          <!-- MV描述 -->
          <div class="mv-desc" v-if="mvDetail.desc">
            <div class="desc-title">MV介绍：</div>
            <div class="desc-content">{{ mvDetail.desc }}</div>
          </div>
        </div>
        
        <!-- 相关推荐 -->
        <div class="similar-mv-container" v-if="similarMvs.length > 0">
          <div class="section-title">相关推荐</div>
          <div class="similar-mv-list">
            <div 
              class="similar-mv-item" 
              v-for="mv in similarMvs" 
              :key="mv.id"
              @click="goToMvDetail(mv)"
            >
              <div class="mv-cover">
                <img :src="mv.cover" alt="MV封面" />
                <van-icon name="play-circle" class="play-icon" />
              </div>
              <div class="mv-info">
                <div class="mv-name">{{ mv.name }}</div>
                <div class="mv-artist">{{ mv.artistName }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 无数据 -->
      <van-empty v-else description="暂无MV数据" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast, showFailToast, ActionSheet } from 'vant';
import { getMvDetail, getMvUrl } from '@/apis/music';
import { formatPlayCount } from '@/utils/tools';

const route = useRoute();
const router = useRouter();
const videoRef = ref(null);
const mvDetail = ref(null);
const mvUrl = ref('');
const currentResolution = ref(1080);
const showResolutionSheet = ref(false);

const resolutions = ref([
  { label: '480p', value: 480 },
  { label: '720p', value: 720 },
  { label: '1080p', value: 1080 }
]);

// ActionSheet 的数据项
const resolutionActions = computed(() => {
  return resolutions.value.map(res => ({
    name: res.label,
    value: res.value,
    color: currentResolution.value === res.value ? '#1989fa' : ''
  }));
});

// 获取当前分辨率标签
const getCurrentResolutionLabel = () => {
  const resolution = resolutions.value.find(res => res.value === currentResolution.value);
  return resolution ? resolution.label : '1080p';
};
const similarMvs = ref([]);
const loading = ref(false);

// 计算属性
const mvId = computed(() => {
  return route.query.id;
});

// 获取MV详情
const fetchMvDetail = async () => {
  loading.value = true;
  
  try {
    const res = await getMvDetail({ mvid: mvId.value });
    if (res.code === 200) {
      mvDetail.value = res.data;
      similarMvs.value = res.data.briefDesc || [];
      
      // 获取MV播放地址
      await fetchMvUrl();
    } else {
      showFailToast('获取MV详情失败');
    }
  } catch (error) {
    console.error('获取MV详情失败:', error);
    showFailToast('获取MV详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 获取MV播放地址
const fetchMvUrl = async (resolution = currentResolution.value) => {
  try {
    // 保存当前播放进度
    const currentTime = videoRef.value ? videoRef.value.currentTime : 0;
    const isPlaying = videoRef.value ? !videoRef.value.paused : false;
    
    const res = await getMvUrl({ id: mvId.value, r: resolution });
    if (res.code === 200 && res.data && res.data.url) {
      mvUrl.value = res.data.url;
      
      // 设置当前选择的分辨率
      currentResolution.value = resolution;
      
      // 恢复播放进度
      if (videoRef.value) {
        await nextTick();
        videoRef.value.currentTime = currentTime;
        if (isPlaying) {
          try {
            await videoRef.value.play();
          } catch (e) {
            console.warn('自动播放失败:', e);
          }
        }
      }
    } else {
      showFailToast('获取MV播放地址失败');
    }
  } catch (error) {
    console.error('获取MV播放地址失败:', error);
    showFailToast('获取MV播放地址失败，请稍后重试');
  }
};

// 切换视频分辨率
const changeResolution = (resolution) => {
  if (currentResolution.value !== resolution) {
    fetchMvUrl(resolution);
  }
};

// 选择分辨率在ActionSheet中
const onSelectResolution = (action) => {
  showResolutionSheet.value = false;
  changeResolution(action.value);
};

// 跳转到歌手页面
const goToArtist = (artistId) => {
  if (!artistId) return;
  router.push({
    path: '/artist',
    query: { id: artistId }
  });
};

// 跳转到其他MV详情
const goToMvDetail = (mv) => {
  router.push({
    path: '/mv-detail',
    query: { id: mv.id }
  });
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 监听路由参数变化
watch(
  () => route.query.id,
  (newId) => {
    if (newId) {
      fetchMvDetail();
    }
  }
);

onMounted(() => {
  if (mvId.value) {
    fetchMvDetail();
  } else {
    showToast('MV ID不存在');
    router.back();
  }
});
</script>

<style lang="scss" scoped>
.mv-detail-page {
  min-height: 100vh;
  background-color: $bg-color;
}

.content-wrapper {
  padding: 56px 0 20px;
}

.loading-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.video-container {
  position: relative;
  width: 100%;
  background-color: #000;
  
  .video-player {
    width: 100%;
    height: auto;
    max-height: 40vh;
  }
  
  .resolution-tag {
    position: absolute;
    bottom: 70px;
    right: 20px;
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, #1989fa, #0F69C4);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    color: #fff;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 13px;
    z-index: 10;
    opacity: 0.9;
    transition: all 0.2s ease;
    cursor: pointer;
    
    &:active {
      opacity: 1;
      transform: scale(0.98);
    }
    
    .van-icon {
      margin-right: 5px;
      font-size: 14px;
    }
    
    span {
      font-weight: 500;
    }
  }
}

.mv-info-card {
  padding: 16px;
  background-color: #fff;
  
  .mv-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  .mv-stats {
    display: flex;
    font-size: 13px;
    color: #999;
    margin-bottom: 16px;
    
    .play-count {
      display: flex;
      align-items: center;
      margin-right: 16px;
      
      .van-icon {
        margin-right: 4px;
      }
    }
  }
  
  .artist-info {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    
    .artist-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      margin-right: 12px;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .artist-name {
      font-size: 15px;
      font-weight: 500;
      color: $text-color;
    }
  }
  
  .mv-desc {
    font-size: 14px;
    line-height: 1.5;
    color: #666;
    
    .desc-title {
      font-weight: 500;
      margin-bottom: 6px;
    }
    
    .desc-content {
      text-indent: 2em;
    }
  }
}

.similar-mv-container {
  margin-top: 12px;
  padding: 16px;
  background-color: #fff;
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: $text-color;
    margin-bottom: 12px;
    position: relative;
    padding-left: 10px;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 16px;
      background-color: $primary-color;
      border-radius: 2px;
    }
  }
  
  .similar-mv-list {
    .similar-mv-item {
      display: flex;
      padding: 10px 0;
      border-bottom: 1px solid #f2f2f2;
      
      &:last-child {
        border-bottom: none;
      }
      
      .mv-cover {
        position: relative;
        width: 120px;
        height: 68px;
        border-radius: 4px;
        overflow: hidden;
        margin-right: 12px;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .play-icon {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          color: #fff;
          font-size: 30px;
          opacity: 0.8;
        }
      }
      
      .mv-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        
        .mv-name {
          font-size: 14px;
          margin-bottom: 4px;
          @include text-ellipsis;
        }
        
        .mv-artist {
          font-size: 13px;
          color: #999;
        }
      }
    }
  }
}
</style>
