// src/lib/db.ts

export interface Product {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export const PRODUCT_REGISTRY: Record<string, Product> = {
  "item_1": { id: "item_1", name: "Classic Cheeseburger", price: 299, isAvailable: true },
  "item_2": { id: "item_2", name: "Peri-Peri Chicken Pizza", price: 449, isAvailable: true },
  "item_3": { id: "item_3", name: "Truffle Parmesan Fries", price: 189, isAvailable: true },
  "item_4": { id: "item_4", name: "Matcha Latte (Sold Out)", price: 159, isAvailable: false }, // Adversarial Test Target
};

// Global in-memory state tracking for idempotency keys to defeat repeated payment calls
export const processedPayments = new Set<string>();