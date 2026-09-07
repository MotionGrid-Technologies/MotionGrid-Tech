import Link from "next/link";
import type { BlogPostWithRelations } from "@/lib/blog-store";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-ZA", {
    dateStyle: "medium",
  });
}

export function BlogPostsTable({ posts }: { posts: BlogPostWithRelations[] }) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-16 text-center">
        <p className="text-sm text-chrome-500">No blog posts yet.</p>
        <p className="text-xs text-chrome-700">
          Click “New Post” to write your first article.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-hairline text-xs uppercase tracking-wide text-chrome-700">
          <tr>
            <Th>Title</Th>
            <Th>Status</Th>
            <Th>Categories</Th>
            <Th align="right">Views</Th>
            <Th>Published</Th>
            <Th>Updated</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {posts.map((p) => (
            <tr key={p.id} className="text-chrome-500 transition-colors hover:bg-graphite/60">
              <Td>
                <Link
                  href={`/dashboard/admin/marketing/blog/${p.id}`}
                  className="text-chrome-100 hover:text-signal"
                >
                  {p.title}
                </Link>
              </Td>
              <Td>
                <span
                  className={
                    "rounded-full border px-2.5 py-0.5 text-[0.7rem] tracking-wide " +
                    (p.status === "published"
                      ? "text-chrome-100 border-chrome-500"
                      : "text-chrome-700 border-hairline")
                  }
                >
                  {p.status}
                </span>
              </Td>
              <Td>
                <span className="text-chrome-300">
                  {p.categories.length > 0
                    ? p.categories.map((c) => c.name).join(", ")
                    : "—"}
                </span>
              </Td>
              <Td align="right" className="text-chrome-100">
                {p.view_count}
              </Td>
              <Td>
                <span className="text-chrome-300">{formatDate(p.published_at)}</span>
              </Td>
              <Td>
                <span className="text-chrome-700">{formatDate(p.updated_at)}</span>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return <th className={`px-4 py-3 ${align === "right" ? "text-right" : "text-left"}`}>{children}</th>;
}

function Td({
  children,
  align = "left",
  className = "",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <td className={`px-4 py-3 ${align === "right" ? "text-right" : "text-left"} ${className}`}>
      {children}
    </td>
  );
}
