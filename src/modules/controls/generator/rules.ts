import type { BlockField } from '@/modules/widget-block/types'
import type { ControlSchema, BuilderKind } from '@/modules/controls/types'
import type { FieldMeta } from '@/modules/widget-block/analyzer/types'
import {
  analyzeField,
  getFieldDisplayName,
  isContentTextarea,
  isContentTextField,
  isImageKey,
  isTextareaKey,
  isTextFieldKey,
  stripBreakpointPrefix,
} from '@/modules/widget-block/analyzer'
import { FONT_WEIGHT_OPTIONS, TEXT_ALIGN_OPTIONS } from '@/modules/controls/types'
import { buildControlLabel } from '@/modules/control-labels'

export interface ControlRule {
  id: string
  match: (field: BlockField, meta: FieldMeta) => boolean
  build: (field: BlockField, meta: FieldMeta) => Partial<ControlSchema>
}

function breakpointToBuilderKind(bp: FieldMeta['breakpoint']): BuilderKind {
  if (bp === 'tablet') return 'design-tablet'
  if (bp === 'phone') return 'design-phone'
  return 'design-desktop'
}

export const contentTextRule: ControlRule = {
  id: 'content-text',
  match: (field, meta) => isContentTextField(field, meta),
  build: (_field, meta) => ({
    group: meta.group,
    name: buildControlLabel(_field, meta),
    type: 'textfield',
    sourceFieldKey: _field.key,
    sourceSectionKind: 'content',
  }),
}

const RICH_TEXT_SUFFIX = /(^|_)(text|description)$/

export const contentTextareaRule: ControlRule = {
  id: 'content-textarea',
  match: (field, meta) => isContentTextarea(field, meta),
  build: (field, meta) => ({
    group: meta.group,
    name: buildControlLabel(field, meta),
    type: RICH_TEXT_SUFFIX.test(field.key) ? 'wysiwyg' : 'textarea',
    sourceFieldKey: field.key,
    sourceSectionKind: 'content',
  }),
}

const DEFAULT_IMAGE_FILE_TYPES = 'image/jpeg,image/png,image/gif,image/svg+xml'
const DEFAULT_IMAGE_MAX_SIZE = '204800'

/**
 * Определяет схему контрола для одного поля внутри элемента коллекции
 * (например, `rows.template.img`/`text_1`). Дочерние поля шаблона никогда не
 * несут `group` в реальном корпоративном формате (подтверждено эталонной
 * фикстурой), поэтому здесь она намеренно опускается.
 */
function inferTemplateFieldSchema(key: string, order: number): ControlSchema {
  const name = getFieldDisplayName(key)

  if (isImageKey(key)) {
    return {
      key,
      group: '',
      name,
      type: 'file',
      file_types: DEFAULT_IMAGE_FILE_TYPES,
      max_size: DEFAULT_IMAGE_MAX_SIZE,
      order,
    }
  }

  if (isTextareaKey(key) || RICH_TEXT_SUFFIX.test(key)) {
    return { key, group: '', name, type: 'wysiwyg', order }
  }

  if (isTextFieldKey(key)) {
    return { key, group: '', name, type: 'textfield', order }
  }

  return { key, group: '', name, type: 'wysiwyg', order }
}

/**
 * Строит `template` для контрола-коллекции, анализируя форму первого
 * распарсенного элемента (например, `rows: [{img: "...", text_1: "..."}]`,
 * разобранный парсером объект-литералов в обычный массив объектов).
 * Возвращает undefined, если значение поля не является непустым массивом
 * объектов (анализировать нечего).
 */
function buildCollectionTemplate(field: BlockField): Record<string, ControlSchema> | undefined {
  const value = field.value
  if (!Array.isArray(value) || value.length === 0) return undefined

  const firstItem = value[0]
  if (typeof firstItem !== 'object' || firstItem === null || Array.isArray(firstItem)) {
    return undefined
  }

  const template: Record<string, ControlSchema> = {}
  let order = 0
  for (const key of Object.keys(firstItem as Record<string, unknown>)) {
    template[key] = inferTemplateFieldSchema(key, order++)
  }
  return template
}

export const contentCollectionRule: ControlRule = {
  id: 'content-collection',
  match: (_field, meta) => meta.isContent && meta.isCollection,
  build: (field, meta) => {
    const template = buildCollectionTemplate(field)
    return {
      group: meta.group,
      name: buildControlLabel(field, meta),
      type: 'collection',
      ...(template ? { template } : {}),
      sourceFieldKey: field.key,
      sourceSectionKind: 'content',
    }
  },
}

export const contentDefaultRule: ControlRule = {
  id: 'content-default',
  match: (_field, meta) => meta.isContent,
  build: (field, meta) => ({
    group: meta.group,
    name: buildControlLabel(field, meta),
    type: 'wysiwyg',
    sourceFieldKey: field.key,
    sourceSectionKind: 'content',
  }),
}

const BG_IMAGE_FILE_TYPES = 'image/jpeg,image/png'
const BG_IMAGE_MAX_SIZE = '819200'

export const contentFileRule: ControlRule = {
  id: 'content-file',
  match: (_field, meta) => meta.isContent && meta.isImage,
  build: (field, meta) => {
    const isBgImage = field.key.includes('bg_image')
    return {
      group: meta.group,
      name: buildControlLabel(field, meta),
      type: 'file',
      file_types: isBgImage ? BG_IMAGE_FILE_TYPES : DEFAULT_IMAGE_FILE_TYPES,
      max_size: isBgImage ? BG_IMAGE_MAX_SIZE : DEFAULT_IMAGE_MAX_SIZE,
      sourceFieldKey: field.key,
      sourceSectionKind: 'content',
    }
  },
}

export const fontWeightRule: ControlRule = {
  id: 'style-font-weight',
  match: (_field, meta) => meta.isStyle && meta.propertyType === 'font_weight',
  build: (field, meta) => ({
    group: meta.group,
    name: buildControlLabel(field, meta),
    type: 'radio',
    options: FONT_WEIGHT_OPTIONS,
    builder_kind: breakpointToBuilderKind(meta.breakpoint),
    sourceFieldKey: field.key,
    sourceSectionKind: 'style',
  }),
}

export const fontFamilyRule: ControlRule = {
  id: 'style-font-family',
  match: (_field, meta) => meta.isStyle && meta.propertyType === 'font_family',
  build: (field, meta) => ({
    group: meta.group,
    name: buildControlLabel(field, meta),
    type: 'fonts',
    builder_kind: breakpointToBuilderKind(meta.breakpoint),
    sourceFieldKey: field.key,
    sourceSectionKind: 'style',
  }),
}

export const alignRule: ControlRule = {
  id: 'style-align',
  match: (_field, meta) => meta.isStyle && meta.propertyType === 'align',
  build: (field, meta) => ({
    group: meta.group,
    name: buildControlLabel(field, meta),
    type: 'radio',
    options: TEXT_ALIGN_OPTIONS,
    builder_kind: breakpointToBuilderKind(meta.breakpoint),
    sourceFieldKey: field.key,
    sourceSectionKind: 'style',
  }),
}

export const colorStyleRule: ControlRule = {
  id: 'style-color',
  match: (_field, meta) => meta.isStyle && meta.isColor && meta.propertyType === 'color',
  build: (field, meta) => ({
    group: meta.group,
    name: buildControlLabel(field, meta),
    type: 'color',
    builder_kind: breakpointToBuilderKind(meta.breakpoint),
    sourceFieldKey: field.key,
    sourceSectionKind: 'style',
  }),
}

export const numericStyleRule: ControlRule = {
  id: 'style-numeric',
  match: (_field, meta) => meta.isStyle && meta.isNumeric,
  build: (field, meta) => ({
    group: meta.group,
    name: buildControlLabel(field, meta),
    type: 'textfield',
    builder_kind: breakpointToBuilderKind(meta.breakpoint),
    validate: { digits: 'true' },
    sourceFieldKey: field.key,
    sourceSectionKind: 'style',
  }),
}

export const lineHeightStyleRule: ControlRule = {
  id: 'style-line-height',
  match: (field, meta) => meta.isStyle && stripBreakpointPrefix(field.key).endsWith('_line_height'),
  build: (field, meta) => ({
    group: meta.group,
    name: buildControlLabel(field, meta),
    type: 'textfield',
    builder_kind: breakpointToBuilderKind(meta.breakpoint),
    sourceFieldKey: field.key,
    sourceSectionKind: 'style',
  }),
}

export const fileStyleRule: ControlRule = {
  id: 'style-file',
  match: (_field, meta) => meta.isStyle && meta.isImage && meta.propertyType === 'image',
  build: (field, meta) => {
    const isBgImage = field.key.includes('bg_image')
    return {
      group: meta.group,
      name: buildControlLabel(field, meta),
      type: 'file',
      file_types: isBgImage ? BG_IMAGE_FILE_TYPES : DEFAULT_IMAGE_FILE_TYPES,
      max_size: isBgImage ? BG_IMAGE_MAX_SIZE : DEFAULT_IMAGE_MAX_SIZE,
      builder_kind: breakpointToBuilderKind(meta.breakpoint),
      sourceFieldKey: field.key,
      sourceSectionKind: 'style',
    }
  },
}

export const defaultRules: ControlRule[] = [
  contentCollectionRule,
  contentFileRule,
  contentTextareaRule,
  contentTextRule,
  fontWeightRule,
  fontFamilyRule,
  alignRule,
  colorStyleRule,
  numericStyleRule,
  lineHeightStyleRule,
  fileStyleRule,
  contentDefaultRule,
]

export function inferControlForField(
  field: BlockField,
  rules: ControlRule[] = defaultRules,
  styleTopicMap?: Map<string, string>,
): ControlSchema | null {
  const meta = analyzeField(field, styleTopicMap)

  for (const rule of rules) {
    if (!rule.match(field, meta)) continue
    const partial = rule.build(field, meta)
    return {
      key: field.key,
      group: partial.group ?? meta.group,
      name: partial.name ?? buildControlLabel(field, meta),
      type: partial.type ?? 'textfield',
      order: field.order,
      ...partial,
    }
  }

  return null
}
