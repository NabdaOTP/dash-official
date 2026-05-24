// src/app/[locale]/(dashboard)/projects/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, Plus, ArrowRight, Menu, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Sidebar } from "@/features/layout/components/sidebar";
import { useAuth } from "@/features/auth/context/auth-context";

import { getMyProjects } from "@/features/projects/services/project-service";
import { CreateProjectDialog } from "@/features/projects/components/create-project-dialog";
import type { Project } from "@/features/projects/types";
import { toast } from "sonner";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

export default function ProjectsPage() {
  const router = useRouter();
  const locale = useLocale();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const userName = user?.name ?? "User";

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyProjects();
      setProjects(data);
    } catch (err: unknown) {
      toast.error(
        (err as { message?: string })?.message ?? "Failed to load projects"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchProjects();
    })()
  }, [fetchProjects]);

  // After project is created — navigate to its dashboard
  const handleProjectCreated = (projectId: string) => {
    setShowCreate(false);
    router.push(`/${locale}/projects/${projectId}/dashboard`);
  };

  return (
    <div className="flex h-screen bg-[#F8F7FF] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col h-full">
        <Sidebar mode="home" />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          {/* Sidebar panel */}
          <div className="absolute inset-y-0 left-0 w-[300px] max-w-[80vw] bg-background shadow-xl animate-in slide-in-from-left duration-200">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted cursor-pointer"
              aria-label="Close menu"
            >
              <X size={18} className="text-muted-foreground" />
            </button>
            <Sidebar mode="home" onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Mobile top bar — hamburger only, no header text */}
        <div className="flex items-center justify-end h-14 px-4 border-b border-border bg-background lg:hidden shrink-0">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-muted cursor-pointer"
            aria-label="Open menu"
          >
            <Menu size={20} className="text-foreground" />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 sm:px-8 py-10 max-w-5xl mx-auto">
            {/* Welcome */}
            <div className="text-center mb-10">
              <h1 className="text-[36px] md:text-[48px] font-bold text-foreground">
                Welcome back,{" "}
                <span className="text-[#7C3AED]">{userName}</span>{" "}
                <span>👋</span>
              </h1>
              <p className="text-muted-foreground mt-2 text-[18px] font-normal">
                Manage your projects, send WhatsApp OTPs, and track your usage.
              </p>
            </div>

                  {/* Loading state */}
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 size={28} className="animate-spin text-[#7C3AED]" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() =>
                      router.push(
                        `/${locale}/projects/${project.id}/dashboard`
                      )
                    }
                    className="bg-background border border-border rounded-xl p-5 cursor-pointer hover:border-[#7C3AED] hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center shrink-0">
                        <Building2 size={18} className="text-[#7C3AED]" />
                      </div>
                      <span className="text-[15px] font-semibold text-foreground truncate">
                        {project.name}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-5">
                      Last updated: {formatDate(project.updatedAt)}
                    </p>
                    <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#7C3AED] group-hover:gap-2.5 transition-all">
                      View Project
                      <ArrowRight size={14} />
                    </div>
                  </div>
                ))}

            {/* Create new project */}
                <div
                  onClick={() => setShowCreate(true)}
                  className="border-2 border-dashed border-border hover:border-[#7C3AED] hover:bg-[#F5F3FF] rounded-xl p-5 cursor-pointer flex flex-col items-center justify-center gap-3 min-h-[148px] transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-[#EDE9FE] flex items-center justify-center">
                    <Plus size={18} className="text-[#7C3AED]" />
                  </div>
                  <span className="text-[13.5px] font-medium text-muted-foreground">
                    Create New Project
                  </span>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
 
      {/* Create project dialog */}
      <CreateProjectDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleProjectCreated}
      />
    </div>
  );
}