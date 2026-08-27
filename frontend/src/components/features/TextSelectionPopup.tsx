"use client";

import * as React from "react";
import { BookOpen, X, Volume2, Lightbulb, Sparkles, Globe } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { WordSaveModal, type SavedWord } from "@/components/features/WordSaveModal";
import { useLocale, useTranslations } from "next-intl";

const speakWord = (text: string, langCode: string = "en-US") => {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const code = langCode.toLowerCase();
    utterance.lang = code.includes("vi")
      ? "vi-VN"
      : code.includes("fr")
      ? "fr-FR"
      : code.includes("zh")
      ? "zh-CN"
      : code.includes("ja")
      ? "ja-JP"
      : code.includes("ko")
      ? "ko-KR"
      : code.includes("es")
      ? "es-ES"
      : code.includes("de")
      ? "de-DE"
      : "en-US";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  }
};

const LANG_NAMES: Record<string, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
  ja: "日本語",
  ko: "한국어",
  zh: "中文",
  vi: "Tiếng Việt",
};

function getLangName(code?: string | null): string {
  if (!code) return "English";
  const c = code.toLowerCase();
  return LANG_NAMES[c] || c.toUpperCase();
}

type LookupResult = {
  term: string;
  translation: string | null;
  detectedLang: string | null;
  languageId: number;
  phonetic?: string | null;
  dictionary: {
    phonetic: string | null;
    partOfSpeech: string | null;
    definition: string | null;
    example: string | null;
  } | null;
  library: {
    id: number;
    phonetic: string | null;
    definition: string | null;
    example: string | null;
    languageId: number;
    languageName: string;
    saveCount: number;
  } | null;
};

type PopupPosition = { top: number; left: number; direction: "above" | "below" };

export function TextSelectionPopup({
  targetLang,
  onWordSaved,
}: {
  targetLang?: string;
  onWordSaved?: (item: SavedWord, duplicated: boolean) => void;
}) {
  const locale = useLocale();
  const t = useTranslations("vocabulary");
  const effectiveTargetLang = targetLang || (locale && locale !== "en" ? locale : "vi");

  const [selectedText, setSelectedText] = React.useState("");
  const [position, setPosition] = React.useState<PopupPosition | null>(null);
  const [result, setResult] = React.useState<LookupResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [showSaveModal, setShowSaveModal] = React.useState(false);
  const [visible, setVisible] = React.useState(false);

  const [translatedDef, setTranslatedDef] = React.useState<string | null>(null);
  const [translatedEx, setTranslatedEx] = React.useState<string | null>(null);
  const [wordTranslation, setWordTranslation] = React.useState<string | null>(null);

  const popupRef = React.useRef<HTMLDivElement>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  // Extract phonetic, raw definition, and example
  const phonetic =
    result?.phonetic ??
    result?.dictionary?.phonetic ??
    result?.library?.phonetic ??
    null;
  const rawDefinition =
    result?.dictionary?.definition ??
    result?.library?.definition ??
    null;
  const rawExample =
    result?.dictionary?.example ??
    result?.library?.example ??
    null;

  // Auto translate term meaning if missing or untranslated
  React.useEffect(() => {
    if (!result) {
      setWordTranslation(null);
      return;
    }
    const rawTrans = result.translation;
    if (rawTrans && rawTrans.trim().toLowerCase() !== selectedText.trim().toLowerCase()) {
      setWordTranslation(rawTrans);
    } else {
      api<{ translation: string }>("/translate", {
        method: "POST",
        body: { text: selectedText, target: effectiveTargetLang, source: "auto" },
      })
        .then((res) => setWordTranslation(res?.translation || rawTrans || selectedText))
        .catch(() => setWordTranslation(rawTrans || selectedText));
    }
  }, [result, selectedText, effectiveTargetLang]);

  // Auto-translate raw English definition & example to user's active locale
  React.useEffect(() => {
    if (!rawDefinition) {
      setTranslatedDef(null);
    } else if (locale && !locale.startsWith("en")) {
      api<{ translation: string }>("/translate", {
        method: "POST",
        body: { text: rawDefinition, target: locale, source: "auto" },
      })
        .then((res) => setTranslatedDef(res?.translation || rawDefinition))
        .catch(() => setTranslatedDef(rawDefinition));
    } else {
      setTranslatedDef(rawDefinition);
    }

    if (!rawExample) {
      setTranslatedEx(null);
    } else if (locale && !locale.startsWith("en")) {
      api<{ translation: string }>("/translate", {
        method: "POST",
        body: { text: rawExample, target: locale, source: "auto" },
      })
        .then((res) => setTranslatedEx(res?.translation || rawExample))
        .catch(() => setTranslatedEx(rawExample));
    } else {
      setTranslatedEx(rawExample);
    }
  }, [rawDefinition, rawExample, locale]);

  const definition = translatedDef ?? rawDefinition;
  const example = rawExample;
  const exampleTranslation = translatedEx;

  const handlePlayAudio = () => {
    const audioUrl = (result?.dictionary as any)?.audioUrl || (result?.library as any)?.audioUrl;
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(() => speakWord(selectedText, result?.detectedLang || "en"));
    } else {
      speakWord(selectedText, result?.detectedLang || "en");
    }
  };

  const handleSave = async () => {
    if (!result || saving) return;
    setSaving(true);
    try {
      const res = await api<{ saved: SavedWord; duplicated: boolean }>("/vocabulary/save-word", {
        method: "POST",
        body: {
          term: selectedText.trim(),
          languageId: result.languageId,
          phonetic: phonetic?.trim() || undefined,
          definition: (result.translation || definition)?.trim() || undefined,
          example: example?.trim() || undefined,
          source: "manual",
        },
      });
      onWordSaved?.(res.saved, res.duplicated);
      close();
    } catch (err) {
      console.error("Lưu từ thất bại:", err);
      setShowSaveModal(true);
    } finally {
      setSaving(false);
    }
  };

  const close = React.useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setSelectedText("");
      setPosition(null);
      setResult(null);
      setLoading(false);
      setSaving(false);
    }, 150);
    abortRef.current?.abort();
  }, []);

  // Listen to mouseup event on page for text selection
  React.useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      if (popupRef.current?.contains(e.target as Node)) return;

      setTimeout(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim() ?? "";

        if (text.length < 1 || text.length > 100) {
          close();
          return;
        }

        const activeEl = document.activeElement;
        if (
          activeEl instanceof HTMLInputElement ||
          activeEl instanceof HTMLTextAreaElement
        ) {
          close();
          return;
        }

        const range = selection?.getRangeAt(0);
        if (!range) return;
        const rect = range.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;

        const POPUP_HEIGHT_ESTIMATE = 320;
        const direction: "above" | "below" =
          rect.top > POPUP_HEIGHT_ESTIMATE + 16 ? "above" : "below";

        const POPUP_WIDTH = 380;
        const top =
          direction === "above"
            ? rect.top + window.scrollY - 8
            : rect.bottom + window.scrollY + 8;
        const left = Math.max(
          16,
          Math.min(
            rect.left + rect.width / 2 - POPUP_WIDTH / 2,
            window.innerWidth - POPUP_WIDTH - 16
          )
        );

        setSelectedText(text);
        setPosition({ top, left, direction });
        setResult(null);
        setLoading(true);
        setVisible(true);

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        api<LookupResult>(
          `/vocabulary/lookup?term=${encodeURIComponent(text)}&target=${encodeURIComponent(effectiveTargetLang)}`
        )
          .then((data) => {
            if (!controller.signal.aborted) {
              setResult(data);
              setLoading(false);
            }
          })
          .catch((err) => {
            if (!controller.signal.aborted) {
              console.error("Lookup error:", err);
              setLoading(false);
            }
          });
      }, 10);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [effectiveTargetLang, close]);

  React.useEffect(() => {
    if (!visible) return;
    const handleScroll = () => close();
    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", handleScroll, { capture: true });
  }, [visible, close]);

  if (!position || !visible) return showSaveModal ? (
    <WordSaveModal
      open={showSaveModal}
      onClose={() => setShowSaveModal(false)}
      initialWord={selectedText}
      source="manual"
      onSaved={(item, dup) => {
        onWordSaved?.(item, dup);
        setShowSaveModal(false);
      }}
    />
  ) : null;

  return (
    <>
      <div
        ref={popupRef}
        className={cn(
          "fixed z-[9999] w-[380px] max-w-[calc(100vw-32px)]",
          "bg-surface/95 backdrop-blur-xl border border-border/70",
          "rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15),0_4px_12px_rgba(0,0,0,0.08)]",
          "transition-all duration-200 ease-out p-4 space-y-3",
          visible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-1"
        )}
        style={{
          top: position.top,
          left: position.left,
          transformOrigin:
            position.direction === "above" ? "bottom center" : "top center",
          transform: position.direction === "above"
            ? `translateY(-100%)`
            : undefined,
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 pb-1">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-foreground break-all leading-tight font-display">
                {selectedText}
              </h3>
              <button
                type="button"
                onClick={handlePlayAudio}
                className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 hover:bg-teal-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs shrink-0"
                title={t("btn_audio_tooltip")}
              >
                <Volume2 className="w-4 h-4" />
              </button>
              {phonetic && (
                <span className="text-xs font-bold rounded-lg px-2 py-0.5 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200/60 shrink-0">
                  {phonetic}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={close}
            className="w-7 h-7 rounded-full hover:bg-muted/10 flex items-center justify-center text-muted hover:text-foreground transition-colors shrink-0 -mr-1 -mt-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="space-y-2.5 animate-pulse py-2">
            <div className="h-10 bg-muted/10 rounded-xl w-full" />
            <div className="h-12 bg-muted/10 rounded-xl w-full" />
          </div>
        ) : result ? (
          <div className="space-y-3">
            {/* 1. Primary Meaning / Translation (Nghĩa của từ) */}
            <div className="bg-teal-50/80 dark:bg-teal-950/50 p-3 rounded-xl border border-teal-200/80 dark:border-teal-800/50">
              <div className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Nghĩa của từ ({getLangName(effectiveTargetLang)})</span>
              </div>
              <div className="text-base font-extrabold text-teal-950 dark:text-teal-100">
                {wordTranslation || result.translation || selectedText}
              </div>
            </div>

            {/* 2. Definition & Context of Use (Giải thích nghĩa & Hoàn cảnh sử dụng) */}
            {definition && (
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                  <span>Giải thích nghĩa & Hoàn cảnh sử dụng</span>
                </div>
                <div className="text-xs font-medium text-foreground leading-relaxed bg-surface-2/70 p-2.5 rounded-xl border border-border/70">
                  {definition}
                </div>
              </div>
            )}

            {/* 3. Example Sentence & Translation */}
            {example && (
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Ví dụ câu & Ngữ cảnh</span>
                </div>
                <div className="bg-surface-2/70 p-2.5 rounded-xl border border-border/70 text-xs">
                  <p className="text-foreground italic font-medium leading-relaxed">&ldquo;{example}&rdquo;</p>
                  {exampleTranslation && exampleTranslation !== example && (
                    <p className="text-teal-800 dark:text-teal-300 text-[11px] font-medium mt-1.5 pt-1.5 border-t border-border/50 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-teal-600 shrink-0" />
                      <span>{exampleTranslation}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Language name badge with auto-detection indicator */}
            {(result.library?.languageName || result.detectedLang) && (
              <div className="flex items-center gap-1 text-[10px] text-muted font-bold pt-0.5">
                <Globe className="w-3 h-3 text-teal-600 shrink-0" />
                <span>Tự động nhận diện: {result.library?.languageName || getLangName(result.detectedLang)}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-error py-2">
            {t("lookup_error")}
          </p>
        )}

        {/* Footer — Save button */}
        <div className="pt-2 border-t border-border/50">
          <button
            onClick={handleSave}
            disabled={saving || !result}
            className={cn(
              "w-full flex items-center justify-center gap-2",
              "h-10 rounded-xl text-sm font-bold",
              "sd-btn-gradient text-white",
              "shadow-xs transition-all active:scale-[0.98] cursor-pointer",
              "disabled:opacity-50 disabled:pointer-events-none"
            )}
          >
            <BookOpen className="w-4 h-4" />
            {saving ? t("saving_btn") : t("save_to_notebook_btn")}
          </button>
        </div>
      </div>

      <WordSaveModal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        initialWord={selectedText}
        source="manual"
        onSaved={(item, dup) => {
          onWordSaved?.(item, dup);
          setShowSaveModal(false);
        }}
      />
    </>
  );
}
