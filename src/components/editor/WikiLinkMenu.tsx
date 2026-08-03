import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { FileText, Link } from "lucide-react"

export interface WikiLinkItem {
  title: string
  id?: string
}

export interface WikiLinkMenuProps {
  items: WikiLinkItem[]
  query: string
  command: (item: WikiLinkItem) => void
}

export interface WikiLinkMenuRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

export const WikiLinkMenu = forwardRef<WikiLinkMenuRef, WikiLinkMenuProps>(
  ({ items, query, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    useEffect(() => {
      setSelectedIndex(0)
    }, [items])

    const selectItem = (index: number) => {
      if (index >= 0 && index < items.length) {
        command(items[index])
      } else if (query.trim()) {
        // Fallback for creating a new wiki link to a non-existent target
        command({ title: query.trim() })
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

    const hasExactMatch = items.some(
      (item) => item.title.toLowerCase() === query.trim().toLowerCase()
    )

    return (
      <div className="z-50 w-64 max-h-72 overflow-y-auto rounded-sm border border-slate-line bg-card/95 backdrop-blur-md shadow-xl p-1 space-y-0.5 animate-in fade-in-50 zoom-in-95 duration-100 select-none">
        <div className="px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-brass border-b border-slate-line/50 mb-1 flex items-center justify-between">
          <span>Wiki Link Target</span>
          <Link className="w-3 h-3 text-brass" />
        </div>

        {items.map((item, index) => {
          const isSelected = index === selectedIndex
          return (
            <button
              key={item.title}
              type="button"
              onClick={() => selectItem(index)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full flex items-center gap-2 p-2 rounded-sm text-left transition-colors cursor-pointer ${
                isSelected
                  ? "bg-brass/20 text-brass border border-brass/60 font-semibold"
                  : "text-parchment hover:bg-secondary/60 border border-transparent"
              }`}
            >
              <FileText className="w-3.5 h-3.5 shrink-0 text-brass" />
              <span className="text-xs font-sans truncate">{item.title}</span>
            </button>
          )
        })}

        {query.trim() && !hasExactMatch && (
          <button
            type="button"
            onClick={() => selectItem(-1)}
            className="w-full flex items-center gap-2 p-2 rounded-sm text-left transition-colors cursor-pointer text-brass hover:bg-brass/10 border border-dashed border-brass/40 mt-1"
          >
            <Link className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs font-sans font-medium truncate">
              Link to &quot;{query.trim()}&quot;
            </span>
          </button>
        )}
      </div>
    )
  }
)

WikiLinkMenu.displayName = "WikiLinkMenu"
