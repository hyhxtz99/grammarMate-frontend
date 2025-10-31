/**
 * PDF generation utility with GrammarMate watermark protection
 */
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generate a secure watermark that's hard to remove
 */
const createWatermark = (pdf, text = 'GrammarMate', options = {}) => {
  const {
    opacity = 0.1,
    fontSize = 20,
    angle = -45,
    color = '#cccccc',
    spacing = 100
  } = options;

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Calculate watermark positions
  const positions = [];
  for (let x = 0; x < pageWidth + spacing; x += spacing) {
    for (let y = 0; y < pageHeight + spacing; y += spacing) {
      positions.push({ x, y });
    }
  }

  // Add watermarks
  positions.forEach(pos => {
    pdf.setTextColor(color);
    pdf.setFontSize(fontSize);
    // Set opacity using the correct jsPDF method
    try {
      if (pdf.setGState) {
        pdf.setGState({opacity: opacity});
      } else {
        // Fallback for older versions - use alpha in color
        const alpha = Math.round(opacity * 255);
        pdf.setTextColor(parseInt(color.slice(1,3), 16), parseInt(color.slice(3,5), 16), parseInt(color.slice(5,7), 16));
      }
    } catch (error) {
      console.warn('Could not set opacity:', error);
    }
    
    pdf.text(text, pos.x, pos.y, {
      angle: angle,
      align: 'center'
    });
  });
};

/**
 * Add security features to PDF
 */
const addSecurityFeatures = (pdf) => {
  // Set document properties (using the correct jsPDF method)
  try {
    // jsPDF 2.5.1 uses different method names
    if (pdf.setProperties) {
      pdf.setProperties({
        title: 'GrammarMate Q&A Export',
        subject: 'Grammar Q&A Session',
        author: 'GrammarMate',
        creator: 'GrammarMate Application',
        producer: 'GrammarMate PDF Generator'
      });
    } else if (pdf.setMetadata) {
      // Alternative method for older versions
      pdf.setMetadata({
        title: 'GrammarMate Q&A Export',
        subject: 'Grammar Q&A Session',
        author: 'GrammarMate',
        creator: 'GrammarMate Application',
        producer: 'GrammarMate PDF Generator'
      });
    }
  } catch (error) {
    console.warn('Could not set PDF properties:', error);
    // Continue without properties if not supported
  }
};

/**
 * Create a protected PDF with watermark
 */
export const generateProtectedPDF = async (messages, options = {}) => {
  try {
    console.log('generateProtectedPDF called with:', { messages, options });
    
    const {
      title = 'GrammarMate Q&A Session',
      watermarkText = 'GrammarMate',
      watermarkOptions = {},
      filename = 'grammar_qa_session.pdf',
      userId = null
    } = options;

    // 验证输入参数
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error('Messages array is required and cannot be empty');
    }

    console.log('Creating new PDF document...');
    // Create new PDF document
    const pdf = new jsPDF();
  
  // Add security features
  addSecurityFeatures(pdf);
  
  // Set up page dimensions
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 6;
  const maxWidth = pageWidth - (margin * 2);
  
  let yPosition = margin;
  let currentPage = 1;
  
  // Add title
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, margin, yPosition);
  yPosition += 15;
  
  // Add timestamp
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPosition);
  yPosition += 10;
  
  // Add separator line
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;
  
  // Process messages
  messages.forEach((msg, index) => {
    const role = msg.role === 'user' ? 'User' : 'AI Assistant';
    const content = msg.content;
    const translated = msg.translated;
    
    // Check if we need a new page
    if (yPosition > pageHeight - 50) {
      // Add watermark to current page before adding new page
      createWatermark(pdf, watermarkText, watermarkOptions);
      
      pdf.addPage();
      currentPage++;
      yPosition = margin;
    }
    
    // Add role header
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${role}:`, margin, yPosition);
    yPosition += 8;
    
    // Add content
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    // Split long text into multiple lines
    const lines = pdf.splitTextToSize(content, maxWidth);
    lines.forEach(line => {
      if (yPosition > pageHeight - 20) {
        // Add watermark to current page
        createWatermark(pdf, watermarkText, watermarkOptions);
        
        pdf.addPage();
        currentPage++;
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += lineHeight;
    });
    
    // Add translation if exists
    if (translated) {
      yPosition += 3;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Translation: ${translated}`, margin, yPosition);
      yPosition += 6;
    }
    
    yPosition += 8; // Space between messages
  });
  
  // Add watermark protection
  const content = messages.map(msg => msg.content).join(' ');
  
  // Create basic watermark
  createWatermark(pdf, watermarkText, watermarkOptions);
  
  // Add additional watermark layers for better protection
  if (userId) {
  // Add user-specific watermark
  try {
    if (pdf.setGState) {
      pdf.setGState({opacity: 0.05});
    }
  } catch (error) {
    console.warn('Could not set opacity for user watermark:', error);
  }
  pdf.setFontSize(8);
  pdf.setTextColor(180, 180, 180);
  pdf.text(`User: ${userId}`, pdf.internal.pageSize.getWidth() - 50, pdf.internal.pageSize.getHeight() - 10);
  }
  
  // Add footer with GrammarMate branding and protection info
  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    
    // Add footer
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(150, 150, 150);
    pdf.text('Generated by GrammarMate', margin, pageHeight - 10);
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
    
    // Add protection info (very small, hard to notice)
    if (userId) {
      pdf.setFontSize(6);
      pdf.setTextColor(200, 200, 200);
      pdf.text(`ID:${userId}`, pageWidth - 50, pageHeight - 5);
    }
  }
  
  // Store basic protection data
  pdf.protectionData = {
    userId: userId,
    timestamp: Date.now()
  };
  
  console.log('PDF generation completed successfully');
  return pdf;
  
  } catch (error) {
    console.error('Error in generateProtectedPDF:', error);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
};

/**
 * Download PDF with additional protection
 */
export const downloadProtectedPDF = async (messages, options = {}) => {
  try {
    console.log('Generating protected PDF with options:', options);
    
    const pdf = await generateProtectedPDF(messages, options);
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = options.filename || `GrammarMate_QA_${timestamp}.pdf`;
    
    console.log('Saving PDF with filename:', filename);
    
    // Save the PDF
    pdf.save(filename);
    
    console.log('PDF saved successfully');
    
    return {
      success: true,
      filename: filename,
      message: 'PDF exported successfully with GrammarMate watermark'
    };
  } catch (error) {
    console.error('PDF generation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate PDF',
      message: 'Please try again or contact support'
    };
  }
};

/**
 * Create a canvas-based watermark for additional protection
 */
export const createCanvasWatermark = (canvas, text = 'GrammarMate') => {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Set watermark properties
  ctx.font = '20px Arial';
  ctx.fillStyle = 'rgba(200, 200, 200, 0.1)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Rotate and add watermark
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(-Math.PI / 4); // -45 degrees
  
  // Add multiple watermarks
  for (let x = -width; x < width * 2; x += 150) {
    for (let y = -height; y < height * 2; y += 100) {
      ctx.fillText(text, x, y);
    }
  }
  
  ctx.restore();
};

/**
 * Advanced watermark protection using multiple techniques
 */
export const addAdvancedWatermarkProtection = (pdf) => {
  // Add invisible watermark using text positioning
  const pageCount = pdf.internal.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    
    // Add multiple layers of watermarks with different properties
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Layer 1: Very light watermark
    try {
      if (pdf.setGState) {
        pdf.setGState({opacity: 0.05});
      }
    } catch (error) {
      console.warn('Could not set opacity for layer 1:', error);
    }
    pdf.setFontSize(8);
    pdf.setTextColor(200, 200, 200);
    pdf.text('GrammarMate', pageWidth - 50, pageHeight - 10, {angle: 0});
    
    // Layer 2: Diagonal watermark
    try {
      if (pdf.setGState) {
        pdf.setGState({opacity: 0.08});
      }
    } catch (error) {
      console.warn('Could not set opacity for layer 2:', error);
    }
    pdf.setFontSize(12);
    pdf.text('GrammarMate', pageWidth / 2, pageHeight / 2, {angle: -45});
    
    // Layer 3: Corner watermarks
    try {
      if (pdf.setGState) {
        pdf.setGState({opacity: 0.03});
      }
    } catch (error) {
      console.warn('Could not set opacity for layer 3:', error);
    }
    pdf.setFontSize(6);
    pdf.text('GM', 10, 10, {angle: 0});
    pdf.text('GM', pageWidth - 15, 10, {angle: 0});
    pdf.text('GM', 10, pageHeight - 10, {angle: 0});
    pdf.text('GM', pageWidth - 15, pageHeight - 10, {angle: 0});
  }
};
