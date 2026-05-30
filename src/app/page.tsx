// src/app/page.tsx
"use client";

import React, { useState, useMemo } from "react";

const CLIENT_MENU = [
  { id: "item_1", name: "Classic Cheeseburger", description: "Flame-grilled beef patty, cheddar, lettuce, tomato", price: 299, isAvailable: true },
  { id: "item_2", name: "Peri-Peri Chicken Pizza", description: "Spicy peri-peri chicken, onions, bell peppers", price: 449, isAvailable: true },
  { id: "item_3", name: "Truffle Parmesan Fries", description: "Crispy golden fries tossed in truffle oil", price: 189, isAvailable: true },
  { id: "item_4", name: "Matcha Latte (Sold Out)", description: "Premium stone-ground green tea latte", price: 159, isAvailable: false },
];

export default function FoodHubSaaS() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Generate an idempotency key unique to this active user session footprint
  const sessionIdempotencyKey = useMemo(() => `IDEM-${Math.random().toString(36).substring(2, 11).toUpperCase()}`, [apiResponse]);

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const currentQty = prev[id] || 0;
      const nextQty = currentQty + delta;
      const newCart = { ...prev };
      if (nextQty <= 0) delete newCart[id];
      else newCart[id] = nextQty;
      return newCart;
    });
  };

  // UI Calculation Preview Layer
  const subtotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = CLIENT_MENU.find(m => m.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);
  const tax = Math.round(subtotal * 0.05);
  const deliveryFee = subtotal > 0 ? 40 : 0;
  const total = subtotal + tax + deliveryFee;

  const handleCheckout = async () => {
    setIsProcessing(true);
    setApiError(null);
    setApiResponse(null);

    const payload = {
      idempotencyKey: sessionIdempotencyKey,
      paymentMethod: { type: "mock_card" },
      items: Object.entries(cart).map(([id, quantity]) => ({ id, quantity }))
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transaction declined");
      setApiResponse(data);
      setCart({});
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <header className="max-w-5xl mx-auto mb-8 pb-4 border-b">
        <h1 className="text-3xl font-extrabold text-orange-600">🥡 MyFoodHub SaaS Engine</h1>
        <p className="text-sm text-gray-500">Robust backend calculation validation & anti-tampering demo ecosystem.</p>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <section className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold">Menu Display Layer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CLIENT_MENU.map((item) => (
              <div key={item.id} className={`p-4 bg-white border rounded-xl shadow-sm flex flex-col justify-between ${!item.isAvailable && 'opacity-60'}`}>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="font-bold text-orange-600">₹{item.price}</span>
                  {item.isAvailable ? (
                    <div className="flex items-center space-x-2">
                      {(cart[item.id] || 0) > 0 && (
                        <>
                          <button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-0.5 border rounded bg-gray-100 font-bold">-</button>
                          <span className="font-semibold" data-testid={`qty-${item.id}`}>{cart[item.id]}</span>
                        </>
                      )}
                      <button onClick={() => updateQuantity(item.id, 1)} data-testid={`add-${item.id}`} className="bg-orange-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold">
                        + Add
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-red-500 uppercase tracking-tight">Sold Out</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border rounded-xl p-6 shadow-sm h-fit space-y-4">
          <h2 className="text-xl font-bold border-b pb-2">Your Basket Ledger</h2>
          {Object.keys(cart).length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Basket is empty.</p>
          ) : (
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
              <div className="flex justify-between"><span>GST (5%)</span><span>₹{tax}</span></div>
              <div className="flex justify-between"><span>Packaging Fee</span><span>₹{deliveryFee}</span></div>
              <div className="flex justify-between font-bold text-base text-gray-900 border-t pt-2">
                <span>Total</span><span data-testid="ui-total">₹{total}</span>
              </div>
              <button onClick={handleCheckout} disabled={isProcessing} className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-lg">
                {isProcessing ? "Validating Execution..." : `Pay ₹${total}`}
              </button>
            </div>
          )}

          {apiError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-mono" data-testid="error-banner">
              ⚠️ API Validation Error: {apiError}
            </div>
          )}

          {apiResponse && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-xs space-y-1" data-testid="success-banner">
              <p className="font-bold text-sm">🎉 Auth Status: {apiResponse.status}</p>
              <p className="font-mono text-[10px]">ID: {apiResponse.transactionId}</p>
              <p className="font-semibold text-gray-700">Verified Final Total Charged: ₹{apiResponse.breakdown.total}</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}