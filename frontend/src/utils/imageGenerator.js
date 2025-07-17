/**
 * 纯色图片生成工具
 * 用于为盲盒生成临时的纯色图片
 */

// 预定义的颜色数组
const COLORS = [
  '#FF6B6B', // 红色
  '#4ECDC4', // 青色
  '#45B7D1', // 蓝色
  '#96CEB4', // 绿色
  '#FFEAA7', // 黄色
  '#DDA0DD', // 紫色
  '#98D8C8', // 薄荷绿
  '#F7DC6F', // 金黄色
  '#BB8FCE', // 淡紫色
  '#85C1E9', // 天蓝色
  '#F8C471', // 橙色
  '#82E0AA', // 浅绿色
  '#F1948A', // 粉红色
  '#85C6DC', // 浅蓝色
  '#D7BDE2', // 淡紫色
  '#A9DFBF'  // 浅绿色
];

/**
 * 根据盲盒ID生成一致的颜色
 * @param {number} blindBoxId - 盲盒ID
 * @returns {string} 十六进制颜色值
 */
export function getColorByBlindBoxId(blindBoxId) {
  const index = blindBoxId % COLORS.length;
  return COLORS[index];
}

/**
 * 生成纯色图片的Canvas
 * @param {number} width - 图片宽度
 * @param {number} height - 图片高度
 * @param {string} color - 颜色值
 * @param {string} text - 可选的文字内容
 * @returns {HTMLCanvasElement} Canvas元素
 */
export function generateSolidColorCanvas(width = 300, height = 300, color = '#4ECDC4', text = '') {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = width;
  canvas.height = height;
  
  // 填充背景色
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  
  // 添加渐变效果
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, adjustBrightness(color, -20));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // 添加装饰性图案
  drawPattern(ctx, width, height, color);
  
  // 添加文字
  if (text) {
    drawText(ctx, text, width, height);
  }
  
  return canvas;
}

/**
 * 生成纯色图片的Data URL
 * @param {number} blindBoxId - 盲盒ID
 * @param {string} name - 盲盒名称
 * @param {number} width - 图片宽度
 * @param {number} height - 图片高度
 * @returns {string} Data URL
 */
export function generateBlindBoxImage(blindBoxId, name = '', width = 300, height = 300) {
  const color = getColorByBlindBoxId(blindBoxId);
  const canvas = generateSolidColorCanvas(width, height, color, name);
  return canvas.toDataURL('image/png');
}

/**
 * 调整颜色亮度
 * @param {string} color - 十六进制颜色值
 * @param {number} amount - 亮度调整量 (-100 到 100)
 * @returns {string} 调整后的颜色值
 */
function adjustBrightness(color, amount) {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * 绘制装饰性图案
 * @param {CanvasRenderingContext2D} ctx - Canvas上下文
 * @param {number} width - 画布宽度
 * @param {number} height - 画布高度
 * @param {string} baseColor - 基础颜色
 */
function drawPattern(ctx, width, height, baseColor) {
  const lightColor = adjustBrightness(baseColor, 30);
  const darkColor = adjustBrightness(baseColor, -30);
  
  // 绘制圆形装饰
  ctx.globalAlpha = 0.3;
  
  // 大圆
  ctx.fillStyle = lightColor;
  ctx.beginPath();
  ctx.arc(width * 0.8, height * 0.2, width * 0.15, 0, Math.PI * 2);
  ctx.fill();
  
  // 中圆
  ctx.fillStyle = darkColor;
  ctx.beginPath();
  ctx.arc(width * 0.2, height * 0.7, width * 0.1, 0, Math.PI * 2);
  ctx.fill();
  
  // 小圆
  ctx.fillStyle = lightColor;
  ctx.beginPath();
  ctx.arc(width * 0.7, height * 0.8, width * 0.06, 0, Math.PI * 2);
  ctx.fill();
  
  // 线条装饰
  ctx.strokeStyle = darkColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width * 0.1, height * 0.3);
  ctx.lineTo(width * 0.4, height * 0.1);
  ctx.stroke();
  
  ctx.globalAlpha = 1;
}

/**
 * 在画布上绘制文字
 * @param {CanvasRenderingContext2D} ctx - Canvas上下文
 * @param {string} text - 文字内容
 * @param {number} width - 画布宽度
 * @param {number} height - 画布高度
 */
function drawText(ctx, text, width, height) {
  if (!text) return;
  
  // 设置文字样式
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  // 根据画布大小调整字体大小
  const fontSize = Math.max(12, width / 15);
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  
  // 文字过长时进行换行
  const maxWidth = width * 0.8;
  const lines = breakTextIntoLines(ctx, text, maxWidth);
  const lineHeight = fontSize * 1.2;
  const totalHeight = lines.length * lineHeight;
  const startY = (height - totalHeight) / 2 + lineHeight / 2;
  
  lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, startY + index * lineHeight);
  });
  
  // 清除阴影
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

/**
 * 将文字分行
 * @param {CanvasRenderingContext2D} ctx - Canvas上下文
 * @param {string} text - 文字内容
 * @param {number} maxWidth - 最大宽度
 * @returns {string[]} 分行后的文字数组
 */
function breakTextIntoLines(ctx, text, maxWidth) {
  const words = text.split('');
  const lines = [];
  let currentLine = '';
  
  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine + words[i];
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine !== '') {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

/**
 * 为所有盲盒生成图片URL的映射
 * @param {Array} blindBoxes - 盲盒数组
 * @returns {Object} 盲盒ID到图片URL的映射
 */
export function generateBlindBoxImageMap(blindBoxes) {
  const imageMap = {};
  
  blindBoxes.forEach(blindBox => {
    imageMap[blindBox.id] = generateBlindBoxImage(
      blindBox.id,
      blindBox.name,
      300,
      300
    );
  });
  
  return imageMap;
}
