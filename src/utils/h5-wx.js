/**
 * 微信环境检测工具类
 * 用于判断当前环境是否为微信浏览器，以及提供相关的操作提示
 */
import { showToast } from 'vant';

/**
 * 判断当前是否在微信浏览器中运行
 * @returns {Boolean} 是否在微信浏览器中
 */
export function isWeixinBrowser() {
  const ua = navigator.userAgent.toLowerCase();
  return ua.indexOf('micromessenger') !== -1;
}

/**
 * 判断是否在微信小程序环境中
 * @returns {Boolean} 是否在微信小程序中
 */
export function isWeixinMiniProgram() {
  const ua = navigator.userAgent.toLowerCase();
  return ua.indexOf('miniprogram') !== -1 || window.__wxjs_environment === 'miniprogram';
}

/**
 * 在微信浏览器中显示「点击右上角在浏览器打开」的提示
 */
export function showWxOpenTip() {
  if (isWeixinBrowser()) {
    showToast({
      message: '请点击右上角在浏览器打开',
      position: 'top',
      duration: 3000,
    });
  }
}

/**
 * 尝试在非微信环境中打开微信应用
 * @param {String} path 可选参数，打开微信的特定页面路径
 * @returns {Boolean} 是否已尝试打开
 */
export function tryOpenWeixin(path = '') {
  if (!isWeixinBrowser()) {
    const url = `weixin://` + (path ? path : '');
    window.location.href = url;
    return true;
  }
  return false;
}

/**
 * 判断当前是否在移动设备上
 * @returns {Boolean} 是否为移动设备
 */
export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * 显示"请点击右上角"的提示（当在微信内打开时）
 * @param {Object} options 配置选项
 * @param {String} options.message 提示文本，默认为"请点击右上角，选择"在浏览器中打开""
 * @param {Number} options.duration 显示时长（毫秒），默认3000ms
 * @param {Function} options.onClose 关闭回调
 * @returns {Object} 提示控制对象，包含close方法用于手动关闭
 */
export function showWeixinTip(options = {}) {
  if (!isWeixinBrowser()) return null;
  
  const {
    message = '请点击右上角，选择"在浏览器中打开"',
    duration = 3000,
    onClose
  } = options;
  
  // 创建提示元素
  const tipElement = document.createElement('div');
  tipElement.className = 'weixin-open-browser-tip';
  tipElement.style.cssText = `
    position: fixed;
    top: 15px;
    right: 15px;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    border-radius: 4px;
    padding: 10px 15px;
    font-size: 14px;
    z-index: 9999;
    max-width: 70%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    animation: tipFadeIn 0.3s;
    display: flex;
    align-items: center;
  `;
  
  // 添加箭头图标
  const arrowIcon = document.createElement('div');
  arrowIcon.style.cssText = `
    width: 12px;
    height: 12px;
    border-top: 2px solid #fff;
    border-right: 2px solid #fff;
    transform: rotate(45deg);
    margin-right: 10px;
  `;
  
  // 添加文本
  const textElement = document.createElement('span');
  textElement.textContent = message;
  
  tipElement.appendChild(arrowIcon);
  tipElement.appendChild(textElement);
  document.body.appendChild(tipElement);
  
  // 添加动画样式
  const style = document.createElement('style');
  style.textContent = `
    @keyframes tipFadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes tipFadeOut {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(-10px); }
    }
    .weixin-open-browser-tip-fadeout {
      animation: tipFadeOut 0.3s;
    }
  `;
  document.head.appendChild(style);
  
  // 定时关闭
  let timeoutId = null;
  if (duration > 0) {
    timeoutId = setTimeout(() => closeTip(), duration);
  }
  
  // 关闭提示
  const closeTip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    
    tipElement.classList.add('weixin-open-browser-tip-fadeout');
    setTimeout(() => {
      if (document.body.contains(tipElement)) {
        document.body.removeChild(tipElement);
        if (typeof onClose === 'function') {
          onClose();
        }
      }
    }, 300);
  };
  
  // 点击关闭
  tipElement.addEventListener('click', closeTip);
  
  return {
    close: closeTip
  };
}

/**
 * 检测微信APP是否安装（仅适用于非微信环境）
 * 由于浏览器安全限制，无法直接检测APP是否安装
 * 此方法尝试通过重定向方式打开微信，需要用户授权
 * @param {Object} options 配置选项
 * @param {String} options.scheme 微信Scheme，默认为weixin://
 * @param {Function} options.fallback 无法打开微信时的回调
 * @param {Number} options.timeout 超时时间（毫秒），默认2000ms
 */
export function openWeixinApp(options = {}) {
  if (isWeixinBrowser()) {
    console.warn('当前已在微信环境中，无需打开微信APP');
    return;
  }
  
  const {
    scheme = 'weixin://',
    fallback,
    timeout = 2000
  } = options;
  
  // 记录当前时间
  const startTime = Date.now();
  
  // 尝试打开微信
  const openApp = () => {
    // 创建隐藏的iframe用于打开APP
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'display:none;border:0;width:0;height:0;';
    iframe.src = scheme;
    document.body.appendChild(iframe);
    
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 100);
  };
  
  // 检测是否成功跳转APP
  const checkOpen = () => {
    const endTime = Date.now();
    // 如果页面超过超时时间还在，则认为没有安装或无法打开APP
    if (document.hidden || document.webkitHidden) {
      // 页面隐藏了，可能是APP已打开
      return;
    }
    
    // 超时检测
    if (endTime - startTime > timeout + 500) {
      // 可能没有安装APP或用户取消了打开
      if (typeof fallback === 'function') {
        fallback();
      }
    }
  };
  
  // 监听页面可见性变化
  const visibilityChange = () => {
    if (!document.hidden && !document.webkitHidden) {
      // 页面重新可见，可能是用户从APP返回了
      setTimeout(() => {
        if (typeof fallback === 'function') {
          fallback();
        }
      }, 100);
    }
  };
  
  // 添加页面可见性监听
  document.addEventListener('visibilitychange', visibilityChange);
  document.addEventListener('webkitvisibilitychange', visibilityChange);
  
  // 尝试打开APP
  openApp();
  
  // 超时检测
  setTimeout(() => {
    checkOpen();
  }, timeout);
}

/**
 * 环境检测并执行相应操作
 * @param {Object} options 配置选项
 * @param {Function} options.inWeixinCallback 微信环境回调
 * @param {Function} options.notInWeixinCallback 非微信环境回调
 * @param {Boolean} options.showTip 是否显示微信提示，默认true
 */
export function weixinEnvCheck(options = {}) {
  const {
    inWeixinCallback,
    notInWeixinCallback,
    showTip = true
  } = options;
  
  if (isWeixinBrowser()) {
    // 微信环境
    if (showTip) {
      showWeixinTip();
    }
    if (typeof inWeixinCallback === 'function') {
      inWeixinCallback(isWeixinMiniProgram());
    }
  } else {
    // 非微信环境
    if (typeof notInWeixinCallback === 'function') {
      notInWeixinCallback(isMobileDevice());
    }
  }
}

/**
 * 生成微信分享配置
 * 用于配置微信JS-SDK分享功能
 * @param {Object} shareData 分享数据
 * @param {String} shareData.title 分享标题
 * @param {String} shareData.desc 分享描述
 * @param {String} shareData.link 分享链接
 * @param {String} shareData.imgUrl 分享图标
 * @param {Function} shareData.success 分享成功回调
 * @param {Function} shareData.cancel 分享取消回调
 * @returns {Object} 配置对象
 */
export function generateWeixinShareConfig(shareData = {}) {
  return {
    title: shareData.title || document.title,
    desc: shareData.desc || '',
    link: shareData.link || window.location.href,
    imgUrl: shareData.imgUrl || '',
    success: function() {
      if (typeof shareData.success === 'function') {
        shareData.success();
      }
    },
    cancel: function() {
      if (typeof shareData.cancel === 'function') {
        shareData.cancel();
      }
    }
  };
}
