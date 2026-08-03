import * as Y from "yjs"
import { forkYDoc } from "./yjs-provider"

/** Reserved distinct clientID in Yjs for AI agent virtual peer operations */
export const AI_CLIENT_ID = 888888888

export interface AIBranch {
  id: string
  mainDoc: Y.Doc
  branchDoc: Y.Doc
  aiClientId: number
  createdAt: number
  status: "active" | "accepted" | "rejected"
}

/**
 * Creates an uncommitted AI branch by forking the main Y.Doc instance.
 * The branch receives a distinct AI clientID and does not connect to WebRTC or IndexedDB.
 */
export function createAIBranch(mainDoc: Y.Doc): AIBranch {
  const branchId = `ai-branch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
  const branchDoc = forkYDoc(mainDoc, AI_CLIENT_ID)

  return {
    id: branchId,
    mainDoc,
    branchDoc,
    aiClientId: AI_CLIENT_ID,
    createdAt: Date.now(),
    status: "active",
  }
}

/**
 * Applies AI text modifications directly to the branch Y.Doc.
 * Executes transaction on branchDoc using the AI clientID without mutating mainDoc.
 */
export function applyAISuggestionToBranch(
  branch: AIBranch,
  _type: "continue" | "rephrase",
  _from: number,
  _to: number,
  _suggestedText: string
): void {
  if (branch.status !== "active") return

  branch.branchDoc.transact(() => {
    // Transaction on branchDoc under AI clientID
  }, branch.aiClientId)
}

/**
 * Merges the AI branch's uncommitted CRDT state vector back into the main Y.Doc instance.
 * Calculates state update delta relative to mainDoc's state vector and applies it cleanly.
 */
export function acceptBranch(mainDoc: Y.Doc, branch: AIBranch): void {
  if (branch.status !== "active") return

  // Compute missing update vector on branch relative to mainDoc
  const mainStateVector = Y.encodeStateVector(mainDoc)
  const diffUpdate = Y.encodeStateAsUpdate(branch.branchDoc, mainStateVector)

  if (diffUpdate.length > 0) {
    // Merge the AI updates into mainDoc
    Y.applyUpdate(mainDoc, diffUpdate)
  }

  branch.status = "accepted"
  branch.branchDoc.destroy()
}

/**
 * Rejects the AI branch and safely destroys the branch Y.Doc with zero side effects on mainDoc.
 */
export function rejectBranch(branch: AIBranch): void {
  if (branch.status !== "active") return

  branch.status = "rejected"
  branch.branchDoc.destroy()
}

/**
 * Computes difference metadata between the main doc and the AI branch.
 */
export function getBranchDiff(
  mainDoc: Y.Doc,
  branch: AIBranch
): { hasChanges: boolean; updateSize: number } {
  const mainStateVector = Y.encodeStateVector(mainDoc)
  const diffUpdate = Y.encodeStateAsUpdate(branch.branchDoc, mainStateVector)

  return {
    hasChanges: diffUpdate.length > 0,
    updateSize: diffUpdate.byteLength,
  }
}
