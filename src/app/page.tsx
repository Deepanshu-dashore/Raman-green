"use client";

import LandingLayout from "@/components/landing/LandingLayout";
import HeroIntro from "@/components/landing/HeroIntro";
import CategoryGrid from "@/components/landing/CategoryGrid";
import InstantBanner from "@/components/landing/InstantBanner";
import ProductShowcase from "@/components/landing/ProductShowcase";
import NewArrivalsShowcase from "@/components/landing/NewArrivalsShowcase";
import QualitySection from "@/components/landing/QualitySection";
import StoreSection from "@/components/landing/StoreSection";
import { TrustStrip, CertificationsSection } from "@/components/landing/ProofSection";

export default function Home() {
  return (
    <LandingLayout>
      <HeroIntro />
      <CategoryGrid />
      {/* <TrustStrip /> */}
      <InstantBanner />
      <ProductShowcase />
      <NewArrivalsShowcase />
      <QualitySection />
      <CertificationsSection />
      <StoreSection />
    </LandingLayout>
  );
}
