/**
 * Advanced watermark protection system
 */

/**
 * Generate a unique watermark signature
 */
export const generateWatermarkSignature = (content, userId, timestamp) => {
  // Create a hash-based signature that's embedded in the watermark
  const signature = btoa(`${content}_${userId}_${timestamp}_GrammarMate`);
  return signature.slice(0, 16); // Use first 16 characters as signature
};

/**
 * Embed invisible watermark data in text
 */
export const embedInvisibleWatermark = (text, signature) => {
  // Use zero-width characters to embed signature
  const zeroWidthChars = ['\u200B', '\u200C', '\u200D', '\uFEFF'];
  let watermarkedText = text;
  
  for (let i = 0; i < signature.length; i++) {
    const char = signature[i];
    const charCode = char.charCodeAt(0);
    const zeroWidthIndex = charCode % zeroWidthChars.length;
    watermarkedText += zeroWidthChars[zeroWidthIndex];
  }
  
  return watermarkedText;
};

/**
 * Extract watermark signature from text
 */
export const extractWatermarkSignature = (text) => {
  const zeroWidthChars = ['\u200B', '\u200C', '\u200D', '\uFEFF'];
  let signature = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (zeroWidthChars.includes(char)) {
      const charIndex = zeroWidthChars.indexOf(char);
      signature += String.fromCharCode(charIndex + 65); // Convert to A, B, C, D
    }
  }
  
  return signature;
};

/**
 * Create a steganographic watermark
 */
export const createSteganographicWatermark = (canvas, data) => {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  
  // Convert data to binary
  const binaryData = data.split('').map(char => 
    char.charCodeAt(0).toString(2).padStart(8, '0')
  ).join('');
  
  // Embed data in LSB of blue channel
  let dataIndex = 0;
  for (let i = 0; i < pixels.length && dataIndex < binaryData.length; i += 4) {
    const blue = pixels[i + 2];
    const bit = binaryData[dataIndex];
    
    if (bit === '1') {
      pixels[i + 2] = blue | 1; // Set LSB to 1
    } else {
      pixels[i + 2] = blue & ~1; // Set LSB to 0
    }
    
    dataIndex++;
  }
  
  ctx.putImageData(imageData, 0, 0);
};

/**
 * Extract steganographic watermark
 */
export const extractSteganographicWatermark = (canvas) => {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  
  let binaryData = '';
  for (let i = 0; i < pixels.length; i += 4) {
    const blue = pixels[i + 2];
    binaryData += (blue & 1).toString();
  }
  
  // Convert binary to text
  let text = '';
  for (let i = 0; i < binaryData.length; i += 8) {
    const byte = binaryData.slice(i, i + 8);
    if (byte.length === 8) {
      const charCode = parseInt(byte, 2);
      if (charCode > 0 && charCode < 256) {
        text += String.fromCharCode(charCode);
      }
    }
  }
  
  return text;
};

/**
 * Create a multi-layer watermark protection
 */
export const createMultiLayerWatermark = (pdf, content, userId) => {
  const timestamp = Date.now();
  const signature = generateWatermarkSignature(content, userId, timestamp);
  
  // Layer 1: Visible watermark
  pdf.setGState(pdf.GState({opacity: 0.1}));
  pdf.setFontSize(20);
  pdf.setTextColor(200, 200, 200);
  pdf.text('GrammarMate', pdf.internal.pageSize.getWidth() / 2, 
           pdf.internal.pageSize.getHeight() / 2, {angle: -45});
  
  // Layer 2: Invisible watermark in metadata
  pdf.setProperties({
    title: `GrammarMate_${signature}`,
    subject: `QA_Session_${userId}`,
    author: 'GrammarMate',
    creator: 'GrammarMate_Protected',
    producer: `GrammarMate_v1.0_${timestamp}`
  });
  
  // Layer 3: Hidden text watermark
  const watermarkedContent = embedInvisibleWatermark(content, signature);
  pdf.text(watermarkedContent, 0, 0, {opacity: 0});
  
  return signature;
};

/**
 * Verify watermark integrity
 */
export const verifyWatermarkIntegrity = (pdf, expectedSignature) => {
  const properties = pdf.getProperties();
  const title = properties.title || '';
  
  // Check if signature is in title
  if (title.includes(expectedSignature)) {
    return true;
  }
  
  return false;
};

/**
 * Create a tamper-evident watermark
 */
export const createTamperEvidentWatermark = (pdf, content) => {
  // Add checksum to watermark
  const checksum = content.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // Embed checksum in watermark
  const watermarkText = `GrammarMate_${Math.abs(checksum)}`;
  
  // Add watermark with checksum
  pdf.setGState(pdf.GState({opacity: 0.08}));
  pdf.setFontSize(16);
  pdf.setTextColor(180, 180, 180);
  pdf.text(watermarkText, pdf.internal.pageSize.getWidth() / 2, 
           pdf.internal.pageSize.getHeight() / 2, {angle: -45});
  
  return checksum;
};

/**
 * Verify tamper evidence
 */
export const verifyTamperEvidence = (content, expectedChecksum) => {
  const actualChecksum = content.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return Math.abs(actualChecksum) === Math.abs(expectedChecksum);
};
