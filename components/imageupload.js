'use client';
import { useState } from 'react';

export default function ImageUpload() {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select an image');

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      setImageUrl(data.url);
    } else {
      alert(data.error || 'Upload failed');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} accept="image/*" />
        <button type="submit">Upload</button>
      </form>
      {imageUrl && (
        <div>
          <p>Uploaded Image URL:</p>
          <a href={imageUrl} target="_blank" rel="noopener noreferrer">{imageUrl}</a>
          <br />
          <img src={imageUrl} alt="Uploaded" style={{ maxWidth: '300px', marginTop: '10px' }} />
        </div>
      )}
    </div>
  );
}
