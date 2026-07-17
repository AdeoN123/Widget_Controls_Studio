import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useWidgetBlockStore } from '@/stores/widgetBlockStore'
import { runAudit, type AuditFilter, type AuditItem } from '@/modules/audit'

export const useAuditStore = defineStore('audit', () => {
  const isAuditMode = ref(false)
  const activeFilter = ref<AuditFilter | 'all'>('all')

  const items = computed(() => {
    const blockStore = useWidgetBlockStore()
    if (!blockStore.parsedBlock) return []
    return runAudit(blockStore.parsedBlock, blockStore.controls)
  })

  const filteredItems = computed(() => {
    if (activeFilter.value === 'all') return items.value
    return items.value.filter((i) => i.filter === activeFilter.value)
  })

  const counts = computed(() => {
    const map = new Map<AuditFilter, number>()
    for (const item of items.value) {
      map.set(item.filter, (map.get(item.filter) ?? 0) + 1)
    }
    return map
  })

  function toggleAuditMode() {
    isAuditMode.value = !isAuditMode.value
  }

  function setFilter(filter: AuditFilter | 'all') {
    activeFilter.value = filter
  }

  return {
    isAuditMode,
    activeFilter,
    items,
    filteredItems,
    counts,
    toggleAuditMode,
    setFilter,
  }
})

export type { AuditItem, AuditFilter }
