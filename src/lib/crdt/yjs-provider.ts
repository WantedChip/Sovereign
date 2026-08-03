import * as Y from "yjs"

export interface YjsDocSession {
  documentId: string
  ydoc: Y.Doc
  xmlFragment: Y.XmlFragment
}

const activeYjsDocs = new Map<string, YjsDocSession>()

/**
 * Retrieves or creates an active Y.Doc instance and its 'document' XmlFragment for a given documentId.
 */
export function getYjsDoc(documentId: string): YjsDocSession {
  const existing = activeYjsDocs.get(documentId)
  if (existing) {
    return existing
  }

  const ydoc = new Y.Doc()
  const xmlFragment = ydoc.getXmlFragment("document")

  const session: YjsDocSession = {
    documentId,
    ydoc,
    xmlFragment,
  }

  activeYjsDocs.set(documentId, session)
  return session
}

/**
 * Destroys a Y.Doc instance when a document is closed or deleted to free resources.
 */
export function destroyYjsDoc(documentId: string): void {
  const session = activeYjsDocs.get(documentId)
  if (session) {
    session.ydoc.destroy()
    activeYjsDocs.delete(documentId)
  }
}

/**
 * Destroys all active Y.Doc sessions. Useful for cleanup or testing.
 */
export function clearAllYjsDocs(): void {
  for (const session of activeYjsDocs.values()) {
    session.ydoc.destroy()
  }
  activeYjsDocs.clear()
}
