import type { ControlSchema, ControlsMap } from '@/modules/controls/types'
import { isControlType } from '@/modules/widget-block/mappers/controlGuards'
import {
  parseObjectLiteral,
  isPlainObjectLiteral,
  type ParsedLiteralValue,
} from './objectLiteralParser'

const CONTROLS_WRAPPER_KEY = 'widgets_controls'

export function parseControlsRaw(rawControls: string): ControlsMap {
  const trimmed = rawControls.trim()
  if (!trimmed) return {}

  let root: ParsedLiteralValue
  try {
    root = parseObjectLiteral(`{${trimmed}}`)
  } catch {
    return {}
  }

  if (!isPlainObjectLiteral(root)) return {}

  const wrapped = root[CONTROLS_WRAPPER_KEY]
  const controlsRoot = isPlainObjectLiteral(wrapped) ? wrapped : root

  const controls: ControlsMap = {}
  let order = 0

  for (const [key, node] of Object.entries(controlsRoot)) {
    if (!isPlainObjectLiteral(node)) continue
    const schema = nodeToControlSchema(key, node, order)
    if (schema) {
      controls[key] = schema
      order++
    }
  }

  return controls
}

function nodeToControlSchema(
  key: string,
  node: { [k: string]: ParsedLiteralValue },
  order: number,
): ControlSchema | null {
  const typeRaw = node.type
  if (typeof typeRaw !== 'string' || !isControlType(typeRaw)) return null

  const schema: ControlSchema = {
    key,
    group: typeof node.group === 'string' ? node.group : '',
    name: typeof node.name === 'string' ? node.name : key,
    type: typeRaw,
    order,
  }

  if (isPlainObjectLiteral(node.template)) {
    const template: Record<string, ControlSchema> = {}
    for (const [subKey, subNode] of Object.entries(node.template)) {
      if (isPlainObjectLiteral(subNode)) {
        const sub = nodeToControlSchema(subKey, subNode, 0)
        if (sub) template[subKey] = sub
      }
    }
    if (Object.keys(template).length > 0) schema.template = template
  }

  if (isPlainObjectLiteral(node.options)) {
    const options: Record<string, string> = {}
    for (const [k, v] of Object.entries(node.options)) {
      if (typeof v === 'string') options[k] = v
      else if (typeof v === 'number') options[k] = String(v)
    }
    schema.options = options
  }

  if (isPlainObjectLiteral(node.validate)) {
    const req = node.validate.required
    const digits = node.validate.digits
    const validate: NonNullable<ControlSchema['validate']> = {}
    if (req === 'true' || req === true) validate.required = 'true'
    if (digits === 'true' || digits === true) validate.digits = 'true'
    if (Object.keys(validate).length > 0) schema.validate = validate
  }

  if (typeof node.min === 'number') schema.min = node.min
  else if (typeof node.min === 'string' && node.min.trim() !== '') schema.min = Number(node.min)

  if (typeof node.max === 'number') schema.max = node.max
  else if (typeof node.max === 'string' && node.max.trim() !== '') schema.max = Number(node.max)

  if (typeof node.file_types === 'string' && node.file_types) schema.file_types = node.file_types

  if (typeof node.max_size === 'string' && node.max_size) schema.max_size = node.max_size
  else if (typeof node.max_size === 'number') schema.max_size = String(node.max_size)

  if (typeof node.help === 'string' && node.help) schema.help = node.help

  const builderKind = node.builder_kind
  if (
    builderKind === 'design-desktop' ||
    builderKind === 'design-tablet' ||
    builderKind === 'design-phone'
  ) {
    schema.builder_kind = builderKind
  }

  return schema
}
