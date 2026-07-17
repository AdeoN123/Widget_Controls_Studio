import type { WidgetSectionKind } from '../types'

const REQUIRED_SECTION = 'Обязательное'
const CONTENT_SECTION = 'Контент'
const CONTROLS_SECTION = 'Контролы'

export function detectSectionKind(title: string): WidgetSectionKind {
  const normalized = title.trim()
  if (normalized === REQUIRED_SECTION) return 'required'
  if (normalized === CONTENT_SECTION) return 'content'
  if (normalized === CONTROLS_SECTION) return 'controls'
  return 'style'
}

export function isSectionHeader(line: string): boolean {
  return line.trim().startsWith('#')
}

export function parseSectionTitle(line: string): string {
  return line.trim().replace(/^#+/, '').trim()
}

export function isFieldLine(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) return false
  return /^[a-z0-9_]+:/i.test(trimmed)
}

export { REQUIRED_SECTION, CONTENT_SECTION, CONTROLS_SECTION }
