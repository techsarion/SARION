/**
 * Marketing site navigation data.
 * Edit links here — never inline in Navbar/Footer components.
 */
export interface NavLink {
  label: string;
  href: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Portal Demo", href: "/portal-demo" },
];

/** Product column in the footer. */
export const PRODUCT_LINKS: NavLink[] = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Portal Demo", href: "/portal-demo" },
];

/** Legal column in the footer. */
export const LEGAL_LINKS: NavLink[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

/** Company / contact column in the footer. */
export const COMPANY_LINKS: NavLink[] = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Log in", href: "/login" },
];
