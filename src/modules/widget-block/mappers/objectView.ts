import type { WidgetBlock } from '@/modules/widget-block/types'
import type { ControlsMap, ControlSchema } from '@/modules/controls/types'
import { isControlType } from './controlGuards'

export interface BlockObjectView {
  required: Record<string, unknown>
  content: Record<string, unknown>
  styles: Record<string, Record<string, unknown>>
  controls: Record<string, ObjectViewControl>
}

export interface ObjectViewControl {
  group: string
  name: string
  type: string
  builder_kind?: string
  validate?: { required?: string; digits?: string }
  file_types?: string
  max_size?: string
  options?: Record<string, string>
  help?: string
}

export function blockToObjectView(block: WidgetBlock, controls: ControlsMap): BlockObjectView {
  const required: Record<string, unknown> = {}
  for (const f of block.required) required[f.key] = f.value

  const content: Record<string, unknown> = {}
  for (const f of block.content) content[f.key] = f.value

  const styles: Record<string, Record<string, unknown>> = {}
  for (const group of block.styleGroups) {
    styles[group.title] = {}
    for (const f of group.fields) {
      styles[group.title][f.key] = f.value
    }
  }

  const controlsView: Record<string, ObjectViewControl> = {}
  for (const [key, control] of Object.entries(controls)) {
    controlsView[key] = controlToObjectView(control)
  }

  return { required, content, styles, controls: controlsView }
}

function controlToObjectView(control: ControlSchema): ObjectViewControl {
  const view: ObjectViewControl = {
    group: control.group,
    name: control.name,
    type: control.type,
  }
  if (control.builder_kind) view.builder_kind = control.builder_kind
  if (control.validate) view.validate = control.validate
  if (control.file_types) view.file_types = control.file_types
  if (control.max_size) view.max_size = control.max_size
  if (control.options) view.options = control.options
  if (control.help) view.help = control.help
  return view
}

export function objectViewToBlock(
  view: BlockObjectView,
  original: WidgetBlock,
): WidgetBlock {
  const required = original.required.map((f) => ({
    ...f,
    value: view.required[f.key] ?? f.value,
    rawValue: formatRaw(view.required[f.key] ?? f.value, f.rawValue),
  }))

  const content = original.content.map((f) => ({
    ...f,
    value: view.content[f.key] ?? f.value,
    rawValue: formatRaw(view.content[f.key] ?? f.value, f.rawValue),
  }))

  const styleGroups = original.styleGroups.map((group) => ({
    ...group,
    fields: group.fields.map((f) => ({
      ...f,
      value: view.styles[group.title]?.[f.key] ?? f.value,
      rawValue: formatRaw(view.styles[group.title]?.[f.key] ?? f.value, f.rawValue),
    })),
  }))

  return { ...original, required, content, styleGroups }
}

export function objectViewToControls(
  view: BlockObjectView,
  original: ControlsMap,
): ControlsMap {
  const result: ControlsMap = { ...original }

  for (const [key, viewControl] of Object.entries(view.controls)) {
    const existing = original[key]
    const type = isControlType(viewControl.type) ? viewControl.type : (existing?.type ?? 'textfield')

    result[key] = {
      key,
      group: viewControl.group,
      name: viewControl.name,
      type,
      order: existing?.order ?? 0,
      ...(viewControl.builder_kind
        ? {
            builder_kind: viewControl.builder_kind as ControlSchema['builder_kind'],
          }
        : {}),
      ...(viewControl.validate
        ? {
            validate: {
              ...(viewControl.validate.required === 'true' ? { required: 'true' as const } : {}),
              ...(viewControl.validate.digits === 'true' ? { digits: 'true' as const } : {}),
            },
          }
        : {}),
      ...(viewControl.file_types ? { file_types: viewControl.file_types } : {}),
      ...(viewControl.max_size ? { max_size: viewControl.max_size } : {}),
      ...(viewControl.options ? { options: viewControl.options } : {}),
      ...(viewControl.help ? { help: viewControl.help } : {}),
    }
  }

  return result
}

function formatRaw(value: unknown, fallback: string): string {
  if (value === undefined || value === null) return fallback
  if (typeof value === 'string') {
    if (fallback.startsWith('"') || fallback === '""') return `"${value}"`
    return value
  }
  if (typeof value === 'boolean') return String(value)
  if (typeof value === 'number') return String(value)
  if (Array.isArray(value) || typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
