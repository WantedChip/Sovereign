import * as Y from "yjs"
import { IndexeddbPersistence } from "y-indexeddb"

export interface YjsDocSession {
  documentId: string
  ydoc: Y.Doc
  xmlFragment: Y.XmlFragment
  persistence: IndexeddbPersistence
  isSynced: boolean
  whenSynced: Promise<IndexeddbPersistence>
}

const activeYjsDocs = new Map<string, YjsDocSession>()

/**
 * Retrieves or creates an active Y.Doc instance, IndexedDB persistence layer,
 * and 'document' XmlFragment for a given documentId.
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
    isSynced: persistence.synced,
    whenSynced: persistence.whenSynced,
  }

  persistence.on("synced", () => {
    session.isSynced = true
  })

  activeYjsDocs.set(documentId, session)
  return session
}

/**
 * Destroys a Y.Doc instance and its IndexedDB persistence provider when closed or deleted.
 */
export function destroyYjsDoc(documentId: string): void {
  const session = activeYjsDocs.get(documentId)
  if (session) {
    session.persistence.destroy()
    session.ydoc.destroy()
    activeYjsDocs.delete(documentId)
  }
}

/**
 * Destroys all active Y.Doc sessions and their persistence providers.
 */
export function clearAllYjsDocs(): void {
  for (const session of activeYjsDocs.values()) {
    session.persistence.destroy()
    session.ydoc.destroy()
  }
  activeYjsDocs.clear()
}
