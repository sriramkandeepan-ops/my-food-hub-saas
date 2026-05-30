// src/app/layout.tsx
import React from "react";
import "./globals.css"; // Ensure global Tailwind utility classes are imported

export const metadata = {
  title: "MyFoodHub - Takeaway SaaS Engine",
  description: "Production-grade defensive calculation and input boundary validation system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}