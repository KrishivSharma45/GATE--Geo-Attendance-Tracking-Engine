import QRCode from 'qrcode';

export async function generateQrDataUrl(token) {
  return QRCode.toDataURL(token, { width: 300 });
}
