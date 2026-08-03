import { useEffect, lazy, Suspense } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Editor } from "@/components/editor/Editor"
import { BacklinkPanel } from "@/components/editor/BacklinkPanel"
import { CommandPalette } from "@/components/search/CommandPalette"

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
  Menu,
  X,
} from "lucide-react"

// Lazy-load heavy components for code splitting
const KnowledgeGraph = lazy(() =>
  import("@/components/graph/KnowledgeGraph").then((module) => ({
    default: module.KnowledgeGraph,
  }))
)

const ChatPanel = lazy(() =>
  import("@/components/ai/ChatPanel").then((module) => ({
    default: module.ChatPanel,
  }))
)

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
    setRightPanelOpen,
    rightPanelView,
    setRightPanelView,
    searchQuery,
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
      <header
        role="banner"
        aria-label="Application Top Header"
        className="h-12 bg-ink flex items-center justify-between px-3 md:px-4 z-20 border-b border-slate-line shrink-0"
      >
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobile Sidebar Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 text-muted-foreground hover:text-parchment"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Close Documents Drawer" : "Open Documents Drawer"}
            aria-expanded={sidebarOpen}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-brass font-mono min-h-[44px] sm:min-h-0"
            onClick={() => navigate("/")}
            aria-label="Return to Landing Page"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Landing Page</span>
          </Button>

          <Separator orientation="vertical" className="h-4 bg-slate-line hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-sm bg-brass/10 border border-brass/40 flex items-center justify-center">
              <Compass className="w-3.5 h-3.5 text-brass" />
            </div>
            <span className="font-serif font-bold text-sm tracking-tight text-parchment truncate max-w-[120px] sm:max-w-none">
              Sovereign Workspace
            </span>
            <Badge
              variant="default"
              className="hidden lg:inline-flex text-[10px] px-2 py-0.5 border-brass/40 font-mono"
            >
              Field Shell
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <PresenceAvatars
            provider={yjsSession?.webrtcProvider}
            currentUser={{ name: username, color: userColor }}
          />

          <ConnectionStatus
            isConnected={yjsSession?.isConnected}
            peerCount={yjsSession?.peerCount}
          />

          <Badge variant="moss" className="hidden xl:inline-flex gap-1.5 text-[10px] font-mono">
            <HardDrive className="w-3 h-3" />
            <span>IndexedDB + OPFS</span>
          </Badge>

          <Button
            variant={rightPanelOpen && rightPanelView === "ai" ? "default" : "ghost"}
            size="sm"
            className="h-8 text-xs font-mono gap-1.5 text-muted-foreground hover:text-brass min-h-[44px] sm:min-h-0"
            onClick={() => {
              setRightPanelView("ai")
              if (!rightPanelOpen) setRightPanelOpen(true)
            }}
            aria-label="Toggle RAG AI Co-Pilot Panel"
          >
            <Sparkles className="w-3.5 h-3.5 text-brass" />
            <span className="hidden md:inline">AI Co-Pilot</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-parchment min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
            onClick={toggleRightPanel}
            aria-label={rightPanelOpen ? "Collapse Right Panel" : "Expand Right Panel"}
            aria-expanded={rightPanelOpen}
          >
            {rightPanelOpen ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4" />
            )}
          </Button>
        </div>
      </header>

      {/* Main Grid Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Backdrop Overlay when Sidebar is open */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-ink/80 backdrop-blur-sm z-30 animate-in fade-in-0 duration-200"
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}

        {/* Column 1: Left Sidebar (Responsive Drawer on Mobile) */}
        <div
          className={`fixed md:relative inset-y-0 left-0 z-40 md:z-auto transition-transform duration-300 md:transform-none ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <Sidebar
            isOpen={sidebarOpen}
            onToggleOpen={toggleSidebar}
            activeDocumentId={activeDocumentId}
            onSelectDocument={(id) => {
              setActiveDocumentId(id)
              // Close mobile sidebar drawer on document select
              if (window.innerWidth < 768 && sidebarOpen) {
                toggleSidebar()
              }
            }}
            onCreateDocument={handleCreateNewDocument}
          />
        </div>

        {/* Column 2: Center Editor Canvas */}
        <main
          id="main-content"
          role="main"
          tabIndex={-1}
          className="flex-1 flex flex-col bg-background relative overflow-hidden focus:outline-none"
        >
          {/* Document Top Toolbar Header */}
          <div className="h-10 border-b border-slate-line flex items-center justify-between px-3 md:px-6 bg-secondary/20 text-xs shrink-0 font-mono">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <FileText className="w-3.5 h-3.5 text-brass shrink-0" />
              {activeDoc ? (
                <input
                  type="text"
                  value={activeDoc.title}
                  onChange={(e) => updateTitle(e.target.value)}
                  aria-label="Document Title Input"
                  className="bg-transparent text-parchment font-semibold font-sans text-xs focus:outline-none focus:border-b border-brass truncate max-w-[180px] sm:max-w-xs md:max-w-md"
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
                  className="text-[9px] py-0 gap-1 border-slate-line text-muted-foreground hidden sm:inline-flex"
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
          <div className="flex-1 p-3 md:p-6 overflow-y-auto flex flex-col space-y-6">
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

        {/* Column 3: Right Panel (Graph & AI Co-Pilot - Overlay on Mobile/Tablet) */}
        {rightPanelOpen && (
          <>
            {/* Backdrop for Right Panel on Mobile */}
            <div
              className="lg:hidden fixed inset-0 bg-ink/80 backdrop-blur-sm z-30"
              onClick={toggleRightPanel}
              aria-hidden="true"
            />

            <aside
              role="complementary"
              aria-label="Topology & AI Co-Pilot Panel"
              className="fixed lg:relative right-0 top-0 bottom-0 z-40 lg:z-auto w-full sm:w-80 lg:w-72 bg-ink border-l border-slate-line flex flex-col shrink-0 animate-in slide-in-from-right-4 duration-300 shadow-2xl lg:shadow-none"
            >
              {/* Panel Tabs Header */}
              <div className="p-2 border-b border-slate-line flex items-center gap-1 bg-secondary/30 font-mono">
                <Button
                  variant={rightPanelView === "graph" ? "default" : "ghost"}
                  size="sm"
                  className="flex-1 h-8 text-[11px] gap-1.5 min-h-[44px] sm:min-h-0"
                  onClick={() => setRightPanelView("graph")}
                  aria-label="Show Knowledge Graph Topology"
                >
                  <Network className="w-3.5 h-3.5 text-brass" />
                  <span>Topology</span>
                </Button>

                <Button
                  variant={rightPanelView === "ai" ? "default" : "ghost"}
                  size="sm"
                  className="flex-1 h-8 text-[11px] gap-1.5 min-h-[44px] sm:min-h-0"
                  onClick={() => setRightPanelView("ai")}
                  aria-label="Show RAG AI Agent Panel"
                >
                  <Cpu className="w-3.5 h-3.5 text-brass" />
                  <span>AI Agent</span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-8 w-8 text-muted-foreground hover:text-parchment ml-1"
                  onClick={toggleRightPanel}
                  aria-label="Close Right Panel"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Panel Content Area */}
              {rightPanelView === "graph" ? (
                <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-brass uppercase">Knowledge Graph</span>
                    <Badge variant="outline" className="text-[9px]">
                      v0.5
                    </Badge>
                  </div>

                  <Suspense
                    fallback={
                      <div className="h-[280px] w-full border border-slate-line bg-secondary/20 flex flex-col items-center justify-center gap-2 p-4">
                        <Skeleton className="h-full w-full bg-slate-line/30" />
                      </div>
                    }
                  >
                    <KnowledgeGraph
                      activeDocumentId={activeDocumentId}
                      onSelectDocument={(id) => {
                        setActiveDocumentId(id)
                        if (window.innerWidth < 1024) toggleRightPanel()
                      }}
                      searchQuery={searchQuery}
                      height="280px"
                    />
                  </Suspense>

                  {activeDoc && (
                    <BacklinkPanel
                      documentId={activeDoc.id}
                      documentTitle={activeDoc.title}
                      onNavigate={(id) => {
                        setActiveDocumentId(id)
                        if (window.innerWidth < 1024) toggleRightPanel()
                      }}
                    />
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Suspense
                    fallback={
                      <div className="flex-1 p-4 space-y-3 font-mono text-xs">
                        <Skeleton className="h-8 w-full bg-slate-line/40" />
                        <Skeleton className="h-32 w-full bg-slate-line/20" />
                        <Skeleton className="h-10 w-full bg-slate-line/40" />
                      </div>
                    }
                  >
                    <ChatPanel
                      onNavigateDoc={(id) => {
                        setActiveDocumentId(id)
                        if (window.innerWidth < 1024) toggleRightPanel()
                      }}
                    />
                  </Suspense>
                </div>
              )}

              {/* Panel Bottom Privacy Note */}
              <div className="p-3 border-t border-slate-line text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1 font-mono">
                <Lock className="w-3 h-3 text-brass" />
                <span>Zero External Telemetry</span>
              </div>
            </aside>
          </>
        )}
      </div>

      <CommandPalette />
    </div>
  )
}
