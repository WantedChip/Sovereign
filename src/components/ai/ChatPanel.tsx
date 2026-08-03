import { useState, useRef, useEffect, useMemo, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useChatStore, type ChatMessage } from "@/stores/chat-store"
import { useAI } from "@/hooks/useAI"
import { useSettingsStore } from "@/stores/settings-store"
import { ModelDownloadProgress } from "./ModelDownloadProgress"
import { WebGPUBanner } from "./WebGPUBanner"
import { AVAILABLE_LLM_MODELS } from "@/lib/ai/llm-client"
import { listDocuments } from "@/lib/db/operations"
import type { DocumentMeta } from "@/types"
import {
  Send,
  Square,
  RotateCcw,
  Sparkles,
  FileText,
  ChevronDown,
  Cpu,
  User,
  Bot,
  AlertCircle,
} from "lucide-react"

interface ChatPanelProps {
  onNavigateDoc?: (documentId: string) => void
}

export function ChatPanel({ onNavigateDoc }: ChatPanelProps) {
  const [inputQuery, setInputQuery] = useState("")
  const [knownDocs, setKnownDocs] = useState<DocumentMeta[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, addMessage, updateMessageContent, clearMessages } = useChatStore()
  const {
    askQuestion,
    isGenerating,
    stopGeneration,
    llmStatus,
    answer: streamAnswer,
    sources: streamSources,
    error: aiError,
  } = useAI()
  const { selectedModel, setSelectedModel } = useSettingsStore()

  const currentAssistantMsgIdRef = useRef<string | null>(null)

  // Sync active assistant message content and sources from useAI stream
  useEffect(() => {
    if (currentAssistantMsgIdRef.current && (streamAnswer || streamSources.length > 0)) {
      updateMessageContent(currentAssistantMsgIdRef.current, streamAnswer, streamSources)
    }
  }, [streamAnswer, streamSources, updateMessageContent])

  // Fetch documents for citation resolving
  useEffect(() => {
    let isMounted = true
    async function loadDocs() {
      try {
        const docs = await listDocuments()
        if (isMounted) {
          setKnownDocs(docs)
        }
      } catch (err) {
        console.warn("Failed to load documents for citation mapping:", err)
      }
    }
    loadDocs()
    return () => {
      isMounted = false
    }
  }, [messages])

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isGenerating, streamAnswer])

  const handleSend = async () => {
    const trimmed = inputQuery.trim()
    if (!trimmed || isGenerating) return

    setInputQuery("")
    addMessage({ role: "user", content: trimmed })

    const assistantId = addMessage({ role: "assistant", content: "" })
    currentAssistantMsgIdRef.current = assistantId

    try {
      await askQuestion(trimmed, {
        topK: 5,
      })
    } catch (err) {
      console.error("Chat question failed:", err)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const resolveCitationDocId = (docTitle: string): string | null => {
    const normalized = docTitle.trim().toLowerCase()
    const match = knownDocs.find((d) => d.title.toLowerCase() === normalized)
    return match ? match.id : null
  }

  return (
    <div className="flex flex-col h-full bg-ink text-foreground overflow-hidden font-sans">
      {/* Top Panel Header */}
      <div className="p-3 border-b border-slate-line bg-secondary/20 flex items-center justify-between font-mono shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-sm bg-brass/10 border border-brass/40 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-brass" />
          </div>
          <span className="font-bold text-xs text-parchment">RAG AI Assistant</span>
        </div>

        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-parchment"
              onClick={clearMessages}
              title="Clear Conversation History"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* LLM Status / Model Selector Header Bar */}
      <div className="p-2 bg-secondary/10 border-b border-slate-line text-[10px] font-mono flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <Cpu className="w-3 h-3 text-brass shrink-0" />
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-transparent text-parchment focus:outline-none focus:border-b border-brass truncate max-w-[170px]"
          >
            {AVAILABLE_LLM_MODELS.map((m) => (
              <option key={m.id} value={m.id} className="bg-ink text-parchment">
                {m.name} ({m.size})
              </option>
            ))}
          </select>
        </div>

        <Badge
          variant={llmStatus === "ready" ? "moss" : "outline"}
          className="text-[9px] px-1.5 py-0 uppercase"
        >
          {llmStatus}
        </Badge>
      </div>

      {/* WebGPU Feature Detection Banner */}
      <div className="p-2 border-b border-slate-line bg-secondary/15 shrink-0">
        <WebGPUBanner />
      </div>

      {/* Model Download Progress Widget if not ready */}
      {llmStatus !== "ready" && (
        <div className="p-3 border-b border-slate-line bg-secondary/30 shrink-0">
          <ModelDownloadProgress modelId={selectedModel} />
        </div>
      )}

      {/* Message History Container */}
      <div className="flex-1 p-3 overflow-y-auto space-y-4 font-sans text-xs">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-3 text-muted-foreground font-mono">
            <div className="w-10 h-10 rounded-sm bg-brass/10 border border-brass/40 flex items-center justify-center">
              <Bot className="w-5 h-5 text-brass" />
            </div>
            <div className="text-xs text-parchment font-bold">Local Knowledge RAG Assistant</div>
            <p className="text-[11px] leading-relaxed max-w-[220px]">
              Ask questions about your notes. Answers are synthesized locally using on-device WebGPU
              inference with zero server telemetry.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessageItem
              key={msg.id}
              message={msg}
              onNavigate={onNavigateDoc}
              resolveDocId={resolveCitationDocId}
            />
          ))
        )}

        {/* Global Error Banner */}
        {aiError && (
          <div className="p-2.5 rounded-sm bg-oxblood/10 border border-oxblood/30 text-[11px] text-oxblood font-mono flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{aiError}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Field */}
      <div className="p-3 border-t border-slate-line bg-ink shrink-0 space-y-2">
        <div className="relative">
          <textarea
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              llmStatus === "ready"
                ? "Ask your knowledge base (Enter to send)..."
                : "Load model above to ask questions..."
            }
            disabled={llmStatus !== "ready" && !isGenerating}
            rows={2}
            className="w-full bg-secondary/30 border border-slate-line rounded-sm p-2.5 pr-10 text-xs font-sans text-parchment placeholder:text-muted-foreground focus:outline-none focus:border-brass resize-none disabled:opacity-50"
          />

          <div className="absolute right-2 bottom-3 flex items-center gap-1">
            {isGenerating ? (
              <Button
                variant="oxblood"
                size="icon"
                className="h-7 w-7 rounded-sm"
                onClick={stopGeneration}
                title="Stop Generating"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </Button>
            ) : (
              <Button
                variant="default"
                size="icon"
                className="h-7 w-7 rounded-sm bg-brass text-ink hover:bg-brass/90 disabled:opacity-40"
                onClick={handleSend}
                disabled={!inputQuery.trim() || llmStatus !== "ready"}
                title="Send Question (Enter)"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground px-1">
          <span>Shift+Enter for new line</span>
          <span>100% Offline RAG</span>
        </div>
      </div>
    </div>
  )
}

interface ChatMessageItemProps {
  message: ChatMessage
  onNavigate?: (documentId: string) => void
  resolveDocId: (title: string) => string | null
}

function ChatMessageItem({ message, onNavigate, resolveDocId }: ChatMessageItemProps) {
  const isUser = message.role === "user"

  return (
    <div className={`flex flex-col space-y-1.5 ${isUser ? "items-end" : "items-start"}`}>
      {/* Header Label */}
      <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground px-1">
        {isUser ? (
          <>
            <span>You</span>
            <User className="w-3 h-3 text-brass" />
          </>
        ) : (
          <>
            <Bot className="w-3 h-3 text-brass" />
            <span>Sovereign AI</span>
          </>
        )}
      </div>

      {/* Bubble Content */}
      <div
        className={`p-3 rounded-sm text-xs leading-relaxed max-w-[92%] font-sans ${
          isUser
            ? "bg-brass/10 border border-brass/40 text-parchment font-medium"
            : "bg-secondary/30 border border-slate-line text-parchment"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <ParsedAnswerContent
            content={message.content}
            onNavigate={onNavigate}
            resolveDocId={resolveDocId}
          />
        )}

        {/* Sources Accordion */}
        {message.sources && message.sources.length > 0 && (
          <details className="mt-3 pt-2 border-t border-slate-line/50 font-mono text-[10px] group">
            <summary className="cursor-pointer text-muted-foreground hover:text-brass flex items-center justify-between select-none py-1">
              <span className="flex items-center gap-1 font-semibold">
                <FileText className="w-3 h-3 text-brass" />
                Retrieved Context Sources ({message.sources.length})
              </span>
              <ChevronDown className="w-3 h-3 transition-transform group-open:rotate-180" />
            </summary>

            <div className="mt-2 space-y-2 pl-1">
              {message.sources.map((src, i) => {
                const targetDocId = resolveDocId(src.title)
                return (
                  <div
                    key={`${src.id}-${i}`}
                    className="p-2 rounded-sm bg-ink/60 border border-slate-line/60 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => targetDocId && onNavigate && onNavigate(targetDocId)}
                        disabled={!targetDocId}
                        className="text-brass hover:underline font-bold text-left truncate max-w-[170px] disabled:no-underline disabled:text-parchment"
                      >
                        {src.title} {src.heading ? `> ${src.heading}` : ""}
                      </button>
                      <span className="text-[9px] text-muted-foreground">
                        {Math.round(src.score * 100)}% match
                      </span>
                    </div>
                    <p className="text-muted-foreground text-[10px] line-clamp-2 leading-tight italic">
                      "{src.chunkText}"
                    </p>
                  </div>
                )
              })}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}

interface ParsedAnswerContentProps {
  content: string
  onNavigate?: (documentId: string) => void
  resolveDocId: (title: string) => string | null
}

function ParsedAnswerContent({ content, onNavigate, resolveDocId }: ParsedAnswerContentProps) {
  // Regex matching citations formatted as [DocTitle§Heading] or [DocTitle]
  const parsedSegments = useMemo(() => {
    if (!content) return []
    const citationRegex = /\[([^\]§]+)(?:§([^\]]+))?\]/g
    const segments: Array<{
      type: "text" | "citation"
      text: string
      docTitle?: string
      heading?: string
    }> = []

    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = citationRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        segments.push({
          type: "text",
          text: content.substring(lastIndex, match.index),
        })
      }

      const docTitle = match[1].trim()
      const heading = match[2] ? match[2].trim() : undefined

      segments.push({
        type: "citation",
        text: match[0],
        docTitle,
        heading,
      })

      lastIndex = match.index + match[0].length
    }

    if (lastIndex < content.length) {
      segments.push({
        type: "text",
        text: content.substring(lastIndex),
      })
    }

    return segments
  }, [content])

  if (!content) {
    return (
      <span className="inline-flex items-center gap-1 text-muted-foreground font-mono italic animate-pulse">
        Thinking & retrieving context...
      </span>
    )
  }

  return (
    <div className="whitespace-pre-wrap leading-relaxed">
      {parsedSegments.map((seg, idx) => {
        if (seg.type === "text") {
          return <span key={idx}>{seg.text}</span>
        }

        const docId = seg.docTitle ? resolveDocId(seg.docTitle) : null

        return (
          <button
            key={idx}
            onClick={() => docId && onNavigate && onNavigate(docId)}
            disabled={!docId}
            title={docId ? `Navigate to note: ${seg.docTitle}` : `Note not found: ${seg.docTitle}`}
            className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded-sm bg-brass/15 border border-brass/40 text-brass text-[10px] font-mono hover:bg-brass/25 transition-colors disabled:opacity-60 disabled:hover:bg-brass/15 cursor-pointer align-baseline"
          >
            <FileText className="w-2.5 h-2.5" />
            <span>
              {seg.docTitle}
              {seg.heading ? ` § ${seg.heading}` : ""}
            </span>
          </button>
        )
      })}
    </div>
  )
}
