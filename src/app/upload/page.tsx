'use client';
import { useState } from 'react';

export default function UploadForm() {
  const [image, setImage] = useState('');
  const [url, setUrl] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    
    reader.onloadend = async () => {
      const base64 = reader.result;
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: base64 }),
      });

      let data;
      try {
        data = await res.json();
      } catch (e) {
        const text = await res.text();
        alert('Upload failed: ' + text);
        return;
      }

      if (data.error) {
        alert('Upload failed: ' + data.error);
        return;
      }
      setUrl(data.url);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div>
      <input type="file" onChange={handleImageUpload} />
      {url && (
        <div>
          <a href={url} target="_blank" rel="noopener noreferrer">View Image</a>
        </div>
      )}
    </div>
  );
}
