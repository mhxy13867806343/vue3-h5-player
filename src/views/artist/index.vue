<template>
  <div class="artist-detail-container">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      title="歌手详情"
      left-arrow
      @click-left="onClickLeft"
    />
    
    <!-- 歌手信息 -->
    <div class="artist-info" v-if="artist">
      <div class="artist-header">
        <div class="artist-avatar">
          <img :src="artist.picUrl || artist.img1v1Url" :alt="artist.name">
        </div>
        <div class="artist-meta">
          <h1 class="artist-name">{{ artist.name }}</h1>
          <div class="artist-stats">
            <span>单曲: {{ artist.musicSize || '暂无' }}</span>
            <span>专辑: {{ artist.albumSize || '暂无' }}</span>
            <span>MV: {{ artist.mvSize || '暂无' }}</span>
          </div>
        </div>
      </div>
      
      <div class="brief-desc" v-if="artist.briefDesc">{{ artist.briefDesc }}</div>
    </div>
    
    <!-- 标签栏 -->
    <van-tabs v-model:active="activeTab" sticky animated swipeable>
      <van-tab title="热门歌曲">
        <div class="songs-list" v-if="topSongs.length > 0">
          <van-cell 
            v-for="(song, index) in topSongs" 
            :key="song.id"
            :title="song.name"
            :label="formatArtists(song.ar || song.artists)"
            @click="playSong(song)"
          >
            <template #icon>
              <div class="song-index">{{ index + 1 }}</div>
            </template>
            <template #right-icon>
              <div class="song-actions">
                <van-icon name="play-circle-o" />
              </div>
            </template>
          </van-cell>
        </div>
        <div class="empty-state" v-else>暂无热门歌曲</div>
      </van-tab>
      <van-tab title="专辑">
        <div class="albums-list" v-if="albums.length > 0">
          <div 
            v-for="album in albums" 
            :key="album.id" 
            class="album-item"
            @click="goToAlbumDetail(album)"
          >
            <div class="album-cover">
              <img :src="album.picUrl" :alt="album.name">
            </div>
            <div class="album-info">
              <div class="album-name">{{ album.name }}</div>
              <div class="album-time">{{ formatDate(album.publishTime) }}</div>
            </div>
          </div>
        </div>
        <div class="empty-state" v-else>暂无专辑</div>
      </van-tab>
      <van-tab title="MV">
        <div class="mv-list" v-if="mvs.length > 0">
          <div 
            v-for="mv in mvs" 
            :key="mv.id" 
            class="mv-item"
            @click="goToMVDetail(mv)"
          >
            <div class="mv-cover">
              <img :src="mv.imgurl || mv.cover" :alt="mv.name">
              <div class="play-count">
                <van-icon name="play-circle-o" />
                {{ formatPlayCount(mv.playCount) }}
              </div>
            </div>
            <div class="mv-name">{{ mv.name }}</div>
          </div>
        </div>
        <div class="empty-state" v-else>暂无MV</div>
      </van-tab>
      <van-tab title="详情">
        <div class="artist-detail" v-if="artistDetail">
          <h3>歌手简介</h3>
          <div class="desc" v-html="artistDesc"></div>
        </div>
        <div class="empty-state" v-else>暂无详细介绍</div>
      </van-tab>
    </van-tabs>
    
    <!-- 相似歌手 -->
    <div class="similar-artists" v-if="simiArtists.length > 0">
      <h3 class="section-title">相似歌手</h3>
      <div class="similar-artists-list">
        <div 
          v-for="artist in simiArtists" 
          :key="artist.id" 
          class="similar-artist-item"
          @click="goToArtistDetail(artist)"
        >
          <div class="similar-artist-avatar">
            <img :src="artist.picUrl || artist.img1v1Url" :alt="artist.name">
          </div>
          <div class="similar-artist-name">{{ artist.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast, showLoadingToast, closeToast } from 'vant';
import { 
  getArtist, 
  getArtistAlbum, 
  getArtistMV, 
  getArtistDesc, 
  getArtistDetail,
  getArtistTopSongs,
  getSimiArtist
} from '@/apis/music';
import { formatPlayCount } from '@/utils/tools';

const router = useRouter();
const route = useRoute();

// 歌手ID
const artistId = computed(() => route.query.id);

// 标签页
const activeTab = ref(0);

// 歌手信息
const artist = ref(null);
// 热门歌曲
const topSongs = ref([]);
// 专辑列表
const albums = ref([]);
// MV列表
const mvs = ref([]);
// 歌手详情
const artistDetail = ref(null);
// 歌手描述
const artistDesc = ref('');
// 相似歌手
const simiArtists = ref([]);

// 返回上一页
const onClickLeft = () => {
  router.back();
};

// 格式化歌手
const formatArtists = (artists) => {
  if (!artists) return '';
  return artists.map(artist => artist.name).join(' / ');
};

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 播放歌曲
const playSong = (song) => {
  router.push({
    path: '/player',
    query: {
      id: song.id
    }
  });
};

// 跳转到专辑详情
const goToAlbumDetail = (album) => {
  router.push({
    path: '/album',
    query: {
      id: album.id
    }
  });
};

// 跳转到MV详情
const goToMVDetail = (mv) => {
  router.push({
    path: '/mv',
    query: {
      id: mv.id
    }
  });
};

// 跳转到歌手详情
const goToArtistDetail = (artist) => {
  router.push({
    path: '/artist',
    query: {
      id: artist.id
    }
  });
};

// 获取歌手信息和热门歌曲
const fetchArtistAndTopSongs = async () => {
  if (!artistId.value) return;
  
  showLoadingToast({
    message: '加载中...',
    forbidClick: true,
  });
  
  try {
    const res = await getArtist({ id: artistId.value });
    if (res && res.artist) {
      artist.value = res.artist;
      if (res.hotSongs) {
        topSongs.value = res.hotSongs;
      }
    }
  } catch (error) {
    console.error('获取歌手信息失败:', error);
    showToast('获取歌手信息失败');
  } finally {
    closeToast();
  }
};

// 获取歌手专辑
const fetchArtistAlbums = async () => {
  if (!artistId.value) return;
  
  try {
    const res = await getArtistAlbum({ 
      id: artistId.value,
      limit: 20
    });
    if (res && res.hotAlbums) {
      albums.value = res.hotAlbums;
    }
  } catch (error) {
    console.error('获取歌手专辑失败:', error);
  }
};

// 获取歌手MV
const fetchArtistMVs = async () => {
  if (!artistId.value) return;
  
  try {
    const res = await getArtistMV({ id: artistId.value });
    if (res && res.mvs) {
      mvs.value = res.mvs;
    }
  } catch (error) {
    console.error('获取歌手MV失败:', error);
  }
};

// 获取歌手描述
const fetchArtistDesc = async () => {
  if (!artistId.value) return;
  
  try {
    const res = await getArtistDesc({ id: artistId.value });
    if (res && res.introduction) {
      artistDesc.value = res.introduction.map(item => {
        return `<h4>${item.ti}</h4><p>${item.txt}</p>`;
      }).join('');
    }
  } catch (error) {
    console.error('获取歌手描述失败:', error);
  }
};

// 获取歌手详情
const fetchArtistDetail = async () => {
  if (!artistId.value) return;
  
  try {
    const res = await getArtistDetail({ id: artistId.value });
    if (res && res.data) {
      artistDetail.value = res.data;
    }
  } catch (error) {
    console.error('获取歌手详情失败:', error);
  }
};

// 获取相似歌手
const fetchSimiArtists = async () => {
  if (!artistId.value) return;
  
  try {
    const res = await getSimiArtist({ id: artistId.value });
    if (res && res.artists) {
      simiArtists.value = res.artists;
    }
  } catch (error) {
    console.error('获取相似歌手失败:', error);
  }
};

// 初始化
onMounted(async () => {
  if (!artistId.value) {
    showToast('歌手ID不能为空');
    router.back();
    return;
  }
  
  Promise.all([
    fetchArtistAndTopSongs(),
    fetchArtistAlbums(),
    fetchArtistMVs(),
    fetchArtistDesc(),
    fetchArtistDetail(),
    fetchSimiArtists()
  ]);
});
</script>

<style scoped>
.artist-detail-container {
  min-height: 100vh;
  background-color: #f8f8f8;
  padding-bottom: 50px;
}

.artist-info {
  padding: 20px 16px;
  background-color: #fff;
}

.artist-header {
  display: flex;
  gap: 15px;
}

.artist-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.artist-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.artist-meta {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.artist-name {
  margin: 0 0 10px;
  font-size: 20px;
  font-weight: bold;
}

.artist-stats {
  display: flex;
  gap: 10px;
  color: #666;
  font-size: 14px;
}

.brief-desc {
  margin-top: 15px;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.songs-list {
  margin: 10px 0;
}

.song-index {
  width: 24px;
  color: #999;
  font-size: 16px;
  text-align: center;
  margin-right: 5px;
}

.song-actions {
  color: #ff4c4c;
  font-size: 22px;
}

.albums-list, .mv-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 10px;
}

.album-item, .mv-item {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.album-cover, .mv-cover {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
}

.album-cover img, .mv-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.album-info, .mv-name {
  padding: 8px;
}

.album-name, .mv-name {
  font-size: 14px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.album-time {
  font-size: 12px;
  color: #999;
}

.play-count {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 2px 5px;
  border-radius: 10px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 3px;
}

.artist-detail {
  padding: 15px;
  background-color: #fff;
}

.artist-detail h3 {
  margin-bottom: 10px;
  font-size: 16px;
}

.desc {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

.desc h4 {
  margin: 15px 0 5px;
  font-size: 15px;
}

.similar-artists {
  padding: 15px;
  background-color: #fff;
  margin-top: 10px;
}

.section-title {
  margin: 0 0 10px;
  font-size: 16px;
}

.similar-artists-list {
  display: flex;
  overflow-x: auto;
  gap: 15px;
  padding-bottom: 10px;
}

.similar-artist-item {
  flex: 0 0 auto;
  width: 80px;
  text-align: center;
}

.similar-artist-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 5px;
}

.similar-artist-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.similar-artist-name {
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-state {
  padding: 30px;
  text-align: center;
  color: #999;
}
</style>
