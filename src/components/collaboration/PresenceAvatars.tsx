import { useEffect, useState } from "react"
import type { WebrtcProvider } from "y-webrtc"
import type { EditorUserPresence } from "@/components/editor/Editor"

export interface PresenceAvatarsProps {
  provider?: WebrtcProvider | null
  currentUser?: EditorUserPresence
  className?: string
}

export interface PeerState {
  clientId: number
  name: string
  color: string
  isLocal: boolean
}

export function PresenceAvatars({ provider, currentUser, className = "" }: PresenceAvatarsProps) {
  const [peers, setPeers] = useState<PeerState[]>([])

  useEffect(() => {
    if (!provider || !provider.awareness) {
      queueMicrotask(() => setPeers([]))
      return
    }

    const awareness = provider.awareness

    if (currentUser) {
      awareness.setLocalStateField("user", currentUser)
    }

    const updatePeerStates = () => {
      const states = awareness.getStates()
      const localClientId = awareness.clientID
      const activePeers: PeerState[] = []

      states.forEach((state, clientId) => {
        const user = state.user as EditorUserPresence | undefined
        if (user && user.name) {
          activePeers.push({
            clientId,
            name: user.name,
            color: user.color || "#C9A227",
            isLocal: clientId === localClientId,
          })
        }
      })

      setPeers(activePeers)
    }

    queueMicrotask(updatePeerStates)

    awareness.on("change", updatePeerStates)
    return () => {
      awareness.off("change", updatePeerStates)
    }
  }, [provider, currentUser])

  if (peers.length === 0) return null

  return (
    <div className={`flex items-center -space-x-1.5 overflow-hidden ${className}`}>
      {peers.map((peer) => {
        const initials = peer.name.slice(0, 2).toUpperCase()
        return (
          <div
            key={peer.clientId}
            className="relative group cursor-pointer"
            title={`${peer.name}${peer.isLocal ? " (You)" : ""}`}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono text-ink border-2 border-ink shadow-sm transition-transform duration-150 group-hover:scale-110"
              style={{ backgroundColor: peer.color }}
            >
              {initials}
            </div>
            {peer.isLocal && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-moss border border-ink" />
            )}
          </div>
        )
      })}
    </div>
  )
}
