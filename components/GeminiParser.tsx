'use client';
import React, { createContext, useContext, useState } from 'react';

interface GroceryItem {
  item: string;
  quantity_kg: number | null;
  price: number | null;
}

interface GeminiResponse {
  result?: string;
  error?: string;
}

interface GroceryContextType {
  items: GroceryItem[];
  setItems: (items: GroceryItem[]) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const GroceryContext = createContext<GroceryContextType | undefined>(undefined);

export function GroceryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <GroceryContext.Provider value={{ items, setItems, isProcessing, setIsProcessing, error, setError }}>
      {children}
    </GroceryContext.Provider>
  );
}

export function useGrocery() {
  const context = useContext(GroceryContext);
  if (context === undefined) {
    throw new Error('useGrocery must be used within a GroceryProvider');
  }
  return context;
}

const systemPrompt = `You are an intelligent assistant that processes unorganized, messy, or free-form grocery or shopping list text and extracts a structured list of items.

For any given input, identify each item mentioned, its corresponding weight (preferably in kilograms or convert from grams if needed), and its price (in rupees or other currency if provided).

🎯 Your output must be a structured JSON list with the following keys:
    "item": the name of the product
    "quantity_kg": weight in kilograms (convert units if necessary)
    "price": numeric price value (in INR or specified currency)

🔄 If a unit is in grams, convert it to kilograms. If no price is mentioned, return "price": null. If no quantity is given, return "quantity_kg": null.

IMPORTANT: Your response must be a valid JSON array of objects. Do not include any additional text or explanation.`;

export async function parseGroceryList(userText: string): Promise<GroceryItem[]> {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt: systemPrompt,
        userText 
      }),
    });

    const data: GeminiResponse = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to process the request');
    }

    if (!data.result) {
      throw new Error('No result received from the API');
    }

    // Clean the response string to ensure it's valid JSON
    let cleanedResult = data.result.trim();
    
    // If the response is wrapped in markdown code blocks, remove them
    cleanedResult = cleanedResult.replace(/```json\n?|\n?```/g, '');
    
    // If the response starts with a newline or whitespace, remove it
    cleanedResult = cleanedResult.replace(/^\s+/, '');
    
    // Try to parse the cleaned result
    try {
      const parsedResult = JSON.parse(cleanedResult);
      
      // Validate the structure of each item
      if (!Array.isArray(parsedResult)) {
        throw new Error('Response is not an array');
      }

      return parsedResult.map(item => ({
        item: String(item.item || ''),
        quantity_kg: item.quantity_kg !== undefined ? Number(item.quantity_kg) : null,
        price: item.price !== undefined ? Number(item.price) : null
      }));
    } catch (parseError) {
      console.error('Parse error:', parseError);
      console.error('Raw response:', data.result);
      throw new Error('Failed to parse the response as JSON');
    }
  } catch (error) {
    console.error('Error parsing grocery list:', error);
    throw error;
  }
}

// Example usage:
// const groceryList = "2 kg rice for 120 rupees\n500g sugar at 45";
// const result = await parseGroceryList(groceryList);
// console.log(result);
