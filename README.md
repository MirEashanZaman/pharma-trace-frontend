# PharmaTrace Web3 Enterprise Frontend Client

[![License: MIT](https://img.shields.io/badge/License-MIT-00D6B4.svg)](../LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![DaisyUI](https://img.shields.io/badge/DaisyUI-4.12-570DF8.svg)](https://daisyui.com/)

PharmaTrace Frontend is a responsive Next.js 14 (App Router) web application designed for pharmaceutical supply chain traceability, decentralized custody attestation, carrier collateral staking, and regulatory compliance inspection.

The interface is built with Tailwind CSS, DaisyUI, and accessible component primitives following the Midnight Navy / Neon Teal design system (`#0B1220`, `#00D6B4`, `#243247`, `#172638`).

---

## Enterprise Portals and Features

### 1. Modular Operations Dashboard (`/dashboard`)
* **Real-Time Telemetry & Environmental Monitoring**: Live reefer temperature and relative humidity tracking with out-of-spec excursion alerts via the modular `OverviewTab` component.
* **Smart Contract Telemetry Console**: Telemetry cards powered by `SmartContractTelemetry` providing visibility into Chainlink Automation Upkeep, CCIP Cross-Chain Bridge, Sparse Merkle Tree Rollup, and W3C DID cryptographic anchors.
* **Role-Based Workflows**: Dynamically adapts interface forms and navigation tabs based on the authenticated stakeholder role (**Manufacturer, Distributor, Pharmacy, Regulator, Customer, Admin**).
* **Dual-Custody Hospital Dispense Terminal**: Requires physician prescription registration and pharmacist digital signature verification.
* **Administrative Governance Console**: Live stakeholder search, compliance warning flags, account suspension toggles, and system audit logs.
* **Saga Custody State Transitions**: Real-time management across `MANUFACTURED` -> `SHIPPED` -> `RECEIVED` -> `DISPENSED` -> `RECALLED` lifecycle states.

### 2. Public Drug Authenticity Verification (`/verify`)
* Real-time verification of pharmaceutical serial numbers and SHA-256 cryptographic attestation hashes.
* Integrated camera QR scanner with simulated scanner audio and haptic feedback.
* Sample test pills for instant validation (`SN-2026-AMOX500`, `SN-2026-INSULIN`, `DRUG-001`, `DRUG-002`).
* Multi-format compliance dossier export engine supporting certified PDF, CSV, and raw JSON regulatory audit packages.

### 3. User Identity and Profile Security (`/profile`)
* Displays active administrative warnings and compliance review notices.
* Immutable email identity protection preventing unauthorized identity modifications.
* Fixed supply chain role enforcement locking role assignments post-registration.
* Standardized form ergonomics with descriptive guidance across name, organization, wallet, and password inputs.

### 4. Carrier Collateral Staking and Slashing (`/staking`)
* Collateralized ERC-20 security deposit staking for accredited cold-chain logistics carriers.
* Multi-sensor consensus evaluation assessing temperature breach duration and threshold criteria.
* Autonomous slashing mechanisms executing on-chain indemnity transfers to pharmaceutical manufacturers.

### 5. Parametric Delivery Escrow and Keepers (`/escrow`)
* Delivery-versus-payment (DvP) escrow engine holding commercial settlement funds.
* Configurable cold-chain boundaries (minimum and maximum temperature thresholds).
* Chainlink Automation relayer integration (`checkUpkeep` / `performUpkeep`).

### 6. Regulatory Timelock Governance (`/governance`)
* OpenZeppelin TimelockController multi-signature governance interface.
* Threshold guardian node validation representing international authorities (FDA, EMA, WHO).
* Mandatory timelock delay enforcement for emergency product recalls and directive execution.

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

PharmaTrace adheres strictly to the Midnight Navy / Neon Teal design system across all views:

* **Background Base**: `#0B1220` (Midnight Navy Dark)
* **Surface Card & Panels**: `#172638` (Deep Slate Container)
* **Borders & Dividers**: `#304257` / `#243247` (Subtle Slate Border)
* **Accent Brand Neon**: `#00D6B4` (Neon Teal Mint)
* **Accent Hover**: `#00b89a` (Teal Darkened)
* **Primary Text**: `#F1F5F9` (Slate 100)
* **Muted Text**: `#94A3B8` (Slate 400)
* **Danger & Alerts**: Rose 500 / Amber 400

---

## Navigation Architecture

The global header in `components/navigation.tsx` implements responsive modular breakpoints:

* **Screen Width >= 1536px (`2xl`)**: Full display of primary module links, wallet address badge, user profile badge, and sign-out controls.
* **Screen Width 1280px - 1535px (`xl`)**: Displays primary workflow links and groups secondary modules into a dropdown menu to prevent horizontal viewport overflow.
* **Screen Width < 1280px (`<xl`)**: Consolidates navigation into a responsive slide-out drawer menu.

---

## Getting Started

### Prerequisites
- Node.js >= 20.0.0
- Running PharmaTrace Backend Service (Port 3500)

### Environment Configuration

Copy the example environment template:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:3500
```

### Development Execution

```bash
npm install
npm run dev -- -p 3001
```

Access the application in your browser at `http://localhost:3001`.

### Production Build Verification

```bash
# Compile and verify all static and dynamic routes
npm run build

# Start production server
npm run start -- -p 3001
```

---

## Author & Engineering Credits

Engineered by **Mir Eashan Zaman** as part of the PharmaTrace enterprise platform.

## License

This project is licensed under the MIT License. See [LICENSE](../LICENSE) for details.
