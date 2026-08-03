export type EmbeddingStatus = "uninitialized" | "loading" | "ready" | "error"
export type EmbeddingDevice = "webgpu" | "wasm" | null

export interface ProgressCallbackData {
  status?: string
  file?: string
  progress?: number
  loaded?: number
  total?: number
  name?: string
}

class EmbeddingClient {
  private worker: Worker | null = null
  private status: EmbeddingStatus = "uninitialized"
  private device: EmbeddingDevice = null
  private initPromise: Promise<void> | null = null
  private pendingRequests = new Map<
    string,
    {
      resolve: (value: unknown) => void
      reject: (reason?: unknown) => void
    }
  >()
  private progressListeners = new Set<(data: ProgressCallbackData) => void>()

  private getWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL("./embedding-worker.ts", import.meta.url), {
        type: "module",
      })

      this.worker.onmessage = (event: MessageEvent) => {
        const { id, type, success, embedding, embeddings, error, status, device, data } =
          event.data || {}

        if (type === "progress" && data) {
          this.progressListeners.forEach((listener) => listener(data))
          return
        }

        if (type === "status") {
          if (status) this.status = status
          if (device !== undefined) this.device = device
          return
        }

        if (!id) return
        const pending = this.pendingRequests.get(id)
        if (!pending) return

        this.pendingRequests.delete(id)

        if (error) {
          pending.reject(new Error(error))
          return
        }

        if (type === "init") {
          if (success) {
            this.status = "ready"
            if (device) this.device = device
            pending.resolve(undefined)
          } else {
            this.status = "error"
            pending.reject(new Error(error || "Failed to initialize embedding model"))
          }
        } else if (type === "embed") {
          pending.resolve(embedding)
        } else if (type === "embedBatch") {
          pending.resolve(embeddings)
        } else if (type === "getStatus") {
          pending.resolve({ status, device })
        }
      }

      this.worker.onerror = (err) => {
        this.status = "error"
        console.error("Embedding worker error:", err)
      }
    }
    return this.worker
  }

  public addProgressListener(listener: (data: ProgressCallbackData) => void): () => void {
    this.progressListeners.add(listener)
    return () => {
      this.progressListeners.delete(listener)
    }
  }

  public async initEmbeddings(onProgress?: (data: ProgressCallbackData) => void): Promise<void> {
    if (onProgress) {
      this.addProgressListener(onProgress)
    }

    if (this.status === "ready") return
    if (this.initPromise) return this.initPromise

    this.status = "loading"
    const worker = this.getWorker()

    this.initPromise = new Promise<void>((resolve, reject) => {
      const id = crypto.randomUUID()
      this.pendingRequests.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
      })
      worker.postMessage({ id, type: "init" })
    }).finally(() => {
      this.initPromise = null
    })

    return this.initPromise
  }

  public async embedText(text: string): Promise<Float32Array> {
    await this.initEmbeddings()
    const worker = this.getWorker()

    return new Promise<Float32Array>((resolve, reject) => {
      const id = crypto.randomUUID()
      this.pendingRequests.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
      })
      worker.postMessage({ id, type: "embed", text })
    })
  }

  public async embedChunks(chunks: string[]): Promise<Float32Array[]> {
    if (chunks.length === 0) return []
    await this.initEmbeddings()
    const worker = this.getWorker()

    return new Promise<Float32Array[]>((resolve, reject) => {
      const id = crypto.randomUUID()
      this.pendingRequests.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
      })
      worker.postMessage({ id, type: "embedBatch", texts: chunks })
    })
  }

  public getStatus(): EmbeddingStatus {
    return this.status
  }

  public getDevice(): EmbeddingDevice {
    return this.device
  }

  public terminate(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
      this.status = "uninitialized"
      this.device = null
    }
  }
}

export const embeddingClient = new EmbeddingClient()
