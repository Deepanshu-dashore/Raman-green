import Footer from "./Footer";
import Navbar from "./Navbar";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="storefront flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
