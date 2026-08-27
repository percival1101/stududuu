"use client";

import * as React from "react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/features/LanguageSwitcher";
import { Logo } from "@/components/ui/Logo";

export function LandingHeader() {
  const t = useTranslations("home");

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const yOffset = -95; // Offset for sticky navbar height so card is perfectly centered below header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });

      element.classList.remove("sd-blur-motion-active");
      void element.offsetWidth;
      element.classList.add("sd-blur-motion-active");
      setTimeout(() => {
        element.classList.remove("sd-blur-motion-active");
      }, 800);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-border/80 px-4 sm:px-6 lg:px-12 py-3 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Logo size="md" showTagline={true} href="/" />

        {/* Desktop Quick Nav Links with Blur Motion & Perfect Scroll Offset */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-muted">
          <a
            href="#languages"
            onClick={(e) => handleNavClick(e, "languages")}
            className="sd-nav-blur-item hover:text-primary transition-colors cursor-pointer py-1 px-1"
          >
            {t("nav_languages")}
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => handleNavClick(e, "how-it-works")}
            className="sd-nav-blur-item hover:text-primary transition-colors cursor-pointer py-1 px-1"
          >
            {t("nav_how_it_works")}
          </a>
          <a
            href="#features"
            onClick={(e) => handleNavClick(e, "features")}
            className="sd-nav-blur-item hover:text-primary transition-colors cursor-pointer py-1 px-1"
          >
            {t("nav_features")}
          </a>
          <Link
            href="/community"
            className="sd-nav-blur-item hover:text-primary transition-colors py-1 px-1"
          >
            {t("nav_community")}
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <Link href="/login">
            <Button variant="ghost" size="sm" className="font-bold text-xs sm:text-sm px-3">
              {t("login")}
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="sd-btn-gradient font-bold shadow-xs text-xs sm:text-sm rounded-full px-4 sm:px-5">
              {t("register")}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
