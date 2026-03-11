import { useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Underline, List, Heading1, Heading2, AlignLeft, Sparkles } from "lucide-react";

interface DocsEditorProps {
  /** Initial/injected content in HTML or plain string form. */
  content?: string;
  /** Called with updated HTML whenever the document changes. */
  onChange?: (html: string) => void;
}

export function DocsEditor({ content, onChange }: DocsEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content
      ? `<p>${content.replace(/\n/g, "</p><p>")}</p>`
      : "<p>Start writing here… Use the AI Assist button to generate, improve, or translate content.</p>",
    editorProps: {
      attributes: {
        class: "outline-none min-h-[300px] text-t-primary text-base leading-relaxed",
      },
    },
    onUpdate({ editor: e }) {
      onChange?.(e.getHTML());
    },
  });

  // Inject new content from parent (e.g. tool output)
  useEffect(() => {
    if (!editor || !content) return;
    const html = `<p>${content.replace(/\n/g, "</p><p>")}</p>`;
    // Only replace if the content actually differs to avoid cursor jumps
    if (editor.getHTML() !== html) {
      editor.commands.setContent(html, { emitUpdate: false });
    }
  }, [content, editor]);

  const wordCount = useCallback(() => {
    if (!editor) return 0;
    const text = editor.getText();
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, [editor]);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card">
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-border px-4 py-2">
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`rounded-lg p-2 hover:bg-hover hover:text-t-primary ${editor?.isActive("bold") ? "bg-hover text-t-primary" : "text-t-muted"}`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`rounded-lg p-2 hover:bg-hover hover:text-t-primary ${editor?.isActive("italic") ? "bg-hover text-t-primary" : "text-t-muted"}`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          className={`rounded-lg p-2 hover:bg-hover hover:text-t-primary ${editor?.isActive("strike") ? "bg-hover text-t-primary" : "text-t-muted"}`}
          title="Strikethrough"
        >
          <Underline className="h-4 w-4" />
        </button>
        <div className="mx-1 h-5 w-px bg-divider" />
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`rounded-lg p-2 hover:bg-hover hover:text-t-primary ${editor?.isActive("heading", { level: 1 }) ? "bg-hover text-t-primary" : "text-t-muted"}`}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`rounded-lg p-2 hover:bg-hover hover:text-t-primary ${editor?.isActive("heading", { level: 2 }) ? "bg-hover text-t-primary" : "text-t-muted"}`}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <div className="mx-1 h-5 w-px bg-divider" />
        <button
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`rounded-lg p-2 hover:bg-hover hover:text-t-primary ${editor?.isActive("bulletList") ? "bg-hover text-t-primary" : "text-t-muted"}`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor?.chain().focus().setParagraph().run()}
          className="rounded-lg p-2 text-t-muted hover:bg-hover hover:text-t-primary"
          title="Paragraph"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <div className="flex-1" />
        <button className="flex items-center gap-1.5 rounded-lg bg-indigo-500/20 px-3 py-1.5 text-xs text-indigo-400 hover:bg-indigo-500/30">
          <Sparkles className="h-3 w-3" /> AI Assist
        </button>
      </div>

      {/* TipTap editor area */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-2xl prose dark:prose-invert">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between border-t border-border px-4 py-1.5 text-[11px] text-t-muted">
        <span>Words: {wordCount()}</span>
        <span>Saved</span>
      </div>
    </div>
  );
}
