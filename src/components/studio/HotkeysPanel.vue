<script setup lang="ts">
const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform)
const mod = isMac ? '⌘' : 'Ctrl'

const bindings: { keys: string[]; label: string }[] = [
  { keys: [mod, 'S'], label: 'Экспорт' },
  { keys: [mod, 'E'], label: 'Восстановить контролы' },
  { keys: [mod, '⇧', 'N'], label: 'Нормализовать' },
  { keys: [mod, 'Z'], label: 'Отменить' },
  { keys: [mod, '⇧', 'Z'], label: 'Повторить' },
  { keys: [mod, '/'], label: 'Диагностика' },
]
</script>

<template>
  <div class="shrink-0 border-t border-hairline bg-panel px-3 py-2">
    <div class="mb-1.5 font-mono text-[9px] uppercase tracking-wide text-[var(--color-text-dim)]">
      Горячие клавиши
    </div>
    <ul class="flex flex-col gap-1">
      <li v-for="binding in bindings" :key="binding.label" class="flex items-center justify-between gap-2">
        <span class="flex gap-1">
          <kbd
            v-for="key in binding.keys"
            :key="key"
            class="rounded-sm border border-signal/30 bg-ink px-1.5 py-0.5 font-mono text-[10px] leading-none text-signal"
          >
            {{ key }}
          </kbd>
        </span>
        <span class="truncate text-[11px] text-[var(--color-text-muted)]">{{ binding.label }}</span>
      </li>
    </ul>
  </div>
</template>
