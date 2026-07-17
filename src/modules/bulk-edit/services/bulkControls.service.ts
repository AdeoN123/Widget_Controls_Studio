import type { WidgetBlock } from '@/modules/widget-block/types'
import type { ControlsMap, ControlSchema, BuilderKind } from '@/modules/controls/types'
import type { PresetApplyMode } from '@/modules/control-presets'
import { applyControlPreset, getControlPresetById } from '@/modules/control-presets'
import { generateControls } from '@/modules/controls/generator'
import { rebuildControlLabels } from '@/modules/control-labels'

export interface BulkPreview {
  affectedCount: number
  keys: string[]
  summary: string
}

export interface BulkControlsPatch {
  group?: string
  builder_kind?: BuilderKind
  type?: ControlSchema['type']
  validate?: ControlSchema['validate']
  file_types?: string
  max_size?: string
  options?: Record<string, string>
  removeValidate?: boolean
}

export function previewBulkControlPatch(
  controls: ControlsMap,
  keys: string[],
  patch: BulkControlsPatch,
): BulkPreview {
  const affected = keys.filter((k) => controls[k])
  return {
    affectedCount: affected.length,
    keys: affected,
    summary: `Update ${affected.length} controls`,
  }
}

export function applyBulkControlPatch(
  controls: ControlsMap,
  keys: string[],
  patch: BulkControlsPatch,
): ControlsMap {
  const next = { ...controls }
  for (const key of keys) {
    const c = next[key]
    if (!c) continue
    const updated = { ...c, ...patch }
    if (patch.removeValidate) {
      const { validate: _, ...rest } = updated
      next[key] = rest as ControlSchema
    } else {
      next[key] = updated
    }
  }
  return next
}

export function applyBulkControlPreset(
  controls: ControlsMap,
  keys: string[],
  presetId: string,
  mode: PresetApplyMode,
): ControlsMap {
  const preset = getControlPresetById(presetId)
  if (!preset) return controls
  const next = { ...controls }
  for (const key of keys) {
    if (!next[key]) continue
    next[key] = applyControlPreset(next[key], preset, mode)
  }
  return next
}

export function bulkDeleteControls(controls: ControlsMap, keys: string[]): ControlsMap {
  const next = { ...controls }
  for (const key of keys) delete next[key]
  return next
}

export function bulkRegenerateControls(
  block: WidgetBlock,
  controls: ControlsMap,
  keys: string[],
): ControlsMap {
  const generated = generateControls(block)
  const next = { ...controls }
  for (const key of keys) {
    if (generated[key]) next[key] = { ...generated[key], order: next[key]?.order ?? generated[key].order }
  }
  return next
}

export function bulkRebuildNames(
  block: WidgetBlock,
  controls: ControlsMap,
  keys: string[],
): ControlsMap {
  const fields = [...block.content, ...block.styleGroups.flatMap((g) => g.fields)]
  return rebuildControlLabels(controls, fields, keys)
}

export function bulkGenerateMissingForFields(
  block: WidgetBlock,
  controls: ControlsMap,
  fieldKeys: string[],
): ControlsMap {
  return bulkRegenerateControls(
    block,
    controls,
    fieldKeys.filter((k) => !controls[k]),
  )
}

export function cloneControlConfig(
  controls: ControlsMap,
  sourceKey: string,
  targetKeys: string[],
  parts: Array<keyof ControlSchema> = ['type', 'validate', 'options', 'file_types', 'max_size', 'builder_kind'],
): ControlsMap {
  const source = controls[sourceKey]
  if (!source) return controls
  const next = { ...controls }
  for (const key of targetKeys) {
    if (!next[key] || key === sourceKey) continue
    const patch: Partial<ControlSchema> = {}
    for (const part of parts) {
      if (source[part] !== undefined) {
        Object.assign(patch, { [part]: source[part] })
      }
    }
    next[key] = { ...next[key], ...patch }
  }
  return next
}
