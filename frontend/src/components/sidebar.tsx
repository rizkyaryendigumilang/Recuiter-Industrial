'use client';

import React, { useState, useEffect } from "react";
import "./sidebar.css";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

export const DEFAULT_NAV_ITEMS: NavItem[] = [
  {
    id: "home",
    label: "Overview",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ico">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1V9.5z" />
      </svg>
    ),
  },
  {
    id: "content",
    label: "Content",
    count: 3,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ico">
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
        <line x1="7" y1="2" x2="7" y2="22" />
        <line x1="17" y1="2" x2="17" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="2" y1="7" x2="7" y2="7" />
        <line x1="2" y1="17" x2="7" y2="17" />
        <line x1="17" y1="17" x2="22" y2="17" />
        <line x1="17" y1="7" x2="22" y2="7" />
      </svg>
    ),
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ico">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ico">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export interface SidebarProps {
  items?: NavItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  brandName?: string;
  brandSub?: string;
  userName?: string;
  userHandle?: string;
  userAvatarInitial?: string;
  children?: React.ReactNode;
  storageKey?: string;
  className?: string;
  isContained?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items = DEFAULT_NAV_ITEMS,
  activeId,
  onSelect,
  brandName = "Sorvo",
  brandSub = "Creator Studio",
  userName = "Wander Slowly",
  userHandle = "@wanderslowly",
  userAvatarInitial = "W",
  children,
  storageKey = "app:rail",
  className = "",
  isContained = false,
}) => {
  // Status collapse (rail mode) with SSR hydration safety
  const [isRail, setIsRail] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>(activeId || items[0]?.id || "home");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      if (saved === "1") {
        setIsRail(true);
      }
    }
  }, [storageKey]);

  useEffect(() => {
    if (activeId) {
      setActiveTab(activeId);
    }
  }, [activeId]);

  const toggleRail = () => {
    setIsRail((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, next ? "1" : "0");
      }
      return next;
    });
  };

  // Keyboard shortcut listener: Tekan '[' untuk toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tagName = target?.tagName;
      const isEditable = target?.isContentEditable;
      if (
        e.key === "[" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(tagName || "") &&
        !isEditable
      ) {
        e.preventDefault();
        toggleRail();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleItemClick = (id: string) => {
    setActiveTab(id);
    if (onSelect) {
      onSelect(id);
    }
  };

  return (
    <div className={`layout-wrap ${isRail ? "is-rail" : ""} ${isContained ? "is-contained" : ""} ${className}`.trim()}>
      {/* SIDEBAR ASIDE */}
      <aside className="side glass" aria-label="Sidebar Navigation">
        {/* HEADER: BRAND & COLLAPSE BUTTON */}
        <div className="side__head">
          <a href="#/home" className="brand" onClick={(e) => { e.preventDefault(); handleItemClick("home"); }}>
            <span className="mark">
              {/* Logo icon */}
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <circle cx="12" cy="12" r="10" />
              </svg>
            </span>
            <div className="brand__text">
              <b>{brandName}</b>
              <small>{brandSub}</small>
            </div>
          </a>

          {/* TOMBOL COLLAPSE / EXPAND */}
          <button
            type="button"
            className="collapse-btn"
            onClick={toggleRail}
            aria-label={isRail ? "Expand sidebar" : "Collapse sidebar"}
            title={isRail ? "Expand [" : "Collapse ["}
          >
            {/* SVG Panel Icon khusus Sorvo */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3.5" y="4.5" width="17" height="15" rx="3" />
              <path d="M9.5 4.5v15M16 10l-2 2 2 2" />
            </svg>
          </button>
        </div>

        {/* NAVIGATION LIST */}
        <nav className="snav">
          <span className="side__group">Studio</span>
          {items.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`snav__item ${isActive ? "is-active" : ""}`}
                onClick={() => handleItemClick(item.id)}
                title={isRail ? item.label : undefined}
                aria-current={isActive ? "page" : undefined}
              >
                {item.icon}
                <span className="snav__label">{item.label}</span>
                {item.count && item.count > 0 && (
                  <span className="snav__count">{item.count}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* FOOTER USER PROFILE */}
        <div className="side__me">
          <div className="side__me-avatar">{userAvatarInitial}</div>
          <div className="side__me-text">
            <b>{userName}</b>
            <small>{userHandle}</small>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="col">
        {children ? (
          children
        ) : (
          <>
            <header style={{ marginBottom: "24px" }}>
              <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>
                {items.find((n) => n.id === activeTab)?.label || "Overview"}
              </h1>
              <p style={{ color: "#8c94a0" }}>
                Tekan tombol <kbd style={{ padding: "2px 6px", background: "rgba(255,255,255,0.08)", borderRadius: "4px" }}>[</kbd> di keyboard untuk toggle navbar collapse.
              </p>
            </header>
            <div className="demo-content-card glass">
              <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "8px" }}>
                Area Konten Utama
              </h3>
              <p style={{ color: "#8c94a0", lineHeight: 1.5 }}>
                Margin kiri halaman ini bergeser secara sinkron dengan animasi
                melebar/mengecilnya sidebar tanpa glitch (<em>zero layout shift</em>).
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Sidebar;
