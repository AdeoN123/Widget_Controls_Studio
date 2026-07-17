import type { BlockField } from '@/modules/widget-block/types'
import type { ControlSchema } from '@/modules/controls/types'
import { analyzeField } from '@/modules/widget-block/analyzer'
import type { FieldMeta } from '@/modules/widget-block/analyzer/types'
import type { ControlPreset, ControlPresetTarget, PresetApplyMode } from '../model/controlPreset.types'
import { getAllControlPresets } from './controlPresetRegistry'
import { buildControlLabel } from '@/modules/control-labels/services/buildControlLabel'

function matchesTarget(meta: FieldMeta, field: BlockField, target: ControlPresetTarget): boolean {
  if (target === 'any') return true
  if (target === 'content') return meta.isContent
  if (target === 'style') return meta.isStyle
  if (target === 'numeric') return meta.isNumeric
  if (target === 'color') return meta.isColor
  if (target === 'file') return meta.isImage
  if (target === 'font_weight') return meta.propertyType === 'font_weight'
  if (target === 'collection') return meta.isCollection
  if (target === 'text') {
    return meta.isContent && !meta.isCollection && !meta.isImage
  }
  return false
}

export function getMatchingControlPresets(field: BlockField, meta?: FieldMeta): ControlPreset[] {
  const fieldMeta = meta ?? analyzeField(field)
  return getAllControlPresets().filter((preset) => matchesTarget(fieldMeta, field, preset.target))
}

export function inferControlPreset(field: BlockField): ControlPreset | null {
  const matches = getMatchingControlPresets(field)
  return matches[0] ?? null
}

export function applyControlPreset(
  control: ControlSchema,
  preset: ControlPreset,
  mode: PresetApplyMode,
): ControlSchema {
  if (mode === 'replace') {
    return {
      ...control,
      ...preset.control,
      key: control.key,
      order: control.order,
      group: control.group,
    }
  }

  const merged: ControlSchema = { ...control }
  const partial = preset.control

  if (partial.type && !merged.type) merged.type = partial.type

  if (partial.validate) {
    merged.validate = { ...merged.validate, ...partial.validate }
  }
  if (partial.options && !merged.options) merged.options = partial.options
  if (partial.options && mode === 'merge') merged.options = { ...partial.options, ...merged.options }
  if (partial.file_types && !merged.file_types) merged.file_types = partial.file_types
  if (partial.max_size && !merged.max_size) merged.max_size = partial.max_size
  if (partial.builder_kind && !merged.builder_kind) merged.builder_kind = partial.builder_kind

  return merged
}

export function buildControlFromPreset(
  field: BlockField,
  preset: ControlPreset,
  defaults: Partial<ControlSchema> = {},
): ControlSchema {
  const meta = analyzeField(field)
  const base: ControlSchema = {
    key: field.key,
    group: meta.group,
    name: buildControlLabel(field, meta),
    type: preset.control.type ?? 'textfield',
    order: field.order,
    sourceFieldKey: field.key,
    sourceSectionKind: field.sectionKind === 'content' ? 'content' : 'style',
    ...defaults,
  }

  return applyControlPreset(base, preset, 'merge')
}
