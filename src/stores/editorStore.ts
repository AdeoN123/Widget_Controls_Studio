import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  HistoryManager,
  captureWidgetSnapshot,
  restoreWidgetSnapshot,
  runHistoryTransaction,
  setHistoryTransactionsSkipped,
} from '@/modules/history'
import { DEFAULT_LAYOUT, type DiffMode, type LayoutSizes } from '@/modules/editor/types'

export type ThemeMode = 'dark' | 'light'

interface DebouncedHistorySession {
  title: string
  before: ReturnType<typeof captureWidgetSnapshot>
}

export const useEditorStore = defineStore('editor', () => {
  const history = new HistoryManager()
  const historyRestoring = ref(false)
  const debouncedSessions = new Map<string, DebouncedHistorySession>()
  const debouncedTimers = new Map<string, ReturnType<typeof setTimeout>>()
  const theme = ref<ThemeMode>('dark')
  const layout = ref<LayoutSizes>({ ...DEFAULT_LAYOUT })
  const hasUnsavedChanges = ref(false)
  const showImportModal = ref(false)
  const showExportModal = ref(false)
  const diffMode = ref<DiffMode>('original-current')
  const diagnosticsExpanded = ref(true)
  const monacoFocused = ref(false)

  const beforeNormalizeRaw = ref('')
  const afterNormalizeRaw = ref('')
  const beforeRepairRaw = ref('')
  const afterRepairRaw = ref('')
  const beforeGenerateRaw = ref('')
  const afterGenerateRaw = ref('')

  const canUndo = computed(() => history.canUndo)
  const canRedo = computed(() => history.canRedo)
  const historyEntries = computed(() => history.entries)
  const showHistoryPanel = ref(false)

  function applyTheme(mode: ThemeMode) {
    theme.value = mode
    document.documentElement.setAttribute('data-theme', mode)
  }

  function toggleTheme() {
    applyTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  function updateLayout(patch: Partial<LayoutSizes>) {
    layout.value = { ...layout.value, ...patch }
  }

  function runWithHistory(title: string, fn: () => void) {
    if (historyRestoring.value) {
      fn()
      return
    }
    runHistoryTransaction(history, title, fn)
  }

  function runDebouncedHistory(sessionKey: string, title: string, fn: () => void) {
    if (historyRestoring.value) {
      fn()
      return
    }
    if (!debouncedSessions.has(sessionKey)) {
      debouncedSessions.set(sessionKey, { title, before: captureWidgetSnapshot() })
    }
    fn()
    flushDebouncedHistory(sessionKey)
  }

  function flushDebouncedHistory(sessionKey: string) {
    const existing = debouncedTimers.get(sessionKey)
    if (existing) clearTimeout(existing)
    debouncedTimers.set(
      sessionKey,
      setTimeout(() => {
        const session = debouncedSessions.get(sessionKey)
        if (!session) return
        const after = captureWidgetSnapshot()
        history.commit(session.title, session.before, after)
        debouncedSessions.delete(sessionKey)
        debouncedTimers.delete(sessionKey)
      }, 500),
    )
  }

  function seedHistory() {
    history.clear()
  }

  function undo() {
    const entry = history.undo()
    if (!entry) return
    historyRestoring.value = true
    setHistoryTransactionsSkipped(true)
    try {
      restoreWidgetSnapshot(entry.before)
    } finally {
      setHistoryTransactionsSkipped(false)
      historyRestoring.value = false
    }
  }

  function redo() {
    const entry = history.redo()
    if (!entry) return
    historyRestoring.value = true
    setHistoryTransactionsSkipped(true)
    try {
      restoreWidgetSnapshot(entry.after)
    } finally {
      setHistoryTransactionsSkipped(false)
      historyRestoring.value = false
    }
  }

  function markUnsaved() {
    hasUnsavedChanges.value = true
  }

  function markSaved() {
    hasUnsavedChanges.value = false
  }

  function captureDiffSnapshot(
    kind: 'normalize' | 'repair' | 'generate',
    before: string,
    after: string,
  ) {
    if (kind === 'normalize') {
      beforeNormalizeRaw.value = before
      afterNormalizeRaw.value = after
      diffMode.value = 'before-normalize'
    } else if (kind === 'repair') {
      beforeRepairRaw.value = before
      afterRepairRaw.value = after
      diffMode.value = 'before-repair'
    } else {
      beforeGenerateRaw.value = before
      afterGenerateRaw.value = after
      diffMode.value = 'before-generate'
    }
  }

  function initTheme() {
    applyTheme(theme.value)
  }

  return {
    theme,
    layout,
    hasUnsavedChanges,
    showImportModal,
    showExportModal,
    diffMode,
    diagnosticsExpanded,
    monacoFocused,
    beforeNormalizeRaw,
    afterNormalizeRaw,
    beforeRepairRaw,
    afterRepairRaw,
    beforeGenerateRaw,
    afterGenerateRaw,
    canUndo,
    canRedo,
    historyEntries,
    showHistoryPanel,
    historyRestoring,
    applyTheme,
    toggleTheme,
    updateLayout,
    runWithHistory,
    runDebouncedHistory,
    seedHistory,
    undo,
    redo,
    markUnsaved,
    markSaved,
    captureDiffSnapshot,
    initTheme,
  }
})
