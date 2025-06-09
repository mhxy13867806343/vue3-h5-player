/**
 * 千 / 万 / 亿 数字格式化
 *  0-999   → 原样
 *  1 000-9 999   → x.x千   (默认 1 位小数，可改)
 *  10 000-99 999 999 → x.x万
 *  ≥100 000 000 → x.x亿
 *
 * @param {number} count      原始数字
 * @param {number} [digits=1] 小数位
 * @param {boolean} [showUnit=true] 是否显示单位
 * @returns {string}
 */
export function formatPlayCount(count, digits = 1, showUnit = true) {
  if (count === null || count === undefined) return '';

  if (count < 1000) {
    // 0-999：直接返回
    return String(count);
  } else if (count < 1e4) {
    // 1 000-9 999：用“千”
    return calc(count, 1e3, '千');
  } else if (count < 1e8) {
    // 1 万-<1 亿：用“万”
    return calc(count, 1e4, '万');
  } else {
    // >=1 亿：用“亿”
    return calc(count, 1e8, '亿');
  }

  // 小工具：完成换算、保留小数并去尾 0
  function calc(num, divider, label) {
    const n = (num / divider).toFixed(digits);   // 保留 digits 位
    const formatted = parseFloat(n).toString();  // 去掉尾部 0
    return showUnit ? formatted + label : formatted;
  }
}



/**
 * 格式化时间，将毫秒或秒数转化为 mm:ss 格式
 * @param {Number} time 时间（毫秒或秒）
 * @param {Boolean} isMillisecond 是否为毫秒单位，默认true
 * @returns {String} 格式化后的时间字符串
 */
export function formatTime(time, isMillisecond = true) {
  if (!time && time !== 0) return '00:00';
  
  // 如果是毫秒，转换为秒
  const seconds = isMillisecond ? time / 1000 : time;
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 节流函数
 * @param {Function} fn 要节流的函数
 * @param {Number} delay 节流时间，单位毫秒
 * @returns {Function} 节流后的函数
 */
export function throttle(fn, delay = 300) {
  let timer = null;
  let lastTime = 0;
  
  return function(...args) {
    const context = this;
    const now = Date.now();
    
    // 这次调用距离上次调用的时间间隔
    const remaining = delay - (now - lastTime);
    
    // 如果间隔时间足够长，可以执行函数
    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      
      lastTime = now;
      fn.apply(context, args);
    } else if (!timer) {
      // 如果还不到时间，设置一个定时器
      timer = setTimeout(() => {
        lastTime = Date.now();
        timer = null;
        fn.apply(context, args);
      }, remaining);
    }
  };
}

/**
 * 防抖函数
 * @param {Function} fn 要防抖的函数
 * @param {Number} delay 防抖时间，单位毫秒
 * @returns {Function} 防抖后的函数
 */
export function debounce(fn, delay = 300) {
  let timer = null;
  
  return function(...args) {
    const context = this;
    
    if (timer) {
      clearTimeout(timer);
    }
    
    timer = setTimeout(() => {
      fn.apply(context, args);
      timer = null;
    }, delay);
  };
}
