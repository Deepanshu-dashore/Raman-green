import React from "react";

// Philosophy pillars
export const pillars = [
  {
    icon: "lucide:sprout",
    title: "Heritage Provenance",
    desc: "Sourced directly from native Indian soils where traditional crop stewardship preserves the natural biodiversity and lineage of every seed.",
  },
  {
    icon: "lucide:shield-check",
    title: "Glyphosate-Free Purity",
    desc: "Rigorous independent laboratory verification ensures zero glyphosate residue, chemical fertilizers, or toxic weedicides touch our crops.",
  },
  {
    icon: "lucide:settings",
    title: "Cold-Processing Precision",
    desc: "Processed in state-of-the-art clean-rooms with low-impact machinery and strict temperature controls to preserve living nutrients.",
  },
  {
    icon: "lucide:heart",
    title: "Regenerative Farming",
    desc: "We prioritize soil health, natural water conservation, and community partnerships to leave the land richer than we found it.",
  },
];

// Timeline steps
export const timelineSteps = [
  {
    year: "Indigenous Sourcing",
    title: "Tribal Millet Cultivation",
    desc: "We source authentic Kodo and Kutki millets directly from tribal farming communities in the Mandla and Dindori districts of Madhya Pradesh, preserving native crop heritage.",
    image: "/millet_farmers_harvest.png",
  },
  {
    year: "Regenerative Care",
    title: "Nurturing Indian Soils",
    desc: "Our farmers grow millets using traditional organic practices free from synthetic chemical inputs, maintaining soil biology and conserving local water tables.",
    image: "/botanical_crop_warm.png",
  },
  {
    year: "Processing Precision",
    title: "Nutrient-Rich Flour & Snacks",
    desc: "Millets are carefully milled and baked in hygienic, GMP-compliant facilities to produce healthy, fiber-rich alternatives to refined flour (maida) products.",
    image: "/category_crops.png",
  },
  {
    year: "Value Addition",
    title: "Premium Millet Cookies",
    desc: "We transform wholesome ancient grains into delicious products like our signature millet cookies and snacks, linking local artisans directly to modern retail markets.",
    image: "/millet_cookies_showcase.png",
  },
];

// Switcher sections
export const tabs = [
  {
    id: "roots",
    label: "Our Roots",
    title: "An AISECT & CVRU Social Initiative",
    content: (
      <div className="space-y-4 text-sm md:text-base leading-relaxed text-charcoal/70">
        <p>
          Raman Greens is an ecological and health-focused initiative launched by the <strong>AISECT Group</strong>.
          Our brand is built with the goal of bringing nutrition-packed, traditional Indian grains back into the 
          daily diet while creating sustainable economic opportunities in rural India.
        </p>
        <p>
          Through a close collaboration with academic researchers and experts at <strong>Dr. C.V. Raman University (CVRU)</strong>,
          we combine scientific processing methodologies with grassroots agricultural wisdom to formulate high-quality,
          wholesome food alternatives.
        </p>
      </div>
    ),
    icon: "lucide:leaf",
  },
  {
    id: "standards",
    label: "Our Standards",
    title: "Purity & Nutritional Value",
    content: (
      <div className="space-y-4 text-sm md:text-base leading-relaxed text-charcoal/70">
        <p>
          By substituting refined flours (maida) with nutrient-rich millets, we create snacks that are high in fiber,
          minerals, and slow-release proteins. Our facilities adhere strictly to Good Manufacturing Practices (GMP) 
          and food safety protocols.
        </p>
        <p>
          Every batch of Kodo and Kutki millets is carefully cleaned, dehulled, and stone-ground under temperature-controlled 
          conditions to ensure that they retain their raw dietary fibers and vital micronutrients from field to plate.
        </p>
      </div>
    ),
    icon: "lucide:clipboard-list",
  },
  {
    id: "community",
    label: "Our Farmers",
    title: "Empowering Tribal Millets Farmers",
    content: (
      <div className="space-y-4 text-sm md:text-base leading-relaxed text-charcoal/70">
        <p>
          Sustainable agriculture is impossible without sustaining the people who tend to the earth.
          Raman Greens works hand-in-hand with tribal farmers in Madhya Pradesh’s tribal belt, providing them
          with capacity building, organic cultivation training, and crucial direct-to-consumer market linkages.
        </p>
        <p>
          This value chain guarantees fair prices directly to the farmers, cutting out middlemen, improving farm-gate 
          livelihoods, and supporting local tribal economies with every pack of Raman Greens cookies purchased.
        </p>
      </div>
    ),
    icon: "lucide:users",
  },
];
