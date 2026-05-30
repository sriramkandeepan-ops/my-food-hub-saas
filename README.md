# FOODHUB™ SaaS — Takeaway Order & Payment System

A minimal, highly resilient, and fully automated takeaway SaaS system built with Next.js, React, Node.js, and TypeScript. The application is designed with a **Zero-Trust Server-Side Architecture** to enforce complete transactional integrity against client-side tampering, payload manipulation, and unauthorized API exploitation.

**Deployed Production URL:** [https://my-food-hub.vercel.app](https://my-food-hub.vercel.app)  
**Access Matrix:** Public, Unauthenticated (Evaluation/Demo Space)

---

## 🛠️ Architecture & Core Stack
The application splits concerns across isolated layers to ensure deterministic testability and extreme resilience under direct API scrutiny:
* **Frontend/UI:** Next.js (App Router) + React + Tailwind CSS
* **Styles Engine:** `src/globals.css` (Houses core global styles, Tailwind directives, and responsive layout tokens)
* **Deployment Engine:** Vercel Global Edge Network
* **Backend Layer:** Serverless API Routes / Next-Express paradigms
* **Validation Core:** Zod (Runtime type casting and parameter boundary defense)
* **Testing Infrastructure:** * **Unit Tests:** Vitest / Jest (Pure business math, calculation precision, and mock gateway states)
    * **Integration Tests:** Supertest (Direct API schema contract enforcement)
    * **End-to-End Tests:** Playwright (Deterministic cross-browser checkout automation)
    * **CI Pipeline:** GitHub Actions

---

## 🛠️ Environmental Reporting Metrics
* **App Version:** 1.0.0
* **Base Currency Model:** INR (₹)
* **Primary Validation Engine:** Server-side calculation verification (Client inputs are treated as untrusted)
* **Playwright Test Suites Count:** 2 Test Specs (Totaling 2 core execution assertions)
* **Supported Browser Footprint:** Chromium, Firefox, WebKit

---

## 🧭 Input Boundary & Defenses Matrix
This system treats the client interface as entirely hostile. Direct `curl` attacks or manipulated payloads are handled as follows:

| Input Boundary | Validated Elements | Trusted Elements (Accepted Risks) |
| :--- | :--- | :--- |
| **UI $\rightarrow$ API** | • Strict parameter type shape.<br>• Quantities must be positive integers (Zod rules drop decimals/negatives).<br>• Menu item execution availability. | **None.** Item names and prices sent from the client are completely ignored. The server performs an internal lookup from the repository source of truth to compute totals. |
| **API $\rightarrow$ Payment** | • Pre-calculated, server-side validated order sums. | • Mock payment gateway status tokens simulating success/decline/timeout states. |
| **API $\rightarrow$ Data Store** | • In-memory validation structural mapping. | • Volatile retention. Data is stored in local volatile memory (trusted only for the execution container life cycle). |

---

## 💻 Local Engineering Validation Setup
1. Clone the repository and install dependencies:
   ```bash
   npm install