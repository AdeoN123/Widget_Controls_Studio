import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'

let initialized = false

const workerCache = new Map<string, Worker>()

export function setupMonacoEnvironment(): void {
  if (initialized) return
  initialized = true

  globalThis.MonacoEnvironment = {
    getWorker(_workerId: string, label: string) {
      const cached = workerCache.get(label)
      if (cached) return cached
      const worker = label === 'json' ? new jsonWorker() : new editorWorker()
      workerCache.set(label, worker)
      return worker
    },
  }
}

export function registerYamlLanguage(): void {
  setupMonacoEnvironment()
}

export async function loadMonaco() {
  setupMonacoEnvironment()
  const monaco = await import('monaco-editor')
  registerMonacoLanguages(monaco)
  return monaco
}

function registerMonacoLanguages(monaco: typeof import('monaco-editor')) {
  const langs = monaco.languages.getLanguages().map((l) => l.id)
  if (!langs.includes('yaml')) {
    monaco.languages.register({ id: 'yaml' })
    monaco.languages.setMonarchTokensProvider('yaml', {
      tokenizer: {
        root: [
          [/^#.*$/, 'comment'],
          [/^\s*[\w-]+:/, 'keyword'],
          [/"([^"\\]|\\.)*"/, 'string'],
          [/'([^'\\]|\\.)*'/, 'string'],
          [/\b(true|false)\b/, 'keyword'],
          [/\b\d+\b/, 'number'],
        ],
      },
    })
  }
}
