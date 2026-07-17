import type { HistoryEntry, WidgetStudioSnapshot } from '../model/history.types'
import { snapshotsEqual } from './snapshotBuilder'

const MAX_HISTORY = 50

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export class HistoryManager {
  private past: HistoryEntry[] = []
  private future: HistoryEntry[] = []

  get canUndo(): boolean {
    return this.past.length > 0
  }

  get canRedo(): boolean {
    return this.future.length > 0
  }

  get entries(): HistoryEntry[] {
    return [...this.past].reverse()
  }

  commit(
    title: string,
    before: WidgetStudioSnapshot,
    after: WidgetStudioSnapshot,
    meta?: Record<string, unknown>,
  ): HistoryEntry | null {
    if (snapshotsEqual(before, after)) return null

    const entry: HistoryEntry = {
      id: createId(),
      title,
      timestamp: Date.now(),
      before,
      after,
      meta,
    }

    this.past.push(entry)
    if (this.past.length > MAX_HISTORY) this.past.shift()
    this.future = []
    return entry
  }

  undo(): HistoryEntry | null {
    const entry = this.past.pop()
    if (!entry) return null
    this.future.push(entry)
    return entry
  }

  redo(): HistoryEntry | null {
    const entry = this.future.pop()
    if (!entry) return null
    this.past.push(entry)
    return entry
  }

  clear(): void {
    this.past = []
    this.future = []
  }
}
