# PharmaTrace-ES: Web3 Enterprise Frontend Application

A responsive Next.js 14 (App Router) + Tailwind CSS and shadcn/ui frontend interface implementing the Midnight Navy / Neon Teal design system (`#0B1220`, `#00D6B4`, `#243247`, `#172638`) for pharmaceutical supply chain traceability, decentralized escrow, carrier staking, and regulatory timelock governance.

---

## Web3 Portals & Features

* **Carrier Collateral Staking & Bond Portal (`app/staking/page.tsx`)**:
  * ERC-20 collateral deposits and unlocked stake withdrawals.
  * Shipment SLA bond locking linked to manufacturer indemnity beneficiaries.
  * Multi-sensor checkpoint consensus evaluation for automated bond settlement or breach slashing.
* **Cold-Chain Escrow & Chainlink Relayer Portal (`app/escrow/page.tsx`)**:
  * Commercial delivery escrow locking with configurable min/max temperature bands.
  * Chainlink Automation 2.0 relayer monitoring (`checkUpkeep` / `performUpkeep`).
  * ERC-4337 Account Abstraction paymaster gas sponsorship simulation.
* **Multi-Sig Regulatory Governance & Timelock (`app/governance/page.tsx`)**:
  * OpenZeppelin TimelockController multi-signature quorum for regulatory nodes (FDA, EMA, WHO).
  * 2-of-3 guardian signature threshold validation.
  * Timelock delay enforcement for emergency product recalls and directive execution.
* **NFC DNA Verification & Digital Twin Burn (`app/dispense/page.tsx`)**:
  * NTAG 424 DNA dynamic AES-128 CMAC validation.
  * GS1 Digital Link resolver linking 2D data matrix barcodes directly to on-chain credentials.
  * ERC-721 physical-digital twin burn on patient dispensing to eliminate counterfeit recirculations.
* **Interactive Provenance DAG Visualizer (`app/provenance/page.tsx`)**:
  * Vector graph rendering with smooth Bezier links, pan and zoom controls, fit-to-view, and animated edge flow.
  * Dual-view mode: Custody Handover Chain DAG and GS1 EPCIS 2.0 Packaging Aggregation Tree.
* **SSR Immutable Cryptographic Ledger (`app/ledger/page.tsx`)**:
  * Server-side rendered hash-chain verification with real-time on-chain Merkle root validation.
* **ISR Dynamic Pharmaceutical Catalog (`app/catalog/page.tsx`)**:
  * Incremental Static Regeneration catalog displaying verified pharmaceutical batches and serialization parameters.
* **SSG Regulatory Compliance Matrix (`app/standards/page.tsx`)**:
  * Pre-rendered regulatory framework mapping (FDA 21 CFR Part 11, EU GMP Annex 11, WHO TRS 961, US DSCSA Title II).
* **Interactive Custody Dashboard (`app/dashboard/page.tsx`)**:
  * Batch serialization, Saga state validation, and live IoT telemetry stream.
* **Public Authenticity Verifier (`app/verify/page.tsx`)**:
  * Instant consumer and patient authenticity verification using serial numbers or QR codes.

---

## Project Structure

```text
pharma-trace-frontend/
├── app/
│   ├── staking/page.tsx               # Carrier Collateral Staking & Bond Portal
│   ├── escrow/page.tsx                # Cold-Chain Escrow & Chainlink Relayer
│   ├── governance/page.tsx            # Multi-Sig Regulatory Timelock Governance
│   ├── dispense/page.tsx              # NFC DNA Authentication & Digital Twin Burn
│   ├── provenance/page.tsx            # Dedicated Provenance DAG Visualizer
│   ├── ledger/page.tsx                # SSR Immutable Cryptographic Ledger
│   ├── catalog/page.tsx               # ISR Dynamic Pharmaceutical Catalog
│   ├── standards/page.tsx             # SSG Regulatory Compliance Matrix
│   ├── dashboard/page.tsx             # Interactive Batch, Saga & Attestation Dashboard
│   ├── verify/page.tsx                # Public Consumer & Hospital Verification Page
│   ├── login/page.tsx                 # Web3 MetaMask & Enterprise JWT Authentication
│   ├── globals.css                    # Tailwind CSS & shadcn/ui Stylesheet
│   ├── layout.tsx                     # App Root Layout
│   └── page.tsx                       # Hero Landing Page
├── components/
│   ├── navigation.tsx                 # Responsive Header with Enterprise Role Badges
│   ├── provenance-dag.tsx             # Interactive SVG Provenance DAG Visualizer
│   └── ui/                            # shadcn/ui Accessible Component Library
│       ├── alert.tsx                  # Accessible Alert Primitive
│       ├── badge.tsx                  # Neon Teal & Status Badges
│       ├── button.tsx                 # Accessible Button Primitive
│       ├── card.tsx                   # Panel Card & Content Containers
│       ├── dialog.tsx                 # Accessible Modal Dialog
│       ├── dropdown-menu.tsx          # Accessible Dropdown Menu
│       ├── input.tsx                  # Styled Form Input
│       ├── table.tsx                  # Tabular Data Grid
│       └── tabs.tsx                   # Accessible Tab Navigation
├── lib/
│   ├── api.ts                         # Axios Web3 Client SDK for Backend API (Port 3500)
│   ├── utils.ts                       # Class Name Merger Utility (clsx + tailwind-merge)
│   └── web3.ts                        # Ethers.js Wallet Connection & EIP-191 Signer
├── components.json                    # shadcn/ui Configuration
├── tailwind.config.ts                 # Midnight Navy & Neon Teal Design Tokens
├── package.json
└── tsconfig.json
```

---

## Setup & Execution

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev -- -p 3001
```
*Application runs on `http://localhost:3001`.*

### Build for Production
```bash
npm run build
npm run start -- -p 3001
```
