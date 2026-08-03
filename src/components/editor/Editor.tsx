import { useEffect } from "react"
import { useEditor, EditorContent, type JSONContent } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { Placeholder } from "@tiptap/extensions"
import { Toolbar } from "./Toolbar"
import { SlashCommand } from "./SlashCommandExtension"
import { WikiLinkNode } from "./WikiLink"
import { CollapsibleBlockNode } from "./CollapsibleBlock"
import { CalloutBlockNode } from "./CalloutBlock"

interface EditorProps {
  content?: JSONContent | string
  onChange?: (content: string) => void
  onUpdateJSON?: (content: JSONContent) => void
  onUpdateHTML?: (content: string) => void
  placeholder?: string
  readOnly?: boolean
}

export function Editor({
  content = "",
  onChange,
  onUpdateJSON,
  onUpdateHTML,
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
      CollapsibleBlockNode,
      CalloutBlockNode,
    ],
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const json = editor.getJSON()
      onChange?.(html)
      onUpdateHTML?.(html)
      onUpdateJSON?.(json)
    },
  })

  // Sync content when document selection changes
  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    const currentJSON = JSON.stringify(editor.getJSON())
    const nextJSON = typeof content === "object" ? JSON.stringify(content) : null

    if (nextJSON && currentJSON !== nextJSON) {
      editor.commands.setContent(content)
    } else if (typeof content === "string" && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [editor, content])

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
