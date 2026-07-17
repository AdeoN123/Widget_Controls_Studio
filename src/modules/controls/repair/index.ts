import type { WidgetBlock } from '@/modules/widget-block/types'
import type { ControlsMap, ControlSchema } from '@/modules/controls/types'
import { analyzeField } from '@/modules/widget-block/analyzer'
import { generateControls } from '@/modules/controls/generator'
import { FONT_WEIGHT_OPTIONS, TEXT_ALIGN_OPTIONS } from '@/modules/controls/types'
import type { BuilderKind } from '@/modules/controls/types'

export interface RepairResult {
  controls: ControlsMap
  fixed: string[]
  added: string[]
  removed: string[]
}

function breakpointToBuilderKind(bp: 'desktop' | 'tablet' | 'phone'): BuilderKind {
  if (bp === 'tablet') return 'design-tablet'
  if (bp === 'phone') return 'design-phone'
  return 'design-desktop'
}

export function repairControls(block: WidgetBlock, controls: ControlsMap): ControlsMap {
  return repairControlsDetailed(block, controls).controls
}

export function repairControlsDetailed(
  block: WidgetBlock,
  controls: ControlsMap,
): RepairResult {
  const generated = generateControls(block)
  const repaired: ControlsMap = {}
  const fixed: string[] = []
  const added: string[] = []
  const removed: string[] = []

  const existingKeys = new Set(Object.keys(controls))
  let order = 0

  const sortedGenerated = Object.values(generated).sort((a, b) => a.order - b.order)

  for (const gen of sortedGenerated) {
    const existing = controls[gen.key]
    if (existing) {
      const { control, changes } = mergeControl(existing, gen, block, order++)
      repaired[gen.key] = control
      if (changes.length > 0) fixed.push(`${gen.key}: ${changes.join(', ')}`)
      existingKeys.delete(gen.key)
    } else {
      repaired[gen.key] = { ...gen, order: order++ }
      added.push(gen.key)
    }
  }

  for (const orphanKey of existingKeys) {
    removed.push(orphanKey)
  }

  return { controls: repaired, fixed, added, removed }
}

/**
 * Единый общий примитив "слить существующий контрол с эталонной формой
 * (выведенной из generateControls)". Экспортируется, чтобы другие
 * ремонтно-подобные точки входа (repair-scenarios, bulk-edit) переиспользовали
 * одни и те же правила корректности вместо поддержки своих параллельных копий.
 */
export function mergeControl(
  existing: ControlSchema,
  generated: ControlSchema,
  block: WidgetBlock,
  order: number,
): { control: ControlSchema; changes: string[] } {
  const changes: string[] = []
  const field = [...block.content, ...block.styleGroups.flatMap((g) => g.fields)].find(
    (f) => f.key === generated.key,
  )
  const meta = field ? analyzeField(field) : null

  const merged: ControlSchema = {
    ...generated,
    name: existing.name || generated.name,
    help: existing.help ?? generated.help,
    key: generated.key,
    order,
    group: generated.group,
    type: generated.type,
  }

  if (existing.group !== generated.group) changes.push('group')
  if (existing.type !== generated.type) changes.push('type')

  const expectedBuilder = meta ? breakpointToBuilderKind(meta.breakpoint) : generated.builder_kind
  if (generated.builder_kind || expectedBuilder) {
    merged.builder_kind = expectedBuilder ?? generated.builder_kind
    if (existing.builder_kind !== merged.builder_kind) changes.push('builder_kind')
  }

  if (merged.type === 'textfield' && generated.validate?.digits === 'true') {
    merged.validate = { digits: 'true' }
    if (!existing.validate?.digits) changes.push('validate')
  }

  if (merged.type === 'file') {
    const isBgImage = generated.key.includes('bg_image')
    const defaultFileTypes = isBgImage
      ? 'image/jpeg,image/png'
      : 'image/jpeg,image/png,image/gif,image/svg+xml'
    const defaultMaxSize = isBgImage ? '819200' : '204800'
    const fileTypes = existing.file_types || generated.file_types || defaultFileTypes
    const maxSize = existing.max_size || generated.max_size || defaultMaxSize
    if (!existing.file_types) changes.push('file_types')
    if (!existing.max_size) changes.push('max_size')
    merged.file_types = fileTypes
    merged.max_size = maxSize
  }

  if (merged.type === 'radio' && generated.key.includes('font_weight')) {
    merged.options = FONT_WEIGHT_OPTIONS
    if (!existing.options) changes.push('options')
  }

  if (merged.type === 'radio' && (generated.key === 'align' || generated.key.endsWith('_align'))) {
    merged.options = TEXT_ALIGN_OPTIONS
    if (!existing.options) changes.push('options')
  }

  return { control: merged, changes }
}
