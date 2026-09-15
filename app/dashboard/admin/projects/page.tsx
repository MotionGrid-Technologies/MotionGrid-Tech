import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/cn";
import { listProjects, type ProjectStatus } from "@/lib/projects-store";
import { setProjectStatusAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Projects",
  robots: { index: false, follow: false },
};

const STATUS_TABS: { key: ProjectStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "planning", label: "Planning" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const NEXT_ACTIONS: Record<ProjectStatus, { label: string; to: ProjectStatus }[]> = {
  planning: [
    { label: "Start work", to: "active" },
    { label: "Cancel", to: "cancelled" },
  ],
  active: [
    { label: "Mark completed", to: "completed" },
    { label: "Cancel", to: "cancelled" },
  ],
  completed: [{ label: "Reopen", to: "active" }],
  cancelled: [{ label: "Restore to planning", to: "planning" }],
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const activeStatus = STATUS_TABS.some((t) => t.key === status)
    ? (status as ProjectStatus | "all")
    : "all";

  const projects = await listProjects({ status: activeStatus });

  return (
    <section className="py-12">
      <Container className="flex max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-1">
          <Eyebrow>Delivery</Eyebrow>
          <h1 className="font-display text-3xl text-chrome-100">Projects</h1>
          <p className="text-sm text-chrome-500">
            Every approved proposal creates a project here automatically. Move them through
            planning, active work, and completion.
          </p>
        </header>

        {/* Status filter ------------------------------------------------------ */}
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.key}
              href={`/dashboard/admin/projects?status=${tab.key}`}
              className={cn(
                "rounded-[var(--radius-mg)] border px-4 py-2 text-sm transition-colors",
                activeStatus === tab.key
                  ? "border-signal bg-signal/10 text-signal"
                  : "border-hairline text-chrome-500 hover:text-chrome-100"
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* List ----------------------------------------------------------------- */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-[var(--radius-mg-lg)] border border-dashed border-hairline p-12 text-center">
            <span className="mg-eyebrow text-chrome-700">No projects yet</span>
            <p className="max-w-sm text-sm text-chrome-700">
              {activeStatus !== "all"
                ? "No projects in this stage."
                : "Projects appear here the moment a client approves a proposal."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-hairline rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40">
            {projects.map((project) => (
              <article key={project.id} className="flex flex-col gap-4 p-6 md:flex-row md:items-start md:justify-between">
                <div className="flex flex-col gap-2 md:max-w-[60%]">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-display text-lg text-chrome-100">{project.name}</h2>
                    <StatusBadge status={project.status} />
                  </div>
                  <p className="text-sm text-chrome-300">
                    {project.client ? project.client.company : "Client removed"}
                    {project.client && (
                      <span className="text-chrome-700"> · {project.client.name}</span>
                    )}
                  </p>
                  {project.description && (
                    <p className="text-sm leading-relaxed text-chrome-500">{project.description}</p>
                  )}
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-chrome-700">
                    <span>Created {new Date(project.created_at).toLocaleDateString("en-ZA")}</span>
                    <span>Updated {new Date(project.updated_at).toLocaleDateString("en-ZA")}</span>
                    {project.proposal_id && (
                      <Link
                        href={`/dashboard/admin/proposals/${project.proposal_id}`}
                        className="text-chrome-500 hover:text-signal"
                      >
                        View proposal →
                      </Link>
                    )}
                  </div>
                </div>

                <form className="flex shrink-0 flex-wrap gap-2">
                  {(NEXT_ACTIONS[project.status] ?? []).map((next) => (
                    <button
                      key={next.to}
                      formAction={setProjectStatusAction.bind(null, project.id, next.to)}
                      className={cn(
                        "rounded-[var(--radius-mg)] border px-3 py-1.5 text-xs transition-colors",
                        next.to === "cancelled"
                          ? "border-signal/30 text-signal hover:border-signal"
                          : "border-hairline text-chrome-300 hover:border-chrome-500 hover:text-chrome-100"
                      )}
                    >
                      {next.label}
                    </button>
                  ))}
                </form>
              </article>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
