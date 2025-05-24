"use client"
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';

const Page2 = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const data = searchParams?.get('data');
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    // Read from localStorage
    const items = window.localStorage.getItem('selectedItems');
    if (items) {
      try {
        setSelectedItems(JSON.parse(items));
      } catch (e) {
        setSelectedItems([]);
      }
    }
  }, []);

  useEffect(() => {
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        console.log('Background logic here:', parsedData);
        // Call any background function here
      } catch (e) {
        console.error('Failed to parse data:', e);
      }
    }
  }, [data]);

// table create 

  const convertTableToImage = async () => {
    if (tableRef.current) {
      try {
        const canvas = await html2canvas(tableRef.current, {
          scale: 2, // Higher scale for better quality
          backgroundColor: '#ffffff',
          logging: false,
        });
        
        // Convert canvas to image
        const image = canvas.toDataURL('image/png');
        
        // Create a download link
        const link = document.createElement('a');
        link.download = 'bill.png';
        link.href = image;
        link.click();
        
        return image;
      } catch (error) {
        console.error('Error converting table to image:', error);
        return null;
      }
    }
    return null;
  };
// upload image 

  const uploadToCloudinary = async (imageData: string) => {
    try {
      setIsUploading(true);
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: imageData }),
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setUploadedUrl(data.url);
      return data.url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      alert('Failed to upload image. Please try again.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async () => {
    const imageData = await convertTableToImage();
    if (imageData) {
      const cloudinaryUrl = await uploadToCloudinary(imageData);
      if (cloudinaryUrl) {
        alert('Image uploaded successfully!');
      }
    }
  };

// create QR code 
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Generated Bill</h2>
      {selectedItems.length === 0 ? (
        <div>No items found.</div>
      ) : (
        <table ref={tableRef} className="w-full table-auto bg-white shadow-md rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Item Name</th>
              <th className="px-4 py-2 text-left">Quantity</th>
              <th className="px-4 py-2 text-left">Price</th>
            </tr>
          </thead>
          <tbody>
            {selectedItems.map((item, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2">{item.quantity}</td>
                <td className="px-4 py-2">{item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="mt-6 space-x-4">
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => {
            // Placeholder for QR code creation logic
            alert('QR code creation coming soon!');
          }}
        >
          Create QR
        </button>
        <button
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={convertTableToImage}
        >
          Download as Image
        </button>
        <button
          className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          onClick={handleImageUpload}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload to Cloudinary'}
        </button>
      </div>
      {uploadedUrl && (
        <div className="mt-4">
          <p className="text-sm text-gray-600">Image uploaded successfully!</p>
          <a 
            href={uploadedUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            View uploaded image
          </a>
        </div>
      )}
    </div>
  );
};

export default Page2;
