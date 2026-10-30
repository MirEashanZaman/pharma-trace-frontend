# PharmaTrace-ES: Web3 Enterprise Frontend Client

PharmaTrace-ES Frontend is a responsive Next.js 14 (App Router) web application designed for pharmaceutical supply chain traceability, decentralized custody attestation, carrier collateral staking, and regulatory compliance inspection.

The interface is built with Tailwind CSS, DaisyUI, and shadcn/ui primitives following the Midnight Navy / Neon Teal design system (`#0B1220`, `#00D6B4`, `#243247`, `#172638`).

---

## Enterprise Portals and Features

### 1. Public Drug Authenticity Verification (`/verify`)
* Real-time verification of pharmaceutical serial numbers and SHA-256 cryptographic attestation hashes.
* Integrated camera QR scanner with simulated scanner audio and haptic sensory feedback.
* Sample quick-fill test pills for instant evaluation (`SN-2026-AMOX500`, `SN-2026-INSULIN`, `DRUG-001`, `DRUG-002`).
* Automated fallback resolution for catalog-registered batches with pending custody transitions.
* Multi-format compliance dossier export engine supporting PDF, CSV, and raw JSON regulatory audit downloads.

### 2. Enterprise Operations Dashboard (`/dashboard`)
* Real-time telemetry monitoring displaying reefer temperature, relative humidity, and transit waypoints.
* Dual-custody hospital dispense terminal requiring physician prescription and pharmacist verification signatures.
* Administrative compliance console with live search, role filtering, warning issuance, and temporary account disabling.
* Mutual administrative protection safeguards preventing actions against fellow administrator accounts.
* Compensating Saga custody handovers (`MANUFACTURED` -> `SHIPPED` -> `RECEIVED` -> `DISPENSED` -> `RECALLED`).

### 3. User Identity and Profile Management (`/profile`)
* Displays active administrative warnings and compliance review notices.
* Unique and immutable email identity protection preventing unauthorized email address alterations.
* Fixed supply chain role enforcement locking role assignments post-registration.
* Form inputs with standardized `Enter your...` descriptive guidance across name, organization, wallet, and password fields.

### 4. Carrier Collateral Staking and Slashing (`/staking`)
* Collateralized ERC-20 security deposit staking for accredited cold-chain logistics carriers.
* Multi-sensor consensus evaluation evaluating temperature breach criteria.
* Autonomous slashing mechanisms executing on-chain indemnity transfers to pharmaceutical manufacturers.

### 5. Parametric Delivery Escrow and Keepers (`/escrow`)
* Delivery-versus-payment (DvP) escrow engine holding commercial settlement funds.
* Configurable cold-chain boundaries (minimum and maximum temperature thresholds).
* Chainlink Automation 2.0 relayer integration (`checkUpkeep` / `performUpkeep`).

### 6. Regulatory Timelock Governance (`/governance`)
* OpenZeppelin TimelockController multi-signature governance interface.
* Threshold guardian node validation representing international authorities (FDA, EMA, WHO).
* Timelock delay enforcement for emergency product recalls and directive execution.

### 7. Digital Twin Authentication and Dispensing (`/dispense`)
* GS1-128 and 2D DataMatrix barcode parsing (GTIN AI 01, Serial AI 21).
* Dynamic NFC validation simulating NTAG 424 DNA AES-128 CMAC cryptography.
* ERC-721 physical-digital twin burn-on-dispense mechanics preventing counterfeit package recirculation.

### 8. Interactive Provenance DAG Visualizer (`/provenance`)
* Interactive vector directed acyclic graph (DAG) rendering custody handovers.
* Pan, zoom, fit-to-view controls, and animated edge flows illustrating transfer states.
* Dual-mode visualization: Custody Handover Lineage and GS1 EPCIS 2.0 Packaging Aggregation Tree.

### 9. Immutable Cryptographic Ledger (`/ledger`)
* Server-Side Rendered (SSR) cryptographic hash-chain inspection table.
* Real-time verification against anchored on-chain Merkle roots with tamper-evident audit markers.

### 10. Regulatory Compliance Matrix (`/standards`)
* Static Site Generated (SSG) regulatory matrix mapping system controls against FDA 21 CFR Part 11, EU GMP Annex 11, WHO TRS 961, and US DSCSA Title II.

---

## Design System Architecture

PharmaTrace-ES adheres strictly to the Midnight Navy / Neon Teal design system across all views:

* **Background Base**: `#0B1220` (Midnight Navy Dark)
* **Surface Card & Panels**: `#172638` (Deep Slate Slate)
* **Borders & Dividers**: `#304257` / `#243247` (Subtle Slate Border)
* **Accent Brand Neon**: `#00D6B4` (Neon Teal Mint)
* **Accent Hover**: `#00b89a` (Teal Darkened)
* **Primary Text**: `#F1F5F9` (Slate 100)
* **Muted Text**: `#94A3B8` (Slate 400)
* **Danger & Alerts**: Rose 500 / Amber 400

---

## Navigation Architecture

The global header in `components/navigation.tsx` implements responsive modular breakpoints:

* **Screen Width >= 1536px (`2xl`)**: Full display of all 10 module links, wallet address badge, user profile badge, and sign-out controls.
* **Screen Width 1280px - 1535px (`xl`)**: Displays 5 primary workflow links and groups secondary modules into a dropdown menu to prevent horizontal viewport overflow.
* **Screen Width < 1280px (`<xl`)**: Consolidates navigation into a responsive slide-out drawer menu.

---

## Project Structure

```text
pharma-trace-frontend/
├── app/
│   ├── catalog/page.tsx               # ISR Dynamic Pharmaceutical Catalog
│   ├── dashboard/page.tsx             # Interactive Custody Dashboard & Admin Console
│   ├── dispense/page.tsx              # GS1 DataMatrix & Twin Burn Terminal
│   ├── escrow/page.tsx                # Parametric Cold-Chain Escrow Portal
│   ├── governance/page.tsx            # Multi-Sig Regulatory Timelock Governance
│   ├── ledger/page.tsx                # SSR Immutable Cryptographic Ledger
│   ├── login/page.tsx                 # Web3 MetaMask & Enterprise JWT Authentication
│   ├── profile/page.tsx               # User Profile & Immutable Role Management
│   ├── provenance/page.tsx            # Directed Acyclic Graph Lineage Visualizer
│   ├── staking/page.tsx               # Carrier Collateral Staking & Slashing
│   ├── standards/page.tsx             # Regulatory Framework Matrix (FDA, EU GMP, WHO)
│   ├── verify/page.tsx                # Public Authenticity Verifier & QR Scanner
│   ├── globals.css                    # Tailwind CSS & DaisyUI Stylesheet
│   ├── layout.tsx                     # Root Application Layout & Metadata
│   └── page.tsx                       # Hero Landing Page
├── components/
│   ├── navigation.tsx                 # Responsive Header with Enterprise Role Badges
│   ├── provenance-dag.tsx             # Interactive SVG Provenance DAG Visualizer
│   └── ui/                            # shadcn/ui Accessible Component Library
├── lib/
│   ├── api.ts                         # Axios API Client SDK with Bearer Interceptor
│   ├── utils.ts                       # Class Name Merge Utility (clsx + tailwind-merge)
│   └── web3.ts                        # Ethers.js Wallet Connection & EIP-191 Signer
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

* Node.js v18+ or v20+
* Running PharmaTrace Backend Service (Port 3500)

### Environment Configuration

Create a `.env.local` file in `pharma-trace-frontend`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3500
```

### Installation and Development

```bash
# Install dependencies
npm install

# Start development server on port 3001
npm run dev -- -p 3001
```

Access the application in your browser at `http://localhost:3001`.

### Production Build

```bash
# Build optimized production bundle
npm run build

# Start production server
npm run start -- -p 3001
```

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for full details.
