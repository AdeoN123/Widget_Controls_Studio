import type { WidgetBlock } from '@/modules/widget-block/types'
import type { ControlsMap } from '@/modules/controls/types'
import { validateAll } from '@/modules/widget-block/validators'
import { analyzeField } from '@/modules/widget-block/analyzer'
import { FONT_WEIGHT_OPTIONS } from '@/modules/controls/types'

export type AuditFilter =
  | 'missing_controls'
  | 'orphan_controls'
  | 'numeric_without_validate'
  | 'file_without_config'
  | 'wrong_group'
  | 'invalid_font_weight'
  | 'naming_anomaly'
  | 'breakpoint_gap'

export interface AuditItem {
  id: string
  filter: AuditFilter
  fieldKey?: string
  controlKey?: string
  message: string
  severity: 'error' | 'warning' | 'info'
}

const CODE_TO_AUDIT_FILTER: Record<string, AuditFilter> = {
  MissingControl: 'missing_controls',
  OrphanControl: 'orphan_controls',
  NumericWithoutValidation: 'numeric_without_validate',
  FileWithoutFileTypes: 'file_without_config',
  FileWithoutMaxSize: 'file_without_config',
  InvalidFontWeight: 'invalid_font_weight',
  WrongGroup: 'wrong_group',
}

export function runAudit(block: WidgetBlock, controls: ControlsMap): AuditItem[] {
  const items: AuditItem[] = []
  const diagnostics = validateAll(block, controls)
  const editable = [...block.content, ...block.styleGroups.flatMap((g) => g.fields)]

  for (const d of diagnostics) {
    const filter: AuditFilter = CODE_TO_AUDIT_FILTER[d.code] ?? 'wrong_group'

    items.push({
      id: d.id,
      filter,
      fieldKey: d.fieldKey,
      controlKey: d.fieldKey,
      message: d.message,
      severity: d.severity,
    })
  }

  for (const field of editable) {
    const normalized = field.key.replace(/^(tablet_|phone_)/, '')
    if (normalized.includes('background') && !normalized.includes('bg_')) {
      items.push({
        id: `naming-${field.key}`,
        filter: 'naming_anomaly',
        fieldKey: field.key,
        message: `Подозрительное имя: ${field.key}`,
        severity: 'warning',
      })
    }
  }

  const desktopKeys = editable.filter((f) => analyzeField(f).breakpoint === 'desktop').map((f) => f.key.replace(/^(tablet_|phone_)/, ''))
  for (const base of new Set(desktopKeys)) {
    const hasTablet = editable.some((f) => f.key === `tablet_${base}`)
    const hasPhone = editable.some((f) => f.key === `phone_${base}`)
    if (hasPhone && !hasTablet) {
      items.push({
        id: `gap-${base}`,
        filter: 'breakpoint_gap',
        fieldKey: base,
        message: `Есть phone, но нет tablet для ${base}`,
        severity: 'info',
      })
    }
  }

  return items
}

export function filterControlsByAudit(
  controls: ControlsMap,
  auditItems: AuditItem[],
  filter: AuditFilter,
): string[] {
  return auditItems.filter((i) => i.filter === filter && i.controlKey).map((i) => i.controlKey!)
}

export function filterBrokenControlKeys(
  block: WidgetBlock,
  controls: ControlsMap,
): string[] {
  const audit = runAudit(block, controls)
  return [...new Set(audit.filter((i) => i.controlKey && i.severity !== 'info').map((i) => i.controlKey!))]
}

export { FONT_WEIGHT_OPTIONS }
