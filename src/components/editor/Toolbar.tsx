import { type Editor } from "@tiptap/react"
import { Separator } from "@/components/ui/separator"
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  SquareCode,
  Minus,
  Undo,
  Redo,
} from "lucide-react"

interface ToolbarProps {
  editor: Editor | null
}

export function Toolbar({ editor }: ToolbarProps) {
  if (!editor) {
    return null
  }

  const items = [
    {
      label: "Bold",
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
    },
    {
      label: "Italic",
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
    },
    {
      label: "Strikethrough",
      icon: Strikethrough,
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive("strike"),
    },
    {
      label: "Inline Code",
      icon: Code,
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive("code"),
    },
    { type: "divider" as const },
    {
      label: "Heading 1",
      icon: Heading1,
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive("heading", { level: 1 }),
    },
    {
      label: "Heading 2",
      icon: Heading2,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive("heading", { level: 2 }),
    },
    {
      label: "Heading 3",
      icon: Heading3,
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive("heading", { level: 3 }),
    },
    { type: "divider" as const },
    {
      label: "Bullet List",
      icon: List,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
    },
    {
      label: "Ordered List",
      icon: ListOrdered,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
    },
    {
      label: "Blockquote",
      icon: Quote,
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive("blockquote"),
    },
    {
      label: "Code Block",
      icon: SquareCode,
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive("codeBlock"),
    },
    {
      label: "Horizontal Rule",
      icon: Minus,
      action: () => editor.chain().focus().setHorizontalRule().run(),
      isActive: false,
    },
    { type: "divider" as const },
    {
      label: "Undo",
      icon: Undo,
      action: () => editor.chain().focus().undo().run(),
      disabled: !editor.can().undo(),
      isActive: false,
    },
    {
      label: "Redo",
      icon: Redo,
      action: () => editor.chain().focus().redo().run(),
      disabled: !editor.can().redo(),
      isActive: false,
    },
  ]

  return (
    <div className="flex flex-wrap items-center gap-1 p-1.5 bg-ink/90 border-b border-slate-line text-xs font-mono select-none sticky top-0 z-10 backdrop-blur-sm">
      {items.map((item, index) => {
        if ("type" in item && item.type === "divider") {
          return (
            <Separator
              key={`divider-${index}`}
              orientation="vertical"
              className="h-4 mx-1 bg-slate-line"
            />
          )
        }

        const Icon = item.icon
        return (
          <button
            key={item.label}
            type="button"
            onClick={item.action}
            disabled={item.disabled}
            title={item.label}
            className={`h-7 w-7 rounded-sm flex items-center justify-center transition-all duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
              item.isActive
                ? "bg-brass/20 text-brass border border-brass/60 font-bold shadow-inner"
                : "text-muted-foreground hover:text-parchment hover:bg-secondary/60 border border-transparent"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        )
      })}
    </div>
  )
}
