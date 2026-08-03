import type * as Y from "yjs"
import { WebrtcProvider } from "y-webrtc"

export interface WebRTCStatus {
  connected: boolean
  synced: boolean
  peerCount: number
  webrtcPeers: string[]
  bcPeers: string[]
}

/**
 * Creates and configures a WebRTC provider for peer-to-peer document synchronization.
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

  const notifyStatus = () => {
    onStatusChange?.({ ...statusState })
  }

  provider.on("status", ({ connected }: { connected: boolean }) => {
    statusState.connected = connected
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

  return provider
}
