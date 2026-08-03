import type { OPFSMessageRequest, OPFSMessageResponse } from "./opfs-worker"

class OPFSClient {
  private worker: Worker | null = null
  private pendingRequests = new Map<
    string,
    { resolve: (val: unknown) => void; reject: (err: Error) => void }
  >()

  private getWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL("./opfs-worker.ts", import.meta.url), { type: "module" })
      this.worker.onmessage = (event: MessageEvent<OPFSMessageResponse>) => {
        const { requestId, success, data, error } = event.data
        const handler = this.pendingRequests.get(requestId)
        if (handler) {
          this.pendingRequests.delete(requestId)
          if (success) {
            handler.resolve(data)
          } else {
            handler.reject(new Error(error ?? "OPFS operation failed"))
          }
        }
      }
    }
    return this.worker
  }

  private sendRequest<T>(
    type: OPFSMessageRequest["type"],
    docId?: string,
    content?: unknown
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const requestId = crypto.randomUUID()
      this.pendingRequests.set(requestId, {
        resolve: resolve as (val: unknown) => void,
        reject,
      })
      try {
        const worker = this.getWorker()
        worker.postMessage({ requestId, type, docId, content } satisfies OPFSMessageRequest)
      } catch (err) {
        this.pendingRequests.delete(requestId)
        reject(err instanceof Error ? err : new Error(String(err)))
      }
    })
  }

  public async writeDocumentContent(id: string, content: unknown): Promise<void> {
    await this.sendRequest<void>("write", id, content)
  }

  public async readDocumentContent<T = unknown>(id: string): Promise<T | null> {
    return await this.sendRequest<T | null>("read", id)
  }

  public async deleteDocumentContent(id: string): Promise<void> {
    await this.sendRequest<void>("delete", id)
  }

  public async listDocumentFiles(): Promise<string[]> {
    return await this.sendRequest<string[]>("list")
  }
}

export const opfsClient = new OPFSClient()
