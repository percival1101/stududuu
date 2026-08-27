import * as React from "react";
import { Link } from "@/i18n/routing";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  href?: string;
}

export function LogoIcon({ className = "h-11 w-auto" }: { className?: string }) {
  return (
    <img
      src="/stududu-icon-user.png"
      alt="Stududu Icon"
      className={`object-contain ${className}`}
    />
  );
}

export function Logo({
  className,
  iconOnly = false,
  size = "md",
  href = "/discover",
}: LogoProps) {
  const heightClass = {
    sm: "h-11",
    md: "h-[54px]",
    lg: "h-20",
  }[size];

  const logoContent = iconOnly ? (
    <img
      src="/stududu-icon-user.png"
      alt="Stududu Icon"
      className={`${heightClass} w-auto object-contain ${className || ""}`}
    />
  ) : (
    <img
      src="/stududu-logo-user.png"
      alt="Stududu — Speak global, connect local."
      className={`${heightClass} w-auto object-contain ${className || ""}`}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {logoContent}
      </Link>
    );
  }

  return <div className="inline-flex items-center">{logoContent}</div>;
}

