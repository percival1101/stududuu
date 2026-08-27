"use client";

import * as React from "react";
import { LanguageSwitcher } from "@/components/features/LanguageSwitcher";
import { useRegister } from "@/hooks/useRegister";
import { RegisterHeroColumn } from "@/components/features/auth/RegisterHeroColumn";
import { RegisterFormFields } from "@/components/features/auth/RegisterFormFields";
import { SocialRegisterButtons } from "@/components/features/auth/SocialRegisterButtons";
import { Logo } from "@/components/ui/Logo";
import { AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const r = useRegister();

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-background text-foreground relative">
      {/* Brand Hero (Desktop) */}
      <RegisterHeroColumn t={r.t} />

      {/* Register Form Main */}
      <main className="relative flex items-center justify-center px-5 py-12 sm:px-10 lg:px-12">
        <div className="absolute top-5 right-5 z-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-full p-0.5 border border-border/70 shadow-2xs">
            <LanguageSwitcher />
          </div>
        </div>

        <div className="w-full max-w-md py-6">
          {/* Logo on Mobile */}
          <div className="lg:hidden mb-8 flex justify-start">
            <Logo size="md" href="/" />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-foreground">
              {r.t("register.title")}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed">
              {r.t("register.subtitle")}
            </p>
          </div>

          {r.error && (
            <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-200/90 p-4 text-xs sm:text-sm text-rose-800 flex items-start gap-3 shadow-2xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="font-medium leading-relaxed">{r.error}</span>
            </div>
          )}

          <RegisterFormFields
            t={r.t}
            firstName={r.firstName}
            setFirstName={r.setFirstName}
            lastName={r.lastName}
            setLastName={r.setLastName}
            country={r.country}
            handleCountryChange={r.handleCountryChange}
            city={r.city}
            setCity={r.setCity}
            intent={r.intent}
            setIntent={r.setIntent}
            day={r.day}
            setDay={r.setDay}
            month={r.month}
            setMonth={r.setMonth}
            year={r.year}
            setYear={r.setYear}
            gender={r.gender}
            setGender={r.setGender}
            email={r.email}
            setEmail={r.setEmail}
            password={r.password}
            setPassword={r.setPassword}
            saveDraft={r.saveDraft}
            handleRegister={r.handleRegister}
            loading={r.loading}
            isPending={r.isPending}
            days={r.days}
            months={r.months}
            years={r.years}
          />

          <SocialRegisterButtons t={r.t} handleGoogleClick={r.handleGoogleClick} />
        </div>
      </main>

      {/* Email OTP Verification Modal */}
      {r.showOtpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl p-6 sm:p-8 max-w-md w-full border border-border shadow-2xl space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 flex items-center justify-center mx-auto mb-3 border border-teal-200 shadow-2xs font-bold text-lg">
                ✉️
              </div>
              <h3 className="text-xl font-extrabold text-foreground font-display">
                {r.t("auth.otp_title") || "Xác thực mã OTP Email"}
              </h3>
              <p className="text-xs text-muted mt-1.5 leading-relaxed">
                {r.t("auth.otp_desc") || "Mã xác thực 6 số đã được gửi đến email của bạn. Nhập mã OTP bên dưới để hoàn tất đăng ký:"}
              </p>
              <p className="text-xs font-bold text-teal-700 dark:text-teal-300 mt-1">
                {r.email}
              </p>
            </div>

            {r.devOtp && (
              <div className="bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 rounded-2xl p-2.5 text-center text-xs font-mono text-teal-800 dark:text-teal-200">
                Mã OTP (Dev Preview): <span className="font-extrabold text-sm tracking-widest">{r.devOtp}</span>
              </div>
            )}

            <div className="space-y-3">
              <input
                type="text"
                maxLength={6}
                placeholder={r.t("auth.otp_placeholder") || "Nhập 6 số OTP"}
                value={r.otpCode}
                onChange={(e) => r.setOtpCode(e.target.value)}
                className="w-full text-center text-2xl tracking-[8px] font-extrabold py-3 rounded-2xl border border-border bg-background outline-none focus:border-teal-500 font-mono"
              />

              <button
                type="button"
                onClick={r.verifyAndRegister}
                disabled={r.loading || r.otpCode.length < 6}
                className="sd-btn-gradient w-full py-3.5 rounded-full font-bold text-sm text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {r.loading ? r.t("common.loading") : r.t("auth.otp_verify_btn") || "Xác thực Email & Hoàn tất"}
              </button>

              <button
                type="button"
                onClick={() => r.setShowOtpModal(false)}
                className="w-full text-center text-xs font-semibold text-muted hover:text-foreground pt-1 cursor-pointer"
              >
                Hủy & Quay lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
