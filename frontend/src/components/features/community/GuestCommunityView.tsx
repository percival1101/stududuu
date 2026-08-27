"use client";

import * as React from "react";
import { Link } from "@/i18n/routing";
import {
  MessageSquare,
  Heart,
  Lock,
  Users,
  Sparkles,
  Shield,
  ArrowRight,
  UserPlus,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { LandingHeader } from "@/components/features/landing/LandingHeader";
import { useToast } from "@/components/features/TrustDialogs";
import { useTranslations } from "next-intl";

type FeedPost = {
  id: number;
  type: "word_public" | "chat_hours_milestone" | "user_post";
  contentRef?: string | null;
  content?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  user: { id: number; displayName: string; avatarUrl?: string | null };
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  word?: { id: number; term: string; language: { name: string } } | null;
};

interface GuestCommunityViewProps {
  posts: FeedPost[];
  loading: boolean;
  locale: string;
}

function timeAgo(iso: string, t: any): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return t("time_just_now") || "vừa xong";
  if (diffMin < 60) return t("time_minutes_ago", { count: diffMin, m: diffMin }) || `${diffMin}m ago`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return t("time_hours_ago", { count: h, h: h }) || `${h}h ago`;
  return new Date(iso).toLocaleDateString(t("locale") === "en" ? "en-US" : "vi-VN", { day: "2-digit", month: "2-digit" });
}

function postText(p: FeedPost, t: any): string {
  if (p.type === "user_post") return t("post_share") || "shared:";
  if (p.type === "word_public") {
    return p.word
      ? (t("post_word", { term: p.word.term, language: p.word.language.name }) || `saved word: ${p.word.term}`)
      : (t("post_word_generic") || "saved a new word");
  }
  return t("post_milestone", { hours: p.contentRef }) || `reached ${p.contentRef} chat hours`;
}

export function GuestCommunityView({ posts, loading }: GuestCommunityViewProps) {
  const tComm = useTranslations("community");
  const tHome = useTranslations("home");
  const { show: showToast } = useToast();

  const handleGuestAction = (actionName: string) => {
    showToast(`${tHome("login")} ${actionName}`);
  };

  const guestPosts = posts.slice(0, 5);

  const SUGGESTED_GROUPS = [
    { name: "English Learners", code: "EN", members: 4210, desc: "Practice spoken English daily" },
    { name: "日本語 Group", code: "日", members: 1670, desc: "Japanese speaking & Kaiwa" },
    { name: "한국어 스터디", code: "韓", members: 980, desc: "Korean vocabulary & pronunciation" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Landing Header for Unauthenticated Guests */}
      <LandingHeader />

      {/* Guest Community Hero Banner */}
      <section className="bg-gradient-to-b from-teal-900/10 via-background to-background py-10 px-4 border-b border-border/60">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 text-teal-800 text-xs font-bold mb-4 border border-teal-200/80 shadow-2xs">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Stududu Community</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground font-display tracking-tight">
            {tComm("guest_hero_title")}
          </h1>
          <p className="text-muted text-sm sm:text-base mt-2.5 max-w-xl mx-auto font-normal leading-relaxed">
            {tComm("guest_hero_desc")}
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <Link href="/register">
              <Button size="lg" className="sd-btn-gradient rounded-full px-6 font-bold shadow-md text-sm">
                <UserPlus className="w-4 h-4 mr-2" />
                {tComm("guest_join_community_btn")}
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="rounded-full px-6 font-bold text-sm">
                {tHome("login")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
        {/* LEFT / MIDDLE COLUMN: Public Feed Preview */}
        <section className="space-y-5 min-w-0">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <h2 className="text-lg font-extrabold text-foreground font-display flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-teal-600" />
              <span>{tComm("guest_feed_title")}</span>
            </h2>
            <span className="text-xs text-muted font-medium bg-surface-2 px-2.5 py-1 rounded-full border border-border/60">
              {tComm("guest_mode_badge")}
            </span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-surface border border-border/80 animate-pulse" />
              ))}
            </div>
          ) : guestPosts.length === 0 ? (
            <div className="bg-surface rounded-2xl border border-border/80 p-10 text-center shadow-card">
              <MessageSquare className="w-10 h-10 text-muted mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-foreground">{tComm("empty_feed")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {guestPosts.map((p) => (
                <article
                  key={p.id}
                  className="bg-surface rounded-2xl border border-border/80 shadow-card p-5 transition-all hover:border-teal-500/30"
                >
                  <div className="flex items-start gap-3">
                    <Avatar
                      src={p.user.avatarUrl ?? undefined}
                      fallback={p.user.displayName.charAt(0)}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-foreground">
                            {p.user.displayName}
                          </span>
                          <span className="text-xs text-muted">{postText(p, tComm)}</span>
                        </div>
                        <span className="text-xs text-muted">{timeAgo(p.createdAt, tComm)}</span>
                      </div>

                      {/* Post Text */}
                      {p.type === "user_post" && p.content && (
                        <p className="text-foreground text-sm leading-relaxed mt-2.5 whitespace-pre-wrap">
                          {p.content}
                        </p>
                      )}

                      {/* Post Image */}
                      {p.imageUrl && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-border/60 max-h-80 bg-muted/5">
                          <img
                            src={p.imageUrl}
                            alt="Post media"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Interactive Buttons Intercepted for Guests */}
                      <div className="flex items-center gap-6 mt-4 pt-3 border-t border-border/50 text-xs font-semibold text-muted">
                        <button
                          onClick={() => handleGuestAction(tComm("like"))}
                          className="flex items-center gap-1.5 hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          <Heart className="w-4 h-4" />
                          <span>{p.likeCount > 0 ? p.likeCount : tComm("like")}</span>
                        </button>

                        <button
                          onClick={() => handleGuestAction(tComm("comment_placeholder"))}
                          className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>{p.commentCount > 0 ? `${p.commentCount}` : tComm("comment_placeholder")}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              {/* High Conversion Guest Lock Card */}
              <div className="bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white text-center shadow-card border border-teal-600/40 relative overflow-hidden my-6">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-xs">
                  <Lock className="w-6 h-6 text-teal-200" />
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold mb-2 font-display">
                  {tComm("guest_lock_title")}
                </h3>
                <p className="text-xs sm:text-sm text-teal-100/90 max-w-md mx-auto mb-6 leading-relaxed">
                  {tComm("guest_lock_desc")}
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <Link href="/login">
                    <Button className="bg-white text-teal-950 hover:bg-teal-50 font-bold px-6 py-2.5 rounded-full shadow-md text-xs sm:text-sm cursor-pointer">
                      {tComm("guest_login_now")}
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-6 py-2.5 rounded-full border border-teal-400/40 text-xs sm:text-sm cursor-pointer">
                      {tComm("guest_register_free")}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* RIGHT SIDEBAR: Groups & Community Guidelines Preview */}
        <aside className="space-y-6">
          {/* Featured Groups Card */}
          <div className="bg-surface rounded-2xl border border-border/80 shadow-card p-5">
            <h3 className="text-sm font-extrabold text-foreground font-display flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-teal-600" />
              <span>{tComm("guest_groups_title")}</span>
            </h3>
            <div className="space-y-3">
              {SUGGESTED_GROUPS.map((g) => (
                <div key={g.name} className="p-3 rounded-xl bg-surface-2/60 border border-border/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {g.code}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-foreground truncate">{g.name}</div>
                      <div className="text-[10px] text-muted truncate">{g.members.toLocaleString()} members</div>
                    </div>
                  </div>
                  <Link href="/login">
                    <Button size="sm" variant="outline" className="text-[11px] h-7 px-2.5 rounded-full font-semibold cursor-pointer">
                      {tComm("guest_join")}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Community Guidelines Card */}
          <div className="bg-surface rounded-2xl border border-border/80 shadow-card p-5 space-y-3">
            <h3 className="text-sm font-extrabold text-foreground font-display flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-600" />
              <span>{tComm("guest_about_title")}</span>
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              {tComm("guest_about_desc")}
            </p>
            <Link href="/register" className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:underline pt-1">
              <span>{tHome("get_started")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>
      </main>
    </div>
  );
}
