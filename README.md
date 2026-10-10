# PharmaTrace-ES: Web3 Frontend Application

A Next.js 14 (App Router) + Tailwind CSS frontend interface for pharmaceutical traceability, Web3 attestation signing, and public proof verification.

---

##  Features

* **Hero Landing Page (`app/page.tsx`)**: High-impact introduction to Event Sourcing and Web3 blockchain attestation.
* **Interactive Dashboard (`app/dashboard/page.tsx`)**:
  * **Batch Management**: Register new pharmaceutical drugs and batches.
  * **Saga Lifecycle Engine**: Trigger state-validated custody transitions (`MANUFACTURED` -> `QUALITY_CHECKED` -> `PACKAGED` -> `SHIPPED` -> `RECEIVED` -> `DISTRIBUTED`).
  * **Digital Wallet Attestations**: Sign transfers with MetaMask (EIP-191) and view immutable anchors.
  * **GitHub Audit & Trace**: Associate pull requests and commits with contribution/custody claims.
* **Public Proof Explorer (`app/verify/page.tsx`)**: Publicly inspect any SHA-256 event hash, on-chain transaction anchor, signer address, and validity state.

---

##  Project Structure

```text
pharma-trace-frontend/
├── app/
│   ├── dashboard/page.tsx             # Interactive Batch, Saga & Attestation Dashboard
│   ├── verify/page.tsx                # Step 5 Public Verification Page
│   ├── globals.css                    # Tailwind CSS Design System
│   ├── layout.tsx                     # App Root Layout
│   └── page.tsx                       # Landing Hero Page
├── components/
│   └── navigation.tsx                 # Responsive Header with MetaMask Wallet Connect
├── lib/
│   ├── api.ts                         # Axios client for NestJS Backend
│   └── web3.ts                        # Ethers.js Wallet Connection & EIP-191 Signer
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

##  Setup & Execution

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
npm run start
```
*Frontend runs on `http://localhost:3000` (or `http://localhost:3001` if backend uses port 3000)*
