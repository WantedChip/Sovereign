import {
  CreateWebWorkerMLCEngine,
  type WebWorkerMLCEngine,
  type InitProgressReport,
  type ChatCompletionMessageParam,
} from "@mlc-ai/web-llm"

export interface LLMModelInfo {
  id: string
  name: string
  size: string
  description: string
  default?: boolean
}

export const AVAILABLE_LLM_MODELS: LLMModelInfo[] = [
  {
    id: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    name: "Llama 3.2 1B Instruct",
    size: "~850 MB",
    description: "Smallest & fastest model, ideal for local mobile and desktop devices.",
    default: true,
  },
  {
    id: "Phi-3.5-mini-instruct-q4f16_1-MLC",
    name: "Phi 3.5 Mini Instruct",
    size: "~2.2 GB",
    description: "Highly capable reasoning model for complex RAG synthesis.",
  },
  {
    id: "Gemma-2-2b-it-q4f16_1-MLC",
    name: "Gemma 2 2B IT",
    size: "~1.5 GB",
    description: "Google's lightweight 2B parameter instruction-tuned model.",
  },
]

export type LLMStatus = "idle" | "downloading" | "compiling" | "ready" | "generating" | "error"

export interface LLMProgress {
  stage: string
  progress: number // 0 to 100
  text: string
}

type StatusListener = (status: LLMStatus) => void
type ProgressListener = (progress: LLMProgress) => void

class LLMClient {
  private engine: WebWorkerMLCEngine | null = null
  private worker: Worker | null = null
  private currentModelId: string | null = null
  private status: LLMStatus = "idle"
  private progress: LLMProgress = { stage: "Idle", progress: 0, text: "" }
  private errorMessage: string | null = null

  private statusListeners: Set<StatusListener> = new Set()
  private progressListeners: Set<ProgressListener> = new Set()

  public getStatus(): LLMStatus {
    return this.status
  }

  public getProgress(): LLMProgress {
    return this.progress
  }

  public getCurrentModelId(): string | null {
    return this.currentModelId
  }

  public getErrorMessage(): string | null {
    return this.errorMessage
  }

  public subscribeStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener)
    listener(this.status)
    return () => this.statusListeners.delete(listener)
  }

  public subscribeProgress(listener: ProgressListener): () => void {
    this.progressListeners.add(listener)
    listener(this.progress)
    return () => this.progressListeners.delete(listener)
  }

  private setStatus(newStatus: LLMStatus, error: string | null = null) {
    this.status = newStatus
    this.errorMessage = error
    this.statusListeners.forEach((fn) => fn(newStatus))
  }

  private setProgress(stage: string, progress: number, text: string) {
    this.progress = { stage, progress: Math.min(100, Math.max(0, progress)), text }
    this.progressListeners.forEach((fn) => fn(this.progress))
  }

  public async initLLM(
    modelId: string = "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    onProgress?: (progress: LLMProgress) => void
  ): Promise<void> {
    if (this.engine && this.currentModelId === modelId && this.status === "ready") {
      return
    }

    if (this.status === "downloading" || this.status === "compiling") {
      return
    }

    this.setStatus("downloading")
    this.setProgress("Initializing worker...", 0, "Starting WebLLM Web Worker...")

    try {
      if (!this.worker) {
        this.worker = new Worker(new URL("./llm-worker.ts", import.meta.url), { type: "module" })
      }

      const initProgressCallback = (report: InitProgressReport) => {
        const pct = Math.round(report.progress * 100)
        let stage = "Downloading model weights..."
        if (report.text.includes("compiling") || report.text.includes("shader")) {
          stage = "Compiling WebGPU shaders..."
          if (this.status !== "compiling") {
            this.setStatus("compiling")
          }
        } else if (report.text.includes("loading") || report.text.includes("GPU")) {
          stage = "Loading model into GPU VRAM..."
        }

        this.setProgress(stage, pct, report.text)
        if (onProgress) {
          onProgress(this.progress)
        }
      }

      this.engine = await CreateWebWorkerMLCEngine(this.worker, modelId, {
        initProgressCallback,
      })

      this.currentModelId = modelId
      this.setProgress("Ready", 100, "Model loaded and WebGPU pipeline ready.")
      this.setStatus("ready")
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      this.setProgress("Error", 0, msg)
      this.setStatus("error", msg)
      throw err
    }
  }

  public async chatCompletion(
    messages: ChatCompletionMessageParam[],
    onToken?: (chunk: string) => void
  ): Promise<string> {
    if (!this.engine || this.status !== "ready") {
      throw new Error("LLM engine is not ready. Call initLLM() first.")
    }

    this.setStatus("generating")
    let fullText = ""

    try {
      const asyncChunkStream = await this.engine.chat.completions.create({
        messages,
        stream: true,
      })

      for await (const chunk of asyncChunkStream) {
        const token = chunk.choices[0]?.delta?.content || ""
        if (token) {
          fullText += token
          if (onToken) {
            onToken(token)
          }
        }
      }

      this.setStatus("ready")
      return fullText
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      this.setStatus("error", msg)
      throw err
    }
  }

  public async unloadModel(): Promise<void> {
    if (this.engine) {
      try {
        await this.engine.unload()
      } catch (err) {
        console.warn("Error unloading WebLLM model:", err)
      }
      this.engine = null
    }

    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }

    this.currentModelId = null
    this.setStatus("idle")
    this.setProgress("Idle", 0, "")
  }
}

export const llmClient = new LLMClient()
