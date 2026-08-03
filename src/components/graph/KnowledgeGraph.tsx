import { useEffect, useRef, useState, useCallback } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import cytoscape, { type Core, type NodeSingular, type EdgeSingular } from "cytoscape"
import fcose from "cytoscape-fcose"
import { db } from "@/lib/db/schema"
import { createFromLink } from "@/lib/db/operations"
import { GraphControls } from "./GraphControls"
import { GraphTooltip, type TooltipData } from "./GraphTooltip"

// Register fcose layout with Cytoscape
try {
  cytoscape.use(fcose)
} catch {
  // Extension already registered
}

export interface KnowledgeGraphProps {
  activeDocumentId: string | null
  onSelectDocument: (id: string) => void
  searchQuery?: string
  height?: string
}

export function KnowledgeGraph({
  activeDocumentId,
  onSelectDocument,
  searchQuery,
  height = "100%",
}: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null)

  const documents = useLiveQuery(() => db.documents.toArray(), [])
  const links = useLiveQuery(() => db.links.toArray(), [])

  // Initialize and update Cytoscape instance
  useEffect(() => {
    if (!containerRef.current) return

    const degreeMap = new Map<string, number>()
    const docMetaMap = new Map<string, { wordCount: number; updatedAt: Date }>()

    if (documents) {
      for (const doc of documents) {
        degreeMap.set(doc.id, 0)
        docMetaMap.set(doc.id, { wordCount: doc.wordCount, updatedAt: doc.updatedAt })
      }
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
              "transition-property": "opacity, background-color, border-color",
              "transition-duration": 0.15,
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
              "transition-property": "opacity, line-color",
              "transition-duration": 0.15,
            },
          },
          {
            selector: ".dimmed",
            style: {
              opacity: 0.15,
            },
          },
          {
            selector: ".search-highlight",
            style: {
              "border-color": "#C9A227",
              "border-width": 3,
              color: "#C9A227",
              "font-weight": "bold",
              opacity: 1,
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

      // Single tap node handler -> navigate
      cyRef.current.on("tap", "node", async (evt) => {
        const node = evt.target as NodeSingular
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

      // Double tap node handler -> center & zoom
      cyRef.current.on("dbltap", "node", (evt) => {
        const node = evt.target as NodeSingular
        cyRef.current?.animate(
          {
            center: { eles: node },
            zoom: 1.5,
          },
          {
            duration: 300,
          }
        )
      })

      // Tap edge handler -> highlight connected nodes & edge
      cyRef.current.on("tap", "edge", (evt) => {
        const edge = evt.target as EdgeSingular
        const connected = edge.connectedNodes()
        if (!cyRef.current) return

        cyRef.current.elements().addClass("dimmed")
        edge.removeClass("dimmed")
        connected.removeClass("dimmed")
      })

      // Background tap -> clear dimming
      cyRef.current.on("tap", (evt) => {
        const cy = cyRef.current
        if (cy && evt.target === cy) {
          cy.elements().removeClass("dimmed")
          setTooltipData(null)
        }
      })

      // Hover node handler -> highlight neighborhood & show tooltip
      cyRef.current.on("mouseover", "node", (evt) => {
        const node = evt.target as NodeSingular
        const isUnresolved = node.data("isUnresolved") === "true"
        const meta = docMetaMap.get(node.id())
        const renderedPos = node.renderedPosition()

        setTooltipData({
          title: node.data("label"),
          wordCount: meta?.wordCount,
          updatedAt: meta?.updatedAt,
          degree: node.data("degree") || 0,
          isUnresolved,
          x: renderedPos.x,
          y: renderedPos.y,
        })

        const neighborhood = node.closedNeighborhood()
        if (cyRef.current) {
          cyRef.current.elements().not(neighborhood).addClass("dimmed")
          neighborhood.removeClass("dimmed")
        }
      })

      // Mouseout node handler -> restore graph & hide tooltip
      cyRef.current.on("mouseout", "node", () => {
        setTooltipData(null)
        if (cyRef.current) {
          cyRef.current.elements().removeClass("dimmed")
        }
      })
    } else {
      // Batch update graph elements
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

  // Search Query Highlighting effect
  useEffect(() => {
    if (!cyRef.current) return
    const query = searchQuery?.trim().toLowerCase()

    if (!query) {
      cyRef.current.elements().removeClass("dimmed").removeClass("search-highlight")
      return
    }

    cyRef.current.batch(() => {
      if (!cyRef.current) return
      cyRef.current.elements().addClass("dimmed").removeClass("search-highlight")

      cyRef.current.nodes().each((node) => {
        const label = (node.data("label") || "").toLowerCase()
        if (label.includes(query)) {
          node.removeClass("dimmed").addClass("search-highlight")
          node.connectedEdges().removeClass("dimmed").addClass("search-highlight")
        }
      })
    })
  }, [searchQuery])

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
      {/* Graph Controls Overlay */}
      <GraphControls
        nodeCount={docCount}
        edgeCount={linkCount}
        onFit={handleFit}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetLayout={handleResetLayout}
      />

      {/* Floating Hover Tooltip */}
      <GraphTooltip data={tooltipData} />

      {/* Cytoscape Canvas Container */}
      <div ref={containerRef} className="w-full flex-1 cursor-grab active:cursor-grabbing" />
    </div>
  )
}
