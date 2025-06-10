<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { showToast, showNotify, Checkbox } from 'vant';
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

// 路径自动补全相关
const showPathSuggestions = ref(false);
const allRoutePaths = computed(() => settingsStore.allRoutePaths);
const filteredPaths = ref([]);
const selectedPaths = ref([]); // 已选路径列表
const pathSearchText = ref(''); // 路径搜索文本

// 过滤路径建议
const filterSuggestions = () => {
  console.log('Filtering paths, allRoutePaths:', allRoutePaths.value.length);
  // 确保路径列表非空
  if (!allRoutePaths.value || allRoutePaths.value.length === 0) {
    console.log('No routes available');
    filteredPaths.value = [];
    return;
  }

  // 过滤已经存在的路径
  const availablePaths = allRoutePaths.value.filter(path => 
    !hiddenPaths.value.includes(path)
  );
  
  console.log('Available paths:', availablePaths.length);
  
  // 根据搜索文本或输入过滤
  const searchText = pathSearchText.value || newPath.value;
  if (searchText && searchText.trim() !== '') {
    filteredPaths.value = availablePaths.filter(path => 
      path.toLowerCase().includes(searchText.toLowerCase())
    );
    console.log('Filtered by search:', filteredPaths.value.length);
  } else {
    filteredPaths.value = [...availablePaths]; // 显示所有可用路径
    console.log('Showing all paths:', filteredPaths.value.length);
  }
  
  // 排序：已选中的路径排在前面
  filteredPaths.value.sort((a, b) => {
    const aSelected = selectedPaths.value.includes(a);
    const bSelected = selectedPaths.value.includes(b);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return a.localeCompare(b);
  });
};

// 初始化时多加载一次、确保数据准备好
onMounted(() => {
  // 延迟一下确保路由列表已加载
  setTimeout(() => {
    filterSuggestions();
  }, 300);
});

// 选择单个路径
const selectPath = (path) => {
  newPath.value = path;
  showPathSuggestions.value = false;
  selectedPaths.value = [];
};

// 切换路径选中状态
const togglePathSelection = (path) => {
  const index = selectedPaths.value.indexOf(path);
  if (index > -1) {
    selectedPaths.value.splice(index, 1);
  } else {
    selectedPaths.value.push(path);
  }
};

// 添加多个选中的路径
const selectMultiplePaths = () => {
  if (selectedPaths.value.length === 0) return;
  
  let addedCount = 0;
  let errorCount = 0;
  
  selectedPaths.value.forEach(path => {
    const result = settingsStore.addHiddenPath(path);
    if (result.success) {
      addedCount++;
    } else {
      errorCount++;
    }
  });
  
  // 更新本地数据
  hiddenPaths.value = [...settingsStore.playerVisibility.hiddenPaths];
  
  // 显示结果提示
  if (addedCount > 0) {
    showToast(`成功添加 ${addedCount} 个路径${errorCount > 0 ? `，${errorCount} 个失败` : ''}`); 
  } else if (errorCount > 0) {
    showToast({ type: 'fail', message: `添加失败，可能路径已存在或无效` });
  }
  
  // 清空选中列表并更新过滤列表
  selectedPaths.value = [];
  filterSuggestions();
  closePathSuggestions()
};

// 关闭路径建议框
const closePathSuggestions = () => {
  showPathSuggestions.value = false;
  selectedPaths.value = [];
  pathSearchText.value = '';
};

// 处理输入框聚焦事件
const handleInputFocus = () => {
  // 清除之前的搜索和选择状态
  pathSearchText.value = '';
  // 打开建议列表
  showPathSuggestions.value = true;
  // 重新筛选，显示所有可用路径
  filterSuggestions();
};

// 处理输入框清空事件
const handleInputClear = () => {
  // 重新过滤显示所有路径
  pathSearchText.value = '';
  filterSuggestions();
};

// 点击页面其他位置时隐藏建议
watch(() => showPathSuggestions.value, (show) => {
  if (show) {
    filterSuggestions(); // 首次显示时加载建议
    setTimeout(() => {
      document.addEventListener('click', hidePathSuggestions);
    }, 0);
  } else {
    document.removeEventListener('click', hidePathSuggestions);
    selectedPaths.value = [];
  }
});

// 隐藏路径建议
const hidePathSuggestions = (e) => {
  // 点击路径输入框、建议框和按钮外部时隐藏
  const suggestions = document.querySelector('.path-suggestions');
  const input = document.querySelector('.input-with-button .van-field');
  const inputField = document.querySelector('.input-with-button .van-field__control');
  const clearButton = document.querySelector('.input-with-button .van-field__clear');
  const buttons = document.querySelectorAll('.path-suggestions-actions .van-button');
  
  let clickedOnButton = false;
  buttons.forEach(button => {
    if (button && button.contains(e.target)) clickedOnButton = true;
  });
  
  // 判断是否点击了清除按钮
  const clickedOnClear = clearButton && clearButton.contains(e.target);
  
  if (suggestions && !suggestions.contains(e.target) && 
      input && !input.contains(e.target) && 
      !clickedOnButton && !clickedOnClear) {
    showPathSuggestions.value = false;
  }
  
  // 如果点击了清除按钮，保持下拉列表显示
  if (clickedOnClear) {
    setTimeout(() => {
      showPathSuggestions.value = true;
      filterSuggestions();
    }, 0);
  }
};

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
  
  // 确保路径以斜杠开头
  if (newPath.value.charAt(0) !== '/') {
    newPath.value = '/' + newPath.value;
  }
  
  // 使用store中的addHiddenPath方法，该方法已实现路径有效性检查
  const result = settingsStore.addHiddenPath(newPath.value);
  
  if (result.success) {
    // 更新本地数据
    hiddenPaths.value = [...settingsStore.playerVisibility.hiddenPaths];
    newPath.value = '';
    showToast(result.message);
    showPathSuggestions.value = false; // 添加成功后隐藏路径建议
  } else {
    // 显示错误信息
    showToast({ type: 'fail', message: result.message });
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
        <van-field 
          v-model="newPath" 
          placeholder="输入路径，例如setting或者s的时候 ，会出现让你补全的列表可以选择"
          @focus="handleInputFocus"
          @input="filterSuggestions"
          @clear="handleInputClear"
          clearable
        />
        <van-button type="primary" size="small" @click="addHiddenPath">添加</van-button>
      </div>
      
      <!-- 路径提示列表 -->
      <div v-if="showPathSuggestions && filteredPaths.length > 0" class="path-suggestions">
        <div class="path-suggestions-header">
          <span>可用路径 ({{ filteredPaths.length }})</span>
          <div class="path-suggestions-actions">
            <van-button size="mini" type="primary" @click="selectMultiplePaths" :disabled="selectedPaths.length === 0">添加选中</van-button>
            <van-button size="mini" @click="closePathSuggestions">关闭</van-button>
          </div>
        </div>
        <div class="path-suggestions-search">
          <van-field
            v-model="pathSearchText"
            placeholder="搜索路径"
            clearable
            @input="filterSuggestions"
          />
        </div>
        <div class="path-suggestions-list">
          <div 
            v-for="path in filteredPaths" 
            :key="path" 
            class="path-suggestion-item" 
            :class="{ 'path-suggestion-item-selected': selectedPaths.includes(path) }"
            @click="togglePathSelection(path)"
          >
            <van-checkbox 
              :model-value="selectedPaths.includes(path)" 
              @click.stop="togglePathSelection(path)"
            ></van-checkbox>
            <span class="path-text" :title="path">{{ path }}</span>
          </div>
        </div>
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
          <div class="preview-cover">
            <div class="preview-cover-placeholder"></div>
          </div>
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
    position: relative;
    
    .van-field {
      flex: 1;
      margin-right: 8px;
    }
  }
  
  // 路径建议列表样式
  .path-suggestions {
    position: absolute;
    top: 100%;
    left: 31px;
    width: calc(100% - 76px); // 减去按钮宽度和间距
    max-height: 350px;
    background-color: #fff;
    border: 1px solid #eee;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    z-index: 10000;
    display: flex;
    flex-direction: column;
    
    .path-suggestions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border-bottom: 1px solid #eee;
      background-color: #f8f8f8;
      border-radius: 8px 8px 0 0;
      
      span {
        font-weight: 500;
        color: #333;
      }
      
      .path-suggestions-actions {
        display: flex;
        gap: 8px;
        
        .van-button {
          height: 28px;
          font-size: 12px;
        }
      }
    }
    
    .path-suggestions-search {
      padding: 8px 12px;
      border-bottom: 1px solid #eee;
      
      .van-field {
        background-color: #f5f5f5;
        border-radius: 4px;
      }
    }
    
    .path-suggestions-list {
      overflow-y: auto;
      max-height: 250px;
    }
    
    .path-suggestion-item {
      padding: 10px 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #f5f5f5;
      transition: background-color 0.2s;
      
      &:last-child {
        border-bottom: none;
      }
      
      &:hover {
        background-color: #f5f5f5;
      }
      
      &.path-suggestion-item-selected {
        background-color: #e8f0fe;
      }
      
      .path-text {
        margin-left: 8px;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .van-checkbox {
        margin-right: 8px;
      }
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
    position: relative;
    height: 70px;
    border-radius: 8px;
    margin-top: 20px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    justify-content: space-between;
    overflow: hidden;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    
    .preview-content {
      display: flex;
      align-items: center;
      flex: 1;
      overflow: hidden;
    }
    
    .preview-cover {
      width: 48px;
      height: 48px;
      background-color: #eee;
      border-radius: 4px;
      margin-right: 12px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      
      .preview-cover-placeholder {
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #e0e0e0 0%, #cccccc 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        
        &:after {
          content: '\266B'; // 音符符号
          font-size: 24px;
          color: #999;
        }
      }
    }
    
    .preview-info {
      flex: 1;
      min-width: 0;
      
      .preview-name {
        margin-bottom: 4px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .preview-artist {
        opacity: 0.8;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    
    .preview-controls {
      display: flex;
      align-items: center;
      margin-left: 16px;
      
      .van-icon {
        margin-left: 16px;
      }
    }
    
    .preview-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background-color: rgba(0, 0, 0, 0.1);
      
      .preview-progress-bar {
        height: 100%;
        width: 50%;
      }
    }
  }
}
</style>