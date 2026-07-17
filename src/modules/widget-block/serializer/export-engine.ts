import type { BlockField, WidgetBlock } from '../types'
import type { ControlsMap, ControlSchema } from '@/modules/controls/types'
import { CONTROL_FIELD_ORDER } from '@/modules/controls/types'

function serializeField(field: BlockField): string {
  return `${field.key}: ${field.rawValue}`
}

function serializeFields(fields: BlockField[]): string {
  return fields.map(serializeField).join('\n')
}

const CONTROLS_WRAPPER_KEY = 'widgets_controls'

/** Оборачивает строковое значение в двойные кавычки, экранируя обратные слэши и вложенные кавычки. */
function quoteString(value: string): string {
  const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return `"${escaped}"`
}

/**
 * Сериализует одно определение контрола как содержимое его объект-литерала
 * `{...}` (без внешних фигурных скобок), в соответствии с реальным
 * корпоративным форматом: фиксированный порядок полей, строковые поля всегда
 * в кавычках, числовые поля (min/max) без кавычек, ключи `options` всегда
 * в кавычках.
 */
function serializeControlNode(control: ControlSchema): string {
  const parts: string[] = []

  if (control.group) parts.push(`group: ${quoteString(control.group)}`)
  parts.push(`name: ${quoteString(control.name)}`)
  parts.push(`type: ${quoteString(control.type)}`)

  if (control.template && Object.keys(control.template).length > 0) {
    const entries = Object.entries(control.template)
      .map(([subKey, sub]) => `${subKey}: {${serializeControlNode(sub)}}`)
      .join(', ')
    parts.push(`template: {${entries}}`)
  }

  if (control.options && Object.keys(control.options).length > 0) {
    const entries = Object.entries(control.options)
      .map(([k, v]) => `${quoteString(k)}: ${quoteString(v)}`)
      .join(', ')
    parts.push(`options: {${entries}}`)
  }

  if (control.min !== undefined) parts.push(`min: ${control.min}`)
  if (control.max !== undefined) parts.push(`max: ${control.max}`)
  if (control.file_types) parts.push(`file_types: ${quoteString(control.file_types)}`)
  if (control.max_size) parts.push(`max_size: ${quoteString(control.max_size)}`)

  if (control.validate) {
    const entries: string[] = []
    if (control.validate.required) entries.push('required: "true"')
    if (control.validate.digits) entries.push('digits: "true"')
    if (entries.length > 0) parts.push(`validate: {${entries.join(', ')}}`)
  }

  if (control.help) parts.push(`help: ${quoteString(control.help)}`)
  if (control.builder_kind) parts.push(`builder_kind: ${quoteString(control.builder_kind)}`)

  return parts.join(', ')
}

/**
 * Сериализует всю карту контролов как единое обёрнутое значение
 * `widgets_controls: {...}`, точно в соответствии с реальным корпоративным
 * форматом (round-trip совместимо с `parseControlsRaw`).
 */
export function serializeControls(controls: ControlsMap): string {
  const sorted = Object.values(controls).sort((a, b) => a.order - b.order)
  if (sorted.length === 0) return ''

  const entries = sorted
    .map((control) => `${control.key}: {${serializeControlNode(control)}}`)
    .join(',\n')

  return `${CONTROLS_WRAPPER_KEY}: {\n${entries}\n}`
}

export function exportWidgetBlock(
  block: WidgetBlock,
  controls?: ControlsMap,
): string {
  const parts: string[] = []

  function pushSection(title: string, body: string) {
    if (parts.length > 0) parts.push('')
    parts.push(`#${title}`)
    parts.push(body)
  }

  if (block.required.length > 0) {
    pushSection('Обязательное', serializeFields(block.required))
  }

  if (block.content.length > 0) {
    pushSection('Контент', serializeFields(block.content))
  }

  const sortedGroups = block.styleGroups.slice().sort((a, b) => a.order - b.order)
  for (const group of sortedGroups) {
    pushSection(group.title, serializeFields(group.fields))
  }

  const controlsContent = controls
    ? serializeControls(controls)
    : block.controlsRaw

  if (controlsContent) {
    pushSection('Контролы', controlsContent)
  }

  return parts.join('\n')
}

export { CONTROL_FIELD_ORDER }
