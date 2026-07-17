export type {
  WidgetStudioSnapshot,
  HistoryEntry,
  HistoryDiffSummary,
} from './model/history.types'

export { HistoryManager } from './services/historyManager'
export {
  beginHistoryTransaction,
  commitHistoryTransaction,
  cancelHistoryTransaction,
  runHistoryTransaction,
  setHistoryTransactionsSkipped,
} from './services/historyTransaction'
export {
  captureWidgetSnapshot,
  restoreWidgetSnapshot,
  snapshotsEqual,
} from './services/snapshotBuilder'
export { diffSnapshots } from './services/historyDiff'
export { useHistory } from './composables/useHistory'
