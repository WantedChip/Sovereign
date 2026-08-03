import { useEffect } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Editor } from "@/components/editor/Editor"
import { KnowledgeGraph } from "@/components/graph/KnowledgeGraph"
import { BacklinkPanel } from "@/components/editor/BacklinkPanel"

import { Sidebar } from "./Sidebar"
import { useDocumentStore } from "@/stores/document-store"
import { useUIStore } from "@/stores/ui-store"
import { useSettingsStore } from "@/stores/settings-store"
import { useDocument } from "@/hooks/useDocument"
import { createDocument, listDocuments } from "@/lib/db/operations"
import { PresenceAvatars } from "@/components/collaboration/PresenceAvatars"
import { ConnectionStatus } from "@/components/collaboration/ConnectionStatus"

import {
  Compass,
  FileText,
  Sparkles,
  Network,
  PanelRightClose,
  PanelRightOpen,
  ArrowLeft,
  HardDrive,
  Cpu,
  Share2,
  Lock,
  Loader2,
  CheckCircle2,
} from "lucide-react"

const DEFAULT_WELCOME_CONTENT = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Welcome to Sovereign" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Sovereign is a local-first, privacy-focused personal knowledge management system built with ",
        },
        { type: "text", marks: [{ type: "bold" }], text: "Tiptap v3" },
        { type: "text", text: ", " },
        { type: "text", marks: [{ type: "bold" }], text: "Yjs CRDTs" },
        { type: "text", text: ", and " },
        { type: "text", marks: [{ type: "bold" }], text: "WebLLM" },
        { type: "text", text: "." },
      ],
    },
    {
      type: "callout",
      attrs: { type: "info" },
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "All documents are stored locally on your device in OPFS and IndexedDB. Zero cloud telemetry.",
            },
          ],
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Type '/' to insert callouts, toggle sections, code blocks, or lists. Create wiki links by typing '[['.",
        },
      ],
    },
  ],
}

export function WorkspaceLayout() {
  const navigate = useNavigate()

  const { activeDocumentId, setActiveDocumentId } = useDocumentStore()
  const {
    sidebarOpen,
    toggleSidebar,
    rightPanelOpen,
    toggleRightPanel,
    rightPanelView,
    setRightPanelView,
  } = useUIStore()

  const { username, userColor } = useSettingsStore()

  const {
    document: activeDoc,
    yjsSession,
    isLoading: isDocLoading,
    isSaving,
    saveContent,
    updateTitle,
  } = useDocument(activeDocumentId)

  // Initialize workspace: create default document if DB is empty
  useEffect(() => {
    let isMounted = true
    async function initWorkspace() {
      const existing = await listDocuments()
      if (!isMounted) return

      if (existing.length === 0) {
        const welcomeDoc = await createDocument("Welcome to Sovereign", DEFAULT_WELCOME_CONTENT)
        if (isMounted) {
          setActiveDocumentId(welcomeDoc.id)
        }
      } else if (!activeDocumentId) {
        setActiveDocumentId(existing[0].id)
      }
    }

    initWorkspace()
    return () => {
      isMounted = false
    }
  }, [activeDocumentId, setActiveDocumentId])

  const handleCreateNewDocument = async () => {
    const newDoc = await createDocument("Untitled Note")
    setActiveDocumentId(newDoc.id)
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden selection:bg-brass/30 selection:text-brass font-sans">
      {/* Top Application Header */}
      <header className="h-12 bg-ink flex items-center justify-between px-4 z-20 border-b border-slate-line shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-brass font-mono"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Landing Page</span>
          </Button>

          <Separator orientation="vertical" className="h-4 bg-slate-line" />

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-sm bg-brass/10 border border-brass/40 flex items-center justify-center">
              <Compass className="w-3.5 h-3.5 text-brass" />
            </div>
            <span className="font-serif font-bold text-sm tracking-tight text-parchment">
              Sovereign Workspace
            </span>
            <Badge variant="default" className="text-[10px] px-2 py-0.5 border-brass/40 font-mono">
              Field Shell
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <PresenceAvatars
            provider={yjsSession?.webrtcProvider}
            currentUser={{ name: username, color: userColor }}
          />

          <ConnectionStatus
            isConnected={yjsSession?.isConnected}
            peerCount={yjsSession?.peerCount}
          />

          <Badge variant="moss" className="hidden sm:inline-flex gap-1.5 text-[10px] font-mono">
            <HardDrive className="w-3 h-3" />
            <span>IndexedDB + OPFS</span>
          </Badge>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-parchment"
            onClick={toggleRightPanel}
            title={rightPanelOpen ? "Collapse Right Panel" : "Expand Right Panel"}
          >
            {rightPanelOpen ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4" />
            )}
          </Button>
        </div>
      </header>

      {/* Main 3-Column Grid Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Column 1: Left Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggleOpen={toggleSidebar}
          activeDocumentId={activeDocumentId}
          onSelectDocument={setActiveDocumentId}
          onCreateDocument={handleCreateNewDocument}
        />

        {/* Column 2: Center Editor Canvas */}
        <main className="flex-1 flex flex-col bg-background relative overflow-hidden">
          {/* Document Top Toolbar Header */}
          <div className="h-10 border-b border-slate-line flex items-center justify-between px-6 bg-secondary/20 text-xs shrink-0 font-mono">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <FileText className="w-3.5 h-3.5 text-brass shrink-0" />
              {activeDoc ? (
                <input
                  type="text"
                  value={activeDoc.title}
                  onChange={(e) => updateTitle(e.target.value)}
                  className="bg-transparent text-parchment font-semibold font-sans text-xs focus:outline-none focus:border-b border-brass truncate max-w-xs md:max-w-md"
                  placeholder="Untitled Document"
                />
              ) : (
                <span className="font-semibold text-muted-foreground font-sans">
                  No Document Selected
                </span>
              )}

              {isSaving ? (
                <Badge
                  variant="outline"
                  className="text-[9px] py-0 gap-1 border-brass text-brass animate-pulse"
                >
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  Saving...
                </Badge>
              ) : activeDoc ? (
                <Badge
                  variant="outline"
                  className="text-[9px] py-0 gap-1 border-slate-line text-muted-foreground"
                >
                  <CheckCircle2 className="w-2.5 h-2.5 text-moss" />
                  Saved Locally
                </Badge>
              ) : null}
            </div>

            <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
              {activeDoc && <span>{activeDoc.wordCount} words</span>}
              <span className="hidden md:inline-flex items-center gap-1">
                <Share2 className="w-3.5 h-3.5 text-brass" />
                {yjsSession && yjsSession.peerCount > 0
                  ? `P2P Mesh (${yjsSession.peerCount} peer${yjsSession.peerCount === 1 ? "" : "s"})`
                  : "P2P Ready"}
              </span>
            </div>
          </div>

          {/* Main Editor Canvas Container */}

          <div className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col space-y-6">
            {isDocLoading ? (
              <div className="flex-1 flex items-center justify-center font-mono text-xs text-muted-foreground gap-2 min-h-[300px]">
                <Loader2 className="w-4 h-4 animate-spin text-brass" />
                <span>Loading note content & syncing IndexedDB persistence...</span>
              </div>
            ) : activeDoc && yjsSession ? (
              <div className="flex-1 flex flex-col space-y-6">
                <Editor
                  key={activeDoc.id}
                  ydoc={yjsSession.ydoc}
                  xmlFragment={yjsSession.xmlFragment}
                  provider={yjsSession.webrtcProvider}
                  user={{ name: username, color: userColor }}
                  content={activeDoc.content}
                  onUpdateJSON={(json) => saveContent(json)}
                />

                <BacklinkPanel
                  documentId={activeDoc.id}
                  documentTitle={activeDoc.title}
                  onNavigate={setActiveDocumentId}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center font-mono text-xs text-muted-foreground min-h-[300px]">
                Select or create a document to begin writing.
              </div>
            )}
          </div>
        </main>

        {/* Column 3: Right Panel (Graph & AI Co-Pilot) */}
        {rightPanelOpen && (
          <aside className="w-72 bg-ink border-l border-slate-line flex flex-col shrink-0 animate-in slide-in-from-right-4 duration-300">
            {/* Panel Tabs Header */}
            <div className="p-2 border-b border-slate-line flex items-center gap-1 bg-secondary/30 font-mono">
              <Button
                variant={rightPanelView === "graph" ? "default" : "ghost"}
                size="sm"
                className="flex-1 h-7 text-[11px] gap-1.5"
                onClick={() => setRightPanelView("graph")}
              >
                <Network className="w-3.5 h-3.5 text-brass" />
                <span>Topology</span>
              </Button>

              <Button
                variant={rightPanelView === "ai" ? "default" : "ghost"}
                size="sm"
                className="flex-1 h-7 text-[11px] gap-1.5"
                onClick={() => setRightPanelView("ai")}
              >
                <Cpu className="w-3.5 h-3.5 text-brass" />
                <span>AI Agent</span>
              </Button>
            </div>

            {/* Panel Content Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans">
              {rightPanelView === "graph" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-brass uppercase">Knowledge Graph</span>
                    <Badge variant="outline" className="text-[9px]">
                      v0.5
                    </Badge>
                  </div>

                  <KnowledgeGraph
                    activeDocumentId={activeDocumentId}
                    onSelectDocument={setActiveDocumentId}
                    height="280px"
                  />

                  {activeDoc && (
                    <BacklinkPanel
                      documentId={activeDoc.id}
                      documentTitle={activeDoc.title}
                      onNavigate={setActiveDocumentId}
                    />
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-brass uppercase">WebGPU AI Co-Pilot</span>
                    <Badge variant="outline" className="text-[9px]">
                      v0.7
                    </Badge>
                  </div>

                  <div className="survey-card p-6 rounded-sm border-slate-line text-center space-y-3">
                    <div className="w-10 h-10 rounded-sm bg-brass/10 border border-brass flex items-center justify-center mx-auto">
                      <Sparkles className="w-5 h-5 text-brass" />
                    </div>
                    <div className="text-xs font-mono font-semibold text-parchment">
                      On-Device LLM & RAG
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Local GPU inference powered by WebLLM for private RAG query synthesis arrives
                      in sub-phase v0.7.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Panel Bottom Privacy Note */}
            <div className="p-3 border-t border-slate-line text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1 font-mono">
              <Lock className="w-3 h-3 text-brass" />
              <span>Zero External Telemetry</span>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
