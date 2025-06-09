<template>
  <div class="mv-top-list-page">
    <van-nav-bar
      title="MV排行榜"
      left-arrow
      @click-left="goBack"
      fixed
    />
    
    <div class="content-wrapper">
      <!-- 加载中 -->
      <div class="loading-wrapper" v-if="loading">
        <van-loading color="#1989fa" size="24px">加载中...</van-loading>
      </div>
      
      <!-- MV列表 -->
      <div class="mv-container" v-else>
        <div class="mv-item" v-for="(mv, index) in mvList" :key="mv.id" @click="goToMvDetail(mv)">
          <div class="mv-rank">{{ index + 1 }}</div>
          <div class="mv-cover">
            <img :src="mv.cover" alt="MV封面" />
            <div class="mv-play-count">
              <van-icon name="video-o" />
              <span>{{ formatPlayCount(mv.playCount) }}</span>
            </div>
            <van-icon name="play-circle" class="play-icon" />
          </div>
          <div class="mv-info">
            <div class="mv-name">{{ mv.name }}</div>
            <div class="mv-artist">{{ mv.artistName }}</div>
          </div>
        </div>
        
        <!-- 加载更多 -->
        <div class="load-more" v-if="!isEnd">
          <van-button block plain round type="primary" @click="loadMore" :disabled="loadingMore" :loading="loadingMore">
            {{ loadingMore ? '加载中...' : '加载更多' }}
          </van-button>
        </div>
        
        <!-- 无更多数据 -->
        <div class="no-more" v-if="isEnd && mvList.length > 0">
          <p>- 已经到底啦 -</p>
        </div>
        
        <!-- 无数据 -->
        <van-empty v-if="!loading && mvList.length === 0" description="暂无MV数据" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { getTopMv } from '@/apis/music';
import { formatPlayCount } from '@/utils/tools';

const router = useRouter();
const mvList = ref([]);
const loading = ref(false);
const loadingMore = ref(false);
const isEnd = ref(false);
const offset = ref(0);
const limit = 20;

// 获取MV排行
const fetchTopMv = async (isLoadMore = false) => {
  if (isLoadMore) {
    loadingMore.value = true;
  } else {
    loading.value = true;
  }
  
  try {
    const res = await getTopMv({ limit, offset: offset.value });
    if (res.code === 200) {
      if (isLoadMore) {
        mvList.value = [...mvList.value, ...res.data];
      } else {
        mvList.value = res.data;
      }
      
      // 判断是否还有更多数据
      if (res.data.length < limit) {
        isEnd.value = true;
      } else {
        offset.value += limit;
      }
    } else {
      showToast('获取MV排行失败，请稍后重试');
    }
  } catch (error) {
    console.error('获取MV排行失败:', error);
    showToast('获取MV排行失败，请稍后重试');
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

// 加载更多
const loadMore = () => {
  if (loadingMore.value || isEnd.value) return;
  fetchTopMv(true);
};

// 跳转到MV详情
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

onMounted(() => {
  fetchTopMv();
});
</script>

<style lang="scss" scoped>
.mv-top-list-page {
  min-height: 100vh;
  background-color: $bg-color;
}

.content-wrapper {
  padding: 56px 12px 20px;
}

.loading-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.mv-container {
  padding-bottom: 20px;
  
  .mv-item {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    margin-bottom: 10px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    
    .mv-rank {
      font-size: 18px;
      font-weight: bold;
      color: $primary-color;
      width: 30px;
      text-align: center;
      
      // 前三名特殊颜色
      &:nth-child(1) {
        color: #ff0000;
      }
      
      &:nth-child(2) {
        color: #ff8800;
      }
      
      &:nth-child(3) {
        color: #ffcc00;
      }
    }
    
    .mv-cover {
      position: relative;
      width: 120px;
      height: 68px;
      border-radius: 6px;
      overflow: hidden;
      margin-right: 12px;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .mv-play-count {
        position: absolute;
        top: 5px;
        right: 5px;
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        font-size: 12px;
        padding: 1px 5px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        
        .van-icon {
          margin-right: 2px;
        }
      }
      
      .play-icon {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        color: #fff;
        font-size: 30px;
        text-shadow: 0 0 5px rgba(0, 0, 0, 0.7);
        opacity: 0.8;
      }
    }
    
    .mv-info {
      flex: 1;
      overflow: hidden;
      
      .mv-name {
        font-size: 15px;
        font-weight: 500;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .mv-artist {
        font-size: 13px;
        color: #999;
      }
    }
  }
}

.load-more {
  margin-top: 20px;
}

.no-more {
  margin-top: 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}
</style>
