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
    default: "Madui — Comunidad Emprendedora de Zibatá",
    template: "%s | Madui",
  },
  description:
    "Descubre emprendedores locales verificados en Zibatá, Querétaro. Productos, servicios y ofertas exclusivas de tu comunidad.",
  keywords: [
    "Madui",
    "Zibatá",
    "emprendedores",
    "comunidad",
    "Querétaro",
    "comercio local",
    "ofertas",
  ],
  authors: [{ name: "Madui" }],
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Madui",
    title: "Madui — Comunidad Emprendedora de Zibatá",
    description:
      "Descubre emprendedores locales verificados en Zibatá, Querétaro.",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Madui",
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
