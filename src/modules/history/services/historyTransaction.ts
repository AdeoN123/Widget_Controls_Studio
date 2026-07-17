import type { WidgetStudioSnapshot } from '../model/history.types'
import type { HistoryManager } from './historyManager'
import { captureWidgetSnapshot } from './snapshotBuilder'

interface ActiveTransaction {
  title: string
  before: WidgetStudioSnapshot
}

let depth = 0
let active: ActiveTransaction | null = null
let skipTransactions = false

export function setHistoryTransactionsSkipped(skipped: boolean): void {
  skipTransactions = skipped
}

export function beginHistoryTransaction(title: string): void {
  if (skipTransactions) return
  if (depth === 0) {
    active = { title, before: captureWidgetSnapshot() }
  }
  depth++
}

export function commitHistoryTransaction(manager: HistoryManager): void {
  if (skipTransactions) {
    if (depth > 0) depth--
    return
  }
  depth--
  if (depth > 0 || !active) return

  const after = captureWidgetSnapshot()
  manager.commit(active.title, active.before, after)
  active = null
}

export function cancelHistoryTransaction(): void {
  depth = 0
  active = null
}

export function runHistoryTransaction(
  manager: HistoryManager,
  title: string,
  fn: () => void,
): void {
  if (skipTransactions) {
    fn()
    return
  }
  beginHistoryTransaction(title)
  try {
    fn()
    commitHistoryTransaction(manager)
  } catch (error) {
    cancelHistoryTransaction()
    throw error
  }
}
