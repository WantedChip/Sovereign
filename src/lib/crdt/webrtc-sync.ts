import type * as Y from "yjs"
import { WebrtcProvider } from "y-webrtc"
import { errorHandler } from "@/lib/error-handler"

export interface WebRTCStatus {
  connected: boolean
  synced: boolean
  peerCount: number
  webrtcPeers: string[]
  bcPeers: string[]
}

/**
 * Creates and configures a WebRTC provider for peer-to-peer document synchronization with auto-reconnect backoff.
 *
 * @param documentId Unique identifier for the document. Room name will be `sovereign-${documentId}`.
 * @param ydoc The Y.Doc instance to synchronize.
 * @param onStatusChange Callback triggered when WebRTC connection status or peer count changes.
 */
export function createWebRTCProvider(
  documentId: string,
  ydoc: Y.Doc,
  onStatusChange?: (status: WebRTCStatus) => void
): WebrtcProvider {
  const roomName = `sovereign-${documentId}`

  const provider = new WebrtcProvider(roomName, ydoc, {
    signaling: [
      "wss://signaling.yjs.dev",
      "wss://y-webrtc-signaling-ws.glitch.me",
      "wss://y-webrtc-signaling-us.glitch.me",
    ],
    filterBcConns: false,
  })

  const statusState: WebRTCStatus = {
    connected: provider.connected,
    synced: false,
    peerCount: 0,
    webrtcPeers: [],
    bcPeers: [],
  }

  let reconnectAttempts = 0
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null

  const notifyStatus = () => {
    onStatusChange?.({ ...statusState })
  }

  const scheduleReconnectWithBackoff = () => {
    if (reconnectTimer) clearTimeout(reconnectTimer)

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)
    reconnectAttempts++

    console.warn(
      `[WebRTC] Disconnected. Scheduling reconnect attempt ${reconnectAttempts} in ${delay}ms...`
    )

    reconnectTimer = setTimeout(() => {
      if (!provider.connected) {
        try {
          provider.connect()
        } catch (err) {
          errorHandler.handleNetworkError(err)
        }
      }
    }, delay)
  }

  provider.on("status", ({ connected }: { connected: boolean }) => {
    statusState.connected = connected
    if (connected) {
      reconnectAttempts = 0
      if (reconnectTimer) clearTimeout(reconnectTimer)
    } else {
      scheduleReconnectWithBackoff()
    }
    notifyStatus()
  })

  provider.on("synced", ({ synced }: { synced: boolean }) => {
    statusState.synced = synced
    notifyStatus()
  })

  provider.on(
    "peers",
    ({
      webrtcPeers,
      bcPeers,
    }: {
      added: string[]
      removed: string[]
      webrtcPeers: string[]
      bcPeers: string[]
    }) => {
      statusState.webrtcPeers = webrtcPeers || []
      statusState.bcPeers = bcPeers || []
      statusState.peerCount =
        (webrtcPeers ? webrtcPeers.length : 0) + (bcPeers ? bcPeers.length : 0)
      notifyStatus()
    }
  )

  const originalDestroy = provider.destroy.bind(provider)
  provider.destroy = () => {
    if (reconnectTimer) clearTimeout(reconnectTimer)
    originalDestroy()
  }

  return provider
}
