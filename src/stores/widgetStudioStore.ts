import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useWidgetBlockStore } from '@/stores/widgetBlockStore'
import { useSelectionStore } from '@/stores/selectionStore'
import { useCompareStore } from '@/stores/compareStore'
import { usePresetsStore } from '@/stores/presetsStore'
import { useEditorStore } from '@/stores/editorStore'
import { exportWidgetBlock } from '@/modules/widget-block/serializer'
import type { PresetApplyMode } from '@/modules/control-presets'
import { runRepairScenario } from '@/modules/repair-scenarios'
import type { RepairScenarioContext } from '@/modules/repair-scenarios'
import {
  applyBulkControlPatch,
  applyBulkControlPreset,
  bulkDeleteControls,
  bulkRebuildNames,
  bulkRegenerateControls,
  cloneControlConfig,
} from '@/modules/bulk-edit/services/bulkControls.service'
import { applyParameterPreset } from '@/modules/parameter-presets'
import type { ParameterPresetMode } from '@/modules/parameter-presets'
import { renameField } from '@/modules/refactor'

export const useWidgetStudioStore = defineStore('widgetStudio', () => {
  const showBulkEditCenter = ref(false)
  const showRepairPanel = ref(false)
  const showComparePanel = ref(false)
  const bulkMode = ref<'controls' | 'fields'>('controls')

  function applyControlPresetToSelection(presetId: string, mode?: PresetApplyMode) {
    const blockStore = useWidgetBlockStore()
    const selection = useSelectionStore()
    const presetsStore = usePresetsStore()
    const keys = [...selection.selectedControlKeys]
    if (keys.length === 0 && blockStore.selectedControlKey) keys.push(blockStore.selectedControlKey)

    useEditorStore().runWithHistory('apply-preset', () => {
      blockStore.controls = applyBulkControlPreset(
        blockStore.controls,
        keys,
        presetId,
        mode ?? presetsStore.presetApplyMode,
      )
      blockStore.runDiagnostics()
    })
  }

  function runScenario(scenarioId: string, ctx?: Partial<RepairScenarioContext>) {
    const blockStore = useWidgetBlockStore()
    if (!blockStore.parsedBlock) return
    const selection = useSelectionStore()
    const context: RepairScenarioContext = {
      scope: ctx?.scope ?? (selection.controlCount > 0 ? 'controls' : 'block'),
      fieldKeys: ctx?.fieldKeys ?? [...selection.selectedFieldKeys],
      controlKeys: ctx?.controlKeys ?? [...selection.selectedControlKeys],
      sectionTitle: ctx?.sectionTitle,
    }

    let result: ReturnType<typeof runRepairScenario> | undefined
    useEditorStore().runWithHistory(`scenario-${scenarioId}`, () => {
      result = runRepairScenario(scenarioId, blockStore.parsedBlock!, blockStore.controls, context)
      if (!result) return
      blockStore.parsedBlock = result.block
      blockStore.controls = result.controls
      blockStore.rawInput = exportWidgetBlock(result.block, result.controls)
      blockStore.runDiagnostics()
    })
    return result
  }

  function applyParameterPresetToSection(
    presetId: string,
    sectionTitle: string,
    mode: ParameterPresetMode = 'add_missing',
  ) {
    const blockStore = useWidgetBlockStore()
    const presetsStore = usePresetsStore()
    if (!blockStore.parsedBlock) return
    const preset = presetsStore.getAllParameterPresets().find((p) => p.id === presetId)
    if (!preset) return

    let result: ReturnType<typeof applyParameterPreset> | undefined
    useEditorStore().runWithHistory('parameter-preset', () => {
      result = applyParameterPreset(blockStore.parsedBlock!, blockStore.controls, preset, sectionTitle, mode)
      blockStore.parsedBlock = result.block
      blockStore.controls = result.controls
      blockStore.rawInput = exportWidgetBlock(result.block, result.controls)
      blockStore.runDiagnostics()
    })
    return result
  }

  function bulkSetGroup(group: string) {
    const blockStore = useWidgetBlockStore()
    const keys = [...useSelectionStore().selectedControlKeys]
    useEditorStore().runWithHistory('bulk-set-group', () => {
      blockStore.controls = applyBulkControlPatch(blockStore.controls, keys, { group })
      blockStore.runDiagnostics()
    })
  }

  function bulkRebuildSelectedNames() {
    const blockStore = useWidgetBlockStore()
    const keys = [...useSelectionStore().selectedControlKeys]
    useEditorStore().runWithHistory('bulk-rebuild-names', () => {
      blockStore.controls = bulkRebuildNames(blockStore.parsedBlock!, blockStore.controls, keys)
      blockStore.runDiagnostics()
    })
  }

  function bulkCloneControl(sourceKey: string, targetKeys: string[]) {
    const blockStore = useWidgetBlockStore()
    useEditorStore().runWithHistory('apply-preset', () => {
      blockStore.controls = cloneControlConfig(blockStore.controls, sourceKey, targetKeys)
      blockStore.runDiagnostics()
    })
  }

  function mergeFromComparedBlock(missingOnly = true) {
    const blockStore = useWidgetBlockStore()
    const compareStore = useCompareStore()
    if (!compareStore.comparedBlock || !blockStore.parsedBlock) return
    const keys = [...compareStore.selectedCompareKeys]
    if (keys.length === 0) return

    useEditorStore().runWithHistory('compare-merge', () => {
      blockStore.controls = compareStore.mergeSelectedControlsToTarget(
        blockStore.controls,
        compareStore.comparedControls,
        keys,
        missingOnly,
      )
      blockStore.rawInput = exportWidgetBlock(blockStore.parsedBlock!, blockStore.controls)
      blockStore.runDiagnostics()
    })
  }

  function safeRenameField(from: string, to: string) {
    const blockStore = useWidgetBlockStore()
    if (!blockStore.parsedBlock) return

    useEditorStore().runWithHistory('rename-field', () => {
      const result = renameField(blockStore.parsedBlock!, blockStore.controls, from, to)
      if (!result) return
      blockStore.parsedBlock = result.block
      blockStore.controls = result.controls
      blockStore.rawInput = exportWidgetBlock(result.block, result.controls)
      if (blockStore.selectedFieldKey === from) blockStore.selectField(to)
      blockStore.runDiagnostics()
    })
  }

  function bulkDeleteSelectedControls() {
    const blockStore = useWidgetBlockStore()
    const keys = [...useSelectionStore().selectedControlKeys]
    useEditorStore().runWithHistory('bulk-delete', () => {
      blockStore.controls = bulkDeleteControls(blockStore.controls, keys)
      useSelectionStore().clearControls()
      blockStore.runDiagnostics()
    })
  }

  function bulkRegenerateSelected() {
    const blockStore = useWidgetBlockStore()
    const keys = [...useSelectionStore().selectedControlKeys]
    useEditorStore().runWithHistory('bulk-regenerate', () => {
      blockStore.controls = bulkRegenerateControls(blockStore.parsedBlock!, blockStore.controls, keys)
      blockStore.runDiagnostics()
    })
  }

  return {
    showBulkEditCenter,
    showRepairPanel,
    showComparePanel,
    bulkMode,
    applyControlPresetToSelection,
    runScenario,
    applyParameterPresetToSection,
    bulkSetGroup,
    bulkRebuildSelectedNames,
    bulkCloneControl,
    mergeFromComparedBlock,
    safeRenameField,
    bulkDeleteSelectedControls,
    bulkRegenerateSelected,
  }
})
