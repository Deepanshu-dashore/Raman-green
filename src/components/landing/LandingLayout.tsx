import { Suspense } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="storefront flex flex-col min-h-screen">
      <Suspense fallback={<div className="h-16" />}>
        <Navbar />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
