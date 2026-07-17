import type { BlockField } from '@/modules/widget-block/types'
import type { ControlSchema } from '@/modules/controls/types'
import { analyzeField } from '@/modules/widget-block/analyzer'
import { buildControlLabel } from './buildControlLabel'

export function rebuildControlLabel(
  control: ControlSchema,
  field: BlockField,
): ControlSchema {
  const meta = analyzeField(field)
  return {
    ...control,
    name: buildControlLabel(field, meta),
    group: meta.group,
    builder_kind:
      control.builder_kind ??
      (meta.breakpoint === 'tablet'
        ? 'design-tablet'
        : meta.breakpoint === 'phone'
          ? 'design-phone'
          : field.sectionKind === 'style'
            ? 'design-desktop'
            : undefined),
  }
}

export function rebuildControlLabels(
  controls: Record<string, ControlSchema>,
  fields: BlockField[],
  keys?: string[],
): Record<string, ControlSchema> {
  const fieldMap = new Map(fields.map((f) => [f.key, f]))
  const targetKeys = keys ?? Object.keys(controls)
  const result = { ...controls }

  for (const key of targetKeys) {
    const field = fieldMap.get(key)
    const control = result[key]
    if (field && control) {
      result[key] = rebuildControlLabel(control, field)
    }
  }

  return result
}

export { buildControlLabel } from './buildControlLabel'
