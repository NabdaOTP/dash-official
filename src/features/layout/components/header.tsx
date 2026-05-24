"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/features/layout/components/language-switcher";

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="flex items-center h-[57px] px-5 border-b border-border bg-background shrink-0">
      {/* Hamburger — mobile only */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden mr-2 cursor-pointer"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </Button>

      {/* Title */}
      <h1 className="text-[15px] font-medium text-foreground flex-1">
        {title}
      </h1>

      <LanguageSwitcher />
    </header>
  );
}