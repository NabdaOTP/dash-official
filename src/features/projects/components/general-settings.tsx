"use client";

import { useEffect, useState } from "react";
import {
    Check,
    Copy,
    Loader2,
    Settings as SettingsIcon,
    ShieldCheck,
    Trash2,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/features/auth/context/auth-context";
import { DeleteProjectDialog } from "@/features/projects/components/delete-project-dialog";
import { useProjects } from "@/features/projects/context/projects-context";
import { saveMetaWhatsappSettings } from "@/features/projects/services/project-service";
import type {
    Project,
    ProjectMetaWhatsappSettings,
} from "@/features/projects/types";

export function GeneralSettings() {
    const t = useTranslations("settings.general");
    const locale = useLocale();
    const params = useParams();
    const projectId = params?.projectId as string;

    const { projects, refresh } = useProjects();
    const { user } = useAuth();

    const project = projects.find((p) => p.id === projectId) as Project | undefined;

    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [businessId, setBusinessId] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [wabaId, setWabaId] = useState("");
    const [phoneNumberId, setPhoneNumberId] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [savingMeta, setSavingMeta] = useState(false);

    const isOwner = !!project && !!user && project.ownerId === user.id;
    const metaWhatsapp = project?.settings?.metaWhatsapp as
        | ProjectMetaWhatsappSettings
        | undefined;

    useEffect(() => {
        setBusinessId(metaWhatsapp?.businessId || "");
        setBusinessName(metaWhatsapp?.businessName || "");
        setWabaId(metaWhatsapp?.wabaId || "");
        setPhoneNumberId(metaWhatsapp?.phoneNumberId || "");
        setAccessToken("");
    }, [metaWhatsapp, projectId]);

    if (!project) {
        return (
            <div className="rounded-2xl border border-border/60 p-8 bg-white text-center">
                <div className="text-sm text-muted-foreground">{t("loading")}</div>
            </div>
        );
    }

    const handleCopy = async (value: string, field: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopiedField(field);
            toast.success(t("copied"));
            setTimeout(() => setCopiedField(null), 2000);
        } catch {
            toast.error(t("copyFailed"));
        }
    };

    const formatDate = (iso: string) => {
        try {
            return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            }).format(new Date(iso));
        } catch {
            return iso;
        }
    };

    const handleSaveMetaSettings = async () => {
        if (savingMeta) return;
        if (
            !businessId.trim() ||
            !wabaId.trim() ||
            !phoneNumberId.trim() ||
            !accessToken.trim()
        ) {
            toast.error(
                "Business ID, WABA ID, Phone Number ID, and access token are required"
            );
            return;
        }

        setSavingMeta(true);
        try {
            await saveMetaWhatsappSettings(project.id, {
                businessId: businessId.trim(),
                businessName: businessName.trim() || undefined,
                wabaId: wabaId.trim(),
                phoneNumberId: phoneNumberId.trim(),
                accessToken: accessToken.trim(),
            });
            toast.success("Meta WhatsApp settings saved");
            setAccessToken("");
            await refresh();
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to save Meta settings";
            toast.error(message);
        } finally {
            setSavingMeta(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                    <SettingsIcon className="w-5 h-5 text-[#7C3AED]" />
                </div>
                <div>
                    <h1 className="text-[22px] font-bold tracking-tight text-foreground">
                        {t("pageTitle")}
                    </h1>
                    <p className="text-[12.5px] text-muted-foreground">
                        {t("pageSubtitle")}
                    </p>
                </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(124,58,237,0.06)]">
                <div className="mb-5">
                    <h2 className="text-base font-semibold text-foreground">
                        {t("info.title")}
                    </h2>
                    <p className="text-[12px] text-muted-foreground mt-0.5">
                        {t("info.subtitle")}
                    </p>
                </div>

                <div className="space-y-4">
                    <InfoRow
                        label={t("info.name")}
                        value={project.name}
                        helper={t("info.nameHelper")}
                        readonly
                    />
                    <InfoRow
                        label={t("info.id")}
                        value={project.id}
                        mono
                        copyable
                        isCopied={copiedField === "id"}
                        onCopy={() => handleCopy(project.id, "id")}
                        helper={t("info.idHelper")}
                    />
                    <InfoRow
                        label={t("info.created")}
                        value={formatDate(project.createdAt)}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-2 sm:gap-4 items-center">
                        <div className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">
                            {t("info.status")}
                        </div>
                        <div className="flex items-center gap-2">
                            <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-medium ${
                                    project.isActive
                                        ? "bg-green-50 text-green-700"
                                        : "bg-gray-100 text-gray-600"
                                }`}
                            >
                                <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                        project.isActive ? "bg-green-500" : "bg-gray-400"
                                    }`}
                                />
                                {project.isActive
                                    ? t("info.statusActive")
                                    : t("info.statusInactive")}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Meta WhatsApp credentials
                        </div>
                        <h2 className="mt-3 text-base font-semibold text-foreground">
                            Save the test sender credentials for this project
                        </h2>
                        <p className="text-[12px] text-muted-foreground mt-0.5 max-w-2xl">
                            Store the Meta business, WABA, phone number, and access token here. Saving this also syncs the sender into the project so templates, OTP, and message sends can use it.
                        </p>
                    </div>

                    {metaWhatsapp?.updatedAt ? (
                        <div className="rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-[11px] text-muted-foreground">
                            Last saved {formatDate(metaWhatsapp.updatedAt)}
                        </div>
                    ) : null}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <MetaField
                        label="Business ID"
                        value={businessId}
                        onChange={setBusinessId}
                        placeholder="1234567890"
                        helper="Meta business portfolio ID"
                    />
                    <MetaField
                        label="Business Name"
                        value={businessName}
                        onChange={setBusinessName}
                        placeholder="Acme Store"
                        helper="Optional label shown in the dashboard"
                    />
                    <MetaField
                        label="WABA ID"
                        value={wabaId}
                        onChange={setWabaId}
                        placeholder="4419551288316559"
                        helper="WhatsApp Business Account ID from Meta"
                    />
                    <MetaField
                        label="Phone Number ID"
                        value={phoneNumberId}
                        onChange={setPhoneNumberId}
                        placeholder="999372706599985"
                        helper="Sender phone number ID that Meta uses for sends"
                    />
                </div>

                <div className="mt-4">
                    <label className="block text-[11px] uppercase tracking-wide font-semibold text-muted-foreground mb-1.5">
                        Access Token
                    </label>
                    <input
                        type="password"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        placeholder={
                            metaWhatsapp?.accessToken
                                ? "Re-enter to rotate the stored token"
                                : "Paste the Meta access token"
                        }
                        className="w-full h-10 px-3.5 rounded-lg bg-muted/40 border border-border/60 text-[13.5px] outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                    />
                    <p className="mt-1.5 text-[11.5px] text-muted-foreground">
                        The token is stored encrypted in the database and used by the server when it creates templates or sends messages.
                    </p>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={handleSaveMetaSettings}
                        disabled={savingMeta}
                        className="cursor-pointer inline-flex h-10 items-center gap-2 rounded-lg bg-[#7C3AED] px-4 text-[13px] font-medium text-white hover:bg-[#6D28D9] disabled:opacity-60"
                    >
                        {savingMeta ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <ShieldCheck className="w-4 h-4" />
                        )}
                        Save Meta settings
                    </button>
                    {metaWhatsapp?.wabaId ? (
                        <span className="text-[12px] text-muted-foreground">
                            Saved sender will be used by the WABA, templates, and message screens.
                        </span>
                    ) : null}
                </div>
            </div>

            {isOwner ? (
                <div className="rounded-2xl border border-red-200 bg-white overflow-hidden">
                    <div className="border-b border-red-100 bg-red-50/40 px-5 sm:px-6 py-4">
                        <h2 className="text-base font-semibold text-red-900">
                            {t("danger.title")}
                        </h2>
                        <p className="text-[12px] text-red-700/80 mt-0.5">
                            {t("danger.subtitle")}
                        </p>
                    </div>

                    <div className="px-5 sm:px-6 py-5">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-[14px] font-semibold text-foreground">
                                    {t("danger.deleteTitle")}
                                </h3>
                                <p className="text-[12.5px] text-muted-foreground mt-1 leading-relaxed">
                                    {t("danger.deleteDescription")}
                                </p>
                            </div>
                            <button
                                onClick={() => setDeleteDialogOpen(true)}
                                style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
                                className="cursor-pointer h-10 px-4 rounded-lg text-[13px] font-medium active:scale-[0.99] transition-all flex items-center justify-center gap-2 shrink-0 w-full md:w-auto"
                            >
                                <Trash2 className="w-4 h-4" />
                                {t("danger.deleteButton")}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-5 sm:p-6">
                    <p className="text-[12.5px] text-muted-foreground">
                        {t("nonOwnerNotice")}
                    </p>
                </div>
            )}

            <DeleteProjectDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                projectId={project.id}
                projectName={project.name}
            />
        </div>
    );
}

function MetaField({
    label,
    value,
    onChange,
    placeholder,
    helper,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    helper?: string;
}) {
    return (
        <div>
            <label className="block text-[11px] uppercase tracking-wide font-semibold text-muted-foreground mb-1.5">
                {label}
            </label>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-10 px-3.5 rounded-lg bg-muted/40 border border-border/60 text-[13.5px] outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
            />
            {helper ? (
                <p className="mt-1.5 text-[11.5px] text-muted-foreground">{helper}</p>
            ) : null}
        </div>
    );
}

interface InfoRowProps {
    label: string;
    value: string;
    mono?: boolean;
    copyable?: boolean;
    isCopied?: boolean;
    onCopy?: () => void;
    helper?: string;
    readonly?: boolean;
}

function InfoRow({
    label,
    value,
    mono,
    copyable,
    isCopied,
    onCopy,
    helper,
    readonly,
}: InfoRowProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-2 sm:gap-4 items-start">
            <div className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground pt-2">
                {label}
            </div>
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <div
                        className={`flex-1 h-10 px-3.5 rounded-lg bg-muted/40 border border-border/40 flex items-center text-[13.5px] text-foreground ${
                            mono ? "font-mono text-[12.5px]" : ""
                        } ${readonly ? "select-text" : ""}`}
                    >
                        <span className="truncate">{value}</span>
                    </div>
                    {copyable ? (
                        <button
                            type="button"
                            onClick={onCopy}
                            className="cursor-pointer w-10 h-10 rounded-lg border border-border/60 flex items-center justify-center hover:bg-muted transition-colors"
                            aria-label="Copy"
                        >
                            {isCopied ? (
                                <Check className="w-4 h-4 text-green-600" />
                            ) : (
                                <Copy className="w-4 h-4 text-muted-foreground" />
                            )}
                        </button>
                    ) : null}
                </div>
                {helper ? (
                    <p className="text-[11.5px] text-muted-foreground">{helper}</p>
                ) : null}
            </div>
        </div>
    );
}
