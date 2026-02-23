import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import Breadcrumb from "./Breadcrumb";
import CTASection from "./CTASection";
import paterbrown from "@/assets/pater-brown-logo.png";
import heroBackground from "@/assets/hero-background.jpg";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface LandingLayoutProps {
  children: ReactNode;
  breadcrumbs: BreadcrumbItem[];
  showCTA?: boolean;
}

const LandingLayout = ({
  children,
  breadcrumbs,
  showCTA = true,
}: LandingLayoutProps) => (
  <div className="min-h-screen flex flex-col">
    {/* Hero Header */}
    <div
      className="relative bg-cover bg-top bg-no-repeat min-h-[300px]"
      style={{
        backgroundImage: `url(${heroBackground})`,
        backgroundPositionY: "clamp(-200px, -15vw, 0px)",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      <div className="relative container mx-auto px-6 py-4">
        <Link
          to="/"
          className="inline-block hover:opacity-80 transition-opacity"
        >
          <img
            src={paterbrown}
            alt="Pater Brown Logo"
            className="h-[84px] w-auto"
          />
        </Link>
      </div>
    </div>

    {/* Content */}
    <main className="flex-1 bg-background py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        <Breadcrumb items={breadcrumbs} />

        <div className="premium-card p-8 md:p-12">
          {children}
        </div>

        {showCTA && <CTASection />}
      </div>
    </main>

    <Footer />
  </div>
);

export default LandingLayout;
