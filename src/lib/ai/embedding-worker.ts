import { pipeline, env, type FeatureExtractionPipeline } from "@huggingface/transformers"

env.allowLocalModels = false

let embedder: FeatureExtractionPipeline | null = null
let activeDevice: "webgpu" | "wasm" | null = null
let isInitializing = false
let initError: string | null = null

async function initPipeline(): Promise<{ device: "webgpu" | "wasm" }> {
  if (embedder && activeDevice) {
    return { device: activeDevice }
  }

  isInitializing = true
  initError = null

  try {
    self.postMessage({
      type: "status",
      status: "loading",
      device: "webgpu",
      message: "Initializing WebGPU embedding pipeline...",
    })

    embedder = (await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
      device: "webgpu",
      dtype: "fp32",
      progress_callback: (progressData: unknown) => {
        self.postMessage({ type: "progress", data: progressData })
      },
    })) as FeatureExtractionPipeline

    activeDevice = "webgpu"
    isInitializing = false
    self.postMessage({
      type: "status",
      status: "ready",
      device: "webgpu",
      message: "WebGPU embedding pipeline ready.",
    })
    return { device: "webgpu" }
  } catch (webgpuError) {
    console.warn("WebGPU initialization failed, falling back to WASM:", webgpuError)
  }

  try {
    self.postMessage({
      type: "status",
      status: "loading",
      device: "wasm",
      message: "Initializing WASM embedding pipeline...",
    })

    embedder = (await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
      device: "wasm",
      dtype: "fp32",
      progress_callback: (progressData: unknown) => {
        self.postMessage({ type: "progress", data: progressData })
      },
    })) as FeatureExtractionPipeline

    activeDevice = "wasm"
    isInitializing = false
    self.postMessage({
      type: "status",
      status: "ready",
      device: "wasm",
      message: "WASM embedding pipeline ready.",
    })
    return { device: "wasm" }
  } catch (wasmError) {
    isInitializing = false
    initError = wasmError instanceof Error ? wasmError.message : String(wasmError)
    self.postMessage({
      type: "status",
      status: "error",
      device: null,
      error: initError,
    })
    throw new Error(`Failed to initialize embedding worker: ${initError}`, { cause: wasmError })
  }
}

self.onmessage = async (event: MessageEvent) => {
  const { id, type, text, texts } = event.data || {}

  if (type === "init") {
    try {
      const res = await initPipeline()
      self.postMessage({ id, type: "init", success: true, device: res.device })
    } catch (err) {
      self.postMessage({
        id,
        type: "init",
        success: false,
        error: err instanceof Error ? err.message : String(err),
      })
    }
    return
  }

  if (type === "getStatus") {
    self.postMessage({
      id,
      type: "getStatus",
      status: embedder
        ? "ready"
        : isInitializing
          ? "loading"
          : initError
            ? "error"
            : "uninitialized",
      device: activeDevice,
      error: initError,
    })
    return
  }

  if (type === "embed") {
    try {
      if (!embedder) {
        await initPipeline()
      }
      if (!embedder) throw new Error("Embedder not initialized")

      const output = await embedder(text, { pooling: "mean", normalize: true })
      const floatArray = new Float32Array(output.data as Float32Array)

      self.postMessage(
        { id, type: "embed", embedding: floatArray },
        { transfer: [floatArray.buffer] }
      )
    } catch (err) {
      self.postMessage({
        id,
        type: "embed",
        error: err instanceof Error ? err.message : String(err),
      })
    }
    return
  }

  if (type === "embedBatch") {
    try {
      if (!embedder) {
        await initPipeline()
      }
      if (!embedder) throw new Error("Embedder not initialized")

      const inputTexts: string[] = Array.isArray(texts) ? texts : []
      if (inputTexts.length === 0) {
        self.postMessage({ id, type: "embedBatch", embeddings: [] })
        return
      }

      const output = await embedder(inputTexts, { pooling: "mean", normalize: true })
      const rawData = output.data as Float32Array
      const numItems = inputTexts.length
      const dims = 384
      const embeddings: Float32Array[] = []
      const buffersToTransfer: ArrayBuffer[] = []

      for (let i = 0; i < numItems; i++) {
        const slice = rawData.slice(i * dims, (i + 1) * dims)
        embeddings.push(slice)
        buffersToTransfer.push(slice.buffer)
      }

      self.postMessage({ id, type: "embedBatch", embeddings }, { transfer: buffersToTransfer })
    } catch (err) {
      self.postMessage({
        id,
        type: "embedBatch",
        error: err instanceof Error ? err.message : String(err),
      })
    }
    return
  }
}
