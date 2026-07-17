import { onMounted, onBeforeUnmount } from 'vue'
import { useEditorStore } from '@/stores/editorStore'
import { useWidgetBlockStore } from '@/stores/widgetBlockStore'

interface HotkeyBinding {
  key: string
  ctrl?: boolean
  shift?: boolean
  handler: () => void
  when?: () => boolean
}

export function useHotkeys() {
  const editorStore = useEditorStore()
  const blockStore = useWidgetBlockStore()

  const bindings: HotkeyBinding[] = [
    {
      key: 's',
      ctrl: true,
      handler: () => {
        const result = blockStore.exportBlock()
        navigator.clipboard.writeText(result).catch(() => {})
      },
      when: () => !editorStore.monacoFocused,
    },
    {
      key: 's',
      ctrl: true,
      handler: () => {
        const result = blockStore.exportBlock()
        navigator.clipboard.writeText(result).catch(() => {})
      },
      when: () => editorStore.monacoFocused,
    },
    {
      key: 'e',
      ctrl: true,
      handler: () => blockStore.repairControlsAction(),
      when: () => !editorStore.monacoFocused,
    },
    {
      key: 'n',
      ctrl: true,
      shift: true,
      handler: () => blockStore.normalizeBlock(),
    },
    {
      key: 'z',
      ctrl: true,
      handler: () => editorStore.undo(),
      when: () => !editorStore.monacoFocused,
    },
    {
      key: 'z',
      ctrl: true,
      shift: true,
      handler: () => editorStore.redo(),
      when: () => !editorStore.monacoFocused,
    },
    {
      key: 'y',
      ctrl: true,
      handler: () => editorStore.redo(),
      when: () => !editorStore.monacoFocused,
    },
    {
      key: '/',
      ctrl: true,
      handler: () => {
        editorStore.diagnosticsExpanded = !editorStore.diagnosticsExpanded
      },
    },
  ]

  function onKeyDown(event: KeyboardEvent) {
    const target = event.target
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement
    ) {
      return
    }

    for (const binding of bindings) {
      if (binding.when && !binding.when()) continue
      const ctrl = binding.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey
      const shift = binding.shift ? event.shiftKey : !event.shiftKey
      if (event.key.toLowerCase() === binding.key && ctrl && shift) {
        event.preventDefault()
        binding.handler()
        return
      }
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeyDown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown))
}
