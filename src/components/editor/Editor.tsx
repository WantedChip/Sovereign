import { useEffect } from "react"
import { useEditor, EditorContent, type JSONContent, type AnyExtension } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { Placeholder } from "@tiptap/extensions"
import Collaboration from "@tiptap/extension-collaboration"
import CollaborationCaret from "@tiptap/extension-collaboration-caret"
import type * as Y from "yjs"
import { Toolbar } from "./Toolbar"
import { SlashCommand } from "./SlashCommandExtension"
import { WikiLinkNode } from "./WikiLink"
import { CollapsibleBlockNode } from "./CollapsibleBlock"
import { CalloutBlockNode } from "./CalloutBlock"
import { InlineSuggestionExtension } from "../ai/InlineSuggestion"

export interface EditorUserPresence {
  name: string
  color: string
}

export interface EditorProps {
  content?: JSONContent | string
  ydoc?: Y.Doc
  xmlFragment?: Y.XmlFragment
  provider?: unknown
  user?: EditorUserPresence
  onChange?: (content: string) => void
  onUpdateJSON?: (content: JSONContent) => void
  onUpdateHTML?: (content: string) => void
  placeholder?: string
  readOnly?: boolean
}

export function Editor({
  content = "",
  ydoc,
  xmlFragment,
  provider = null,
  user = { name: "Anonymous Surveyor", color: "#C9A227" },
  onChange,
  onUpdateJSON,
  onUpdateHTML,
  placeholder = "Start typing your notes, or type '/' for slash commands, '[[' for wiki links...",
  readOnly = false,
}: EditorProps) {
  const isCollabActive = Boolean(ydoc || xmlFragment)

  const extensions: AnyExtension[] = [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
      // Disable ProseMirror undoRedo (history) when Yjs collaboration is active — Yjs has its own UndoManager
      undoRedo: isCollabActive ? false : {},
    }),
    Placeholder.configure({
      placeholder,
    }),
    SlashCommand,
    WikiLinkNode,
    CollapsibleBlockNode,
    CalloutBlockNode,
    InlineSuggestionExtension,
  ]

  if (xmlFragment) {
    extensions.push(
      Collaboration.configure({
        fragment: xmlFragment,
      })
    )
  } else if (ydoc) {
    extensions.push(
      Collaboration.configure({
        document: ydoc,
        field: "document",
      })
    )
  }

  if (isCollabActive) {
    extensions.push(
      CollaborationCaret.configure({
        provider: provider || null,
        user,
      })
    )
  }

  const editor = useEditor({
    editable: !readOnly,
    content: isCollabActive ? undefined : content,
    extensions,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const json = editor.getJSON()
      onChange?.(html)
      onUpdateHTML?.(html)
      onUpdateJSON?.(json)
    },
  })

  // Sync content when document content prop changes (for non-collab or initial empty fragment population)
  useEffect(() => {
    if (!editor || editor.isDestroyed) return

    if (!isCollabActive) {
      const currentJSON = JSON.stringify(editor.getJSON())
      const nextJSON = typeof content === "object" ? JSON.stringify(content) : null

      if (nextJSON && currentJSON !== nextJSON) {
        editor.commands.setContent(content)
      } else if (typeof content === "string" && content !== editor.getHTML()) {
        editor.commands.setContent(content)
      }
    } else if (content && editor.isEmpty) {
      // Populate Yjs fragment with initial content if fragment is currently empty
      editor.commands.setContent(content)
    }
  }, [editor, content, isCollabActive])

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
