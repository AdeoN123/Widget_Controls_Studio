import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { WidgetBlock, ParseMetadata } from '@/modules/widget-block/types'
import type { ControlsMap, ControlSchema, BuilderKind } from '@/modules/controls/types'
import type { DiagnosticItem } from '@/types/diagnostics'
import type { BlockField } from '@/modules/widget-block/types'
import { mockFaqBlock } from '@/constants/mockFaqBlock'
import { parseWidgetBlock } from '@/modules/widget-block/parser'
import { generateControls } from '@/modules/controls/generator'
import { bulkGenerateControlsForFields as bulkGenerateControlsForFieldsService } from '@/modules/bulk-edit/services/bulkFields.service'
import { exportWidgetBlock, serializeControls } from '@/modules/widget-block/serializer'
import { normalizeWidgetBlock, normalizeControlsOrder } from '@/modules/widget-block/normalizer'
import { repairControls, repairControlsDetailed } from '@/modules/controls/repair'
import { validateAll } from '@/modules/widget-block/validators'
import {
  blockToObjectView,
  objectViewToBlock,
  objectViewToControls,
  type BlockObjectView,
} from '@/modules/widget-block/mappers/objectView'
import { findFieldByKey, inferBreakpoint } from '@/modules/widget-block/utils/fieldUtils'
import {
  getControlKeysInOrder,
  moveControlKey,
  reorderControls,
  reorderSectionFields,
} from '@/modules/editor/services/reorder.service'
import { useEditorStore } from '@/stores/editorStore'
import { useSelectionStore } from '@/stores/selectionStore'
import type { WidgetStudioSnapshot } from '@/modules/history'

export const useWidgetBlockStore = defineStore('widgetBlock', () => {
  const rawInput = ref('')
  const parsedBlock = ref<WidgetBlock | null>(null)
  const controls = ref<ControlsMap>({})
  const diagnostics = ref<DiagnosticItem[]>([])
  const parseMetadata = ref<ParseMetadata>({
    contentFieldsCount: 0,
    styleFieldsCount: 0,
    controlsCount: 0,
    groupsCount: 0,
  })
  const selectedSectionId = ref<string | null>(null)
  const selectedFieldKey = ref<string | null>(null)
  const selectedControlKey = ref<string | null>(null)
  const isDirty = ref(false)
  const isParsing = ref(false)
  const isGeneratingControls = ref(false)
  const exportedRaw = ref('')
  const originalRaw = ref('')
  const lastRepairLog = ref<string[]>([])
  const skipHistory = ref(false)

  function currentExport(): string {
    return parsedBlock.value
      ? exportWidgetBlock(parsedBlock.value, controls.value)
      : rawInput.value
  }

  function runDiagnostics() {
    diagnostics.value = validateAll(parsedBlock.value, controls.value)
  }

  function applyParseResult(raw: string, mergeControls = true) {
    isParsing.value = true
    const result = parseWidgetBlock(raw)
    parsedBlock.value = result.block
    diagnostics.value = result.diagnostics
    parseMetadata.value = result.metadata

    if (mergeControls && result.block?.controlsParsed) {
      controls.value = result.block.controlsParsed
    }

    if (!selectedSectionId.value && result.block) {
      selectedSectionId.value = 'required'
    }

    isParsing.value = false
    runDiagnostics()
  }

  function loadMockBlock() {
    rawInput.value = mockFaqBlock
    originalRaw.value = mockFaqBlock
    controls.value = {}
    applyParseResult(mockFaqBlock)
    isDirty.value = false
    selectedSectionId.value = 'required'
    selectedFieldKey.value = null
  }

  function importFromRaw(raw: string) {
    const editor = useEditorStore()
    editor.runWithHistory('import', () => {
      rawInput.value = raw
      originalRaw.value = raw
      controls.value = {}
      applyParseResult(raw)
      isDirty.value = false
    })
  }

  function restoreSnapshot(raw: string, controlsJson: string) {
    skipHistory.value = true
    try {
      restoreWorkspaceSnapshot({
        rawInput: raw,
        controlsJson,
        selectedSectionId: selectedSectionId.value,
        selectedFieldKey: selectedFieldKey.value,
        selectedControlKey: selectedControlKey.value,
        selectedFieldKeys: [],
        selectedControlKeys: [],
      })
    } finally {
      skipHistory.value = false
    }
  }

  function restoreWorkspaceSnapshot(snapshot: WidgetStudioSnapshot) {
    skipHistory.value = true
    try {
      const parsedControls = JSON.parse(snapshot.controlsJson) as ControlsMap
      rawInput.value = snapshot.rawInput
      controls.value = parsedControls
      applyParseResult(snapshot.rawInput, false)
      controls.value = parsedControls
      selectedSectionId.value = snapshot.selectedSectionId
      selectedFieldKey.value = snapshot.selectedFieldKey
      selectedControlKey.value = snapshot.selectedControlKey
      isDirty.value = true
      runDiagnostics()
    } finally {
      skipHistory.value = false
    }
  }

  function setControls(next: ControlsMap) {
    controls.value = next
    isDirty.value = true
    runDiagnostics()
  }

  function selectSection(sectionId: string) {
    selectedSectionId.value = sectionId
    if (!useSelectionStore().multiSelectMode) {
      selectedFieldKey.value = null
      selectedControlKey.value = null
    }
  }

  function selectField(fieldKey: string) {
    if (parsedBlock.value) {
      const field = findFieldByKey(parsedBlock.value, fieldKey)
      if (field) {
        if (field.sectionKind === 'required') selectSection('required')
        else if (field.sectionKind === 'content') selectSection('content')
        else if (field.groupTitle) selectSection(`style-${field.groupTitle}`)
      }
    }
    selectedFieldKey.value = fieldKey
    selectedControlKey.value = fieldKey
  }

  function selectControl(controlKey: string) {
    selectField(controlKey)
  }

  function selectDiagnostic(item: DiagnosticItem) {
    if (item.fieldKey) selectField(item.fieldKey)
    else if (item.sectionTitle) {
      if (item.sectionTitle === 'Контент') selectSection('content')
      else if (item.sectionTitle === 'Обязательное') selectSection('required')
      else selectSection(`style-${item.sectionTitle}`)
    }
  }

  function generateControlsAction() {
    if (!parsedBlock.value) return
    const editor = useEditorStore()
    const before = currentExport()
    editor.runWithHistory('generate-controls', () => {
      isGeneratingControls.value = true
      controls.value = generateControls(parsedBlock.value!)
      isGeneratingControls.value = false
      isDirty.value = true
      runDiagnostics()
    })
    editor.captureDiffSnapshot('generate', before, currentExport())
  }

  function repairControlsAction() {
    if (!parsedBlock.value) return
    const editor = useEditorStore()
    const before = currentExport()
    editor.runWithHistory('repair-controls', () => {
      const result = repairControlsDetailed(parsedBlock.value!, controls.value)
      controls.value = result.controls
      lastRepairLog.value = [
        ...result.added.map((k) => `+ ${k}`),
        ...result.removed.map((k) => `- ${k}`),
        ...result.fixed,
      ]
      isDirty.value = true
      runDiagnostics()
    })
    editor.captureDiffSnapshot('repair', before, currentExport())
  }

  function normalizeBlock() {
    if (!parsedBlock.value) return
    const editor = useEditorStore()
    const before = currentExport()
    editor.runWithHistory('normalize', () => {
      parsedBlock.value = normalizeWidgetBlock(parsedBlock.value!)
      controls.value = repairControls(parsedBlock.value, controls.value)
      controls.value = normalizeControlsOrder(parsedBlock.value, controls.value)
      rawInput.value = exportWidgetBlock(parsedBlock.value, controls.value)
      isDirty.value = true
      runDiagnostics()
    })
    editor.captureDiffSnapshot('normalize', before, rawInput.value)
  }

  function validateAction() {
    runDiagnostics()
  }

  function exportBlock() {
    if (!parsedBlock.value) return ''
    exportedRaw.value = exportWidgetBlock(parsedBlock.value, controls.value)
    rawInput.value = exportedRaw.value
    isDirty.value = false
    useEditorStore().markSaved()
    return exportedRaw.value
  }

  function updateFieldValue(fieldKey: string, rawValue: string, value: unknown) {
    if (!parsedBlock.value) return
    useEditorStore().runDebouncedHistory(`field:${fieldKey}`, 'field-value-edit', () => {
      const updateInList = (fields: BlockField[]) => {
        const field = fields.find((f) => f.key === fieldKey)
        if (field) {
          field.rawValue = rawValue
          field.value = value
        }
      }
      updateInList(parsedBlock.value!.required)
      updateInList(parsedBlock.value!.content)
      for (const group of parsedBlock.value!.styleGroups) {
        updateInList(group.fields)
      }
      isDirty.value = true
      runDiagnostics()
    })
  }

  function updateControl(controlKey: string, patch: Partial<ControlSchema>) {
    const existing = controls.value[controlKey]
    if (!existing) return
    useEditorStore().runDebouncedHistory(`control:${controlKey}`, 'control-edit', () => {
      controls.value[controlKey] = { ...existing, ...patch }
      isDirty.value = true
      runDiagnostics()
    })
  }

  function updateRawInput(raw: string) {
    rawInput.value = raw
    applyParseResult(raw, false)
    isDirty.value = true
  }

  function applyObjectView(jsonText: string): boolean {
    if (!parsedBlock.value) return false
    try {
      const parsed: unknown = JSON.parse(jsonText)
      if (!parsed || typeof parsed !== 'object') return false
      const view = parsed as BlockObjectView
      parsedBlock.value = objectViewToBlock(view, parsedBlock.value)
      controls.value = objectViewToControls(view, controls.value)
      isDirty.value = true
      runDiagnostics()
      return true
    } catch {
      return false
    }
  }

  function reorderField(fromIndex: number, toIndex: number) {
    if (!parsedBlock.value || !selectedSectionId.value) return
    useEditorStore().runWithHistory('reorder-fields', () => {
      parsedBlock.value = reorderSectionFields(
        parsedBlock.value!,
        selectedSectionId.value!,
        fromIndex,
        toIndex,
      )
      rawInput.value = exportWidgetBlock(parsedBlock.value, controls.value)
      isDirty.value = true
    })
  }

  function reorderControlKeys(from: number, to: number) {
    useEditorStore().runWithHistory('reorder-controls', () => {
      const keys = getControlKeysInOrder(controls.value)
      const next = moveControlKey(keys, from, to)
      controls.value = reorderControls(controls.value, next)
      isDirty.value = true
    })
  }

  function resetFieldOrder() {
    if (!parsedBlock.value) return
    parsedBlock.value = normalizeWidgetBlock(parsedBlock.value)
    rawInput.value = exportWidgetBlock(parsedBlock.value, controls.value)
    isDirty.value = true
  }

  function resetControlOrder() {
    if (!parsedBlock.value) return
    controls.value = normalizeControlsOrder(parsedBlock.value, controls.value)
    isDirty.value = true
  }

  function bulkUpdateControls(
    keys: string[],
    patch: Partial<ControlSchema>,
  ) {
    useEditorStore().runWithHistory('bulk-update-controls', () => {
      for (const key of keys) {
        if (controls.value[key]) {
          controls.value[key] = { ...controls.value[key], ...patch }
        }
      }
      isDirty.value = true
      runDiagnostics()
    })
  }

  function bulkDeleteControls(keys: string[]) {
    useEditorStore().runWithHistory('bulk-delete-controls', () => {
      for (const key of keys) delete controls.value[key]
      isDirty.value = true
      runDiagnostics()
    })
  }

  function bulkAddValidate(keys: string[]) {
    bulkUpdateControls(keys, { validate: { required: 'true', digits: 'true' } })
  }

  function bulkRemoveValidate(keys: string[]) {
    useEditorStore().runWithHistory('bulk-update-controls', () => {
      for (const key of keys) {
        if (controls.value[key]) {
          const { validate: _, ...rest } = controls.value[key]
          controls.value[key] = rest as ControlSchema
        }
      }
      isDirty.value = true
      runDiagnostics()
    })
  }

  function bulkSetBuilderKind(keys: string[], kind: BuilderKind) {
    bulkUpdateControls(keys, { builder_kind: kind })
  }

  function bulkSetGroup(keys: string[], group: string) {
    bulkUpdateControls(keys, { group })
  }

  function bulkSetFileConfig(keys: string[], file_types: string, max_size: string) {
    bulkUpdateControls(keys, { file_types, max_size, type: 'file' })
  }

  function regenerateSelectedControls(keys: string[]) {
    if (!parsedBlock.value) return
    useEditorStore().runWithHistory('bulk-generate-fields', () => {
      controls.value = bulkGenerateControlsForFieldsService(parsedBlock.value!, controls.value, keys)
      isDirty.value = true
      runDiagnostics()
    })
  }

  function bulkGenerateControlsForFields(keys: string[]) {
    regenerateSelectedControls(keys)
  }

  const sections = computed(() => {
    const block = parsedBlock.value
    if (!block) return []
    return [
      { id: 'required', title: 'Обязательное', kind: 'required' as const, count: block.required.length },
      { id: 'content', title: 'Контент', kind: 'content' as const, count: block.content.length },
      ...block.styleGroups.map((g) => ({
        id: `style-${g.title}`,
        title: g.title,
        kind: 'style' as const,
        count: g.fields.length,
      })),
      {
        id: 'controls',
        title: 'Контролы',
        kind: 'controls' as const,
        count: Object.keys(controls.value).length,
      },
    ]
  })

  const selectedSectionFields = computed(() => {
    const block = parsedBlock.value
    if (!block || !selectedSectionId.value) return []
    switch (selectedSectionId.value) {
      case 'required':
        return block.required
      case 'content':
        return block.content
      case 'controls':
        return []
      default: {
        const title = selectedSectionId.value.replace('style-', '')
        return block.styleGroups.find((g) => g.title === title)?.fields ?? []
      }
    }
  })

  const controlList = computed(() =>
    Object.values(controls.value).sort((a, b) => a.order - b.order),
  )

  const selectedField = computed(() => {
    if (!parsedBlock.value || !selectedFieldKey.value) return null
    return findFieldByKey(parsedBlock.value, selectedFieldKey.value) ?? null
  })

  const selectedControl = computed(() => {
    if (!selectedControlKey.value) return null
    return controls.value[selectedControlKey.value] ?? null
  })

  const totalFieldCount = computed(() => {
    const block = parsedBlock.value
    if (!block) return 0
    return (
      block.required.length +
      block.content.length +
      block.styleGroups.reduce((sum, g) => sum + g.fields.length, 0)
    )
  })

  const objectView = computed(() => {
    if (!parsedBlock.value) return null
    return blockToObjectView(parsedBlock.value, controls.value)
  })

  const objectViewJson = computed(() => JSON.stringify(objectView.value, null, 2))

  const serializedControls = computed(() => {
    if (Object.keys(controls.value).length === 0) return ''
    return serializeControls(controls.value)
  })

  const currentRaw = computed(() => currentExport())

  const fieldBreakpoint = computed(() => {
    if (!selectedField.value) return 'design-desktop'
    return inferBreakpoint(selectedField.value.key)
  })

  const diagnosticsErrors = computed(() =>
    diagnostics.value.filter((d) => d.severity === 'error'),
  )
  const diagnosticsWarnings = computed(() =>
    diagnostics.value.filter((d) => d.severity === 'warning'),
  )
  const diagnosticsInfo = computed(() =>
    diagnostics.value.filter((d) => d.severity === 'info'),
  )

  const diagnosticsByCategory = computed(() => {
    const cats = {
      parse: [] as DiagnosticItem[],
      controls: [] as DiagnosticItem[],
      validation: [] as DiagnosticItem[],
      normalize: [] as DiagnosticItem[],
      export: [] as DiagnosticItem[],
    }
    for (const d of diagnostics.value) {
      cats[d.category].push(d)
    }
    return cats
  })

  return {
    rawInput,
    parsedBlock,
    controls,
    diagnostics,
    parseMetadata,
    selectedSectionId,
    selectedFieldKey,
    selectedControlKey,
    isDirty,
    isParsing,
    isGeneratingControls,
    exportedRaw,
    originalRaw,
    lastRepairLog,
    sections,
    selectedSectionFields,
    controlList,
    selectedField,
    selectedControl,
    totalFieldCount,
    objectView,
    objectViewJson,
    serializedControls,
    currentRaw,
    fieldBreakpoint,
    diagnosticsErrors,
    diagnosticsWarnings,
    diagnosticsInfo,
    diagnosticsByCategory,
    loadMockBlock,
    importFromRaw,
    restoreSnapshot,
    restoreWorkspaceSnapshot,
    setControls,
    selectSection,
    selectField,
    selectControl,
    selectDiagnostic,
    generateControlsAction,
    repairControlsAction,
    normalizeBlock,
    validateAction,
    exportBlock,
    updateFieldValue,
    updateControl,
    updateRawInput,
    applyObjectView,
    reorderField,
    reorderControlKeys,
    resetFieldOrder,
    resetControlOrder,
    bulkUpdateControls,
    bulkDeleteControls,
    bulkAddValidate,
    bulkRemoveValidate,
    bulkSetBuilderKind,
    bulkSetGroup,
    bulkSetFileConfig,
    regenerateSelectedControls,
    bulkGenerateControlsForFields,
    runDiagnostics,
  }
})
