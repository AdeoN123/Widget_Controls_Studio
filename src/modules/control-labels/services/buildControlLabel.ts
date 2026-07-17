import type { BlockField } from '@/modules/widget-block/types'
import type { FieldMeta } from '@/modules/widget-block/analyzer/types'
import { getFieldDisplayName, stripBreakpointPrefix } from '@/modules/widget-block/analyzer'

const PIXEL_PROPERTIES = new Set(['font_size', 'padding', 'margin'])

const TEXT_COLOR_SUBJECTS = new Set(['title', 'header', 'text', 'subtitle'])

export function buildControlLabel(field: BlockField, meta: FieldMeta): string {
  const base = getFieldDisplayName(field.key)

  if (meta.propertyType === 'font_family') return 'Шрифт'
  if (meta.propertyType === 'align') return 'Выравнивание'
  if (meta.isColor && field.key.includes('bg')) return 'Цвет фона'
  if (meta.isColor) {
    const subjectWords = stripBreakpointPrefix(field.key)
      .split('_')
      .filter((w) => w && w.toLowerCase() !== 'color')
    if (subjectWords.length === 1 && TEXT_COLOR_SUBJECTS.has(subjectWords[0].toLowerCase())) {
      return 'Цвет текста'
    }
    const subject = subjectWords.length ? getFieldDisplayName(subjectWords.join('_')) : ''
    return subject ? `Цвет ${subject.toLowerCase()}` : 'Цвет'
  }

  if (PIXEL_PROPERTIES.has(meta.propertyType) || meta.isNumeric) {
    return `${base} (в px)`
  }

  if (meta.propertyType === 'font_weight') return 'Жирность шрифта'
  if (meta.isImage) return base
  if (meta.isCollection) return base

  if (field.key === 'button_text') return 'Текст кнопки'
  if (field.key === 'title') return 'Заголовок'
  if (field.key === 'subtitle') return 'Подзаголовок'

  return base
}
