import Dexie, { type EntityTable } from "dexie"
import type { Document, LinkEntry, Setting } from "@/types"

export class SovereignDB extends Dexie {
  documents!: EntityTable<Document, "id">
  settings!: EntityTable<Setting, "key">
  links!: EntityTable<LinkEntry, "id">

  constructor() {
    super("SovereignDB")
    this.version(1).stores({
      documents: "id, title, updatedAt, *tags",
      settings: "key",
    })
    this.version(2).stores({
      documents: "id, title, updatedAt, *tags",
      settings: "key",
      links: "++id, sourceId, targetId, targetTitle",
    })
  }
}

export const db = new SovereignDB()
