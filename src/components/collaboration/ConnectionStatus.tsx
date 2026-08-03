import { Badge } from "@/components/ui/badge"
import { Share2, Wifi, WifiOff } from "lucide-react"

export interface ConnectionStatusProps {
  isConnected?: boolean
  peerCount?: number
  className?: string
}

export function ConnectionStatus({
  isConnected = false,
  peerCount = 0,
  className = "",
}: ConnectionStatusProps) {
  if (!isConnected) {
    return (
      <Badge
        variant="outline"
        className={`text-[10px] font-mono gap-1.5 border-oxblood/40 text-oxblood bg-oxblood/10 ${className}`}
        title="P2P mesh offline. Local edits are stored in IndexedDB & OPFS and will sync when peers connect."
      >
        <WifiOff className="w-3 h-3 text-oxblood" />
        <span>Offline</span>
      </Badge>
    )
  }

  if (peerCount === 0) {
    return (
      <Badge
        variant="outline"
        className={`text-[10px] font-mono gap-1.5 border-brass/40 text-brass bg-brass/10 ${className}`}
        title="WebRTC signaling active. Waiting for remote peers or tabs to join room."
      >
        <Share2 className="w-3 h-3 text-brass animate-pulse" />
        <span>P2P Ready</span>
      </Badge>
    )
  }

  return (
    <Badge
      variant="moss"
      className={`text-[10px] font-mono gap-1.5 ${className}`}
      title={`Connected to ${peerCount} peer${peerCount === 1 ? "" : "s"} via WebRTC & BroadcastChannel.`}
    >
      <Wifi className="w-3 h-3 text-moss" />
      <span>
        {peerCount} Peer{peerCount === 1 ? "" : "s"} Active
      </span>
    </Badge>
  )
}
