const QRCode = require('qrcode');
const logger = require('./logger');

/**
 * Generate QR code from data
 * @param {Object} data - Data to encode in QR code
 * @param {Object} options - QR code options
 * @returns {Promise<string>} QR code as data URL
 */
const generateQRCode = async (data, options = {}) => {
  try {
    const qrData = JSON.stringify(data);
    const qrOptions = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 300,
      ...options
    };
    
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, qrOptions);
    logger.info('QR code generated successfully');
    return qrCodeDataUrl;
  } catch (error) {
    logger.error('QR code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Generate QR code as buffer
 * @param {Object} data - Data to encode in QR code
 * @returns {Promise<Buffer>} QR code as PNG buffer
 */
const generateQRCodeBuffer = async (data) => {
  try {
    const qrData = JSON.stringify(data);
    const buffer = await QRCode.toBuffer(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 300,
    });
    
    logger.info('QR code buffer generated successfully');
    return buffer;
  } catch (error) {
    logger.error('QR code buffer generation error:', error);
    throw new Error('Failed to generate QR code buffer');
  }
};

module.exports = {
  generateQRCode,
  generateQRCodeBuffer
};
