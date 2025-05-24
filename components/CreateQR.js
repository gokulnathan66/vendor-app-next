'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function UPIQRCode({ upiId, name, amount , note}) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${note}`;

    QRCode.toDataURL(upiString)
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error(err));
  }, [upiId, name, amount]);

  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold mb-4">Scan to Pay</h2>
      {qrCodeUrl && <img src={qrCodeUrl} alt="UPI QR Code" className="mx-auto" />}
    </div>
  );
}
