"use client";

import * as React from "react";
import { ShieldCheck, RefreshCw, CheckCircle2, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface CaptchaChallengeProps {
  t: any;
  onVerified: (isVerified: boolean) => void;
  className?: string;
}

export function CaptchaChallenge({ t, onVerified, className }: CaptchaChallengeProps) {
  const [num1, setNum1] = React.useState(0);
  const [num2, setNum2] = React.useState(0);
  const [userAnswer, setUserAnswer] = React.useState("");
  const [verified, setVerified] = React.useState(false);
  const [error, setError] = React.useState(false);

  const generateNewChallenge = React.useCallback(() => {
    const n1 = Math.floor(Math.random() * 12) + 3;
    const n2 = Math.floor(Math.random() * 10) + 1;
    setNum1(n1);
    setNum2(n2);
    setUserAnswer("");
    setVerified(false);
    setError(false);
    onVerified(false);
  }, [onVerified]);

  React.useEffect(() => {
    generateNewChallenge();
  }, []);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const ans = parseInt(userAnswer.trim(), 10);
    if (ans === num1 + num2) {
      setVerified(true);
      setError(false);
      onVerified(true);
    } else {
      setVerified(false);
      setError(true);
      onVerified(false);
    }
  };

  return (
    <div
      className={cn(
        "p-3.5 rounded-2xl border transition-all my-3 bg-surface-2/60",
        verified
          ? "border-emerald-500/50 bg-emerald-50/40 dark:bg-emerald-950/20"
          : error
            ? "border-rose-500/50 bg-rose-50/40 dark:bg-rose-950/20"
            : "border-border/80",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <ShieldCheck className={cn("w-4 h-4", verified ? "text-emerald-600" : "text-teal-600")} />
          <span>{t("auth.captcha_title") || "Xác thực chống Bot & Spam"}</span>
        </div>
        <button
          type="button"
          onClick={generateNewChallenge}
          className="text-muted hover:text-foreground p-1 rounded-lg transition-colors cursor-pointer"
          title="Tạo câu hỏi mới"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {verified ? (
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 py-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{t("auth.captcha_success") || "Đã xác thực bạn không phải là robot!"}</span>
        </div>
      ) : (
        <form onSubmit={handleCheck} className="flex items-center gap-2 mt-1">
          <div className="bg-surface px-3 py-1.5 rounded-xl border border-border/80 text-xs font-extrabold text-teal-800 dark:text-teal-300 tracking-wider shadow-2xs">
            {num1} + {num2} = ?
          </div>

          <input
            type="number"
            placeholder={t("auth.captcha_answer_placeholder") || "Kết quả..."}
            value={userAnswer}
            onChange={(e) => {
              setUserAnswer(e.target.value);
              setError(false);
            }}
            className="flex-1 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold outline-none focus:border-teal-500"
          />

          <button
            type="submit"
            disabled={!userAnswer.trim()}
            className="bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
          >
            {t("auth.captcha_verify_btn") || "Xác nhận"}
          </button>
        </form>
      )}

      {error && !verified && (
        <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1">
          <ShieldAlert className="w-3 h-3" />
          <span>{t("auth.captcha_error") || "Kết quả chưa đúng, vui lòng thử lại!"}</span>
        </p>
      )}
    </div>
  );
}
