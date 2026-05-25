// src/app/[locale]/(dashboard)/projects/[projectid]/layout.tsx
"use client";

import { Sidebar } from "@/features/layout/components/sidebar";
import { getProjectById } from "@/features/projects/services/project-service";
import type { ProjectDetails } from "@/features/projects/types";
import { Loader2, Menu, X } from "lucide-react";
import { useLocale } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const projectId = (params.projectId as string) ?? "";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    let cancelled = false;
    (async () => {
      try {
        const data = await getProjectById(projectId);
        if (!cancelled) {
          setProject(data);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          toast.error(
            (err as { message?: string })?.message ?? "Project not found"
          );
          router.push(`/${locale}/projects`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [projectId, router, locale]);

  // Show loader while fetching project
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F7FF]">
        <Loader2 size={28} className="animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="flex h-screen bg-[#F8F7FF] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col h-full">
        <Sidebar
          mode="project"
          projectId={projectId}
          projectName={project.name}
        />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[300px] max-w-[80vw] bg-background shadow-xl animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted cursor-pointer"
              aria-label="Close menu"
            >
              <X size={18} className="text-muted-foreground" />
            </button>
            <Sidebar
              mode="project"
              projectId={projectId}
              projectName={project.name}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <header className="flex items-center h-[57px] px-5 border-b border-border bg-background shrink-0">
          <h1 className="text-sm font-medium text-foreground flex-1 truncate">
            {project.name}
          </h1>
          <div className="relative">
            {/* <button
              className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-muted cursor-pointer"
              aria-label="Notifications"
            >
              <Bell size={18} className="text-foreground" />
              <LanguageSwitcher/>
            </button> */}
          </div>
          <button
            className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-muted cursor-pointer lg:hidden ml-1"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} className="text-foreground" />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}