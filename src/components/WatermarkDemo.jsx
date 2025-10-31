import React, { useState, useRef, useEffect } from 'react';
import { createWatermark, WatermarkGenerator } from '../utils/watermarkGenerator';
import './WatermarkDemo.css';

const WatermarkDemo = () => {
  const [watermark, setWatermark] = useState(null);
  const [isProtected, setIsProtected] = useState(false);
  const [demoText, setDemoText] = useState('这是一个演示文本，用于测试水印保护功能。');
  const containerRef = useRef(null);

  // 应用水印
  const applyWatermark = () => {
    if (watermark) {
      watermark.destroy();
    }

    const newWatermark = createWatermark(containerRef.current, {
      text: 'GrammarMate Demo',
      fontSize: 18,
      color: 'rgba(200, 200, 200, 0.15)',
      angle: -45,
      spacing: 120,
      userId: 'demo_user',
      timestamp: new Date().toISOString()
    });

    setWatermark(newWatermark);
    setIsProtected(true);
  };

  // 移除水印
  const removeWatermark = () => {
    if (watermark) {
      watermark.destroy();
      setWatermark(null);
      setIsProtected(false);
    }
  };

  // 测试水印保护
  const testProtection = () => {
    if (!watermark) return;

    // 尝试删除水印元素
    const watermarkElements = containerRef.current.querySelectorAll('.watermark-overlay');
    watermarkElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });

    // 检查水印是否被重新生成
    setTimeout(() => {
      const newWatermarkElements = containerRef.current.querySelectorAll('.watermark-overlay');
      if (newWatermarkElements.length > 0) {
        alert('✅ 水印保护成功！水印被自动重新生成。');
      } else {
        alert('❌ 水印保护失败！');
      }
    }, 200);
  };

  // 修改水印样式
  const modifyWatermark = () => {
    if (!watermark) return;

    // 尝试修改水印样式
    const watermarkElements = containerRef.current.querySelectorAll('.watermark-overlay');
    watermarkElements.forEach(element => {
      element.style.opacity = '0.5';
      element.style.background = 'red';
    });

    // 检查水印是否被恢复
    setTimeout(() => {
      const modifiedElements = containerRef.current.querySelectorAll('.watermark-overlay');
      const isRestored = Array.from(modifiedElements).every(element => 
        element.style.opacity === '0.1' && !element.style.background.includes('red')
      );
      
      if (isRestored) {
        alert('✅ 水印样式保护成功！样式被自动恢复。');
      } else {
        alert('❌ 水印样式保护失败！');
      }
    }, 200);
  };

  // 清理
  useEffect(() => {
    return () => {
      if (watermark) {
        watermark.destroy();
      }
    };
  }, [watermark]);

  return (
    <div className="watermark-demo">
      <div className="demo-header">
        <h2>🛡️ 水印保护演示</h2>
        <p>演示基于Canvas和MutationObserver的水印保护机制</p>
      </div>

      <div className="demo-controls">
        <button 
          className="demo-btn primary"
          onClick={applyWatermark}
          disabled={isProtected}
        >
          {isProtected ? '✅ 水印已启用' : '🔒 启用水印保护'}
        </button>
        
        <button 
          className="demo-btn secondary"
          onClick={removeWatermark}
          disabled={!isProtected}
        >
          🗑️ 移除水印
        </button>
        
        <button 
          className="demo-btn test"
          onClick={testProtection}
          disabled={!isProtected}
        >
          🧪 测试删除保护
        </button>
        
        <button 
          className="demo-btn test"
          onClick={modifyWatermark}
          disabled={!isProtected}
        >
          🎨 测试样式保护
        </button>
      </div>

      <div className="demo-content">
        <div className="demo-textarea">
          <label>演示文本内容：</label>
          <textarea
            value={demoText}
            onChange={(e) => setDemoText(e.target.value)}
            placeholder="输入一些文本..."
            rows={4}
          />
        </div>

        <div 
          className="demo-container"
          ref={containerRef}
        >
          <div className="demo-content-area">
            <h3>📄 受保护的内容区域</h3>
            <p>{demoText}</p>
            <div className="demo-features">
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <span>防删除保护</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎨</span>
                <span>防修改保护</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">👁️</span>
                <span>隐形水印</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="demo-info">
        <h4>🔍 技术说明</h4>
        <ul>
          <li><strong>Canvas绘制：</strong>使用Canvas将文本转换为Base64图片，然后平铺作为背景</li>
          <li><strong>MutationObserver：</strong>监控DOM变化，检测水印是否被删除或修改</li>
          <li><strong>自动恢复：</strong>检测到变化后延迟100ms自动重新生成水印</li>
          <li><strong>防循环：</strong>通过延迟机制防止无限循环重新生成</li>
        </ul>
      </div>
    </div>
  );
};

export default WatermarkDemo;