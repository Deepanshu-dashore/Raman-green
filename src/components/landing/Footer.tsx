import Link from "next/link";
import { Icon } from "@iconify/react";

const exploreLinks = [
  { label: "Provenance", href: "/about" },
  { label: "Sustainability", href: "/about" },
  { label: "Lab Reports", href: "/about" },
];

const supportLinks = [
  { label: "Shipping", href: "/contact" },
  { label: "Wholesale", href: "/contact" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-cream border-t border-cream-dark/40">
      <div className="max-w-[1280px] mx-auto px-5 md:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand column */}
          <div className="md:col-span-2">
            <h3 className="font-playfair text-2xl font-bold text-forest mb-3">Raman Green</h3>
            <p className="text-sm text-charcoal/70 leading-relaxed max-w-xs font-inter">
              Cultivating Heritage, Defining Wellness. Delivering
              the finest organic seeds, crops, and dry foods
              straight from our sustainable farms to your table.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded border border-charcoal/15 flex items-center justify-center hover:bg-forest hover:text-white hover:border-forest transition-all">
                <Icon icon="lucide:instagram" className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded border border-charcoal/15 flex items-center justify-center hover:bg-forest hover:text-white hover:border-forest transition-all">
                <Icon icon="lucide:facebook" className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-inter text-xs font-semibold uppercase tracking-[0.1em] text-charcoal/50 mb-4">Explore</h4>
            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm font-inter text-charcoal/70 hover:text-forest transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-inter text-xs font-semibold uppercase tracking-[0.1em] text-charcoal/50 mb-4">Support</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm font-inter text-charcoal/70 hover:text-forest transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-charcoal/8 py-5">
        <div className="max-w-[1280px] mx-auto px-5 md:px-16 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-inter text-charcoal/40">
            © {new Date().getFullYear()} Raman Green. Cultivating Heritage, Defining Wellness.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs font-inter text-charcoal/40 hover:text-charcoal transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs font-inter text-charcoal/40 hover:text-charcoal transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
