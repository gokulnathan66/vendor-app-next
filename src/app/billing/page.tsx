"use client"
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const Page2 = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const data = searchParams.get('data');
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Generated Bill</h2>
      {selectedItems.length === 0 ? (
        <div>No items found.</div>
      ) : (
        <table className="w-full table-auto bg-white shadow-md rounded-lg">
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
      <button
        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => {
          // Placeholder for QR code creation logic
          alert('QR code creation coming soon!');
        }}
      >
        Create QR
      </button>
    </div>
  );
};

export default Page2;
