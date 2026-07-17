import type { WidgetBlock } from '@/modules/widget-block/types'
import type { ControlSchema, ControlsMap } from '@/modules/controls/types'
import { generateControls } from '@/modules/controls/generator'
import {
  createDiagnostic,
  type DiagnosticCategory,
  type DiagnosticItem,
  type DiagnosticSeverity,
} from '@/types/diagnostics'
import { collectAllFields } from '@/modules/widget-block/utils/fieldUtils'

export const DiagnosticCodes = {
  NUMERIC_WITHOUT_VALIDATION: 'NumericWithoutValidation',
  FILE_WITHOUT_MAX_SIZE: 'FileWithoutMaxSize',
  FILE_WITHOUT_FILE_TYPES: 'FileWithoutFileTypes',
  WRONG_GROUP: 'WrongGroup',
  WRONG_TYPE: 'WrongType',
  MISSING_CONTROL: 'MissingControl',
  ORPHAN_CONTROL: 'OrphanControl',
  INVALID_FONT_WEIGHT: 'InvalidFontWeight',
  WRONG_BUILDER_KIND: 'WrongBuilderKind',
} as const

function getEditableFields(block: WidgetBlock) {
  return [...block.content, ...block.styleGroups.flatMap((g) => g.fields)]
}

interface ControlDiagnosticRule {
  code: string
  category: DiagnosticCategory
  severity: DiagnosticSeverity
  /** Возвращает читаемое сообщение о нарушении, либо null, если `control` уже совпадает с `canonical` по этому аспекту. */
  check: (control: ControlSchema, canonical: ControlSchema) => string | null
}

const CONTROL_DIAGNOSTIC_RULES: ControlDiagnosticRule[] = [
  {
    code: DiagnosticCodes.WRONG_GROUP,
    category: 'controls',
    severity: 'error',
    check: (control, canonical) =>
      control.group !== canonical.group
        ? `group «${control.group}» ≠ ожидаемая «${canonical.group}»`
        : null,
  },
  {
    code: DiagnosticCodes.WRONG_TYPE,
    category: 'controls',
    severity: 'error',
    check: (control, canonical) =>
      control.type !== canonical.type
        ? `type «${control.type}» ≠ ожидаемый «${canonical.type}»`
        : null,
  },
  {
    code: DiagnosticCodes.NUMERIC_WITHOUT_VALIDATION,
    category: 'controls',
    severity: 'error',
    check: (control, canonical) => {
      const canonicalNeedsDigits = canonical.type === 'textfield' && canonical.validate?.digits === 'true'
      if (!canonicalNeedsDigits) return null
      return control.validate?.digits === 'true' ? null : 'числовой контрол без validate.digits'
    },
  },
  {
    code: DiagnosticCodes.FILE_WITHOUT_FILE_TYPES,
    category: 'controls',
    severity: 'error',
    check: (control, canonical) =>
      canonical.type === 'file' && !control.file_types ? 'file-контрол без file_types' : null,
  },
  {
    code: DiagnosticCodes.FILE_WITHOUT_MAX_SIZE,
    category: 'controls',
    severity: 'error',
    check: (control, canonical) =>
      canonical.type === 'file' && !control.max_size ? 'file-контрол без max_size' : null,
  },
  {
    code: DiagnosticCodes.WRONG_BUILDER_KIND,
    category: 'controls',
    severity: 'error',
    check: (control, canonical) =>
      canonical.builder_kind && control.builder_kind !== canonical.builder_kind
        ? `builder_kind «${control.builder_kind ?? 'отсутствует'}» ≠ ожидаемый «${canonical.builder_kind}»`
        : null,
  },
  {
    code: DiagnosticCodes.INVALID_FONT_WEIGHT,
    category: 'controls',
    severity: 'error',
    check: (control, canonical) => {
      if (!canonical.key.includes('font_weight') || !canonical.options || !control.options) return null
      const validLabels = Object.keys(canonical.options)
      const invalid = Object.keys(control.options).filter((k) => !validLabels.includes(k))
      return invalid.length > 0
        ? `font_weight «${invalid.join(', ')}» не входит в ${validLabels.join('/')}`
        : null
    },
  },
]

export function validateWidgetBlock(block: WidgetBlock): DiagnosticItem[] {
  const diagnostics: DiagnosticItem[] = []

  for (const group of block.styleGroups) {
    if (group.fields.length === 0) {
      diagnostics.push(
        createDiagnostic({
          severity: 'info',
          category: 'validation',
          code: 'EMPTY_STYLE_GROUP',
          message: `Стилевая группа «${group.title}» пуста`,
          sectionTitle: group.title,
        }),
      )
    }
  }

  return diagnostics
}

export function validateControls(
  block: WidgetBlock,
  controls: ControlsMap,
): DiagnosticItem[] {
  const diagnostics: DiagnosticItem[] = []
  const editableFields = getEditableFields(block)
  const fieldMap = new Map(editableFields.map((f) => [f.key, f]))
  const canonical = generateControls(block)

  for (const field of editableFields) {
    if (!controls[field.key]) {
      diagnostics.push(
        createDiagnostic({
          severity: 'warning',
          category: 'controls',
          code: DiagnosticCodes.MISSING_CONTROL,
          message: `Нет контрола для поля «${field.key}»`,
          fieldKey: field.key,
          sectionTitle: field.groupTitle,
        }),
      )
    }
  }

  for (const [key, control] of Object.entries(controls)) {
    const field = fieldMap.get(key)

    if (!field) {
      diagnostics.push(
        createDiagnostic({
          severity: 'warning',
          category: 'controls',
          code: DiagnosticCodes.ORPHAN_CONTROL,
          message: `Контрол «${key}» без соответствующего поля`,
          fieldKey: key,
        }),
      )
      continue
    }

    const canon = canonical[key]
    if (!canon) continue

    for (const rule of CONTROL_DIAGNOSTIC_RULES) {
      const message = rule.check(control, canon)
      if (message) {
        diagnostics.push(
          createDiagnostic({
            severity: rule.severity,
            category: rule.category,
            code: rule.code,
            message: `${message} для «${key}»`,
            fieldKey: key,
          }),
        )
      }
    }
  }

  return diagnostics
}

export function validateAll(
  block: WidgetBlock | null,
  controls: ControlsMap,
): DiagnosticItem[] {
  if (!block) return []
  return [...validateWidgetBlock(block), ...validateControls(block, controls)]
}

export { collectAllFields }
