import type { WidgetBlock } from '@/modules/widget-block/types'
import type { ControlsMap } from '@/modules/controls/types'
import type { BlockField } from '@/modules/widget-block/types'
import type { ParameterPreset, ParameterPresetMode } from '../model/parameterPreset.types'
import { getControlPresetById } from '@/modules/control-presets'
import { buildControlFromPreset } from '@/modules/control-presets'
import { analyzeField } from '@/modules/widget-block/analyzer'

export interface ApplyParameterPresetResult {
  block: WidgetBlock
  controls: ControlsMap
  addedFields: string[]
  updatedFields: string[]
}

export function applyParameterPreset(
  block: WidgetBlock,
  controls: ControlsMap,
  preset: ParameterPreset,
  sectionTitle: string,
  mode: ParameterPresetMode = 'add_missing',
): ApplyParameterPresetResult {
  const group = block.styleGroups.find((g) => g.title === sectionTitle)
  if (!group) {
    return { block, controls, addedFields: [], updatedFields: [] }
  }

  const addedFields: string[] = []
  const updatedFields: string[] = []
  const existingKeys = new Set(group.fields.map((f) => f.key))
  const nextControls = { ...controls }
  let order = group.fields.length

  for (const pf of preset.fields) {
    const exists = existingKeys.has(pf.key)

    if (exists && mode === 'add_missing') continue

    if (!exists || mode === 'append_all' || mode === 'replace_conflicting') {
      const field: BlockField = exists
        ? {
            ...group.fields.find((f) => f.key === pf.key)!,
            rawValue: mode === 'replace_conflicting' ? pf.defaultValue : group.fields.find((f) => f.key === pf.key)!.rawValue,
            value: pf.defaultValue.replace(/^"|"$/g, ''),
          }
        : {
            key: pf.key,
            value: pf.defaultValue.replace(/^"|"$/g, ''),
            rawValue: pf.defaultValue,
            sectionKind: 'style',
            groupTitle: sectionTitle,
            order: order++,
          }

      if (!exists) {
        group.fields.push(field)
        addedFields.push(pf.key)
      } else {
        updatedFields.push(pf.key)
      }

      if (pf.controlPresetId) {
        const cp = getControlPresetById(pf.controlPresetId)
        if (cp) {
          nextControls[pf.key] = buildControlFromPreset(field, cp, {
            order: nextControls[pf.key]?.order ?? field.order,
          })
        }
      }
    }
  }

  return {
    block: { ...block, styleGroups: block.styleGroups.map((g) => (g.title === sectionTitle ? { ...group } : g)) },
    controls: nextControls,
    addedFields,
    updatedFields,
  }
}
