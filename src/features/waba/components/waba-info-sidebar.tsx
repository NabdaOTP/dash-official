"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import {
    FileText, KeyRound, BookOpen, ArrowRight, Info,
} from "lucide-react";

export function WabaInfoSidebar() {
    const t = useTranslations("waba.sidebar");
    const params = useParams();
    const projectId = params?.projectId as string;

    return (
        <div className="space-y-4">
            {/* Next steps */}
            <div className="rounded-2xl border border-border/60 bg-white p-5">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-[#EDE9FE] flex items-center justify-center">
                        <Info className="w-3.5 h-3.5 text-[#7C3AED]" />
                    </div>
                    <h3 className="text-[13px] font-semibold text-foreground">
                        {t("nextSteps.title")}
                    </h3>
                </div>
                <p className="text-[12px] text-muted-foreground leading-relaxed mb-4">
                    {t("nextSteps.description")}
                </p>

                <div className="space-y-2">
                    <QuickLink
                        href={`/projects/${projectId}/templates`}
                        icon={<FileText className="w-3.5 h-3.5" />}
                        label={t("links.templates")}
                    />
                    <QuickLink
                        href={`/projects/${projectId}/api-keys`}
                        icon={<KeyRound className="w-3.5 h-3.5" />}
                        label={t("links.apiKeys")}
                    />
                </div>
            </div>

            {/* Docs card */}
            <div className="rounded-2xl border border-border/60 bg-linear-to-br from-[#F8F7FF] to-white p-5">
                <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-[#7C3AED]" />
                    <h3 className="text-[13px] font-semibold text-foreground">
                        {t("docs.title")}
                    </h3>
                </div>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                    {t("docs.description")}
                </p>
            </div>
        </div>
    );
}

function QuickLink({
    href,
    icon,
    label,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <Link
            href={href}
            className="group cursor-pointer flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg hover:bg-[#EDE9FE]/40 transition-colors"
        >
            <span className="flex items-center gap-2 text-[12.5px] font-medium text-foreground">
                <span className="text-[#7C3AED]">{icon}</span>
                {label}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[#7C3AED] group-hover:translate-x-0.5 transition-all" />
        </Link>
    );
}