// src/app/api/orders/route.ts
import { NextResponse } from "next/server";
import { PRODUCT_REGISTRY, processedPayments } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, paymentMethod, idempotencyKey } = body;

    // 1. Validate Idempotency to prevent repeated billing submission attacks
    if (!idempotencyKey || typeof idempotencyKey !== "string") {
      return NextResponse.json({ error: "Missing or invalid idempotencyKey" }, { status: 400 });
    }
    if (processedPayments.has(idempotencyKey)) {
      return NextResponse.json({ error: "Duplicate transaction blocked via Idempotency Engine" }, { status: 409 });
    }

    // 2. Structural Input Validation Layer
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Basket cannot be empty" }, { status: 400 });
    }

    let serverCalculatedSubtotal = 0;
    const validatedItems = [];

    // 3. Sanitization & Adversarial Attack Interception Loop
    for (const inputItem of items) {
      const { id, quantity } = inputItem;

      // Anti-Hacking: Verify Item Exists in Database Registry
      const dbProduct = PRODUCT_REGISTRY[id];
      if (!dbProduct) {
        return NextResponse.json({ error: `Malicious or Invalid Product ID: ${id}` }, { status: 400 });
      }

      // Anti-Hacking: Verify Product is Available (Not Sold Out)
      if (!dbProduct.isAvailable) {
        return NextResponse.json({ error: `Product ${dbProduct.name} is currently sold out` }, { status: 400 });
      }

      // Anti-Hacking: Intercept Negative and Decimal Quantities
      if (!Number.isInteger(quantity) || quantity <= 0) {
        return NextResponse.json({ error: "Quantity manipulation detected. Must be positive integer." }, { status: 400 });
      }

      // Calculations use the SERVER-SIDE price exclusively. Client-sent prices are discarded.
      serverCalculatedSubtotal += dbProduct.price * quantity;
      validatedItems.push({
        id: dbProduct.id,
        name: dbProduct.name,
        price: dbProduct.price,
        quantity
      });
    }

    // 4. Mathematical Calculation Engine
    const taxRate = 0.05; // 5% Flat GST
    const serverCalculatedTax = Math.round(serverCalculatedSubtotal * taxRate);
    const packagingFee = 40; // Fixed delivery/handling markup
    const serverCalculatedTotal = serverCalculatedSubtotal + serverCalculatedTax + packagingFee;

    // 5. Mock Payment Processor Authorization Simulation
    if (!paymentMethod || paymentMethod.type !== "mock_card") {
      return NextResponse.json({ error: "Invalid payment methodology channel" }, { status: 400 });
    }

    // Lock the idempotency token to prevent double-charging
    processedPayments.add(idempotencyKey);

    const transactionId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;

    return NextResponse.json({
      status: "SUCCESS",
      transactionId,
      breakdown: {
        subtotal: serverCalculatedSubtotal,
        tax: serverCalculatedTax,
        packagingFee,
        total: serverCalculatedTotal
      },
      orderedItems: validatedItems
    }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: "Internal Server Processing Error" }, { status: 500 });
  }
}