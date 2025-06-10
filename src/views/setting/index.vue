<script setup>
import { ref, reactive, onMounted } from 'vue';
import { showToast, showNotify } from 'vant';
import { useRouter, useRoute } from 'vue-router';
import { useSettingsStore } from '@/store/modules/settings';

const router = useRouter();
const route = useRoute();
const settingsStore = useSettingsStore();

// 创建本地副本，避免直接修改store中的值
const miniPlayerStyle = reactive({
  ...settingsStore.miniPlayerStyle
});

// 颜色选择器是否显示
const showColorPicker = ref(false);
// 当前正在编辑的颜色属性
const currentColorProp = ref('');

// 页面路径管理
const hiddenPaths = ref(settingsStore.playerVisibility.hiddenPaths);
const newPath = ref('');

// 保存样式设置
const saveStyles = () => {
  settingsStore.updateMiniPlayerStyle(miniPlayerStyle);
  showToast('设置已保存');
};

// 重置样式设置
const resetStyles = () => {
  settingsStore.resetMiniPlayerStyle();
  Object.assign(miniPlayerStyle, settingsStore.miniPlayerStyle);
  showToast('样式已重置为默认值');
};

// 打开颜色选择器
const openColorPicker = (prop) => {
  currentColorProp.value = prop;
  showColorPicker.value = true;
};

// 添加隐藏播放器的路径
const addHiddenPath = () => {
  if (!newPath.value) {
    showToast('请输入路径');
    return;
  }
  
  if (newPath.value.charAt(0) !== '/') {
    newPath.value = '/' + newPath.value;
  }
  
  if (!hiddenPaths.value.includes(newPath.value)) {
    settingsStore.addHiddenPath(newPath.value);
    hiddenPaths.value = [...settingsStore.playerVisibility.hiddenPaths];
    newPath.value = '';
    showToast('添加成功');
  } else {
    showToast('该路径已存在');
  }
};

// 移除隐藏播放器的路径
const removeHiddenPath = (path) => {
  settingsStore.removeHiddenPath(path);
  hiddenPaths.value = [...settingsStore.playerVisibility.hiddenPaths];
  showToast('已移除');
};

// 应用颜色变更
const applyColorChange = (color) => {
  if (currentColorProp.value) {
    miniPlayerStyle[currentColorProp.value] = color;
  }
  showColorPicker.value = false;
};
</script>

<template>
  <div class="settings-page">
    <div class="page-header">
      <van-nav-bar
        title="设置"
        left-arrow
        @click-left="router.go(-1)"
      />
    </div>
    
    <div class="section">
      <div class="section-title">迷你播放器样式</div>
      
      <div class="setting-item">
        <span>背景颜色</span>
        <div 
          class="color-preview" 
          :style="{ backgroundColor: miniPlayerStyle.backgroundColor }"
          @click="openColorPicker('backgroundColor')"
        ></div>
      </div>
      
      <div class="setting-item">
        <span>歌曲名称颜色</span>
        <div 
          class="color-preview" 
          :style="{ backgroundColor: miniPlayerStyle.textColor }"
          @click="openColorPicker('textColor')"
        ></div>
      </div>
      
      <div class="setting-item">
        <span>歌手名称颜色</span>
        <div 
          class="color-preview" 
          :style="{ backgroundColor: miniPlayerStyle.artistColor }"
          @click="openColorPicker('artistColor')"
        ></div>
      </div>
      
      <div class="setting-item">
        <span>进度条颜色</span>
        <div 
          class="color-preview" 
          :style="{ backgroundColor: miniPlayerStyle.progressColor }"
          @click="openColorPicker('progressColor')"
        ></div>
      </div>
      
      <div class="setting-item">
        <span>图标颜色</span>
        <div 
          class="color-preview" 
          :style="{ backgroundColor: miniPlayerStyle.iconColor }"
          @click="openColorPicker('iconColor')"
        ></div>
      </div>
      
      <div class="setting-item">
        <span>歌曲字体大小</span>
        <van-stepper v-model="miniPlayerStyle.fontSize" min="12" max="18" step="1" />
      </div>
      
      <div class="setting-item">
        <span>歌手字体大小</span>
        <van-stepper v-model="miniPlayerStyle.artistFontSize" min="10" max="16" step="1" />
      </div>
      
      <div class="action-buttons">
        <van-button type="primary" @click="saveStyles">保存设置</van-button>
        <van-button type="default" @click="resetStyles">重置默认</van-button>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">播放器显示控制</div>
      
      <div class="setting-item">
        <span>添加不显示播放器的页面路径</span>
      </div>
      
      <div class="input-with-button">
        <van-field v-model="newPath" placeholder="输入路径，例如/setting" />
        <van-button type="primary" size="small" @click="addHiddenPath">添加</van-button>
      </div>
      
      <div class="path-list">
        <div v-for="(path, index) in hiddenPaths" :key="index" class="path-item">
          <span>{{ path }}</span>
          <van-icon name="cross" @click="removeHiddenPath(path)" />
        </div>
      </div>
    </div>
    
    <div class="section preview-section">
      <div class="section-title">预览</div>
      <div class="mini-player-preview" :style="{
        backgroundColor: miniPlayerStyle.backgroundColor
      }">
        <div class="preview-content">
          <div class="preview-cover"></div>
          <div class="preview-info">
            <div class="preview-name" :style="{
              color: miniPlayerStyle.textColor,
              fontSize: miniPlayerStyle.fontSize + 'px'
            }">歌曲名称</div>
            <div class="preview-artist" :style="{
              color: miniPlayerStyle.artistColor,
              fontSize: miniPlayerStyle.artistFontSize + 'px'
            }">演唱歌手</div>
          </div>
        </div>
        <div class="preview-controls">
          <van-icon name="play-circle-o" size="30" :style="{ color: miniPlayerStyle.iconColor }" />
          <van-icon name="bars" size="24" :style="{ color: miniPlayerStyle.iconColor }" />
        </div>
        <div class="preview-progress">
          <div class="preview-progress-bar" :style="{ backgroundColor: miniPlayerStyle.progressColor, width: '50%' }"></div>
        </div>
      </div>
    </div>
    
    <!-- 颜色选择器 -->
    <van-popup v-model:show="showColorPicker" position="bottom" closeable>
      <div class="color-picker">
        <div class="color-options">
          <div 
            v-for="color in ['#ffffff', '#f5f5f5', '#e0e0e0', '#2979ff', '#56ccf2', '#ff9500', '#ff3b30', '#8e44ad', '#27ae60', '#222222']"
            :key="color"
            class="color-option"
            :style="{ backgroundColor: color }"
            @click="applyColorChange(color)"
          ></div>
        </div>
      </div>
    </van-popup>
    
  </div>
</template>

<style scoped lang="scss">
.settings-page {
  padding-bottom: 20px;
  
  .section {
    margin: 16px;
    background-color: #fff;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    
    &.preview-section {
      margin-bottom: 80px;
    }
  }
  
  .section-title {
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 16px;
    color: #333;
  }
  
  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    span {
      flex: 1;
      color: #666;
    }
  }
  
  .color-preview {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    border: 1px solid #ddd;
    cursor: pointer;
  }
  
  .action-buttons {
    display: flex;
    justify-content: space-around;
    margin-top: 24px;
    
    .van-button {
      min-width: 120px;
    }
  }
  
  .input-with-button {
    display: flex;
    margin-bottom: 16px;
    
    .van-field {
      flex: 1;
      margin-right: 8px;
    }
  }
  
  .path-list {
    .path-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f5f5f5;
      
      &:last-child {
        border-bottom: none;
      }
      
      .van-icon {
        color: #ff3b30;
        padding: 4px;
      }
    }
  }
  
  .color-picker {
    padding: 24px 16px;
    
    .color-options {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      
      .color-option {
        width: 50px;
        height: 50px;
        margin: 8px;
        border-radius: 4px;
        border: 1px solid #ddd;
        cursor: pointer;
        
        &:hover {
          transform: scale(1.05);
        }
      }
    }
  }
  
  .mini-player-preview {
    height: 60px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    position: relative;
    overflow: hidden;
    
    .preview-content {
      display: flex;
      align-items: center;
      flex: 1;
      overflow: hidden;
    }
    
    .preview-cover {
      width: 44px;
      height: 44px;
      border-radius: 4px;
      background-color: #e0e0e0;
      margin-right: 12px;
    }
    
    .preview-info {
      flex: 1;
      overflow: hidden;
    }
    
    .preview-name {
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .preview-artist {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .preview-controls {
      display: flex;
      align-items: center;
      
      .van-icon {
        margin-left: 16px;
      }
    }
    
    .preview-progress {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 2px;
      background-color: rgba(0, 0, 0, 0.1);
      
      .preview-progress-bar {
        height: 100%;
        width: 30%;
      }
    }
  }
}
</style>