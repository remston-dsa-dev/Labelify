"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function SystemIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

type ThemeMode = "light" | "dark" | "system";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const id = requestAnimationFrame(() => {
      if (!cancelled) setMounted(true);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, []);

  if (!mounted) {
    return (
      <div
        className={`h-9 w-[104px] shrink-0 rounded-lg border border-border bg-muted ${className ?? ""}`}
        aria-hidden
      />
    );
  }

  const active = (mode: ThemeMode) => theme === mode;

  const btn =
    "flex h-8 w-8 items-center justify-center rounded-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted p-0.5 ${className ?? ""}`}
      role="group"
      aria-label="Theme"
    >
      <button
        type="button"
        className={`${btn} ${
          active("light")
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
        }`}
        onClick={() => setTheme("light")}
        title="Light"
        aria-pressed={active("light")}
      >
        <SunIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={`${btn} ${
          active("dark")
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
        }`}
        onClick={() => setTheme("dark")}
        title="Dark"
        aria-pressed={active("dark")}
      >
        <MoonIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={`${btn} ${
          active("system")
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
        }`}
        onClick={() => setTheme("system")}
        title="Use system setting"
        aria-pressed={active("system")}
      >
        <SystemIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
