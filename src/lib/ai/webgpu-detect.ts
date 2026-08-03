export interface WebGPUInfo {
  supported: boolean
  adapterName?: string
  error?: string
}

export async function checkWebGPUSupport(): Promise<WebGPUInfo> {
  if (typeof navigator === "undefined" || !("gpu" in navigator)) {
    return {
      supported: false,
      error: "WebGPU API is not available in this browser environment.",
    }
  }

  try {
    const gpu = navigator.gpu
    const adapter = await gpu.requestAdapter()
    if (!adapter) {
      return {
        supported: false,
        error: "No WebGPU GPUAdapter found.",
      }
    }

    let adapterName: string | undefined
    if (adapter.info) {
      adapterName = adapter.info.description || adapter.info.device || adapter.info.vendor
    }

    return {
      supported: true,
      adapterName,
    }
  } catch (err) {
    return {
      supported: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
