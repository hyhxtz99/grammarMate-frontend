/**
 * 水印生成工具类 - 基于Canvas和MutationObserver实现
 * 参考图片中的思路：使用Canvas绘制水印，MutationObserver保护水印不被删除或修改
 */

/**
 * 水印生成器类
 */
export class WatermarkGenerator {
  constructor(options = {}) {
    this.options = {
      text: 'GrammarMate',
      fontSize: 16,
      color: 'rgba(200, 200, 200, 0.1)',
      angle: -45,
      spacing: 100,
      container: null,
      userId: null,
      timestamp: null,
      ...options
    };
    
    this.observer = null;
    this.watermarkElement = null;
    this.isDestroyed = false;
  }

  /**
   * 生成水印文本（包含用户ID和时间戳）
   */
  generateWatermarkText() {
    const { text, userId, timestamp } = this.options;
    const currentTime = timestamp || new Date().toISOString();
    const userInfo = userId ? `_${userId}` : '';
    return `${text}${userInfo}_${currentTime}`;
  }

  /**
   * 创建Canvas并绘制水印
   */
  createWatermarkCanvas() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 设置canvas尺寸
    canvas.width = 300;
    canvas.height = 200;
    
    // 设置字体和颜色
    ctx.font = `${this.options.fontSize}px Arial`;
    ctx.fillStyle = this.options.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 旋转并绘制水印文本
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((this.options.angle * Math.PI) / 180);
    
    // 绘制多个水印文本
    const watermarkText = this.generateWatermarkText();
    for (let x = -canvas.width; x < canvas.width * 2; x += this.options.spacing) {
      for (let y = -canvas.height; y < canvas.height * 2; y += this.options.spacing) {
        ctx.fillText(watermarkText, x, y);
      }
    }
    
    ctx.restore();
    
    return canvas;
  }

  /**
   * 将Canvas转换为Base64图片
   */
  canvasToBase64(canvas) {
    return canvas.toDataURL('image/png');
  }

  /**
   * 创建水印DOM元素
   */
  createWatermarkElement() {
    const canvas = this.createWatermarkCanvas();
    const base64Image = this.canvasToBase64(canvas);
    
    const watermarkDiv = document.createElement('div');
    watermarkDiv.className = 'watermark-overlay';
    watermarkDiv.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url(${base64Image});
      background-repeat: repeat;
      background-size: 300px 200px;
      pointer-events: none;
      z-index: 9999;
      opacity: 0.1;
    `;
    
    return watermarkDiv;
  }

  /**
   * 设置MutationObserver来保护水印
   */
  setupMutationObserver() {
    if (this.isDestroyed) return;
    
    this.observer = new MutationObserver((mutations) => {
      let shouldRegenerate = false;
      
      mutations.forEach((mutation) => {
        // 检查水印是否被删除
        if (mutation.type === 'childList') {
          mutation.removedNodes.forEach((node) => {
            if (node === this.watermarkElement || 
                (node.nodeType === Node.ELEMENT_NODE && 
                 node.contains && node.contains(this.watermarkElement))) {
              shouldRegenerate = true;
            }
          });
        }
        
        // 检查水印样式是否被修改
        if (mutation.type === 'attributes' && 
            mutation.target === this.watermarkElement) {
          if (mutation.attributeName === 'style' || 
              mutation.attributeName === 'class') {
            shouldRegenerate = true;
          }
        }
      });
      
      if (shouldRegenerate && !this.isDestroyed) {
        // 延迟100ms防止无限循环
        setTimeout(() => {
          if (!this.isDestroyed) {
            this.regenerateWatermark();
          }
        }, 100);
      }
    });
    
    // 开始观察
    if (this.options.container) {
      this.observer.observe(this.options.container, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }
  }

  /**
   * 重新生成水印
   */
  regenerateWatermark() {
    if (this.isDestroyed) return;
    
    // 移除旧的水印
    if (this.watermarkElement && this.watermarkElement.parentNode) {
      this.watermarkElement.parentNode.removeChild(this.watermarkElement);
    }
    
    // 创建新的水印
    this.watermarkElement = this.createWatermarkElement();
    
    // 添加到容器
    if (this.options.container) {
      this.options.container.appendChild(this.watermarkElement);
    }
  }

  /**
   * 应用水印到容器
   */
  applyWatermark(container) {
    if (this.isDestroyed) return;
    
    this.options.container = container;
    
    // 确保容器有相对定位
    const containerStyle = window.getComputedStyle(container);
    if (containerStyle.position === 'static') {
      container.style.position = 'relative';
    }
    
    // 创建并添加水印
    this.watermarkElement = this.createWatermarkElement();
    container.appendChild(this.watermarkElement);
    
    // 设置MutationObserver保护
    this.setupMutationObserver();
    
    return this.watermarkElement;
  }

  /**
   * 更新水印选项
   */
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    
    // 如果水印已存在，重新生成
    if (this.watermarkElement && !this.isDestroyed) {
      this.regenerateWatermark();
    }
  }

  /**
   * 销毁水印
   */
  destroy() {
    this.isDestroyed = true;
    
    // 停止观察
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    // 移除水印元素
    if (this.watermarkElement && this.watermarkElement.parentNode) {
      this.watermarkElement.parentNode.removeChild(this.watermarkElement);
      this.watermarkElement = null;
    }
  }
}

/**
 * 创建水印实例的便捷函数
 */
export const createWatermark = (container, options = {}) => {
  const watermark = new WatermarkGenerator(options);
  watermark.applyWatermark(container);
  return watermark;
};

/**
 * 为PDF预览创建专用水印
 */
export const createPDFPreviewWatermark = (container, userId, sessionId) => {
  return new WatermarkGenerator({
    text: 'GrammarMate',
    fontSize: 14,
    color: 'rgba(180, 180, 180, 0.08)',
    angle: -45,
    spacing: 120,
    userId: userId,
    timestamp: new Date().toISOString(),
    container: container
  });
};

/**
 * 验证水印是否被篡改
 */
export const verifyWatermarkIntegrity = (container) => {
  const watermarkElements = container.querySelectorAll('.watermark-overlay');
  return watermarkElements.length > 0;
};

export default WatermarkGenerator;
