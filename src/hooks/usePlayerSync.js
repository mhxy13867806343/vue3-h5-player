import { computed, watch } from 'vue';
import { usePlayerStore } from '../store/modules/player';
import { showToast }       from "vant";

/**
 * 播放器状态同步Hook
 * 处理多播放列表场景下的歌曲选择、高亮和播放状态同步
 */
export const usePlayerSync = (activePlaylistId) => {
  const playerStore = usePlayerStore();

  // 获取当前活跃的播放列表
  const currentPlaylist = computed(() => {
    return playerStore.playlists.find(list => list.id === activePlaylistId.value) || { songs: [] };
  });

  // 是否是当前活跃的播放列表
  const isActivePlaylist = computed(() => {
    return playerStore.activePlaylistId === activePlaylistId.value;
  });

  // 通过索引播放歌曲
  const playSongByIndex = (index) => {
    if (!currentPlaylist.value || !currentPlaylist.value.songs[index]) return;
    
    // 确保先切换到正确的播放列表
    if (!isActivePlaylist.value) {
      playerStore.switchPlaylist(activePlaylistId.value);
    }
    
    const song = currentPlaylist.value.songs[index];
    
    // 设置当前索引并播放
    playerStore.currentIndex = index;
    playerStore.playSong(song);
  };

  // 判断歌曲是否为当前正在播放的歌曲
  const isCurrentSong = (index) => {
    // 不仅检查索引位置，还要检查当前播放列表与正在浏览的列表是否匹配
    if (!isActivePlaylist.value) return false;
    
    // 获取对应索引的歌曲
    const song = currentPlaylist.value.songs[index];
    if (!song || !playerStore.currentSong) return false;
    
    // 使用ID和名称进行精确匹配
    return song.id === playerStore.currentSong.id && 
           song.name === playerStore.currentSong.name;
  };

  // 监听播放状态变化，确保UI同步
  watch(
    () => playerStore.currentSong,
    (newSong) => {
      if (newSong && isActivePlaylist.value) {
        // 当前播放列表变化时，确保UI更新
        playerStore.updateCurrentIndex();
      }
    }
  );
// 播放单曲
const playSong = (song) => {
  console.log(playerStore.playing)
  try {
  
    const songInfo = {
      id: song.id,
      name: song.name,
      artist: song.ar.map(a => a.name).join('/'),
      album: song.al.name,
      duration: song.dt,
      picUrl: song.al.picUrl
    };
    
    playerStore.playSong(songInfo);
    
  } catch (error) {
    console.error('播放失败:', error);
    showToast('播放失败');
  }
}
// 判断歌曲是否正在播放
const isCurrentPlaying = (song) => {
  // 使用ID和名称双重判断，确保精确匹配
  return playerStore.currentSong &&
         playerStore.currentSong.id === song.id &&
         playerStore.currentSong.name === song.name &&
         playerStore.playing;
};
  // 新增：准确判断是否是当前播放的歌曲，直接比较歌曲对象
  const isExactSameSong = (song) => {
    if (!playerStore.currentSong || !song) return false;
    
    // 直接比较ID和名称，不依赖索引或播放列表
    return playerStore.currentSong.id === song.id && 
           playerStore.currentSong.name === song.name;
  };

  return {
    currentPlaylist,
    isActivePlaylist,
    playSongByIndex,
    playSong,
    isCurrentPlaying,
    isCurrentSong,
    isExactSameSong
  };
};
