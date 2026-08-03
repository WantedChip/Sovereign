import { useEditor, EditorContent } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { Placeholder } from "@tiptap/extensions"
import { Toolbar } from "./Toolbar"
import { SlashCommand } from "./SlashCommandExtension"
import { WikiLinkNode } from "./WikiLink"

interface EditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
  readOnly?: boolean
}

export function Editor({
  content = "",
  onChange,
  placeholder = "Start typing your notes, or type '/' for slash commands, '[[' for wiki links...",
  readOnly = false,
}: EditorProps) {
  const editor = useEditor({
    editable: !readOnly,
    content,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      SlashCommand,
      WikiLinkNode,
    ],
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 bg-background rounded-sm border border-slate-line overflow-hidden">
      <Toolbar editor={editor} />
      <div className="flex-1 overflow-y-auto p-6 md:p-8 cursor-text">
        <EditorContent
          editor={editor}
          className="prose prose-invert max-w-none focus:outline-none min-h-[400px] h-full"
        />
      </div>
    </div>
  )
}
