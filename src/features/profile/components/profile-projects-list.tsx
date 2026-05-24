"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Building2, ArrowRight, Plus, Loader2, FolderOpen } from "lucide-react";
import { useProjects } from "@/features/projects/context/projects-context";

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function ProfileProjectsList() {
    const router = useRouter();
    const locale = useLocale();
    const { projects, loading } = useProjects();

    return (
        <div className="bg-background rounded-2xl border border-border/60 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                        <FolderOpen size={16} className="text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-foreground">
                            My Projects
                        </h2>
                        {!loading && (
                            <p className="text-[11px] text-muted-foreground">
                                {projects.length} {projects.length === 1 ? "project" : "projects"}
                            </p>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => router.push(`/${locale}/projects`)}
                    className="text-[12px] font-semibold text-[#7C3AED] hover:text-[#6D28D9] cursor-pointer transition-colors"
                >
                    View all
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 size={20} className="animate-spin text-muted-foreground" />
                </div>
            ) : projects.length === 0 ? (
                <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                        <Building2 size={20} className="text-muted-foreground" />
                    </div>
                    <p className="text-[13px] font-semibold text-foreground mb-1">
                        No projects yet
                    </p>
                    <p className="text-[12px] text-muted-foreground mb-4">
                        Create your first project to get started
                    </p>
                    <button
                        onClick={() => router.push(`/${locale}/projects`)}
                        className="h-9 px-4 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[13px] font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                    >
                        <Plus size={14} />
                        Create Project
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {projects.slice(0, 6).map((project) => (
                        <button
                            key={project.id}
                            onClick={() =>
                                router.push(`/${locale}/projects/${project.id}/dashboard`)
                            }
                            className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-[#7C3AED] hover:bg-[#F5F3FF]/50 transition-all cursor-pointer group text-start"
                        >
                            <div className="w-10 h-10 rounded-lg bg-[#EDE9FE] flex items-center justify-center shrink-0 group-hover:bg-[#7C3AED] transition-colors">
                                <Building2
                                    size={16}
                                    className="text-[#7C3AED] group-hover:text-white transition-colors"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13.5px] font-semibold text-foreground truncate">
                                    {project.name}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    Created {formatDate(project.createdAt)}
                                </p>
                            </div>
                            <ArrowRight
                                size={14}
                                className="text-muted-foreground/40 group-hover:text-[#7C3AED] group-hover:translate-x-0.5 transition-all shrink-0"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}