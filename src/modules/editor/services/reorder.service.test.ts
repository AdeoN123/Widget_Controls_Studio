import { describe, it, expect } from 'vitest'
import { moveControlKey, reorderControls } from '@/modules/editor/services/reorder.service'

describe('reorder.service', () => {
  it('moves control keys', () => {
    const keys = ['a', 'b', 'c']
    expect(moveControlKey(keys, 0, 2)).toEqual(['b', 'c', 'a'])
  })

  it('reorders controls map', () => {
    const controls = {
      a: { key: 'a', group: 'G', name: 'A', type: 'textfield' as const, order: 0 },
      b: { key: 'b', group: 'G', name: 'B', type: 'textfield' as const, order: 1 },
    }
    const result = reorderControls(controls, ['b', 'a'])
    expect(result.b.order).toBe(0)
    expect(result.a.order).toBe(1)
  })
})
