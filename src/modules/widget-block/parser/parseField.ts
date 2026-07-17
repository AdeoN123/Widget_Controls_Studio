import { parseObjectLiteral } from './objectLiteralParser'

export interface ParsedFieldLine {
  key: string
  rawValue: string
  value: unknown
}

export function parseBlockField(line: string): ParsedFieldLine | null {
  const trimmed = line.trim()
  if (!trimmed) return null

  const colonIndex = trimmed.indexOf(':')
  if (colonIndex <= 0) return null

  const key = trimmed.slice(0, colonIndex).trim()
  const rawValue = trimmed.slice(colonIndex + 1).trim()

  if (!/^[a-z0-9_]+$/i.test(key)) return null

  return {
    key,
    rawValue,
    value: parseFieldValue(rawValue),
  }
}

function parseFieldValue(raw: string): unknown {
  if (raw === 'true' || raw === 'false') return raw === 'true'
  if (raw === '""' || raw === "''") return ''
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    return raw.slice(1, -1)
  }
  if (raw.startsWith('[') || raw.startsWith('{')) {
    try {
      return parseObjectLiteral(raw)
    } catch {
      return raw
    }
  }
  return raw
}
