import QRCode from 'qrcode';

/**
 * Generate a QR code as a base64 Data URL
 * @param {string} text - URL or text to encode
 * @returns {Promise<string>} Data URL (data:image/png;base64,...)
 */
export async function generateQrDataUrl(text) {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 256,
      color: {
        dark: '#0f1f38', // Deep navy
        light: '#ffffff',
      },
    });
  } catch (error) {
    console.error('[QR Service] Failed to generate QR data URL:', error);
    throw new Error('QR Code generation failed');
  }
}

/**
 * Generate a QR code as an image buffer
 * @param {string} text - URL or text to encode
 * @returns {Promise<Buffer>} PNG Buffer
 */
export async function generateQrBuffer(text) {
  try {
    return await QRCode.toBuffer(text, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 256,
      color: {
        dark: '#0f1f38',
        light: '#ffffff',
      },
    });
  } catch (error) {
    console.error('[QR Service] Failed to generate QR buffer:', error);
    throw new Error('QR Code buffer generation failed');
  }
}
