import { describe, it, expect } from 'vitest'
import { HistoryManager } from './services/historyManager'
import { diffSnapshots } from './services/historyDiff'
import { snapshotsEqual } from './services/snapshotBuilder'
import type { WidgetStudioSnapshot } from './model/history.types'

function snap(raw: string, controls = '{}'): WidgetStudioSnapshot {
  return {
    rawInput: raw,
    controlsJson: controls,
    selectedSectionId: null,
    selectedFieldKey: null,
    selectedControlKey: null,
    selectedFieldKeys: [],
    selectedControlKeys: [],
  }
}

describe('HistoryManager', () => {
  it('commits before/after entries', () => {
    const manager = new HistoryManager()
    const before = snap('a')
    const after = snap('b')

    manager.commit('raw-edit', before, after)
    expect(manager.canUndo).toBe(true)
    expect(manager.entries[0]?.title).toBe('raw-edit')
  })

  it('supports undo/redo with snapshot restoration targets', () => {
    const manager = new HistoryManager()
    manager.commit('step-1', snap('a'), snap('b'))
    manager.commit('step-2', snap('b'), snap('c'))

    const undone = manager.undo()
    expect(undone?.after.rawInput).toBe('c')
    expect(undone?.before.rawInput).toBe('b')

    const redone = manager.redo()
    expect(redone?.after.rawInput).toBe('c')
  })

  it('deduplicates identical snapshots', () => {
    const manager = new HistoryManager()
    manager.commit('a', snap('x'), snap('y'))
    manager.commit('b', snap('y'), snap('y'))
    expect(manager.entries).toHaveLength(1)
  })
})

describe('history diff', () => {
  it('summarizes control count changes', () => {
    const before = snap('x', '{"a":{}}')
    const after = snap('x', '{"a":{},"b":{}}')
    const diff = diffSnapshots(before, after)
    expect(diff.controlsChanged).toBe(true)
    expect(diff.controlCountDelta).toBe(1)
  })

  it('detects equal snapshots', () => {
    const a = snap('same', '{"k":1}')
    const b = snap('same', '{"k":1}')
    expect(snapshotsEqual(a, b)).toBe(true)
  })
})
