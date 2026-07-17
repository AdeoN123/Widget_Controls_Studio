import type { ControlsMap } from '@/modules/controls/types'
import type { DiagnosticItem } from '@/types/diagnostics'

export type WidgetSectionKind = 'required' | 'content' | 'style' | 'controls'

export interface BlockSection {
  title: string
  kind: WidgetSectionKind
  order: number
}

export interface BlockField {
  key: string
  value: unknown
  rawValue: string
  sectionKind: WidgetSectionKind
  groupTitle?: string
  order: number
}

export interface StyleGroup {
  title: string
  order: number
  fields: BlockField[]
}

export interface WidgetBlock {
  raw: string
  sections: BlockSection[]
  required: BlockField[]
  content: BlockField[]
  styleGroups: StyleGroup[]
  controlsRaw?: string
  controlsParsed?: ControlsMap
}

export interface ParseMetadata {
  contentFieldsCount: number
  styleFieldsCount: number
  controlsCount: number
  groupsCount: number
}

export interface ParseResult {
  block: WidgetBlock | null
  diagnostics: DiagnosticItem[]
  metadata: ParseMetadata
}

export const REQUIRED_FIELD_ORDER = [
  'preview_url',
  'preview_image',
  'builder_template_kinds',
  'scroll_to_enabled',
  'visible',
  'visibility_kind',
  'w_type',
  'custom_tablet_design',
  'custom_phone_design',
  'promo_end',
  'promo_end_data',
] as const

export type RequiredFieldKey = (typeof REQUIRED_FIELD_ORDER)[number]

export const REQUIRED_FIELD_DEFAULTS: Record<RequiredFieldKey, string> = {
  preview_url: '',
  preview_image: '',
  builder_template_kinds: '[]',
  scroll_to_enabled: 'true',
  visible: '"true"',
  visibility_kind: '"public"',
  w_type: '"interactive"',
  custom_tablet_design: '""',
  custom_phone_design: '""',
  promo_end: '"false"',
  promo_end_data: '""',
}

export const CONTENT_SECTION_TITLE = 'Контент'
export const REQUIRED_SECTION_TITLE = 'Обязательное'
export const CONTROLS_SECTION_TITLE = 'Контролы'
