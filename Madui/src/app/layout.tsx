import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "zibata.services — Directorio de Emprendedores de Zibatá",
    template: "%s | zibata.services",
  },
  description:
    "Descubre emprendedores locales verificados en Zibatá, Querétaro. Productos, servicios y ofertas exclusivas de tu comunidad.",
  keywords: [
    "zibata.services",
    "Zibatá",
    "emprendedores",
    "comunidad",
    "Querétaro",
    "comercio local",
    "ofertas",
  ],
  authors: [{ name: "zibata.services" }],
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "zibata.services",
    title: "zibata.services — Directorio de Emprendedores de Zibatá",
    description:
      "Descubre emprendedores locales verificados en Zibatá, Querétaro.",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "zibata.services",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#2D5A27",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${inter.variable} ${montserrat.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
