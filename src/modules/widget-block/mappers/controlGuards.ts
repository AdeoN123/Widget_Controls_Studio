import type { ControlType } from '@/modules/controls/types'

const CONTROL_TYPES: ControlType[] = [
  'textfield', 'textarea', 'wysiwyg', 'color', 'file', 'radio',
  'select', 'collection', 'range', 'checkbox', 'switch', 'fonts',
]

export function isControlType(value: string): value is ControlType {
  return CONTROL_TYPES.includes(value as ControlType)
}
