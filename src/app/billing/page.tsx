"use client"
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import UPIQRCode from '../../../components/CreateQR';

const Page2 = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const data = searchParams?.get('data');
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
  const [isShortening, setIsShortening] = useState(false);
  const [showQR, setShowQR] = useState(false);
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
        return image;
      } catch (error) {
        console.error('Error converting table to image:', error);
        return null;
      }
    }
    return null;
  };

  const handleDownloadImage = async () => {
    const imageData = await convertTableToImage();
    if (imageData) {
      const link = document.createElement('a');
      link.download = 'bill.png';
      link.href = imageData;
      link.click();
    }
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

  const shortenUrl = async (longUrl: string) => {
    try {
      setIsShortening(true);
      console.log('Sending URL to shorten:', longUrl);
      
      const response = await fetch('/api/shortentinly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ longUrl }),
      });

      const data = await response.json();
      console.log('Shorten URL response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to shorten URL');
      }

      if (!data.shortUrl) {
        throw new Error('No shortened URL received');
      }

      setShortenedUrl(data.shortUrl);
      return data.shortUrl;
    } catch (error: any) {
      console.error('Error shortening URL:', error);
      alert(`Failed to shorten URL: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setIsShortening(false);
    }
  };

  const handleImageUpload = async () => {
    const imageData = await convertTableToImage();
    if (imageData) {
      const cloudinaryUrl = await uploadToCloudinary(imageData);
      if (cloudinaryUrl) {
        // Automatically shorten the URL after successful upload
        await shortenUrl(cloudinaryUrl);
        alert('Image uploaded and URL shortened successfully!');
      }
    }
  };

// create QR code 

  const handleGenerateQR = async () => {
    try {
      // Step 1: Convert table to image
      const imageData = await convertTableToImage();
      if (!imageData) {
        alert('Failed to generate image from table');
        return;
      }

      // Step 2: Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(imageData);
      if (!cloudinaryUrl) {
        alert('Failed to upload image to Cloudinary');
        return;
      }

      // Step 3: Shorten URL
      const shortUrl = await shortenUrl(cloudinaryUrl);
      if (!shortUrl) {
        alert('Failed to shorten URL');
        return;
      }

      // Step 4: Show QR code
      setShowQR(true);
      alert('QR code generated successfully!');
    } catch (error) {
      console.error('Error in QR generation process:', error);
      alert('Failed to generate QR code. Please try again.');
    }
  };

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
          onClick={handleGenerateQR}
        >
          Generate QR
        </button>
        <button
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={handleDownloadImage}
        >
          Download as Image
        </button>
        <button
          className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          onClick={handleImageUpload}
          disabled={isUploading || isShortening}
        >
          {isUploading ? 'Uploading...' : isShortening ? 'Shortening URL...' : 'Upload to Cloudinary'}
        </button>
      </div>
      {(uploadedUrl || shortenedUrl) && (
        <div className="mt-4 space-y-2">
          {uploadedUrl && (
            <div>
              <p className="text-sm text-gray-600">Original URL:</p>
              <a 
                href={uploadedUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {uploadedUrl}
              </a>
            </div>
          )}
          {shortenedUrl && (
            <div>
              <p className="text-sm text-gray-600">Shortened URL:</p>
              <a 
                href={shortenedUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-600 hover:underline"
              >
                {shortenedUrl}
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shortenedUrl);
                  alert('URL copied to clipboard!');
                }}
                className="ml-2 px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
              >
                Copy
              </button>
            </div>
          )}
        </div>
      )}
      {showQR && shortenedUrl && (
        <div className="mt-6 p-4 border rounded-lg bg-white shadow-sm">
          <UPIQRCode
            upiId="kevinkrahul1878-3@okicici" // Replace with actual UPI ID
            name="Kevin Rahul" // Replace with actual vendor name
            // amount={selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
            amount={1}
            note={`Bill Link: ${shortenedUrl}`}
          />
        </div>
      )}
    </div>
  );
};

export default Page2;
