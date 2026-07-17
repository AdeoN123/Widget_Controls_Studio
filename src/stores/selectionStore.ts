import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useSelectionStore = defineStore('selection', () => {
  const selectedFieldKeys = ref<Set<string>>(new Set())
  const selectedControlKeys = ref<Set<string>>(new Set())
  const multiSelectMode = ref(false)
  const activeSectionId = ref<string | null>(null)

  const fieldCount = computed(() => selectedFieldKeys.value.size)
  const controlCount = computed(() => selectedControlKeys.value.size)

  function toggleField(key: string) {
    const next = new Set(selectedFieldKeys.value)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    selectedFieldKeys.value = next
  }

  function toggleControl(key: string) {
    const next = new Set(selectedControlKeys.value)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    selectedControlKeys.value = next
  }

  function selectAllFields(keys: string[]) {
    selectedFieldKeys.value = new Set(keys)
  }

  function selectAllControls(keys: string[]) {
    selectedControlKeys.value = new Set(keys)
  }

  function clearFields() {
    selectedFieldKeys.value = new Set()
  }

  function clearControls() {
    selectedControlKeys.value = new Set()
  }

  function clearAll() {
    clearFields()
    clearControls()
  }

  return {
    selectedFieldKeys,
    selectedControlKeys,
    multiSelectMode,
    activeSectionId,
    fieldCount,
    controlCount,
    toggleField,
    toggleControl,
    selectAllFields,
    selectAllControls,
    clearFields,
    clearControls,
    clearAll,
  }
})
