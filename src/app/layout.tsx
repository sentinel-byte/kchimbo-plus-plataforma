import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kchimbo+ | Plataforma Educativa Premium",
  description: "Plataforma educativa premium de Medicina Humana, Ingeniería Civil y ciencias. Estudia a tu propio ritmo con nuestra línea de tiempo interactiva y domina tu carrera.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased`}
      >
        <ToastProvider>
          <div className="flex flex-col min-h-screen">
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
