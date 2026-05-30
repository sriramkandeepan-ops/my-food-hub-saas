# Technical Health & Risk Assessment Document: MyFoodHub SaaS Engine

This report provides engineering and product leadership with an explicit, defensible evaluation of the MyFoodHub Takeaway SaaS application's risk profile, input security boundaries, architectural guarantees, and automated testing confidence metrics.

---

## 1. Input Boundary Matrix & Trust Policies

Our security engineering model implements a Zero-Trust architecture regarding all client-side payloads. We enforce strict, isolated validation borders at every input boundary point to completely neutralize transaction corruption, price tampering, and API-direct injection attacks:

| Input Boundary Route | Parameter Inspected | Trust Level | Validation Action & Enforcement Mechanic |
| :--- | :--- | :--- | :--- |
| **UI → API Layer** | `price` | **Zero Trust** | **Complete Discard.** The API completely ignores any price data sent by the client. Financial computations look up values exclusively from the internal `PRODUCT_REGISTRY` server-side. |
| **UI → API Layer** | `quantity` | **Zero Trust** | **Domain Type Enforcement.** The payload parameter is evaluated via `Number.isInteger()`. Any decimal, fractional, negative, or zero quantities are blocked immediately with a `400 Bad Request`. |
| **UI → API Layer** | `id` | **Zero Trust** | **Registry Mapping & Stock Auditing.** Checked against our product registry array. Invalid keys or items marked `isAvailable: false` immediately drop out of execution with a target error. |
| **UI → API Layer** | `idempotencyKey` | **Trusted Verification** | **Replay Protection.** Checked against an in-memory `Set` cache. If the unique transaction token has already been executed, the call is blocked with a `409 Conflict`. |
| **API → Payment Gateway** | `serverCalculatedTotal` | **Fully Trusted** | **Isolated Pipe.** The application seals the server-side mathematical product sum, plus a 5% GST tax calculation and flat packaging fee. This final total is sent directly to the mock authorization layer. |

---

## 2. Production Risk Assessment & Technical Gaps

To maintain strict architectural transparency, we separate immediate deployment risks from planned system gaps. Risks outline where the current system can fail under extreme conditions, while gaps define features deliberately omitted from this minimal assessment build.

### 🏢 Production Risks (Prioritized by Impact)
1. **Volatile Memory Cache for Idempotency Tracking**
   - *Risk Context:* Idempotency tokens are tracked using an in-memory runtime `Set` object. 
   - *Impact Scenario:* Because the application is deployed on Vercel's serverless architecture, runtime containers recycle during idle periods or scaling events. A container recycle entirely flushes the idempotency memory cache. If a client attempts a malicious request replay right as a container scales down or splits, the double-charge protection will fail.
2. **Lack of Transactional Database Level Locks (Race Conditions)**
   - *Risk Context:* Product availability checks look up a boolean status field (`isAvailable`) rather than checking active stock counter pools with analytical transaction row locks (`SELECT FOR UPDATE`).
   - *Impact Scenario:* High-concurrency traffic targeting the last remaining quantities of a specific menu item can cause a race condition, letting multiple simultaneous requests pass the availability boundary before the data array state updates.

### 🛠️ Technical Gaps (Intentional Architectural Omissions)
1. **No External Payment Processor Gateway Rail:** The checkout flow utilizes a completely isolated, asynchronous mock loop sequence simulating authorization latency rather than hooking into a live production gateway web-hook webhook (e.g., Stripe, Razorpay).
2. **Ephemeral Database State:** Product models and active transaction states are managed using static, server-side memory records rather than being anchored to a persistent, replicated database cluster (e.g., PostgreSQL, MongoDB).

---

## 3. Engineering Observations & AI Interaction Log

### AI Error Case & Vulnerability Identification
During initial code generation passes, the AI assistant attempted to optimize frontend UI snappiness by computing order subtotals and taxes directly in the React client layer, passing a pre-calculated total field (`clientSideTotal`) straight over the network to the backend payment processing router.

### Engineering Mitigation & Refactoring Sequence
Our automation testing suite caught this architectural vulnerability immediately during pre-deployment verification. By writing a script that bypassed the React UI layer and fired an adversarial `curl` request directly at the endpoint, we confirmed that the backend processing router blindly accepted a manipulated payload containing a custom price of ₹1 for a premium item. 

We immediately fixed this gap by refactoring the codebase:
1. Stripped the backend route of any parameters relying on client-side financial computations.
2. Configured the server to treat client payloads purely as an array of IDs and quantities.
3. Implemented a complete, server-side recalculation engine that queries our isolated product registry to determine totals.

---

## 4. Defensible Verification & Test Suite Matrix

The integrity of this application is defended by an automated, multi-layered verification framework. The system metrics published in our `README.md` and repository headers are completely synced with the real behaviors enforced in production:

* **E2E UI Calculation Accuracy Test:** Asserts that when a user interacts with the UI (e.g., setting an item quantity to 2), the localized interface calculation exactly predicts the server-side invoice total (₹668.00).
* **Direct Boundary Injection Test:** Asserts that manual `curl` requests trying to inject a negative integer (`-999`) directly into the API route are intercepted, returning a `400 Bad Request` message matching our specifications.