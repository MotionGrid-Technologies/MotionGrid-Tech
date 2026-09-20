import Link from "next/link";
import { Plus } from "lucide-react";

export function NewBlogButton() {
  return (
    <Link
      href="/dashboard/admin/marketing/blog/new"
      className="inline-flex items-center gap-1.5 rounded-[var(--radius-mg)] bg-signal px-4 py-2 text-sm font-semibold text-black hover:bg-signal/90"
    >
      <Plus size={15} />
      New Post
    </Link>
  );
}