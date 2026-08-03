export interface WebGPUCapabilities {
  supported: boolean
  adapterName?: string
  vendor?: string
  architecture?: string
  estimatedVRAMMB: number
  fallback: "webgpu" | "wasm"
  error?: string
}

export async function detectWebGPU(): Promise<WebGPUCapabilities> {
  if (typeof navigator === "undefined" || !("gpu" in navigator)) {
    return {
      supported: false,
      estimatedVRAMMB: 0,
      fallback: "wasm",
      error: "WebGPU API is not available in this browser environment.",
    }
  }

  try {
    const gpu = navigator.gpu
    const adapter = await gpu.requestAdapter()
    if (!adapter) {
      return {
        supported: false,
        estimatedVRAMMB: 0,
        fallback: "wasm",
        error: "No WebGPU GPUAdapter found. Check browser hardware acceleration settings.",
      }
    }

    let adapterName = "WebGPU Accelerated Device"
    let vendor = ""
    let architecture = ""

    if (adapter.info) {
      adapterName =
        adapter.info.description || adapter.info.device || adapter.info.vendor || adapterName
      vendor = adapter.info.vendor || ""
      architecture = adapter.info.architecture || ""
    }

    let estimatedVRAMMB = 2048 // Default baseline estimation
    try {
      const device = await adapter.requestDevice()
      if (device && device.limits) {
        const maxBuffer =
          device.limits.maxStorageBufferBindingSize || device.limits.maxBufferSize || 0
        if (maxBuffer >= 1073741824) {
          // 1GB+ max buffer limit usually corresponds to 4GB+ dedicated VRAM
          estimatedVRAMMB = 4096
        } else if (maxBuffer >= 536870912) {
          estimatedVRAMMB = 2048
        } else {
          estimatedVRAMMB = 1024
        }
      }
    } catch (deviceErr) {
      console.warn("Could not inspect GPUDevice limits:", deviceErr)
    }

    return {
      supported: true,
      adapterName,
      vendor,
      architecture,
      estimatedVRAMMB,
      fallback: "webgpu",
    }
  } catch (err) {
    return {
      supported: false,
      estimatedVRAMMB: 0,
      fallback: "wasm",
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

export function getRecommendedModel(caps: WebGPUCapabilities): {
  recommendedModelId: string | null
  reason: string
} {
  if (!caps.supported) {
    return {
      recommendedModelId: null,
      reason:
        "WebGPU acceleration is not supported on this device. Text search and vector embeddings will run in WASM fallback mode.",
    }
  }

  if (caps.estimatedVRAMMB >= 4096) {
    return {
      recommendedModelId: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
      reason: `WebGPU active (${caps.adapterName || "GPU"}). High VRAM capacity (~${caps.estimatedVRAMMB}MB) detected.`,
    }
  }

  return {
    recommendedModelId: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    reason: `WebGPU active (${caps.adapterName || "GPU"}). Lightweight 1B parameter model recommended.`,
  }
}
