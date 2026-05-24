"use client";

import {
    createContext, useCallback, useContext, useEffect, useState,
    type ReactNode,
} from "react";
import { useAuth } from "@/features/auth/context/auth-context";
import { getMyProjects } from "../services/project-service";
import type { Project } from "../types";

interface ProjectsContextValue {
    projects: Project[];
    loading: boolean;
    refresh: () => Promise<void>;
}

const ProjectsContext = createContext<ProjectsContextValue | undefined>(undefined);

export function ProjectsProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchProjects = useCallback(async () => {
        if (!isAuthenticated) {
            setProjects([]);
            return;
        }
        setLoading(true);
        try {
            const data = await getMyProjects();
            setProjects(data);
        } catch {
            // silent fail — sidebar shouldn't show errors
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        (async () => {
            await fetchProjects();
        })()
    }, [fetchProjects]);

    return (
        <ProjectsContext.Provider
            value={{ projects, loading, refresh: fetchProjects }}
        >
            {children}
        </ProjectsContext.Provider>
    );
}

export function useProjects() {
    const ctx = useContext(ProjectsContext);
    if (!ctx) {
        throw new Error("useProjects must be used within ProjectsProvider");
    }
    return ctx;
}