import { computed, watch } from 'vue';
import { usePlayerStore } from '../store/modules/player';

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
    return isActivePlaylist.value && index === playerStore.currentIndex;
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

  return {
    currentPlaylist,
    isActivePlaylist,
    playSongByIndex,
    isCurrentSong
  };
};
