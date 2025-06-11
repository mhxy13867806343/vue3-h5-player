<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getSongDetails } from '@/apis/music';
import { usePlayerStore } from '@/store/modules/player';
import { showLoadingToast, closeToast, showToast, Tag, Icon } from 'vant';
import { useSettingsStore } from "@/store/modules/settings.js";

const route = useRoute();
const router = useRouter();
const playerStore = usePlayerStore();
const settingsStore = useSettingsStore();
const song = ref(null);
const loading = ref(true);
const error = ref(null);
const showMoreInfo = ref(false); // 控制显示更多信息

// 格式化时间戳为日期
const formatDate = (timestamp) => {
  if (!timestamp) return '未知';
  return new Date(timestamp).toLocaleDateString();
};

// 格式化时长
const formatDuration = (ms) => {
  if (!ms) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// 获取音质标签
const getQualityTags = (song) => {
  const tags = [];
  if (!song) return tags;
  
  if (song.hr) tags.push({ text: 'Hi-Res', type: 'danger' });
  if (song.sq) tags.push({ text: 'SQ', type: 'primary' });
  if (song.h) tags.push({ text: 'HQ', type: 'success' });
  if (song.l) tags.push({ text: '标准', type: 'default' });
  
  return tags;
};

// 获取版权信息
const getCopyrightInfo = (song) => {
  if (!song || !song.privilege) return [];
  const info = [];
  
  if (song.privilege.st < 0) {
    info.push({ text: '无版权', type: 'danger' });
  }
  
  if (song.privilege.toast) {
    info.push({ text: '地区限制', type: 'warning' });
  }
  
  if (song.fee === 1 || song.fee === 8) {
    info.push({ text: 'VIP', type: 'primary' });
  } else if (song.fee === 4) {
    info.push({ text: '付费专辑', type: 'warning' });
  }
  
  if ((song.mark & 1048576) === 1048576) {
    info.push({ text: '🅴', type: 'danger' });
  }
  
  if ((song.mark & 131072) === 131072) {
    info.push({ text: '纯音乐', type: 'success' });
  }
  
  if (song.originCoverType === 2) {
    info.push({ text: '翻唱', type: 'primary' });
  }
  
  return info;
};

// 获取歌曲ID
const songId = computed(() => route.query.id || '');

// 获取歌曲详情
const fetchSongDetails = async () => {
  if (!songId.value) {
    error.value = '缺少歌曲ID';
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    const toast = showLoadingToast({
      message: '加载中...',
      forbidClick: true,
    });
    
    const res = await getSongDetails({ ids: songId.value });
    
    if (res.songs && res.songs.length > 0) {
      song.value = res.songs[0];
      document.title = `${song.value.name} - ${song.value.ar.map(artist => artist.name).join('/')} - 音乐播放器`;
    } else {
      error.value = '未找到歌曲信息';
    }
  } catch (err) {
    console.error('获取歌曲详情失败:', err);
    error.value = '获取歌曲信息失败，请稍后重试';
    showToast({
      message: '获取歌曲信息失败',
      position: 'bottom',
    });
  } finally {
    loading.value = false;
    closeToast();
  }
};

// 播放歌曲
const playSong = () => {
  if (!song.value) return;
  
  const songInfo = {
    id: song.value.id,
    name: song.value.name,
    artists: song.value.ar.map(artist => artist.name).join('/'),
    album: song.value.al.name,
    cover: song.value.al.picUrl,
    duration: song.value.dt,
    url: `https://music.163.com/song/media/outer/url?id=${song.value.id}.mp3`
  };
  
  playerStore.playSong(songInfo);
};

// 返回上一页
const goBack = () => {
  router.go(-1);
};
const singleCompted=computed(()=>{
  const r={
    0:'有专辑信息或者是DJ节目',
    1:'未知专辑',
  }[song.value?.single]
  return r
})
onMounted(() => {
  fetchSongDetails();
});
</script>

<template>
  <div class="song-details-container">
    <!-- 返回按钮 -->
    <div class="back-button" @click="goBack">
      <van-icon name="arrow-left" size="20" />
    </div>
    
    <!-- 加载中 -->
    <div v-if="loading" class="loading-container">
      <van-loading type="spinner" color="#1989fa" />
    </div>
    
    <!-- 错误提示 -->
    <div v-else-if="error" class="error-message">
      <van-empty :description="error" />
    </div>
    
    <!-- 歌曲详情 -->
    <div v-else-if="song" class="song-content">
      <!-- 封面 -->
      <div class="song-cover">
        <img :src="song.al.picUrl + '?param=300y300'" :alt="song.name" class="cover-image" />
      </div>
      
      <!-- 歌曲信息 -->
      <div class="song-info">
        <div class="song-header">
          <div class="title-section">
            <h1 class="song-name">{{ song.name }}</h1>
            <!-- 播放按钮 -->
            <van-button 
              round 
              type="primary"
              size="small"
              icon="play-circle-o"
              disabled
              v-if="song.privilege && song.privilege.st < 0"
              class="play-button"
            >
              {{ song.privilege && song.privilege.st < 0 ? '无版权' : '播放' }}
            </van-button>
             <van-button
              round
              :type=" playerStore.playing?'danger':'primary'"
               hairline
              size="mini"
              :style="{ color: settingsStore.miniPlayerStyle.iconColor }"
              :icon=" playerStore.playing ? 'pause-circle-o' : 'play-circle-o'"
             @click.stop="playerStore.togglePlay"
             v-else
              class="play-button"
            >
              {{ playerStore.playing?'进行中':'播放' }}
            </van-button>
          </div>
          <!-- 歌曲标签 -->
          <div class="song-tags">
            <van-tag 
              v-for="(tag, index) in getCopyrightInfo(song)" 
              :key="index" 
              :type="tag.type" 
              size="medium"
              class="tag"
            >
              {{ tag.text }}
            </van-tag>
          </div>
        </div>
        
        <!-- 副标题/别名 -->
        <p v-if="song.alia && song.alia.length > 0" class="song-alias">
          {{ song.alia[0] }}
        </p>
        
        <!-- 歌手信息 -->
        <div class="song-artist">
          <span class="label">歌手：</span>
          <span class="value">
            <template v-for="(artist, index) in song.ar" :key="artist.id">
              <router-link 
                v-if="artist.id" 
                :to="`/artist?id=${artist.id}`"
                class="artist-link"
              >
                {{ artist.name }}
              </router-link>
              <template v-else>{{ artist.name }}</template>
              <span v-if="index < song.ar.length - 1"> / </span>
            </template>
          </span>
        </div>
        
        <!-- 专辑信息 -->
        <div v-if="song.al && song.al.id" class="song-album">
          <span class="label">专辑：</span>
          <router-link :to="`/album-details?id=${song.al.id}`" class="album-link">
            {{ song.al.name }}
          </router-link>
        </div>
        
        <!-- 音质信息 -->
        <div class="song-quality" v-if="getQualityTags(song).length > 0">
          <span class="label">音质：</span>
          <span class="tags">
            <van-tag 
              v-for="(tag, index) in getQualityTags(song)" 
              :key="index" 
              :type="tag.type" 
              size="small"
              plain
              class="quality-tag"
            >
              {{ tag.text }}
            </van-tag>
          </span>
        </div>
        
        <!-- 其他元数据 -->
        <div class="song-meta">
          <div class="meta-item" v-if="song.pop !== undefined">
            <span class="label">热度：</span>
            <van-progress 
              :percentage="song.pop" 
              :show-pivot="false" 
              stroke-width="4"
              color="#ff4d4f"
              class="popularity-bar"
            />
          </div>
          
          <div class="meta-item" v-if="song.publishTime">
            <span class="label">发行：</span>
            <span class="value">{{ formatDate(song.publishTime) }}</span>
          </div>
          
          <div class="meta-item" v-if="song.dt">
            <span class="label">时长：</span>
            <span class="value">{{ formatDuration(song.dt) }}</span>
          </div>
          
          <div class="meta-item" v-if="song.cd">
            <span class="label">CD：</span>
            <span class="value">{{ song.cd === 'null' ? '-' : song.cd }}</span>
          </div>
          
          <div class="meta-item" v-if="song.no">
            <span class="label">曲目：</span>
            <span class="value">{{ song.no }}</span>
          </div>
        </div>
        
        <!-- 展开/收起按钮 -->
        <div class="toggle-more" @click="showMoreInfo = !showMoreInfo">
          <span>{{ showMoreInfo ? '收起' : '查看更多信息' }}</span>
          <van-icon :name="showMoreInfo ? 'arrow-up' : 'arrow-down'" />
        </div>
        
        <!-- 更多信息 -->
        <div v-if="showMoreInfo" class="more-info">
          <div class="info-section" v-if="song.alia && song.alia.length > 1">
            <div class="info-label">其他别名：</div>
            <div class="info-content">
              <span v-for="(alias, index) in song.alia.slice(1)" :key="index" class="alias">
                {{ alias }}
              </span>
            </div>
          </div>
          
          <div class="info-section" v-if="song.djId">
            <div class="info-label">DJ ID：</div>
            <div class="info-content">{{ song.djId }}</div>
          </div>
          
          <div class="info-section" v-if="song.s_id">
            <div class="info-label">匹配歌曲ID：</div>
            <div class="info-content">{{ song.s_id }}</div>
          </div>
          
          <div class="info-section" v-if="song.copyright !== undefined">
            <div class="info-label">版权标识：</div>
            <div class="info-content">{{ singleCompted }}</div>
          </div>
        </div>
      </div>
      
      <!-- 无版权提示 -->
      <div v-if="song.privilege && song.privilege.st < 0" class="no-copyright-tip">
        <van-icon name="warning-o" /> 该歌曲暂无版权，暂时无法播放
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.song-details-container {
  position: relative;
  min-height: 100vh;
  padding: 16px;
  background: linear-gradient(to bottom, #fafafa, #f0f0f0);
  padding-bottom: 20px;
  
  .back-button {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 10;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 50%;
    backdrop-filter: blur(5px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .loading-container,
  .error-message {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60vh;
  }
  
  .song-content {
    padding-top: 20px;
    text-align: center;
  }
  
  .song-cover {
    margin: 0 auto 24px;
    width: 240px;
    height: 240px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    
    .cover-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .song-info {
    margin-bottom: 24px;
    padding: 0 16px;
    text-align: left;
    
    .song-header {
      margin-bottom: 8px;
      
      .title-section {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        
        .song-name {
          margin: 0 12px 0 0;
          font-size: 22px;
          font-weight: 600;
          color: var(--van-text-color);
          line-height: 1.4;
          word-break: break-word;
          flex: 1;
        }
        
        .play-button {
          flex-shrink: 0;
          height: 32px;
          padding: 0 12px;
          font-size: 14px;
          
          .van-icon {
            font-size: 16px;
            margin-right: 4px;
          }
        }
      }
      
      .song-tags {
        display: flex;
        flex-wrap: wrap;
        margin-top: 4px;
        
        .tag {
          margin-right: 6px;
          margin-bottom: 6px;
        }
      }
    }
    
    .song-alias {
      margin: 0 0 12px;
      font-size: 15px;
      color: var(--van-gray-6);
      font-style: italic;
    }
    
    .song-artist, .song-album, .song-quality, .meta-item {
      display: flex;
      margin-bottom: 8px;
      font-size: 14px;
      color: var(--van-text-color-2);
      line-height: 1.5;
      
      .label {
        flex-shrink: 0;
        color: var(--van-text-color-3);
      }
      
      .value {
        flex: 1;
        word-break: break-all;
      }
      
      .popularity-bar {
        flex: 1;
        margin: 8px 0;
      }
      
      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
    }
    
    .artist-link, .album-link {
      color: var(--van-blue);
      text-decoration: none;
      
      &:active {
        opacity: 0.7;
      }
    }
    
    .toggle-more {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 16px 0 8px;
      color: var(--van-blue);
      font-size: 14px;
      
      .van-icon {
        margin-left: 4px;
        transition: transform 0.3s;
      }
    }
    
    .more-info {
      margin-top: 12px;
      padding: 12px;
      background-color: var(--van-gray-1);
      border-radius: 8px;
      font-size: 13px;
      
      .info-section {
        margin-bottom: 10px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .info-label {
          color: var(--van-text-color-3);
          margin-bottom: 4px;
        }
        
        .info-content {
          color: var(--van-text-color-2);
          line-height: 1.6;
          
          .alias {
            display: inline-block;
            margin-right: 12px;
            margin-bottom: 4px;
          }
        }
      }
    }
  }
  
  .lyrics-container {
    margin: 24px 0 32px;
    height: 200px;
    overflow-y: auto;
    
    .lyrics-placeholder {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      color: #999;
    }
  }
  
  .action-buttons {
    position: fixed;
    bottom: 24px;
    left: 0;
    right: 0;
    padding: 0 16px;
    
    .van-button {
      width: 100%;
      max-width: 300px;
      margin: 0 auto;
      font-size: 16px;
      font-weight: 500;
      height: 44px;
      line-height: 44px;
      
      :deep(.van-icon) {
        margin-right: 6px;
        font-size: 20px;
      }
    }
  }
}

// 无版权提示
.no-copyright-tip {
  margin: 16px 0;
  padding: 12px 16px;
  background-color: var(--van-gray-1);
  border-radius: 8px;
  color: var(--van-orange);
  font-size: 14px;
  display: flex;
  align-items: center;
  
  .van-icon {
    margin-right: 6px;
  }
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  .song-details-container {
    background: linear-gradient(to bottom, #121212, #000);

    .song-info {
      .song-name {
        color: #fff;
      }

      .song-artist, .song-album {
        color: var(--van-text-color-2);
      }
    }

    .no-copyright-tip {
      background-color: var(--van-gray-8);
      color: var(--van-orange);
    }

    .lyrics-placeholder {
      color: var(--van-gray-6);
    }

    .more-info {
      background-color: var(--van-gray-8);
    }
  }
}
</style>