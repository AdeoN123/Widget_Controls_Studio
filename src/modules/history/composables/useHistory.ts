import { computed } from 'vue'
import { useEditorStore } from '@/stores/editorStore'
import { diffSnapshots } from '../services/historyDiff'
import type { HistoryEntry } from '../model/history.types'

const TITLE_LABELS: Record<string, string> = {
  'raw-edit': 'Edit raw block',
  'object-edit': 'Edit object view',
  'controls-edit': 'Edit controls YAML',
  'generate-controls': 'Generate controls',
  'repair-controls': 'Repair controls',
  normalize: 'Normalize block',
  import: 'Import block',
  'reorder-fields': 'Reorder fields',
  'reorder-controls': 'Reorder controls',
  'bulk-update-controls': 'Bulk update controls',
  'bulk-delete-controls': 'Bulk delete controls',
  'apply-preset': 'Apply control preset',
  'parameter-preset': 'Apply parameter preset',
  'field-value-edit': 'Edit field value',
  'control-edit': 'Edit control',
  'rename-field': 'Rename field',
  'compare-merge': 'Compare merge',
  'bulk-set-group': 'Bulk set group',
  'bulk-rebuild-names': 'Rebuild control names',
  'bulk-delete': 'Delete selected controls',
  'bulk-regenerate': 'Restore control defaults',
  'bulk-generate-fields': 'Generate controls for fields',
  initial: 'Initial state',
}

function formatTitle(entry: HistoryEntry): string {
  if (entry.title.startsWith('scenario-')) {
    return `Repair: ${entry.title.replace('scenario-', '').replace(/-/g, ' ')}`
  }
  return TITLE_LABELS[entry.title] ?? entry.title
}

export function useHistory() {
  const editorStore = useEditorStore()

  const entries = computed(() =>
    editorStore.historyEntries.map((entry) => ({
      ...entry,
      label: formatTitle(entry),
      diff: diffSnapshots(entry.before, entry.after),
    })),
  )

  return {
    canUndo: computed(() => editorStore.canUndo),
    canRedo: computed(() => editorStore.canRedo),
    entries,
    undo: () => editorStore.undo(),
    redo: () => editorStore.redo(),
    runWithHistory: editorStore.runWithHistory,
  }
}
