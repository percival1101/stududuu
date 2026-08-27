"use client";

import * as React from "react";
import { Link } from "@/i18n/routing";
import { GoogleSignInButton } from "./GoogleSignInButton";

interface SocialRegisterButtonsProps {
  t: any;
  handleGoogleClick: () => void;
}

export function SocialRegisterButtons({ t }: SocialRegisterButtonsProps) {
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

      <GoogleSignInButton t={t} label={t("register.google")} />

      <div className="mt-7 text-center text-xs sm:text-sm text-muted font-medium">
        {t("register.has_account")}{" "}
        <Link href="/login" className="font-bold text-primary hover:underline ml-1">
          {t("register.login_link")}
        </Link>
      </div>
    </>
  );
}
