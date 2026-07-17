import { describe, it, expect } from 'vitest'
import { parseWidgetBlock } from '@/modules/widget-block/parser'
import { mockTableBlock } from '@/constants/mockTableBlock'
import { validateControls, DiagnosticCodes } from './index'

/**
 * Регрессионный тест для задачи M2: validateControls раньше жёстко прописывал
 * каждую проверку (неверная группа, числовая валидация, конфигурация файла,
 * builder_kind, опции font_weight) отдельным if-блоком, дублируя знания,
 * уже выраженные в generator/rules.ts и controls/repair. Теперь это общий
 * diff с эталонным результатом generateControls(), управляемый небольшой
 * декларативной таблицей правил — каждая диагностика несёт явную категорию
 * вместо того, чтобы выводиться из строки кода дальше по цепочке.
 */
describe('validateControls — generic diff against canonical (M2)', () => {
  const parsed = parseWidgetBlock(mockTableBlock)
  const block = parsed.block!
  const controls = block.controlsParsed!

  it('the real block, as authored, validates cleanly against its own canonical shape where a canonical shape is known', () => {
    const issues = validateControls(block, controls)
    const uncoverable = ['section_container', 'section_columns', 'count_col']
    const relevant = issues.filter((i) => !uncoverable.includes(i.fieldKey ?? ''))
    expect(relevant).toEqual([])
  })

  it('every diagnostic carries an explicit category', () => {
    const broken = { ...controls, title_font_weight: { ...controls.title_font_weight, group: 'Wrong' } }
    const issues = validateControls(block, broken)
    expect(issues.length).toBeGreaterThan(0)
    for (const issue of issues) {
      expect(issue.category).toBe('controls')
    }
  })

  it('detects a wrong group via the generic diff', () => {
    const broken = { ...controls, title_text: { ...controls.title_text, group: 'Неправильно' } }
    const issues = validateControls(block, broken)
    expect(issues.some((i) => i.code === DiagnosticCodes.WRONG_GROUP && i.fieldKey === 'title_text')).toBe(true)
  })

  it('detects a wrong type via the generic diff', () => {
    const broken = { ...controls, title_text: { ...controls.title_text, type: 'textfield' as const } }
    const issues = validateControls(block, broken)
    expect(issues.some((i) => i.code === DiagnosticCodes.WRONG_TYPE && i.fieldKey === 'title_text')).toBe(true)
  })

  it('detects a numeric field missing validate.digits via the generic diff', () => {
    const broken = { ...controls, section_padding_top: { ...controls.section_padding_top, validate: undefined } }
    const issues = validateControls(block, broken)
    expect(
      issues.some((i) => i.code === DiagnosticCodes.NUMERIC_WITHOUT_VALIDATION && i.fieldKey === 'section_padding_top'),
    ).toBe(true)
  })

  it('detects a font_weight control with invalid option labels via the generic diff', () => {
    const broken = {
      ...controls,
      title_font_weight: { ...controls.title_font_weight, options: { '300': '300' } },
    }
    const issues = validateControls(block, broken)
    expect(
      issues.some((i) => i.code === DiagnosticCodes.INVALID_FONT_WEIGHT && i.fieldKey === 'title_font_weight'),
    ).toBe(true)
  })
})
