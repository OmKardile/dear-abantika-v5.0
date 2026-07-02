"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Home,
  Flower2,
  BookHeart,
  Droplet,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/premium/primitives";

export type TabId = "home" | "cycle" | "journal" | "hydration" | "settings";

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "cycle", label: "Cycle", icon: Flower2 },
  { id: "journal", label: "Journal", icon: BookHeart },
  { id: "hydration", label: "Water", icon: Droplet },
  { id: "settings", label: "Settings", icon: Settings },
];

function BottomNav({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (t: TabId) => void;
}) {
  const reduce = useReducedMotion();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[max(env(safe-area-inset-bottom),12px)] px-3">
      <motion.nav
        initial={reduce ? false : { y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className="pointer-events-auto w-full max-w-md"
      >
        <div className="relative rounded-[28px] px-2 py-2 shadow-lifted border border-border glass">
          <div className="flex items-center justify-between">
            {TABS.map((tab) => {
              const isActive = active === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onChange(tab.id)}
                  aria-label={tab.label}
                  aria-current={isActive ? "page" : undefined}
                  className="relative flex flex-1 flex-col items-center gap-1 py-2 px-1 rounded-[22px] transition-colors"
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-[22px] gradient-primary-bg shadow-glow"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10 flex flex-col items-center gap-1">
                    <motion.div
                      animate={isActive ? { scale: 1, y: 0 } : { scale: 0.92, y: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Icon
                        size={22}
                        strokeWidth={isActive ? 2.6 : 2}
                        className={cn(
                          "transition-colors",
                          isActive
                            ? "text-primary-foreground"
                            : "text-text-tertiary"
                        )}
                      />
                    </motion.div>
                    <span
                      className={cn(
                        "text-[10px] font-semibold tracking-wide transition-colors",
                        isActive
                          ? "text-primary-foreground"
                          : "text-text-tertiary"
                      )}
                    >
                      {tab.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </motion.nav>
    </div>
  );
}

export function AppShell({
  active,
  onChange,
  children,
}: {
  active: TabId;
  onChange: (t: TabId) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[100dvh] w-full flex justify-center gradient-hero-bg">
      {/* Ambient decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full opacity-[0.18] blur-3xl"
          style={{ background: "var(--chart-1)" }} />
        <div className="absolute top-1/3 -left-20 w-64 h-64 rounded-full opacity-[0.12] blur-3xl"
          style={{ background: "var(--chart-3)" }} />
      </div>

      {/* Mobile-first column. Full width on phones, centered phone frame on larger screens. */}
      <main className="relative w-full max-w-md min-h-[100dvh] bg-transparent">
        <div className="relative z-10 px-4 pt-6 pb-40">
          <PageTransition id={active}>{children}</PageTransition>
        </div>
      </main>

      <BottomNav active={active} onChange={onChange} />
    </div>
  );
}
