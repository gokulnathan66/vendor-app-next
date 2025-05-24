'use client';

import { useState } from 'react';

const ITEMS = ['Item A', 'Item B', 'Item C', 'Item D'];

export default function ItemsPage() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleAddItem = (item: string) => {
    setSelectedItems(prev => [...prev, item]);
  };

  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <div className="flex space-x-8">
        
        {/* Section 1: Button List */}
        <section className="w-1/3 space-y-4">
          <h2 className="text-2xl font-bold mb-4">Select an Item</h2>
          <div className="space-y-4">
            {ITEMS.map((item, index) => (
              <button
                key={index}
                className="w-full py-6 text-xl font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={() => handleAddItem(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* Section 2: Table */}
        <section className="flex-1">
          <h2 className="text-2xl font-bold mb-4">Selected Items</h2>
          <table className="w-full table-auto bg-white shadow-md rounded-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Item Name</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.length === 0 ? (
                <tr>
                  <td className="px-4 py-4" colSpan={2}>
                    No items added yet.
                  </td>
                </tr>
              ) : (
                selectedItems.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{item}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
