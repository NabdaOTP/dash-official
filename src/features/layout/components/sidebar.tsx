"use client";

import {
  BarChart2,
  BookOpen,
  CreditCard,
  FileBarChart,
  FileCode,
  FileText,
  Gift,
  History,
  Home,
  KeyRound,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  PieChart,
  Receipt,
  Send,
  Settings2,
  SlidersHorizontal,
  Tag,
  Users,
  UsersRound
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BalanceWidget } from "./balance-widget";
import { NavItem } from "./nav-item";
import { ProjectSelector } from "./project-selector";
import { UserMenu } from "./user-menu";
import { MessageSquare, MessageSquareText } from "lucide-react";

interface SidebarProps {
  mode: "home" | "project";
  projectId?: string;
  projectName?: string;
  onNavigate?: () => void;
}

export function Sidebar({
  mode,
  projectId = "",
  projectName = "My Project",
  onNavigate,
}: SidebarProps) {
  const t = useTranslations("Sidebar");
  const p = (path: string) => `/projects/${projectId}${path}`;
  const pathname = usePathname();
  const normalized = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, "");

  return (
    <div className="flex flex-col h-full bg-background border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-[57px] border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <a
            href="https://www.nabda-otp.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <div className="h-12 w-12 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Nabda OTP Logo"
                width={50}
                height={50}
              />
            </div>
            <span className="font-extrabold text-lg text-foreground">
              Nabda OTP
            </span>
          </a>
        </div>
      </div>

      {/* Project selector (project mode only) */}
      {mode === "project" && (
        <div className="px-3 pt-3 pb-1 shrink-0">
          <ProjectSelector projectName={projectName} />
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {/* General */}
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-3 pt-2 pb-1">
          {t("sectionGeneral")}
        </p>
        <NavItem
          icon={Home}
          label={t("navDashboard")}
          href="/projects"
          exactMatch
          onNavigate={onNavigate}
        />
        <NavItem
          icon={Gift}
          label={t("navReferral")}
          href="/referrals"
          onNavigate={onNavigate}
        />
        <NavItem
          icon={BookOpen}
          label={t("navApiDocs")}
          href="https://connect.nabda-otp.com/docs"
          isExternal
          onNavigate={onNavigate}
        />

        {/* ── Project section  */}
        {mode === "project" && (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-3 pt-4 pb-1">
              {projectName}
            </p>

            <NavItem
              icon={LayoutDashboard}
              label={t("navProjectDashboard")}
              href={p("/dashboard")}
              onNavigate={onNavigate}
            />
            <NavItem
              icon={Tag}
              label={t("navPricing")}
              href={p("/pricing")}
              onNavigate={onNavigate}
            />

            {/* Credits & billing */}
            <NavItem icon={CreditCard} label={t("navCredits")} defaultOpen={normalized.includes("/credits/")}>
              <NavItem
                icon={Receipt}
                label={t("navBilling")}
                href={p("/credits/billing")}
                depth={1}
                onNavigate={onNavigate}
              />
              {/* <NavItem
                icon={ArrowLeftRight}
                label={t("navTransferBalance")}
                href={p("/credits/transfer")}
                depth={1}
                onNavigate={onNavigate}
              /> */}
              <NavItem
                icon={History}
                label={t("navTransactionHistory")}
                href={p("/credits/history")}
                depth={1}
                onNavigate={onNavigate}
              />
            </NavItem>

            {/* Send OTP — flat item (uses /external/waba/{phoneNumberId}/otp/send) */}
            {/* <NavItem
              icon={Send}
              label={t("navSendOtp")}
              href={p("/messaging/send")}
              onNavigate={onNavigate}
            /> */}

            <NavItem icon={MessageSquare} label={t("navMessaging")}>
              <NavItem
                icon={MessageSquareText}
                label={t("navSendMessage")}
                href={p("/messaging/send-message")}
                depth={1}
                onNavigate={onNavigate}
              />
              <NavItem
                icon={Send}
                label={t("navSendOtp")}
                href={p("/messaging/send")}
                depth={1}
                onNavigate={onNavigate}
              />
            </NavItem>

            {/* WhatsApp — flat (just account connection page) */}
            <NavItem
              icon={MessageCircle}
              label={t("navWhatsApp")}
              href={p("/whatsapp")}
              onNavigate={onNavigate}
            />

            {/* Templates — flat (Meta-approved templates for OTP) */}
            <NavItem
              icon={FileText}
              label={t("navTemplates")}
              href={p("/templates")}
              onNavigate={onNavigate}
            />

            {/* <NavItem
              icon={Megaphone}
              label={t("navCampaigns")}
              href={p("/campaigns")}
              onNavigate={onNavigate}
            /> */}
            <NavItem
              icon={Users}
              label={t("navContacts")}
              href={p("/contacts")}
              onNavigate={onNavigate}
            />

            {/* Analytics */}
            <NavItem icon={BarChart2} label={t("navAnalytics")} defaultOpen={normalized.includes("/analytics/")}>
              <NavItem
                icon={PieChart}
                label={t("navOverview")}
                href={p("/analytics/overview")}
                depth={1}
                onNavigate={onNavigate}
              />
              <NavItem
                icon={FileBarChart}
                label={t("navReports")}
                href={p("/analytics/reports")}
                depth={1}
                onNavigate={onNavigate}
              />
            </NavItem>

            {/* Project Settings */}
            <NavItem
              icon={SlidersHorizontal}
              label={t("navProjectSettings")}
              defaultOpen={
                normalized.includes("/settings/") ||
                normalized.includes("/api-keys")
              }
            >
              <NavItem
                icon={Settings2}
                label={t("navSettingsGeneral")}
                href={p("/settings/general")}
                depth={1}
                onNavigate={onNavigate}
              />
              <NavItem
                icon={UsersRound}
                label={t("navTeamMembers")}
                href={p("/settings/team")}
                depth={1}
                onNavigate={onNavigate}
              />
              <NavItem
                icon={KeyRound}
                label={t("navApiKeys")}
                href={p("/api-keys")}
                depth={1}
                onNavigate={onNavigate}
              />
              <NavItem
                icon={FileCode}
                label={t("navApiDocumentation")}
                href="https://connect.nabda-otp.com/docs"
                isExternal
                depth={1}
                onNavigate={onNavigate}
              />
            </NavItem>
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-3 pt-2 border-t border-border space-y-2 shrink-0">
        {mode === "project" && <BalanceWidget />}
        <UserMenu />
      </div>
    </div>
  );
}