"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Building2, ChevronsUpDown, Check, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useProjects } from "@/features/projects/context/projects-context";

interface ProjectSelectorProps {
  projectName: string;
}

export function ProjectSelector({ projectName }: ProjectSelectorProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const params = useParams();
  const currentProjectId = params.projectId as string;
  const { projects, loading } = useProjects();

  const handleOpen = () => {
    setOpen((o) => !o);
    projects.forEach((p) => {
      router.prefetch(`/${locale}/projects/${p.id}/dashboard`);
    });
  };

  const handleCreate = () => {
    setOpen(false);
    router.push(`/${locale}/projects`);
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={handleOpen}
        className="w-full flex items-center gap-2.5 rounded-xl bg-muted/60 hover:bg-muted px-3 py-2.5 transition-colors cursor-pointer border border-border/50"
      >
        <div className="w-7 h-7 rounded-lg bg-[#EDE9FE] flex items-center justify-center shrink-0">
          <Building2 size={14} className="text-[#7C3AED]" />
        </div>
        <div className="flex-1 text-start min-w-0">
          <p className="text-[10px] text-muted-foreground leading-tight">
            Current Project
          </p>
          <p className="text-[13px] font-semibold text-foreground truncate leading-tight">
            {projectName}
          </p>
        </div>
        <ChevronsUpDown
          size={14}
          className="text-muted-foreground/60 shrink-0"
        />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-background border border-border rounded-xl shadow-lg overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 size={16} className="animate-spin text-muted-foreground" />
              </div>
            ) : projects.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No projects yet
              </p>
            ) : (
              <div className="py-1 max-h-64 overflow-y-auto">
                {projects.map((project) => {
                  const isSelected = project.id === currentProjectId;
                  return (
                    <Link
                      key={project.id}
                      href={`/${locale}/projects/${project.id}/dashboard`}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2.5 text-left cursor-pointer transition-colors",
                        isSelected ? "bg-[#F5F3FF]" : "hover:bg-muted/60"
                      )}
                    >
                      <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Building2 size={14} className="text-muted-foreground" />
                      </div>
                      <span
                        className={cn(
                          "flex-1 text-[13px] truncate",
                          isSelected
                            ? "font-semibold text-[#7C3AED]"
                            : "font-medium text-foreground"
                        )}
                      >
                        {project.name}
                      </span>
                      {isSelected && (
                        <Check size={14} className="text-[#7C3AED] shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </div>
            )}

            <div className="border-t border-border" />

            <button
              onClick={handleCreate}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left cursor-pointer hover:bg-muted/60 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Plus size={14} className="text-muted-foreground" />
              </div>
              <span className="text-[13px] font-medium text-muted-foreground">
                Create New Project
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}