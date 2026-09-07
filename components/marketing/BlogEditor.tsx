"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { TextAlign } from "@tiptap/extension-text-align";
import { Image } from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Youtube } from "@tiptap/extension-youtube";
import { common, createLowlight } from "lowlight";
import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Link as UrlIcon,
  Minus,
  Palette,
  Code2,
  PlaySquare,
  Loader2,
} from "lucide-react";

const lowlight = createLowlight(common);

const extensions = [
  StarterKit.configure({
    link: { openOnClick: false, autolink: true },
    heading: { levels: [1, 2, 3] },
    codeBlock: false,
  }),
  TextStyle,
  Color,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Image,
  Placeholder.configure({ placeholder: "Write your article…" }),
  CodeBlockLowlight.configure({ lowlight }),
  Youtube.configure({
    nocookie: true,
    width: 640,
    height: 360,
  }),
];

export interface BlogEditorHandle {
  getHTML: () => string;
}

interface BlogEditorProps {
  initialHtml: string;
  onChange: (html: string) => void;
}

export const BlogEditor = forwardRef<BlogEditorHandle, BlogEditorProps>(
  function BlogEditor({ initialHtml, onChange }, ref) {
    const onChangeRef = useRef(onChange);
    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    const editor = useEditor({
      extensions,
      content: initialHtml,
      immediatelyRender: false,
      onUpdate: ({ editor }) => onChangeRef.current(editor.getHTML()),
    });

    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML() ?? "",
    }));

    return (
      <div className="overflow-hidden rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40">
        <Toolbar editor={editor} />
        <div className="border-t border-hairline">
          <EditorContent editor={editor} className="blog-editor-content" />
        </div>
      </div>
    );
  }
);

// ── Toolbar ──────────────────────────────────────────────────────────────

const FALLBACK_STATE = {
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrike: false,
  isH2: false,
  isH3: false,
  isBulletList: false,
  isOrderedList: false,
  isLink: false,
  isCodeBlock: false,
  alignLeft: false,
  alignCenter: false,
  alignRight: false,
};

function Toolbar({ editor }: { editor: Editor | null }) {
  const [uploading, setUploading] = useState(false);

  const state =
    useEditorState({
      editor,
      selector: ({ editor: e }) => ({
        isBold: !!e?.isActive("bold"),
        isItalic: !!e?.isActive("italic"),
        isUnderline: !!e?.isActive("underline"),
        isStrike: !!e?.isActive("strike"),
        isH2: !!e?.isActive("heading", { level: 2 }),
        isH3: !!e?.isActive("heading", { level: 3 }),
        isBulletList: !!e?.isActive("bulletList"),
        isOrderedList: !!e?.isActive("orderedList"),
        isLink: !!e?.isActive("link"),
        isCodeBlock: !!e?.isActive("codeBlock"),
        alignLeft: !!e?.isActive({ textAlign: "left" }),
        alignCenter: !!e?.isActive({ textAlign: "center" }),
        alignRight: !!e?.isActive({ textAlign: "right" }),
      }),
    }) ?? FALLBACK_STATE;

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  const ed = editor;
  const chain = () => ed.chain().focus();

  function promptLink() {
    const prev = ed.getAttributes("link");
    const url = window.prompt("Link URL", (prev.href as string) ?? "https://");
    if (url === null) return;
    if (url === "") {
      chain().unsetLink().run();
      return;
    }
    chain().setLink({ href: url }).run();
  }

  function promptImageUrl() {
    const url = window.prompt("Image URL (external)", "https://");
    if (!url || url === "https://") return;
    chain().setImage({ src: url }).run();
  }

  function promptYoutube() {
    const url = window.prompt("YouTube video URL", "https://www.youtube.com/watch?v=");
    if (!url || url === "https://www.youtube.com/watch?v=") return;
    chain().setYoutubeVideo({ src: url }).run();
  }

  async function handleFileUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        window.alert(data.error || "Upload failed");
        return;
      }
      chain().setImage({ src: data.url }).run();
    } catch {
      window.alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFileUpload(file);
          e.target.value = "";
        }}
      />
      <div className="flex flex-wrap items-center gap-0.5 border-b border-hairline p-2">
        <ToolbarButton title="Undo" onClick={() => chain().undo().run()}>
          <Undo2 size={15} />
        </ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => chain().redo().run()}>
          <Redo2 size={15} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          title="Heading 2"
          active={state.isH2}
          onClick={() => chain().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Heading 3"
          active={state.isH3}
          onClick={() => chain().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 size={15} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          title="Bold"
          active={state.isBold}
          onClick={() => chain().toggleBold().run()}
        >
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={state.isItalic}
          onClick={() => chain().toggleItalic().run()}
        >
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Underline"
          active={state.isUnderline}
          onClick={() => chain().toggleUnderline().run()}
        >
          <Underline size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Strikethrough"
          active={state.isStrike}
          onClick={() => chain().toggleStrike().run()}
        >
          <Strikethrough size={15} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          title="Code block"
          active={state.isCodeBlock}
          onClick={() => chain().toggleCodeBlock().run()}
        >
          <Code2 size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Bullet list"
          active={state.isBulletList}
          onClick={() => chain().toggleBulletList().run()}
        >
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Ordered list"
          active={state.isOrderedList}
          onClick={() => chain().toggleOrderedList().run()}
        >
          <ListOrdered size={15} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton title="Link" active={state.isLink} onClick={promptLink}>
          <Link2 size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Align left"
          active={state.alignLeft}
          onClick={() => chain().setTextAlign("left").run()}
        >
          <AlignLeft size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Align center"
          active={state.alignCenter}
          onClick={() => chain().setTextAlign("center").run()}
        >
          <AlignCenter size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Align right"
          active={state.alignRight}
          onClick={() => chain().setTextAlign("right").run()}
        >
          <AlignRight size={15} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          title="Upload image"
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImageIcon size={15} />}
        </ToolbarButton>
        <ToolbarButton title="Image URL" onClick={promptImageUrl}>
          <UrlIcon size={15} />
        </ToolbarButton>
        <ToolbarButton title="YouTube video" onClick={promptYoutube}>
          <PlaySquare size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Horizontal rule"
          onClick={() => chain().setHorizontalRule().run()}
        >
          <Minus size={15} />
        </ToolbarButton>

        <label
          title="Text color"
          className="ml-1 inline-flex cursor-pointer items-center rounded-[var(--radius-mg)] p-2 text-chrome-500 transition-colors hover:bg-graphite/60 hover:text-chrome-100"
        >
          <Palette size={15} />
          <input
            type="color"
            aria-label="Text color"
            className="h-0 w-0 opacity-0"
            onChange={(e) => chain().setColor(e.target.value).run()}
          />
        </label>
      </div>
    </>
  );
}

function ToolbarButton({
  children,
  onClick,
  title,
  active = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={
        "inline-flex items-center rounded-[var(--radius-mg)] p-2 transition-colors " +
        (active
          ? "bg-signal/15 text-signal"
          : "text-chrome-500 hover:bg-graphite/60 hover:text-chrome-100")
      }
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-hairline" />;
}
