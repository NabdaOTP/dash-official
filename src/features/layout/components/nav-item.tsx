"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ExternalLink, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  isExternal?: boolean;
  exactMatch?: boolean;
  badge?: string;
  children?: React.ReactNode;
  defaultOpen?: boolean;
  depth?: number;
  onNavigate?: () => void;
}

export function NavItem({
  icon: Icon,
  label,
  href,
  isExternal,
  exactMatch = false,
  badge,
  children,
  defaultOpen = false,
  depth = 0,
  onNavigate,
}: NavItemProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    (async () => {
      if (defaultOpen) setOpen(true);
    })()
  }, [defaultOpen]);

  // Strip locale prefix: /en/projects → /projects
  const normalizedPath = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, "");

  const isActive = href
    ? exactMatch
      ? normalizedPath === href
      : normalizedPath === href || normalizedPath.startsWith(href + "/")
    : false;

  const baseClass =
    "flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors duration-150 cursor-pointer select-none w-full";
  const sizeClass = depth === 0 ? "text-[13.5px]" : "text-[13px]";

  const activeClass = cn(
    baseClass,
    sizeClass,
    "bg-[#EDE9FE] text-[#7C3AED] font-medium"
  );

  const normalClass = cn(
    baseClass,
    sizeClass,
    "font-normal text-muted-foreground hover:bg-muted hover:text-foreground"
  );

  // Expandable item (never gets active background)
  if (children) {
    return (
      <div>
        <button
          type="button"
          className={normalClass}
          onClick={() => setOpen((o) => !o)}
        >
          <Icon size={16} className="shrink-0" />
          <span className="flex-1 text-start">{label}</span>
          <ChevronDown
            size={13}
            className={cn(
              "shrink-0 text-muted-foreground/60 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>

        <div
          className={cn(
            "overflow-hidden transition-all duration-200",
            open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className={cn("mt-0.5", depth === 0 ? "pl-6" : "pl-4")}>
            {children}
          </div>
        </div>
      </div>
    );
  }

  // ── External link ──
  if (isExternal && href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={normalClass}
        onClick={onNavigate}
      >
        <Icon size={16} className="shrink-0" />
        <span className="flex-1">{label}</span>
        <ExternalLink size={12} className="shrink-0 text-muted-foreground/50" />
      </a>
    );
  }

  // ── Regular link ──
  if (href) {
    return (
      <Link
        href={href}
        className={isActive ? activeClass : normalClass}
        onClick={onNavigate}
      >
        <Icon
          size={16}
          className={cn("shrink-0", isActive ? "text-[#7C3AED]" : "")}
        />
        <span className="flex-1">{label}</span>
        {badge && (
          <span className="text-[10px] bg-[#EDE9FE] text-[#7C3AED] px-1.5 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </Link>
    );
  }

  return (
    <div className={normalClass}>
      <Icon size={16} className="shrink-0" />
      <span className="flex-1">{label}</span>
    </div>
  );
}