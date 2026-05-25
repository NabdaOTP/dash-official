"use client";

import { Shield, Lock, FileWarning, BookOpen } from "lucide-react";

const tips = [
    {
        icon: Lock,
        title: "Keep keys secret",
        description: "Never commit keys to public repositories or share them publicly",
    },
    {
        icon: FileWarning,
        title: "One key per app",
        description: "Use separate keys for different applications or environments",
    },
    {
        icon: Shield,
        title: "Rotate regularly",
        description: "Revoke old keys and create new ones every few months",
    },
];

export function ApiKeysInfo() {
    return (
        <div className="bg-background rounded-2xl border border-border/60 p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Shield size={16} className="text-blue-600" />
                </div>
                <div>
                    <h2 className="text-base font-semibold text-foreground">
                        Security Best Practices
                    </h2>
                    <p className="text-[11.5px] text-muted-foreground">
                        Keep your API keys safe and secure
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                {tips.map(({ icon: Icon, title, description }) => (
                    <div key={title} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                            <Icon size={14} className="text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-[13px] font-semibold text-foreground">
                                {title}
                            </p>
                            <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                                {description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Docs link */}
            <a
                href="https://connect.nabdaotp.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 pt-4 border-t border-border/60 flex items-center gap-2 text-[12.5px] font-semibold text-[#7C3AED] hover:text-[#6D28D9] cursor-pointer transition-colors"
            >
                <BookOpen size={13} />
                View API Documentation
            </a>
        </div>
    );
}