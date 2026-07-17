import { describe, it, expect } from 'vitest'
import { parseWidgetBlock } from '@/modules/widget-block/parser'
import { mockTableBlock } from '@/constants/mockTableBlock'
import { generateControls } from './index'

/**
 * Регрессионный тест для задачи C4: поля контента раньше всегда попадали
 * в общую группу "Контент", даже если реальный корпоративный блок ожидает,
 * что они относятся к стилевой группе, которую семантически описывают
 * (например, `title_text` -> "Заголовок", а не "Контент").
 *
 * Тест заново генерирует контролы из эталонной фикстуры реального блока
 * (игнорируя её встроенные widgets_controls) и сверяет полученные группы
 * с фактическими группами в этом же реальном блоке — то есть с эталоном,
 * а не с догадкой.
 */
describe('generateControls — content field group mapping (C4)', () => {
  const parsed = parseWidgetBlock(mockTableBlock)
  const block = parsed.block!
  const generated = generateControls(block)

  it('maps a content field to its style group via shared structural topic', () => {
    expect(generated.title_text?.group).toBe('Заголовок')
    expect(generated.title_text?.type).toBe('wysiwyg')
  })

  it('maps cross-vocabulary content fields via the small alias table', () => {
    expect(generated.column_title_1?.group).toBe('Заголовки таблицы')
    expect(generated.column_title_2?.group).toBe('Заголовки таблицы')
    expect(generated.column_title_3?.group).toBe('Заголовки таблицы')
    expect(generated.column_title_4?.group).toBe('Заголовки таблицы')
    expect(generated.column_title_1?.type).toBe('wysiwyg')
  })

  it('maps the rows collection to its virtual group (no matching style section)', () => {
    expect(generated.rows?.group).toBe('Строки')
    expect(generated.rows?.type).toBe('collection')
  })

  it('builds the rows template by introspecting the parsed collection item (H2)', () => {
    const template = generated.rows?.template
    expect(template).toBeDefined()
    expect(template!.img).toMatchObject({ type: 'file' })
    expect(template!.img.group).toBe('')
    expect(template!.text_1).toMatchObject({ type: 'wysiwyg' })
    expect(template!.text_4).toMatchObject({ type: 'wysiwyg' })
    expect(Object.keys(template!)).toEqual(['img', 'text_1', 'text_2', 'text_3', 'text_4'])
  })

  it('still falls back to the generic content group when nothing matches', () => {
    expect(typeof generated.title_text?.group).toBe('string')
  })

  it('does not force validate.digits onto line_height fields, even prefixed (found while verifying M2)', () => {
    expect(generated.title_line_height?.validate).toBeUndefined()
    expect(generated.text_line_height?.validate).toBeUndefined()
    expect(generated.tablet_text_line_height?.validate).toBeUndefined()
    expect(generated.phone_text_line_height?.validate).toBeUndefined()
    expect(generated.image_height?.validate).toEqual({ digits: 'true' })
  })
})
