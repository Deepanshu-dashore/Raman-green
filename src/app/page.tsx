"use client";

import LandingLayout from "@/components/landing/LandingLayout";
import HeroSection from "@/components/landing/HeroSection";
import CategoryGrid from "@/components/landing/CategoryGrid";
import InstantBanner from "@/components/landing/InstantBanner";
import ProductShowcase from "@/components/landing/ProductShowcase";
import QualitySection from "@/components/landing/QualitySection";
import StoreSection from "@/components/landing/StoreSection";

export default function Home() {
  return (
    <LandingLayout>
      <HeroSection />
      <CategoryGrid />
      <InstantBanner />
      <ProductShowcase />
      <QualitySection />
      <StoreSection />
    </LandingLayout>
  );
}
