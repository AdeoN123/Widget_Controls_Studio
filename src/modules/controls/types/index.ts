export type BuilderKind = 'design-desktop' | 'design-tablet' | 'design-phone'

export type ControlType =
  | 'textfield'
  | 'textarea'
  | 'wysiwyg'
  | 'color'
  | 'file'
  | 'radio'
  | 'select'
  | 'collection'
  | 'range'
  | 'checkbox'
  | 'switch'
  | 'fonts'

export interface ControlValidate {
  required?: 'true'
  digits?: 'true'
}

export interface ControlSchema {
  key: string
  group: string
  name: string
  type: ControlType
  template?: Record<string, ControlSchema>
  options?: Record<string, string>
  min?: number
  max?: number
  file_types?: string
  max_size?: string
  validate?: ControlValidate
  help?: string
  builder_kind?: BuilderKind
  sourceFieldKey?: string
  sourceSectionKind?: 'content' | 'style'
  order: number
}

export type ControlsMap = Record<string, ControlSchema>

export const CONTROL_FIELD_ORDER = [
  'group',
  'name',
  'type',
  'template',
  'options',
  'min',
  'max',
  'file_types',
  'max_size',
  'validate',
  'help',
  'builder_kind',
] as const

export const FONT_WEIGHT_OPTIONS: Record<string, string> = {
  light: '300',
  normal: '400',
  medium: '500',
  bold: '700',
}

export const TEXT_ALIGN_OPTIONS: Record<string, string> = {
  Слева: 'left',
  'По центру': 'center',
  Справа: 'right',
}
