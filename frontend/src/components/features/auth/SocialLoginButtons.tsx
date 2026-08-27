"use client";

import * as React from "react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { GoogleSignInButton } from "./GoogleSignInButton";

interface SocialLoginButtonsProps {
  t: any;
  handleGoogleClick: () => void;
}

export function SocialLoginButtons({ t, handleGoogleClick }: SocialLoginButtonsProps) {
  return (
    <>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs font-semibold uppercase tracking-wider">
          <span className="bg-background px-3 text-muted">{t("common.or")}</span>
        </div>
      </div>

      <GoogleSignInButton t={t} label={t("login.google")} />

      <div className="mt-7 text-center text-xs sm:text-sm text-muted font-medium">
        {t("login.no_account")}{" "}
        <Link href="/register" className="font-bold text-primary hover:underline ml-1">
          {t("login.register_link")}
        </Link>
      </div>
    </>
  );
}
