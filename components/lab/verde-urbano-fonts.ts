// Display fonts for the Verde Urbano lab demo. Loaded once, self-hosted via
// next/font (no runtime Google Fonts request, no CLS) to match the site's
// font strategy. Exposed as CSS variables scoped to the lab root element, so
// the rest of the site keeps its own type system untouched.
//
// Import this ONLY from the server page components (next/font lives at the
// server boundary); the class string is passed down to the client view.
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--vu-font-display",
  weight: ["400", "500", "600", "700", "800"],
});

const hanken = Hanken_Grotesk({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--vu-font-text",
  weight: ["400", "500", "600", "700", "800"],
});

/** Apply to the lab root element; children inherit the two CSS variables. */
export const verdeFontClass = `${bricolage.variable} ${hanken.variable}`;
