import { useEffect, useRef, useCallback } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import cytoscape, { type Core } from "cytoscape"
import fcose from "cytoscape-fcose"
import { db } from "@/lib/db/schema"
import { createFromLink } from "@/lib/db/operations"
import { Button } from "@/components/ui/button"
import { Maximize2, ZoomIn, ZoomOut, RotateCcw, Network } from "lucide-react"

// Register fcose layout with Cytoscape
try {
  cytoscape.use(fcose)
} catch {
  // Extension already registered
}

export interface KnowledgeGraphProps {
  activeDocumentId: string | null
  onSelectDocument: (id: string) => void
  height?: string
}

export function KnowledgeGraph({
  activeDocumentId,
  onSelectDocument,
  height = "100%",
}: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)

  const documents = useLiveQuery(() => db.documents.toArray(), [])
  const links = useLiveQuery(() => db.links.toArray(), [])

  // Initialize and update Cytoscape instance
  useEffect(() => {
    if (!containerRef.current) return

    const degreeMap = new Map<string, number>()
    if (documents) {
      for (const doc of documents) degreeMap.set(doc.id, 0)
    }
    if (links) {
      for (const link of links) {
        degreeMap.set(link.sourceId, (degreeMap.get(link.sourceId) ?? 0) + 1)
        if (link.targetId) {
          degreeMap.set(link.targetId, (degreeMap.get(link.targetId) ?? 0) + 1)
        }
      }
    }

    const docNodes = (documents ?? []).map((doc) => {
      const deg = degreeMap.get(doc.id) ?? 0
      const isCurrent = doc.id === activeDocumentId
      return {
        data: {
          id: doc.id,
          label: doc.title || "Untitled",
          degree: deg,
          isCurrent: isCurrent ? "true" : "false",
          isUnresolved: "false",
        },
      }
    })

    const unresolvedTitles = new Set<string>()
    const unresolvedNodes = []
    if (links) {
      for (const link of links) {
        if (!link.targetId && link.targetTitle) {
          const norm = link.targetTitle.toLowerCase().trim()
          if (!unresolvedTitles.has(norm)) {
            unresolvedTitles.add(norm)
            unresolvedNodes.push({
              data: {
                id: `unresolved-${norm}`,
                label: `[[${link.targetTitle}]]`,
                targetTitle: link.targetTitle,
                degree: 1,
                isCurrent: "false",
                isUnresolved: "true",
              },
            })
          }
        }
      }
    }

    const allNodeIds = new Set([
      ...docNodes.map((n) => n.data.id),
      ...unresolvedNodes.map((n) => n.data.id),
    ])

    const edges = (links ?? [])
      .map((link) => {
        const targetNodeId = link.targetId || `unresolved-${link.targetTitle.toLowerCase().trim()}`
        return {
          data: {
            id: `edge-${link.sourceId}-${targetNodeId}`,
            source: link.sourceId,
            target: targetNodeId,
          },
        }
      })
      .filter((e) => allNodeIds.has(e.data.source) && allNodeIds.has(e.data.target))

    const elements = [...docNodes, ...unresolvedNodes, ...edges]

    if (!cyRef.current) {
      cyRef.current = cytoscape({
        container: containerRef.current,
        elements,
        style: [
          {
            selector: "node",
            style: {
              "background-color": "#161B18",
              "border-color": "#3A413C",
              "border-width": 2,
              label: "data(label)",
              color: "#E9E4D4",
              "font-family": "Inter, sans-serif",
              "font-size": "10px",
              "text-valign": "bottom",
              "text-margin-y": 4,
              width: "mapData(degree, 0, 10, 24, 48)",
              height: "mapData(degree, 0, 10, 24, 48)",
            },
          },
          {
            selector: 'node[isCurrent = "true"]',
            style: {
              "background-color": "#2A2415",
              "border-color": "#C9A227",
              "border-width": 3,
              color: "#C9A227",
              "font-weight": "bold",
              width: "mapData(degree, 0, 10, 32, 56)",
              height: "mapData(degree, 0, 10, 32, 56)",
            },
          },
          {
            selector: 'node[isUnresolved = "true"]',
            style: {
              "background-color": "#0A0D0C",
              "border-color": "#C9A227",
              "border-style": "dashed",
              "border-width": 1.5,
              color: "#C9A227",
              opacity: 0.8,
            },
          },
          {
            selector: "edge",
            style: {
              width: 1.5,
              "line-color": "#3A413C",
              "target-arrow-color": "#3A413C",
              "target-arrow-shape": "triangle",
              "curve-style": "bezier",
              opacity: 0.7,
            },
          },
        ],
        layout: {
          name: "fcose",
          animate: false,
          fit: true,
          padding: 20,
        } as unknown as cytoscape.LayoutOptions,
      })

      // Node click handler
      cyRef.current.on("tap", "node", async (evt) => {
        const node = evt.target
        const isUnresolved = node.data("isUnresolved") === "true"

        if (isUnresolved) {
          const title = node.data("targetTitle")
          if (title) {
            const newDoc = await createFromLink(title)
            onSelectDocument(newDoc.id)
          }
        } else {
          const docId = node.id()
          if (docId) {
            onSelectDocument(docId)
          }
        }
      })
    } else {
      // Batch update elements and styling
      cyRef.current.json({ elements })
      cyRef.current
        .layout({
          name: "fcose",
          animate: true,
          animationDuration: 300,
          fit: true,
          padding: 20,
        } as unknown as cytoscape.LayoutOptions)
        .run()
    }
  }, [documents, links, activeDocumentId, onSelectDocument])

  const handleFit = useCallback(() => {
    cyRef.current?.fit(undefined, 20)
  }, [])

  const handleZoomIn = useCallback(() => {
    if (!cyRef.current) return
    const zoom = cyRef.current.zoom()
    cyRef.current.zoom({
      level: zoom * 1.25,
      renderedPosition: {
        x: cyRef.current.width() / 2,
        y: cyRef.current.height() / 2,
      },
    })
  }, [])

  const handleZoomOut = useCallback(() => {
    if (!cyRef.current) return
    const zoom = cyRef.current.zoom()
    cyRef.current.zoom({
      level: zoom * 0.8,
      renderedPosition: {
        x: cyRef.current.width() / 2,
        y: cyRef.current.height() / 2,
      },
    })
  }, [])

  const handleResetLayout = useCallback(() => {
    cyRef.current
      ?.layout({
        name: "fcose",
        animate: true,
        animationDuration: 400,
        fit: true,
        padding: 20,
      } as unknown as cytoscape.LayoutOptions)
      .run()
  }, [])

  const docCount = documents?.length ?? 0
  const linkCount = links?.length ?? 0

  return (
    <div
      className="relative w-full rounded-sm border border-slate-line bg-ink/90 overflow-hidden flex flex-col select-none"
      style={{ height }}
    >
      {/* Graph Controls Toolbar Overlay */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-ink/90 border border-slate-line/80 p-1 rounded-sm shadow-md font-mono">
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6 text-muted-foreground hover:text-brass"
          onClick={handleFit}
          title="Fit to View"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6 text-muted-foreground hover:text-brass"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6 text-muted-foreground hover:text-brass"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6 text-muted-foreground hover:text-brass"
          onClick={handleResetLayout}
          title="Reset Layout"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Graph Stats Badge Overlay */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 bg-ink/90 border border-slate-line/80 px-2 py-0.5 rounded-sm text-[10px] font-mono text-muted-foreground">
        <Network className="w-3 h-3 text-brass" />
        <span>
          {docCount} {docCount === 1 ? "node" : "nodes"} • {linkCount}{" "}
          {linkCount === 1 ? "edge" : "edges"}
        </span>
      </div>

      {/* Cytoscape Canvas Container */}
      <div ref={containerRef} className="w-full flex-1 cursor-grab active:cursor-grabbing" />
    </div>
  )
}
