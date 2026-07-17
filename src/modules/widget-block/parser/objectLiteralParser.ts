export type ParsedLiteralValue =
  | string
  | number
  | boolean
  | ParsedLiteralValue[]
  | { [key: string]: ParsedLiteralValue }

type TokenType =
  | 'brace_open'
  | 'brace_close'
  | 'bracket_open'
  | 'bracket_close'
  | 'colon'
  | 'comma'
  | 'string'
  | 'number'
  | 'identifier'

interface Token {
  type: TokenType
  value: string
}

const PUNCTUATION: Record<string, TokenType> = {
  '{': 'brace_open',
  '}': 'brace_close',
  '[': 'bracket_open',
  ']': 'bracket_close',
  ':': 'colon',
  ',': 'comma',
}

function tokenize(text: string): Token[] {
  const tokens: Token[] = []
  const len = text.length
  let i = 0

  while (i < len) {
    const ch = text[i]

    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      i++
      continue
    }

    if (ch in PUNCTUATION) {
      tokens.push({ type: PUNCTUATION[ch], value: ch })
      i++
      continue
    }

    if (ch === '"' || ch === "'") {
      const quote = ch
      let value = ''
      i++
      while (i < len && text[i] !== quote) {
        if (text[i] === '\\' && i + 1 < len) {
          const next = text[i + 1]
          if (next === 'n') value += '\n'
          else if (next === 't') value += '\t'
          else value += next
          i += 2
          continue
        }
        value += text[i]
        i++
      }
      i++
      tokens.push({ type: 'string', value })
      continue
    }

    if (ch === '-' || (ch >= '0' && ch <= '9')) {
      const start = i
      i++
      while (i < len && ((text[i] >= '0' && text[i] <= '9') || text[i] === '.')) i++
      tokens.push({ type: 'number', value: text.slice(start, i) })
      continue
    }

    if (/[A-Za-z_]/.test(ch)) {
      const start = i
      i++
      while (i < len && /[A-Za-z0-9_]/.test(text[i])) i++
      tokens.push({ type: 'identifier', value: text.slice(start, i) })
      continue
    }

    i++
  }

  return tokens
}

class TokenCursor {
  private pos = 0

  constructor(private readonly tokens: Token[]) {}

  peek(): Token | undefined {
    return this.tokens[this.pos]
  }

  next(): Token | undefined {
    return this.tokens[this.pos++]
  }

  expect(type: TokenType): Token {
    const token = this.next()
    if (!token || token.type !== type) {
      throw new Error(`Expected ${type} but got ${token ? token.type : 'end of input'}`)
    }
    return token
  }
}

function parseValue(cursor: TokenCursor): ParsedLiteralValue {
  const token = cursor.peek()
  if (!token) throw new Error('Unexpected end of input while parsing value')

  if (token.type === 'brace_open') return parseObjectValue(cursor)
  if (token.type === 'bracket_open') return parseArrayValue(cursor)

  if (token.type === 'string') {
    cursor.next()
    return token.value
  }

  if (token.type === 'number') {
    cursor.next()
    return Number(token.value)
  }

  if (token.type === 'identifier') {
    cursor.next()
    if (token.value === 'true') return true
    if (token.value === 'false') return false
    return token.value
  }

  throw new Error(`Unexpected token ${token.type} while parsing value`)
}

function parseKey(cursor: TokenCursor): string {
  const token = cursor.next()
  if (!token) throw new Error('Unexpected end of input while parsing key')
  if (token.type === 'string' || token.type === 'identifier') return token.value
  throw new Error(`Unexpected token ${token.type} while parsing key`)
}

function parseObjectValue(cursor: TokenCursor): { [key: string]: ParsedLiteralValue } {
  cursor.expect('brace_open')
  const result: { [key: string]: ParsedLiteralValue } = {}

  if (cursor.peek()?.type === 'brace_close') {
    cursor.next()
    return result
  }

  while (true) {
    const key = parseKey(cursor)
    cursor.expect('colon')
    result[key] = parseValue(cursor)

    if (cursor.peek()?.type === 'comma') {
      cursor.next()
      if (cursor.peek()?.type === 'brace_close') break
      continue
    }
    break
  }

  cursor.expect('brace_close')
  return result
}

function parseArrayValue(cursor: TokenCursor): ParsedLiteralValue[] {
  cursor.expect('bracket_open')
  const result: ParsedLiteralValue[] = []

  if (cursor.peek()?.type === 'bracket_close') {
    cursor.next()
    return result
  }

  while (true) {
    result.push(parseValue(cursor))

    if (cursor.peek()?.type === 'comma') {
      cursor.next()
      if (cursor.peek()?.type === 'bracket_close') break
      continue
    }
    break
  }

  cursor.expect('bracket_close')
  return result
}

/** Разбирает одно значение в синтаксисе JS-объект-литерала (объект, массив, строка или число). */
export function parseObjectLiteral(text: string): ParsedLiteralValue {
  const tokens = tokenize(text)
  const cursor = new TokenCursor(tokens)
  return parseValue(cursor)
}

export function isPlainObjectLiteral(
  value: ParsedLiteralValue | undefined,
): value is { [key: string]: ParsedLiteralValue } {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
