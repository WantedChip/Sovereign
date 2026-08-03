import * as Y from "yjs"
import { IndexeddbPersistence } from "y-indexeddb"
import type { WebrtcProvider } from "y-webrtc"
import { createWebRTCProvider } from "./webrtc-sync"

export interface YjsDocSession {
  documentId: string
  ydoc: Y.Doc
  xmlFragment: Y.XmlFragment
  persistence: IndexeddbPersistence
  webrtcProvider: WebrtcProvider
  isSynced: boolean
  whenSynced: Promise<IndexeddbPersistence>
  peerCount: number
  isConnected: boolean
}

const activeYjsDocs = new Map<string, YjsDocSession>()

/**
 * Retrieves or creates an active Y.Doc instance, IndexedDB persistence layer,
 * WebRTC P2P sync provider, and 'document' XmlFragment for a given documentId.
 */
export function getYjsDoc(documentId: string): YjsDocSession {
  const existing = activeYjsDocs.get(documentId)
  if (existing) {
    return existing
  }

  const ydoc = new Y.Doc()
  const xmlFragment = ydoc.getXmlFragment("document")
  const persistence = new IndexeddbPersistence(`sovereign-doc-${documentId}`, ydoc)

  const session: YjsDocSession = {
    documentId,
    ydoc,
    xmlFragment,
    persistence,
    webrtcProvider: null as unknown as WebrtcProvider,
    isSynced: persistence.synced,
    whenSynced: persistence.whenSynced,
    peerCount: 0,
    isConnected: false,
  }

  const webrtcProvider = createWebRTCProvider(documentId, ydoc, (status) => {
    session.isConnected = status.connected
    session.peerCount = status.peerCount
  })

  session.webrtcProvider = webrtcProvider
  session.isConnected = webrtcProvider.connected

  persistence.on("synced", () => {
    session.isSynced = true
  })

  activeYjsDocs.set(documentId, session)
  return session
}

/**
 * Destroys a Y.Doc instance, its IndexedDB persistence provider, and WebRTC provider when closed or deleted.
 */
export function destroyYjsDoc(documentId: string): void {
  const session = activeYjsDocs.get(documentId)
  if (session) {
    session.webrtcProvider.destroy()
    session.persistence.destroy()
    session.ydoc.destroy()
    activeYjsDocs.delete(documentId)
  }
}

/**
 * Destroys all active Y.Doc sessions, their persistence providers, and WebRTC providers.
 */
export function clearAllYjsDocs(): void {
  for (const session of activeYjsDocs.values()) {
    session.webrtcProvider.destroy()
    session.persistence.destroy()
    session.ydoc.destroy()
  }
  activeYjsDocs.clear()
}
