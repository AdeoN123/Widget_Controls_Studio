import { onMounted, onBeforeUnmount, watch, type Ref } from 'vue'
import { loadMonaco } from '@/modules/editor/monaco/setup'
import type { EditorDiagnostic, EditorLanguage } from '@/modules/editor/types'

const languageMap: Record<EditorLanguage, string> = {
  yaml: 'yaml',
  javascript: 'javascript',
  json: 'json',
  plaintext: 'plaintext',
}

interface PropsRefs {
  modelValue: Ref<string>
  language?: Ref<EditorLanguage | undefined>
  readonly?: Ref<boolean | undefined>
  diagnostics?: Ref<EditorDiagnostic[] | undefined>
  formatOnMount?: Ref<boolean | undefined>
}

export function useMonacoEditor(
  container: Ref<HTMLElement | null>,
  props: PropsRefs,
  emit: {
    (e: 'update:modelValue', value: string): void
    (e: 'save'): void
    (e: 'focus-field', payload: { line: number }): void
    (e: 'focus'): void
    (e: 'blur'): void
  },
) {
  let editor: import('monaco-editor').editor.IStandaloneCodeEditor | null = null
  let monaco: typeof import('monaco-editor') | null = null
  let suppressEmit = false
  let lastSetValue: string | null = null

  async function init() {
    if (!container.value) return
    monaco = await loadMonaco()

    lastSetValue = props.modelValue.value
    editor = monaco.editor.create(container.value, {
      value: props.modelValue.value,
      language: languageMap[props.language?.value ?? 'plaintext'],
      readOnly: props.readonly?.value ?? false,
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      fontSize: 12,
      fontFamily: 'JetBrains Mono, Fira Code, ui-monospace, monospace',
      lineNumbers: 'on',
      theme: document.documentElement.getAttribute('data-theme') === 'light' ? 'vs' : 'vs-dark',
    })

    editor.onDidChangeModelContent(() => {
      if (suppressEmit || !editor) return
      const v = editor.getValue()
      lastSetValue = v
      emit('update:modelValue', v)
    })

    editor.onDidFocusEditorText(() => emit('focus'))
    editor.onDidBlurEditorText(() => emit('blur'))

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      emit('save')
    })

    applyDiagnostics()
    if (props.formatOnMount?.value && props.language?.value === 'json') {
      editor.getAction('editor.action.formatDocument')?.run()
    }
  }

  function applyDiagnostics() {
    if (!editor || !monaco) return
    const model = editor.getModel()
    if (!model) return

    const markers: import('monaco-editor').editor.IMarkerData[] = (props.diagnostics?.value ?? []).map(
      (d) => ({
        startLineNumber: d.line,
        startColumn: d.column,
        endLineNumber: d.endLine ?? d.line,
        endColumn: d.endColumn ?? d.column + 1,
        message: d.message,
        severity:
          d.severity === 'error'
            ? monaco!.MarkerSeverity.Error
            : d.severity === 'warning'
              ? monaco!.MarkerSeverity.Warning
              : monaco!.MarkerSeverity.Info,
      }),
    )

    monaco.editor.setModelMarkers(model, 'wcs', markers)
  }

  function setValue(value: string) {
    if (!editor || lastSetValue === value) return
    lastSetValue = value
    suppressEmit = true
    editor.setValue(value)
    suppressEmit = false
  }

  function setTheme(isLight: boolean) {
    if (!monaco) return
    monaco.editor.setTheme(isLight ? 'vs' : 'vs-dark')
  }

  function dispose() {
    editor?.dispose()
    editor = null
  }

  onMounted(init)
  onBeforeUnmount(dispose)

  watch(() => props.modelValue.value, setValue)
  watch(
    () => props.language?.value,
    (lang) => {
      if (!editor || !monaco) return
      const model = editor.getModel()
      if (model) monaco.editor.setModelLanguage(model, languageMap[lang ?? 'plaintext'])
    },
  )
  watch(
    () => props.readonly?.value,
    (ro) => editor?.updateOptions({ readOnly: ro }),
  )
  watch(() => props.diagnostics?.value, applyDiagnostics, { deep: true })

  return { setTheme, dispose }
}
