export interface OPFSMessageRequest {
  requestId: string
  type: "write" | "read" | "delete" | "list"
  docId?: string
  content?: unknown
}

export interface OPFSMessageResponse {
  requestId: string
  success: boolean
  data?: unknown
  error?: string
}

async function getDocsDir(): Promise<FileSystemDirectoryHandle> {
  const root = await navigator.storage.getDirectory()
  return await root.getDirectoryHandle("documents", { create: true })
}

self.onmessage = async (event: MessageEvent<OPFSMessageRequest>) => {
  const { requestId, type, docId, content } = event.data

  try {
    const docsDir = await getDocsDir()

    switch (type) {
      case "write": {
        if (!docId) throw new Error("docId required for write")
        const fileHandle = await docsDir.getFileHandle(`${docId}.json`, { create: true })
        const jsonStr = typeof content === "string" ? content : JSON.stringify(content ?? {})
        const encoder = new TextEncoder()
        const data = encoder.encode(jsonStr)

        if (
          "createSyncAccessHandle" in fileHandle &&
          typeof fileHandle.createSyncAccessHandle === "function"
        ) {
          try {
            const accessHandle = await fileHandle.createSyncAccessHandle()
            accessHandle.truncate(0)
            accessHandle.write(data, { at: 0 })
            accessHandle.flush()
            accessHandle.close()
          } catch {
            const writable = await fileHandle.createWritable()
            await writable.write(jsonStr)
            await writable.close()
          }
        } else {
          const writable = await fileHandle.createWritable()
          await writable.write(jsonStr)
          await writable.close()
        }

        self.postMessage({ requestId, success: true } satisfies OPFSMessageResponse)
        break
      }

      case "read": {
        if (!docId) throw new Error("docId required for read")
        try {
          const fileHandle = await docsDir.getFileHandle(`${docId}.json`, { create: false })
          const file = await fileHandle.getFile()
          const text = await file.text()
          const data = JSON.parse(text)
          self.postMessage({ requestId, success: true, data } satisfies OPFSMessageResponse)
        } catch {
          // File not found or corrupt
          self.postMessage({ requestId, success: true, data: null } satisfies OPFSMessageResponse)
        }
        break
      }

      case "delete": {
        if (!docId) throw new Error("docId required for delete")
        try {
          await docsDir.removeEntry(`${docId}.json`)
        } catch {
          // File might already be gone
        }
        self.postMessage({ requestId, success: true } satisfies OPFSMessageResponse)
        break
      }

      case "list": {
        const docIds: string[] = []
        for await (const name of docsDir.keys()) {
          if (name.endsWith(".json")) {
            docIds.push(name.replace(/\.json$/, ""))
          }
        }
        self.postMessage({ requestId, success: true, data: docIds } satisfies OPFSMessageResponse)
        break
      }

      default:
        throw new Error(`Unknown OPFS message type: ${type}`)
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    self.postMessage({
      requestId,
      success: false,
      error: errorMessage,
    } satisfies OPFSMessageResponse)
  }
}
