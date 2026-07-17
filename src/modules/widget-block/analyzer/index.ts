import type { BlockField, StyleGroup } from '../types'
import {
  CONTENT_SECTION_TITLE,
  REQUIRED_SECTION_TITLE,
} from '../types'
import type { Breakpoint, FieldMeta, PropertyType } from './types'
import { translateFieldKey } from './ruFieldLabels'

const COLLECTION_KEYS = new Set(['questions', 'items', 'cards', 'slides', 'tabs', 'list', 'rows'])
const TEXTFIELD_KEYS = new Set(['title', 'subtitle', 'button_text', 'label', 'link', 'url', 'name'])
const TEXTAREA_KEYS = new Set(['text', 'description', 'content', 'body', 'html'])
const IMAGE_PATTERNS = ['image', 'icon', 'arrow', 'logo', 'bg_image', 'file', 'img']

const NUMERIC_PATTERNS: PropertyType[] = ['font_size', 'padding', 'margin']

const CONTENT_GROUP_ALIASES: Record<string, string> = {
  column_title: 'Заголовки таблицы',
  rows: 'Строки',
}

/**
 * Строит соответствие "тема -> название стилевой группы" по стилевым группам
 * блока — используется, чтобы структурно определить, к какой стилевой группе
 * семантически относится поле контента (например, поле контента `title_text`
 * и стилевые поля `title_font_size`/`title_align`/... разделяют тему "title"
 * -> оба относятся к группе "Заголовок").
 */
export function buildStyleTopicMap(styleGroups: StyleGroup[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const group of styleGroups) {
    for (const field of group.fields) {
      const base = stripBreakpointPrefix(field.key)
      const topic = base.split('_')[0]
      if (topic && !map.has(topic)) map.set(topic, group.title)
    }
  }
  return map
}

function resolveContentFieldGroup(field: BlockField, styleTopicMap?: Map<string, string>): string {
  const base = stripBreakpointPrefix(field.key)

  const aliasTopic = base.replace(/_\d+$/, '')
  const alias = CONTENT_GROUP_ALIASES[aliasTopic]
  if (alias) return alias

  if (styleTopicMap) {
    const structuralTopic = base.split('_')[0]
    const matched = styleTopicMap.get(structuralTopic)
    if (matched) return matched
  }

  return CONTENT_SECTION_TITLE
}

export function resolveFieldGroup(field: BlockField, styleTopicMap?: Map<string, string>): string {
  if (field.sectionKind === 'content') return resolveContentFieldGroup(field, styleTopicMap)
  if (field.sectionKind === 'style' && field.groupTitle) return field.groupTitle
  if (field.sectionKind === 'required') return REQUIRED_SECTION_TITLE
  return field.groupTitle ?? 'Общее'
}

export function detectBreakpoint(key: string): Breakpoint {
  if (key.startsWith('tablet_')) return 'tablet'
  if (key.startsWith('phone_')) return 'phone'
  return 'desktop'
}

function stripBreakpointPrefix(key: string): string {
  return key.replace(/^(tablet_|phone_)/, '')
}

export function detectPropertyType(key: string): PropertyType {
  const base = stripBreakpointPrefix(key)

  if (base.includes('font_weight')) return 'font_weight'
  if (base.includes('font_family')) return 'font_family'
  if (base === 'align' || base.endsWith('_align')) return 'align'
  if (base.includes('font_size')) return 'font_size'
  if (base.includes('padding')) return 'padding'
  if (base.includes('margin')) return 'margin'
  if (base.includes('color') || base.includes('bg_color')) return 'color'
  if (IMAGE_PATTERNS.some((p) => base.includes(p))) return 'image'

  return 'unknown'
}

export function isNumericProperty(meta: FieldMeta): boolean {
  if (meta.isContent) return false
  return (
    meta.isNumeric ||
    meta.propertyType === 'font_size' ||
    meta.propertyType === 'padding' ||
    meta.propertyType === 'margin' ||
    NUMERIC_PATTERNS.includes(meta.propertyType)
  )
}

const NUMERIC_EXCLUDED_SUFFIXES = ['line_height']

function isNumericKey(key: string): boolean {
  const base = stripBreakpointPrefix(key)
  if (NUMERIC_EXCLUDED_SUFFIXES.some((suffix) => base === suffix || base.endsWith(`_${suffix}`))) {
    return false
  }

  const numericFragments = [
    'font_size',
    'padding',
    'margin',
    'width',
    'height',
    'border_radius',
    'gap',
    '_top',
    '_left',
    '_right',
    '_bottom',
  ]
  return numericFragments.some((f) => base.includes(f))
}

function isColorKey(key: string): boolean {
  const base = stripBreakpointPrefix(key)
  return base.includes('color') || base.includes('bg_color')
}

function isImageKey(key: string): boolean {
  const base = stripBreakpointPrefix(key)
  return IMAGE_PATTERNS.some((p) => base.includes(p))
}

function isCollectionKey(key: string): boolean {
  return COLLECTION_KEYS.has(key)
}

function isTextFieldKey(key: string): boolean {
  return TEXTFIELD_KEYS.has(key) || TEXTFIELD_KEYS.has(stripBreakpointPrefix(key))
}

function isTextareaKey(key: string): boolean {
  return TEXTAREA_KEYS.has(key) || [...TEXTAREA_KEYS].some((k) => key.includes(k))
}

export function analyzeField(field: BlockField, styleTopicMap?: Map<string, string>): FieldMeta {
  const isContent = field.sectionKind === 'content'
  const isStyle = field.sectionKind === 'style'
  const propertyType = detectPropertyType(field.key)
  const breakpoint = detectBreakpoint(field.key)

  return {
    isContent,
    isStyle,
    isNumeric: isNumericKey(field.key),
    isColor: isColorKey(field.key),
    isImage: isImageKey(field.key),
    isCollection: isCollectionKey(field.key),
    breakpoint,
    propertyType,
    group: resolveFieldGroup(field, styleTopicMap),
  }
}

export function isContentTextField(field: BlockField, meta: FieldMeta): boolean {
  return meta.isContent && isTextFieldKey(field.key) && !meta.isImage
}

export function isContentTextarea(field: BlockField, meta: FieldMeta): boolean {
  return meta.isContent && isTextareaKey(field.key) && !meta.isCollection
}

export function getFieldDisplayName(key: string): string {
  return translateFieldKey(stripBreakpointPrefix(key))
}

export {
  isTextFieldKey,
  isTextareaKey,
  isCollectionKey,
  isImageKey,
  isColorKey,
  isNumericKey,
  stripBreakpointPrefix,
}
