---
name: Modern Botanical
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#434843'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0f0'
  outline: '#737973'
  outline-variant: '#c3c8c1'
  surface-tint: '#4d6453'
  primary: '#061b0e'
  on-primary: '#ffffff'
  primary-container: '#1b3022'
  on-primary-container: '#819986'
  inverse-primary: '#b4cdb8'
  secondary: '#516447'
  on-secondary: '#ffffff'
  secondary-container: '#d4e9c4'
  on-secondary-container: '#576a4c'
  tertiary: '#171815'
  on-tertiary: '#ffffff'
  tertiary-container: '#2b2c29'
  on-tertiary-container: '#94938f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d0e9d4'
  primary-fixed-dim: '#b4cdb8'
  on-primary-fixed: '#0b2013'
  on-primary-fixed-variant: '#364c3c'
  secondary-fixed: '#d4e9c4'
  secondary-fixed-dim: '#b8cdaa'
  on-secondary-fixed: '#101f09'
  on-secondary-fixed-variant: '#3a4c31'
  tertiary-fixed: '#e4e2dd'
  tertiary-fixed-dim: '#c8c6c2'
  on-tertiary-fixed: '#1b1c19'
  on-tertiary-fixed-variant: '#474744'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style

The design system is built on the narrative of "Modern Botanical," a sophisticated bridge between heritage agriculture and contemporary wellness. The target audience consists of health-conscious, affluent consumers who value transparency, quality, and the aesthetic ritual of food preparation. 

The visual style is **Minimalist** with a strong **Editorial** influence. It emphasizes heavy whitespace to evoke a sense of airiness and premium quality, allowing high-resolution product photography of organic textures—seeds, grains, and verdant crops—to serve as the primary visual driver. The UI avoids unnecessary ornamentation, relying on precise typography and a restrained color palette to convey trust and authority in the organic food space.

## Colors

The palette is anchored by **Forest Green** (#1B3022), used for primary branding, navigation, and core calls to action to establish a sense of deep-rooted stability. **Moss Green** (#8FA382) serves as a secondary accent for secondary buttons, success states, and subtle categorizations, grounding the UI in natural tones.

The primary background is a **Warm Cream** (#F9F7F2), which provides a softer, more organic feel than pure white, reducing eye strain and reinforcing the "natural" product positioning. Neutral tones are kept to a high-contrast **Charcoal** (#2C2C2C) for body text to ensure maximum legibility against the cream backdrop.

## Typography

This design system utilizes a high-contrast typographic pairing. **Playfair Display** is reserved for headings and display moments, bringing a literary, premium, and traditional feel to the "Raman Green" heritage. It should be used with tighter letter-spacing in larger formats to maintain a modern editorial edge.

**Inter** handles all functional UI elements, body copy, and data-heavy labels. Its neutral, systematic nature ensures that the interface remains functional and easy to navigate across all device types. Upper-case labels with increased letter-spacing should be used for category browses and small metadata to distinguish them from standard body text.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop to maintain the integrity of the editorial compositions, centering content within a 1280px container. On mobile, the system shifts to a fluid 4-column grid.

Spacing is generous, following an 8px base unit. To achieve the "Modern Botanical" aesthetic, avoid crowding elements; product cards should be separated by large gutters (24px or 32px) to let the photography breathe. Use significant vertical padding (80px to 120px) between homepage sections to reinforce the premium, unhurried shopping experience.

## Elevation & Depth

To maintain a clean, organic feel, this design system avoids heavy drop shadows. Depth is primarily achieved through **Tonal Layers**. 

Surface elevations are created by placing Forest Green or Moss Green containers over the Warm Cream background. When subtle separation is required—such as for a floating cart or navigation bar—use **Low-Contrast Outlines** (1px stroke in a slightly darker cream or muted sage) rather than shadows. If a shadow is absolutely necessary for a modal, use an **Ambient Shadow**: a very large blur (32px+), low opacity (4%), and a slight green tint (#1B3022) to keep it harmonious with the brand colors.

## Shapes

The shape language is **Soft** and restrained. While sharp corners feel too aggressive for a food brand, overly rounded "pill" shapes feel too tech-oriented. A subtle 4px (0.25rem) radius on buttons and 8px (0.5rem) on product cards and images provides a gentle, approachable touch while maintaining the structural rigor of a high-end brand. Icons should use a consistent 1.5px stroke weight with slightly rounded terminals to match the typography.

## Components

### Buttons
Primary buttons use the Forest Green background with Cream text, featuring a subtle hover transition to a slightly desaturated green. Secondary buttons use a Forest Green outline with no fill. All buttons use the `label-md` typographic style for a clear, structured call to action.

### Product Cards
Cards are borderless with a slight tonal shift on hover. They prioritize the image, with the product name in `headline-sm` and price in `body-md`. Category tags (e.g., "Heirloom," "Organic") should appear as small, subtle Moss Green chips with `label-sm` text.

### Input Fields
Fields use a minimal bottom-border only or a very light 1px stroke. The focus state is indicated by a Forest Green border-bottom, avoiding heavy focus rings to maintain the clean aesthetic.

### Lists & Navigation
Navigation links use `label-md` with a simple underline transition. Product lists in the shop view should utilize a staggered grid to mimic the feel of an upscale food magazine.

### Additional Components
- **Provenance Badges**: Small, circular icons indicating "Direct from Farm" or "Lab Tested" using Moss Green line art.
- **Recipe Cards**: Wide-format cards with a split-screen layout—image on one side, ingredients/steps in Inter on the other.