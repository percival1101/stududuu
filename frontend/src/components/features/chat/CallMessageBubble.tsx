"use client";

import * as React from "react";
import { Phone, PhoneMissed, PhoneOff, Video, PhoneCall } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CallMessagePayload } from "@/lib/webrtc/callContract";
import { Button } from "@/components/ui/Button";

interface CallMessageBubbleProps {
  payload: CallMessagePayload;
  mine: boolean;
  t: any;
  onCallBack?: (kind: "audio" | "video") => void;
}

function formatDurationText(seconds: number, t: any): string {
  if (seconds <= 0) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) {
    return t("chat.duration_mins", { count: m }) || `${m} phút`;
  }
  return t("chat.duration_secs", { count: s }) || `${s} giây`;
}

export function CallMessageBubble({ payload, mine, t, onCallBack }: CallMessageBubbleProps) {
  const isVideo = payload.kind === "video";
  const isEnded = payload.status === "ended";
  const isRejected = payload.status === "rejected";
  const isMissed = payload.status === "missed";

  const titleText = isEnded
    ? isVideo
      ? t("chat.call_video") || "Cuộc gọi video"
      : t("chat.call_audio") || "Cuộc gọi thoại"
    : isRejected
      ? t("call.log_rejected") || "Cuộc gọi bị từ chối"
      : t("chat.call_missed") || "Cuộc gọi nhỡ";

  const durationText = isEnded ? formatDurationText(payload.durationSec, t) : "";

  const Icon = isEnded
    ? isVideo
      ? Video
      : Phone
    : isRejected
      ? PhoneOff
      : PhoneMissed;

  return (
    <div className={cn("flex my-3 w-full", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "rounded-3xl p-4 max-w-[280px] w-full border shadow-sm transition-all",
          mine
            ? "bg-teal-900/10 dark:bg-teal-950/40 border-teal-500/30 text-foreground"
            : "bg-surface border-border text-foreground",
        )}
      >
        {/* Main Card Content */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs",
              isEnded
                ? "bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200/80"
                : "bg-rose-100 dark:bg-rose-950/60 text-rose-600 border border-rose-200/80",
            )}
          >
            <Icon className="w-5 h-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-extrabold text-foreground leading-tight truncate font-display">
              {titleText}
            </h4>
            {durationText ? (
              <p className="text-xs text-muted font-medium mt-0.5">{durationText}</p>
            ) : (
              <p className="text-xs text-rose-500 font-medium mt-0.5">
                {isMissed ? t("chat.call_missed") || "Cuộc gọi nhỡ" : t("call.log_rejected") || "Đã từ chối"}
              </p>
            )}
          </div>
        </div>

        {/* Call Back Button */}
        {onCallBack && (
          <div className="mt-3 pt-2.5 border-t border-border/60">
            <Button
              type="button"
              onClick={() => onCallBack(payload.kind ?? "audio")}
              variant="outline"
              className="w-full rounded-2xl h-9 text-xs font-bold gap-2 bg-surface-2 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 dark:hover:bg-teal-950 transition-all cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
              <span>{t("chat.call_back") || "Gọi lại"}</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
