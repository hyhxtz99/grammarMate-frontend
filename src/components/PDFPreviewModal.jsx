import React, { useState, useEffect, useRef } from 'react';
import { createPDFPreviewWatermark, verifyWatermarkIntegrity } from '../utils/watermarkGenerator';
import { generateProtectedPDF } from '../utils/pdfGenerator';
import './PDFPreviewModal.css';

const PDFPreviewModal = ({ 
  isOpen, 
  onClose, 
  messages, 
  userId, 
  sessionId,
  onDownload 
}) => {
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [watermark, setWatermark] = useState(null);
  const previewContainerRef = useRef(null);
  const iframeRef = useRef(null);

  // 生成PDF预览
  useEffect(() => {
    if (isOpen && messages && messages.length > 0) {
      generatePDFPreview();
    }
  }, [isOpen, messages]);

  // 清理PDF URL
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // 生成PDF预览
  const generatePDFPreview = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('开始生成PDF预览...');
      console.log('Messages:', messages);
      console.log('User ID:', userId);
      
      // 验证输入数据
      if (!messages || messages.length === 0) {
        throw new Error('没有消息数据可以生成PDF');
      }
      
      if (!userId) {
        throw new Error('用户ID缺失');
      }
      
      // 生成PDF
      console.log('调用generateProtectedPDF...');
      const pdf = await generateProtectedPDF(messages, {
        title: 'GrammarMate Q&A Session Preview',
        userId: userId,
        watermarkText: 'GrammarMate Preview',
        watermarkOptions: {
          opacity: 0.05,
          fontSize: 12,
          angle: -45,
          color: '#cccccc'
        }
      });

      console.log('PDF生成成功，开始转换为Blob...');
      
      // 转换为Blob
      const pdfBlob = pdf.output('blob');
      console.log('PDF Blob大小:', pdfBlob.size);
      
      const url = URL.createObjectURL(pdfBlob);
      console.log('PDF URL创建成功:', url);
      
      setPdfBlob(pdfBlob);
      setPdfUrl(url);
      
      // 等待iframe加载完成后应用水印
      setTimeout(() => {
        applyWatermarkToPreview();
      }, 500);
      
    } catch (err) {
      console.error('PDF生成错误:', err);
      console.error('错误堆栈:', err.stack);
      setError(`PDF预览生成失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 应用水印到预览窗口
  const applyWatermarkToPreview = () => {
    if (!previewContainerRef.current || watermark) return;
    
    try {
      // 创建水印实例
      const watermarkInstance = createPDFPreviewWatermark(
        previewContainerRef.current,
        userId,
        sessionId
      );
      
      setWatermark(watermarkInstance);
      
      // 验证水印完整性
      const isIntact = verifyWatermarkIntegrity(previewContainerRef.current);
      if (!isIntact) {
        console.warn('水印完整性验证失败');
      }
      
    } catch (err) {
      console.error('水印应用失败:', err);
    }
  };

  // 处理下载
  const handleDownload = () => {
    if (pdfBlob && onDownload) {
      onDownload(pdfBlob);
    }
  };

  // 关闭模态框
  const handleClose = () => {
    // 清理水印
    if (watermark) {
      watermark.destroy();
      setWatermark(null);
    }
    
    // 清理PDF URL
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    
    setPdfBlob(null);
    onClose();
  };

  // 处理iframe加载完成
  const handleIframeLoad = () => {
    // 确保水印在iframe加载后应用
    setTimeout(() => {
      applyWatermarkToPreview();
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div className="pdf-preview-modal-overlay">
      <div className="pdf-preview-modal">
        <div className="pdf-preview-header">
          <h3>PDF预览 - 带水印保护</h3>
          <div className="pdf-preview-actions">
            <button 
              className="btn-secondary"
              onClick={handleClose}
            >
              取消
            </button>
            <button 
              className="btn-primary"
              onClick={handleDownload}
              disabled={!pdfBlob || loading}
            >
              {loading ? '生成中...' : '下载PDF'}
            </button>
          </div>
        </div>
        
        <div className="pdf-preview-content">
          {loading && (
            <div className="pdf-preview-loading">
              <div className="loading-spinner"></div>
              <p>正在生成PDF预览...</p>
            </div>
          )}
          
          {error && (
            <div className="pdf-preview-error">
              <p>❌ {error}</p>
              <button 
                className="btn-primary"
                onClick={generatePDFPreview}
              >
                重试
              </button>
            </div>
          )}
          
          {pdfUrl && !loading && (
            <div 
              className="pdf-preview-container"
              ref={previewContainerRef}
            >
              <iframe
                ref={iframeRef}
                src={pdfUrl}
                title="PDF预览"
                className="pdf-preview-iframe"
                onLoad={handleIframeLoad}
              />
              
              {/* 水印保护提示 */}
              <div className="watermark-protection-info">
                <div className="protection-badge">
                  <span className="protection-icon">🛡️</span>
                  <span>水印保护已启用</span>
                </div>
                <div className="protection-details">
                  <small>此预览包含防复制水印，下载的PDF将包含完整保护</small>
                </div>
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default PDFPreviewModal;
