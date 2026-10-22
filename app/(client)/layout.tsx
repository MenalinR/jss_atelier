import type { Metadata } from "next";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {ClerkProvider} from "@clerk/nextjs";
import localFont from "next/font/local";
import { isAdmin } from "@/lib/admin";
import CartOwnerSync from "@/components/CartOwnerSync";

const raleway = localFont({
  src: "../fonts/Raleway.woff2",
  variable: "--font-raleway",
  weight: "100 900"
});

export const metadata: Metadata = {
  title: "JSS Ecommerce app",
  description: "An ecommerce app for selling purposes",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin = await isAdmin();
  return (
    <ClerkProvider>
      <html lang="en">
      <body
        className={`${raleway.variable}antialiased`}
      >
        {admin && (
          <div className="bg-brand-900 text-white text-xs font-semibold text-center py-1.5">
            Admin mode – use the ✎ buttons to edit the website
          </div>
        )}
        <CartOwnerSync />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
    </ClerkProvider>
  );
}
