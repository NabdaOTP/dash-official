"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { User, Settings, CreditCard, LogOut, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/context/auth-context";
import { useProjects } from "@/features/projects/context/projects-context";

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const { user, logout } = useAuth();
  const { projects } = useProjects();
  const firstProjectId = projects?.[0]?.id ?? "";

  const userName = user?.name ?? "User";
  const userEmail = user?.email ?? "";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
    

  const menuItems = [
    {
      icon: User,
      label: "My Profile",
      onClick: () => {
        setOpen(false);
        router.push(`/${locale}/profile`);
      },
    },
    {
      icon: Settings,
      label: "Settings",
      onClick: () => {
        setOpen(false);
        router.push(`/${locale}/settings`);
      },
    },
    {
      icon: CreditCard,
      label: "Billing",
      onClick: () => {
        setOpen(false);
        router.push(`/${locale}/projects/${firstProjectId}/credits/billing`);
      },
    },
  ];

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-[#EDE9FE] flex items-center justify-center shrink-0">
          <span className="text-[11px] font-semibold text-[#7C3AED]">
            {userInitials}
          </span>
        </div>
        <div className="flex-1 min-w-0 text-start">
          <p className="text-[13px] font-semibold text-foreground truncate">
            {userName}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {userEmail}
          </p>
        </div>
        <ChevronUp
          size={13}
          className={cn(
            "shrink-0 text-muted-foreground/60 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 right-0 bottom-full mb-1 z-50 bg-background border border-border rounded-xl shadow-lg overflow-hidden">
            <div className="px-3 py-3 border-b border-border">
              <p className="text-[13px] font-semibold text-foreground">
                {userName}
              </p>
              <p className="text-[11px] text-muted-foreground">{userEmail}</p>
            </div>
            <div className="py-1">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left cursor-pointer hover:bg-muted/60 transition-colors"
                >
                  <item.icon
                    size={16}
                    className="text-muted-foreground shrink-0"
                  />
                  <span className="text-[13px] font-medium text-foreground">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
            <div className="border-t border-border" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left cursor-pointer hover:bg-muted/60 transition-colors"
            >
              <LogOut size={16} className="text-red-500 shrink-0" />
              <span className="text-[13px] font-medium text-red-500">
                Logout
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}