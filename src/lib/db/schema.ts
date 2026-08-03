import Dexie, { type EntityTable } from "dexie"
import type { Document, Setting } from "@/types"

export class SovereignDB extends Dexie {
  documents!: EntityTable<Document, "id">
  settings!: EntityTable<Setting, "key">

  constructor() {
    super("SovereignDB")
    this.version(1).stores({
      documents: "id, title, updatedAt, *tags",
      settings: "key",
    })
  }
}

export const db = new SovereignDB()
