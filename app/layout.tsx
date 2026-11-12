import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClientProviders } from "@/components/client-providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0B1220",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://pharmatrace.enterprise"),
  title: {
    default: "PharmaTrace | Decentralized Pharmaceutical Provenance & GxP Compliance",
    template: "%s | PharmaTrace",
  },
  description: "Enterprise pharmaceutical supply chain traceability, tamper-evident GS1 digital twins, ZK cold-chain verification, and FDA/EMA GxP compliance.",
  applicationName: "PharmaTrace",
  keywords: [
    "pharmaceutical supply chain",
    "cold-chain verification",
    "GS1 digital twin",
    "FDA 21 CFR Part 11",
    "blockchain track and trace",
    "anti-counterfeiting",
    "EVM smart contracts",
  ],
  authors: [{ name: "PharmaTrace Enterprise Consortium" }],
  creator: "PharmaTrace",
  publisher: "PharmaTrace Protocol",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "PharmaTrace | Decentralized Pharmaceutical Provenance",
    description: "Enterprise pharmaceutical supply chain traceability, tamper-evident GS1 digital twins, and cold-chain compliance",
    url: "https://pharmatrace.enterprise",
    siteName: "PharmaTrace",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PharmaTrace | Decentralized Pharmaceutical Provenance",
    description: "Enterprise pharmaceutical supply chain traceability, tamper-evident GS1 digital twins, and cold-chain compliance",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0B1220] text-[#F1F5F9] min-h-screen overflow-x-hidden`}
      >
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
