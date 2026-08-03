import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import type { Editor, Range } from "@tiptap/core"

export interface SlashCommandItem {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  command: (props: { editor: Editor; range: Range }) => void
}

export interface SlashMenuProps {
  items: SlashCommandItem[]
  command: (item: SlashCommandItem) => void
}

export interface SlashMenuRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

export const SlashMenu = forwardRef<SlashMenuRef, SlashMenuProps>(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    setSelectedIndex(0)
  }, [items])

  const selectItem = (index: number) => {
    const item = items[index]
    if (item) {
      command(item)
    }
  }

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1))
        return true
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0))
        return true
      }
      if (event.key === "Enter") {
        selectItem(selectedIndex)
        return true
      }
      return false
    },
  }))

  if (items.length === 0) {
    return (
      <div className="z-50 min-w-[240px] p-3 rounded-sm border border-slate-line bg-card/95 backdrop-blur-md shadow-xl text-xs font-mono text-muted-foreground">
        No commands found
      </div>
    )
  }

  return (
    <div className="z-50 w-64 max-h-80 overflow-y-auto rounded-sm border border-slate-line bg-card/95 backdrop-blur-md shadow-xl p-1 space-y-0.5 animate-in fade-in-50 zoom-in-95 duration-100 select-none">
      <div className="px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-brass border-b border-slate-line/50 mb-1">
        Insert Block
      </div>
      {items.map((item, index) => {
        const Icon = item.icon
        const isSelected = index === selectedIndex
        return (
          <button
            key={item.title}
            type="button"
            onClick={() => selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
            className={`w-full flex items-center gap-2.5 p-2 rounded-sm text-left transition-colors cursor-pointer ${
              isSelected
                ? "bg-brass/20 text-brass border border-brass/60 font-semibold"
                : "text-parchment hover:bg-secondary/60 border border-transparent"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-sm flex items-center justify-center shrink-0 ${
                isSelected
                  ? "bg-brass/30 text-brass"
                  : "bg-secondary border border-slate-line text-muted-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-sans font-medium text-parchment leading-none mb-1">
                {item.title}
              </div>
              <div className="text-[10px] font-sans text-muted-foreground truncate leading-tight">
                {item.description}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
})

SlashMenu.displayName = "SlashMenu"
