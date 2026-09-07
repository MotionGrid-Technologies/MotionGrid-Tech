"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { NewPostModal } from "@/components/marketing/NewPostModal";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Author {
  id: string;
  name: string;
  is_default: boolean;
}

interface NewBlogButtonProps {
  categories: Category[];
  authors: Author[];
}

export function NewBlogButton({ categories, authors }: NewBlogButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-[var(--radius-mg)] bg-signal px-4 py-2 text-sm font-semibold text-black hover:bg-signal/90"
      >
        <Plus size={15} />
        New Post
      </button>
      <NewPostModal
        categories={categories}
        authors={authors}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
