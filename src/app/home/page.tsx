'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
const ITEMS = [
  { name: "Item A", unitPrice: 10 },
  { name: "Item B", unitPrice: 20 },
  { name: "Item C", unitPrice: 15 },
];

export default function ItemsPage() {
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<{ name: string; unitPrice: number } | null>(null);
  const [inputQuantity, setInputQuantity] = useState(1);
const inputRef = useRef<HTMLInputElement>(null);

const [selectedItems, setSelectedItems] = useState<
  { name: string; quantity: number; price: number ;unitPrice:number}[]
>([]);
const handleAddItem = (item: { name: string; unitPrice: number; quantity: number; price: number }) => {
  setSelectedItems((prev) => [...prev, item]);
};

useEffect(() => {
  if (showModal && inputRef.current) {
    inputRef.current.focus();
  }
}, [showModal]);


const handleQuantityChange = (index: number, newQuantity: number) => {
  setSelectedItems((prev) =>
    prev.map((item, i) =>
      i === index
        ? {
            ...item,
            quantity: newQuantity,
            price: newQuantity * item.unitPrice,
          }
        : item
    )
  );
};





  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <div className="flex">
        
        {/* Section 1: Button List */}
          <section className="w-1/2 pr-4">
            <h2 className="text-2xl font-bold mb-4">Select an Item</h2>
            <div className="grid grid-cols-2 gap-4">
              {ITEMS.map((item, index) => (
                <button
                  key={index}
                  className="w-full py-8 text-xl font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={() => {
                    setCurrentItem(item);
                    setInputQuantity(1);
                    setShowModal(true);
                  }}
                >
                  {item.name}
                </button>

              ))}
            </div>
          </section>


        {/* Section 2: Table */}
<section className="w-1/2 pl-4">
  <h2 className="text-2xl font-bold mb-4">Selected Items</h2>
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
      {selectedItems.length === 0 ? (
        <tr>
          <td className="px-4 py-4" colSpan={4}>
            No items added yet.
          </td>
        </tr>
      ) : (
        selectedItems.map(({ name, quantity, price }, index) => (
          <tr key={index} className="border-t">
            <td className="px-4 py-2">{index + 1}</td>
            <td className="px-4 py-2">{name}</td>
            <td className="px-4 py-2">
              <input
                type="number"
                min={0}
                className="w-20 px-2 py-1 border rounded"
                value={quantity}
                onChange={(e) =>
                  handleQuantityChange(index, Number(e.target.value))
                }
              />
            </td>
            <td className="px-4 py-2">
              <input
                type="number"
                min={0}
                step="0.01"
                className="w-28 px-2 py-1 border rounded"
                value={price}
                readOnly
              />
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
    {/* Sticky Buttons Container */}
    <div className="  mt-4  flex justify-between  ">
      <button
        className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        onClick={() => setSelectedItems([])}
        disabled={selectedItems.length === 0}
      >
        Clear All
      </button>

      <button
        className={`px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${
          selectedItems.length === 0 ? 'opacity-50 pointer-events-none' : ''
        }`}
        aria-disabled={selectedItems.length === 0}
        tabIndex={selectedItems.length === 0 ? -1 : 0}
        disabled={selectedItems.length === 0}
        onClick={() => {
          if (selectedItems.length > 0) {
            window.localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
            window.location.href = '/billing';
          }
        }}
      >
        Generate Bill
      </button>
    </div>
  </section>

{/* Modal for Quantity Input */}

 {showModal && currentItem && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
      <h3 className="text-xl font-semibold mb-4">
        Enter quantity for {currentItem.name}
      </h3>
      <input
        ref={inputRef}
        type="number"
        min={1}
        value={inputQuantity}
        onChange={(e) => setInputQuantity(Number(e.target.value))}
        className="w-full border rounded px-3 py-2 mb-4"
      />
      <div className="flex justify-end space-x-4">
        <button
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          onClick={() => setShowModal(false)}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => {
            handleAddItem({
              name: currentItem.name,
              unitPrice: currentItem.unitPrice,
              quantity: inputQuantity,
              price: inputQuantity * currentItem.unitPrice,
            });
            setShowModal(false);
          }}
        >
          Add Item
        </button>
      </div>
    </div>
  </div>
)}

      </div>
    </main>
  );
}
