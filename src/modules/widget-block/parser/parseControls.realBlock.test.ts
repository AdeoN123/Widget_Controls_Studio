import { describe, it, expect } from 'vitest'
import { parseWidgetBlock } from './index'
import { parseControlsRaw } from './parseControls'
import { mockTableBlock } from '@/constants/mockTableBlock'
import { exportWidgetBlock } from '@/modules/widget-block/serializer'

/**
 * Регрессионный тест на эталонной фикстуре для реального корпоративного
 * формата `widgets_controls: {...}`. До переписывания парсера
 * объект-литералов `parseControlsRaw` молча возвращал {} для этого блока
 * (прослежено вручную: `splitTopLevelBlocks` + `parseIndentedYaml` + проверка
 * `typeof node !== 'object'` в старом `parseControlsRaw` отклоняли единственный
 * ключ-обёртку, значением которого была строка объект-литерала, а не
 * YAML-блок вида `key:\n  sub: ...`).
 */
describe('parseControlsRaw — real corporate widgets_controls format', () => {
  const parsed = parseWidgetBlock(mockTableBlock)

  it('parses the block and finds the controls section', () => {
    expect(parsed.block).not.toBeNull()
    expect(parsed.block?.controlsRaw).toBeTruthy()
    expect(parsed.block?.controlsRaw?.startsWith('widgets_controls:')).toBe(true)
  })

  it('does NOT silently return an empty controls map (the bug this fixes)', () => {
    const controls = parsed.block!.controlsParsed!
    expect(Object.keys(controls).length).toBeGreaterThan(0)
    expect(Object.keys(controls).length).toBe(61)
  })

  it('parses simple wysiwyg content controls', () => {
    const controls = parsed.block!.controlsParsed!
    expect(controls.title_text).toMatchObject({
      group: 'Заголовок',
      name: 'Заголовок',
      type: 'wysiwyg',
    })
    expect(controls.column_title_2).toMatchObject({
      group: 'Заголовки таблицы',
      name: 'Заголовок столбца 2',
      type: 'wysiwyg',
    })
  })

  it('parses the rows collection with a nested template', () => {
    const controls = parsed.block!.controlsParsed!
    const rows = controls.rows
    expect(rows).toBeDefined()
    expect(rows.type).toBe('collection')
    expect(rows.group).toBe('Строки')
    expect(rows.template).toBeDefined()
    expect(rows.template!.img).toMatchObject({
      type: 'file',
      name: 'Изображение',
      max_size: '204800',
      file_types: 'image/jpeg,image/png,image/gif,image/svg+xml',
    })
    expect(rows.template!.text_1).toMatchObject({ type: 'wysiwyg', name: 'Текст 1' })
    expect(rows.template!.text_4).toMatchObject({ type: 'wysiwyg', name: 'Текст 4' })
  })

  it('parses radio options with quoted Cyrillic labels', () => {
    const controls = parsed.block!.controlsParsed!
    expect(controls.section_container).toMatchObject({
      type: 'radio',
      options: { Обычный: 'container', 'На всю ширину': 'container-fluid' },
      builder_kind: 'design-desktop',
    })
    expect(controls.title_align).toMatchObject({
      type: 'radio',
      options: { Слева: 'left', 'По центру': 'center', Справа: 'right' },
    })
  })

  it('parses numeric range and validate.digits fields', () => {
    const controls = parsed.block!.controlsParsed!
    expect(controls.section_columns).toMatchObject({ type: 'range', min: 6, max: 12 })
    expect(controls.section_padding_top.validate).toEqual({ digits: 'true' })
  })

  it('recognizes the "fonts" control type (previously unrecognized)', () => {
    const controls = parsed.block!.controlsParsed!
    expect(controls.title_font_family?.type).toBe('fonts')
    expect(controls.header_font_family?.type).toBe('fonts')
    expect(controls.text_font_family?.type).toBe('fonts')
  })

  it('parses the "rows" content field value (array of objects) via the same engine', () => {
    const rowsField = parsed.block!.content.find((f) => f.key === 'rows')
    expect(rowsField).toBeDefined()
    expect(Array.isArray(rowsField!.value)).toBe(true)
    const items = rowsField!.value as Array<Record<string, unknown>>
    expect(items).toHaveLength(3)
    expect(items[0].text_1).toBe('Текст 1')
    expect(items[0].img).toBe(
      'https://cdn.example.com/builder/images/templates/card_image.svg',
    )
  })

  it('round-trips: serializing the parsed controls and re-parsing recovers the same keys', () => {
    const block = parsed.block!
    const controls = block.controlsParsed!
    const exported = exportWidgetBlock(block, controls)
    expect(exported).toContain('widgets_controls: {')

    const reParsed = parseControlsRaw(
      exported.split('#Контролы\n')[1] ?? '',
    )
    expect(Object.keys(reParsed).sort()).toEqual(Object.keys(controls).sort())
    expect(reParsed.rows.template).toBeDefined()
    expect(Object.keys(reParsed.rows.template!).sort()).toEqual(
      Object.keys(controls.rows.template!).sort(),
    )
  })

  it('gracefully returns {} for empty or malformed input instead of throwing', () => {
    expect(parseControlsRaw('')).toEqual({})
    expect(parseControlsRaw('   ')).toEqual({})
    expect(() => parseControlsRaw('widgets_controls: {oops')).not.toThrow()
  })
})
