"use client";

import * as React from "react";
import { Link, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTranslations } from "next-intl";
import { api, ApiError } from "@/lib/api";
import { KeyRound, Mail, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const t = useTranslations();
  const router = useRouter();

  const [step, setStep] = React.useState<"email" | "otp" | "success">("email");
  const [email, setEmail] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [devOtp, setDevOtp] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await api<{ success: boolean; devOtp?: string }>("/auth/forgot-password-otp", {
        method: "POST",
        body: { email: email.trim() },
      });

      if (res.devOtp) setDevOtp(res.devOtp);
      setStep("otp");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t("common.error_generic"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || !newPassword || newPassword.length < 8) {
      setError(t("register.password_error") || "Mật khẩu mới phải từ 8 ký tự trở lên.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api("/auth/reset-password-otp", {
        method: "POST",
        body: { email: email.trim(), otp: otp.trim(), newPassword },
      });

      setStep("success");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t("common.error_generic"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-surface p-6 sm:p-8 shadow-2xl border border-border">
        <div className="mb-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 flex items-center justify-center mx-auto mb-3 border border-teal-200 shadow-2xs font-bold text-xl">
            {step === "success" ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <KeyRound className="w-6 h-6 text-teal-600" />}
          </div>
          <h1 className="text-2xl font-extrabold text-foreground font-display">
            {t("forgot.title")}
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-muted leading-relaxed">
            {step === "email"
              ? t("forgot.subtitle")
              : step === "otp"
                ? "Nhập mã OTP 6 số từ Email và mật khẩu mới để khôi phục tài khoản"
                : "Mật khẩu của bạn đã được cập nhật thành công!"}
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl bg-rose-50 border border-rose-200/90 p-3.5 text-xs text-rose-800 flex items-start gap-2.5 shadow-2xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span className="font-semibold leading-relaxed">{error}</span>
          </div>
        )}

        {step === "email" && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted ml-1">
                {t("forgot.email_placeholder")}
              </label>
              <Input
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !email.trim()}
              className="sd-btn-gradient w-full h-12 font-bold text-sm rounded-full shadow-card active:scale-[0.98] transition-all cursor-pointer"
            >
              {loading ? t("forgot.sending") : t("forgot.submit")}
            </Button>

            <div className="mt-2 text-center">
              <Link href="/login" className="text-xs font-bold text-teal-700 hover:underline">
                {t("forgot.back_to_login")}
              </Link>
            </div>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            {devOtp && (
              <div className="bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 rounded-2xl p-2.5 text-center text-xs font-mono text-teal-800 dark:text-teal-200">
                Mã OTP Reset (Dev Preview): <span className="font-extrabold text-sm tracking-widest">{devOtp}</span>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted ml-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-teal-600" />
                <span>Mã OTP 6 số từ Email ({email})</span>
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="Nhập 6 số OTP"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full text-center text-2xl tracking-[8px] font-extrabold py-2.5 rounded-2xl border border-border bg-background outline-none focus:border-teal-500 font-mono"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted ml-1">Mật khẩu mới (Tối thiểu 8 ký tự)</label>
              <Input
                type="password"
                placeholder="Mật khẩu mới..."
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={loading || otp.length < 6 || newPassword.length < 8}
              className="sd-btn-gradient w-full h-12 font-bold text-sm rounded-full shadow-card active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? t("common.loading") : "Xác nhận & Cập nhật mật khẩu"}
            </Button>

            <button
              type="button"
              onClick={() => setStep("email")}
              className="text-xs font-semibold text-muted hover:text-foreground text-center pt-1 cursor-pointer"
            >
              Gửi lại mã OTP khác
            </button>
          </form>
        )}

        {step === "success" && (
          <div className="text-center space-y-4">
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 p-4 text-xs sm:text-sm text-emerald-800 dark:text-emerald-200 font-semibold leading-relaxed">
              Mật khẩu của bạn đã được thay đổi an toàn! Bạn có thể đăng nhập ngay bây giờ.
            </div>

            <Button
              type="button"
              onClick={() => router.push("/login")}
              className="sd-btn-gradient w-full h-12 font-bold text-sm rounded-full shadow-card cursor-pointer"
            >
              {t("forgot.back_to_login")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
