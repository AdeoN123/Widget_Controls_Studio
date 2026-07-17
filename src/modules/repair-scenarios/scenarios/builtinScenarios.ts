import type { WidgetBlock, BlockField } from '@/modules/widget-block/types'
import type { ControlsMap, ControlSchema } from '@/modules/controls/types'
import { analyzeField } from '@/modules/widget-block/analyzer'
import { rebuildControlLabel } from '@/modules/control-labels'
import { generateControls } from '@/modules/controls/generator'
import { mergeControl } from '@/modules/controls/repair'
import type { RepairScenario, RepairScenarioContext, RepairScenarioResult } from '../model/repairScenario.types'

function editableFields(block: WidgetBlock) {
  return [...block.content, ...block.styleGroups.flatMap((g) => g.fields)]
}

function inScope(
  key: string,
  block: WidgetBlock,
  ctx: RepairScenarioContext,
): boolean {
  if (ctx.scope === 'block') return true
  if (ctx.scope === 'fields' && ctx.fieldKeys) return ctx.fieldKeys.includes(key)
  if (ctx.scope === 'controls' && ctx.controlKeys) return ctx.controlKeys.includes(key)
  if (ctx.scope === 'section' && ctx.sectionTitle) {
    const field = editableFields(block).find((f) => f.key === key)
    return field?.groupTitle === ctx.sectionTitle || (ctx.sectionTitle === 'Контент' && field?.sectionKind === 'content')
  }
  return true
}

function runFieldScopedFix(
  block: WidgetBlock,
  controls: ControlsMap,
  ctx: RepairScenarioContext,
  matches: (field: BlockField) => boolean,
  fix: (field: BlockField, existing: ControlSchema | undefined) => ControlSchema | null,
): { next: ControlsMap; affected: string[] } {
  const affected: string[] = []
  const next = { ...controls }
  for (const field of editableFields(block)) {
    if (!inScope(field.key, block, ctx) || !matches(field)) continue
    const result = fix(field, next[field.key])
    if (result === null) continue
    next[field.key] = result
    affected.push(field.key)
  }
  return { next, affected }
}

export const repairNumericControls: RepairScenario = {
  id: 'repair-numeric-controls',
  title: 'Восстановить числовые контролы',
  description: 'textfield + validate.digits (эталон, по generateControls)',
  previewCount: (block, controls, ctx) =>
    editableFields(block).filter((f) => inScope(f.key, block, ctx) && analyzeField(f).isNumeric).length,
  run: (block, controls, ctx) => {
    const generated = generateControls(block)
    const { next, affected } = runFieldScopedFix(
      block,
      controls,
      ctx,
      (field) => analyzeField(field).isNumeric,
      (field, existing) => {
        const canonical = generated[field.key]
        if (!canonical) return null
        const order = existing?.order ?? canonical.order
        const base = rebuildControlLabel(existing ?? canonical, field)
        return mergeControl(base, canonical, block, order).control
      },
    )
    return { block, controls: next, affected, message: `Fixed ${affected.length} numeric controls` }
  },
}

export const repairFileControls: RepairScenario = {
  id: 'repair-file-controls',
  title: 'Восстановить файловые контролы',
  previewCount: (block, controls, ctx) =>
    editableFields(block).filter((f) => inScope(f.key, block, ctx) && analyzeField(f).isImage).length,
  run: (block, controls, ctx) => {
    const generated = generateControls(block)
    const { next, affected } = runFieldScopedFix(
      block,
      controls,
      ctx,
      (field) => analyzeField(field).isImage,
      (field, existing) => {
        const canonical = generated[field.key]
        if (!existing || !canonical) return null
        return mergeControl(rebuildControlLabel(existing, field), canonical, block, existing.order).control
      },
    )
    return { block, controls: next, affected, message: `Fixed ${affected.length} file controls` }
  },
}

export const repairFontWeightControls: RepairScenario = {
  id: 'repair-font-weight-controls',
  title: 'Восстановить контролы жирности шрифта',
  previewCount: (block, _, ctx) =>
    editableFields(block).filter((f) => inScope(f.key, block, ctx) && f.key.includes('font_weight')).length,
  run: (block, controls, ctx) => {
    const generated = generateControls(block)
    const { next, affected } = runFieldScopedFix(
      block,
      controls,
      ctx,
      (field) => field.key.includes('font_weight'),
      (field, existing) => {
        const canonical = generated[field.key]
        if (!existing || !canonical) return null
        return mergeControl(existing, canonical, block, existing.order).control
      },
    )
    return { block, controls: next, affected, message: `Fixed ${affected.length} font weight controls` }
  },
}

export const repairGroups: RepairScenario = {
  id: 'repair-groups',
  title: 'Синхронизировать группы контролов',
  previewCount: (block, controls) => {
    let n = 0
    for (const f of editableFields(block)) {
      const g = analyzeField(f).group
      if (controls[f.key] && controls[f.key].group !== g) n++
    }
    return n
  },
  run: (block, controls, ctx) => {
    const { next, affected } = runFieldScopedFix(
      block,
      controls,
      ctx,
      () => true,
      (field, existing) => {
        const expected = analyzeField(field).group
        if (!existing || existing.group === expected) return null
        return { ...existing, group: expected }
      },
    )
    return { block, controls: next, affected, message: `Synced ${affected.length} groups` }
  },
}

export const generateMissingControls: RepairScenario = {
  id: 'generate-missing-controls',
  title: 'Сгенерировать недостающие контролы',
  previewCount: (block, controls, ctx) =>
    editableFields(block).filter((f) => inScope(f.key, block, ctx) && !controls[f.key]).length,
  run: (block, controls, ctx) => {
    const generated = generateControls(block)
    const { next, affected } = runFieldScopedFix(
      block,
      controls,
      ctx,
      () => true,
      (field, existing) => (existing ? null : (generated[field.key] ?? null)),
    )
    return { block, controls: next, affected, message: `Generated ${affected.length} controls` }
  },
}

export const removeOrphanControls: RepairScenario = {
  id: 'remove-orphan-controls',
  title: 'Удалить контролы-сироты',
  previewCount: (block, controls) => {
    const keys = new Set(editableFields(block).map((f) => f.key))
    return Object.keys(controls).filter((k) => !keys.has(k)).length
  },
  run: (block, controls, ctx) => {
    const keys = new Set(editableFields(block).map((f) => f.key))
    const affected: string[] = []
    const next = { ...controls }
    for (const key of Object.keys(next)) {
      if (!inScope(key, block, ctx)) continue
      if (!keys.has(key)) {
        delete next[key]
        affected.push(key)
      }
    }
    return { block, controls: next, affected, message: `Removed ${affected.length} orphan controls` }
  },
}

export const rebuildControlNames: RepairScenario = {
  id: 'rebuild-control-names',
  title: 'Пересобрать названия контролов',
  previewCount: (block) => editableFields(block).length,
  run: (block, controls, ctx) => {
    const { next, affected } = runFieldScopedFix(
      block,
      controls,
      ctx,
      () => true,
      (field, existing) => (existing ? rebuildControlLabel(existing, field) : null),
    )
    return { block, controls: next, affected, message: `Rebuilt ${affected.length} labels` }
  },
}

export const allRepairScenarios: RepairScenario[] = [
  repairNumericControls,
  repairFileControls,
  repairFontWeightControls,
  repairGroups,
  generateMissingControls,
  removeOrphanControls,
  rebuildControlNames,
]

export function listRepairScenarios(): RepairScenario[] {
  return allRepairScenarios
}

export function runRepairScenario(
  id: string,
  block: WidgetBlock,
  controls: ControlsMap,
  ctx: RepairScenarioContext = { scope: 'block' },
): RepairScenarioResult | null {
  const scenario = allRepairScenarios.find((s) => s.id === id)
  if (!scenario) return null
  return scenario.run(block, controls, ctx)
}
