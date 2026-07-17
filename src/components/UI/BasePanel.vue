<script setup lang="ts">
defineProps<{
  title?: string
  noPadding?: boolean
}>()
</script>

<template>
  <section class="flex min-h-0 flex-col overflow-hidden rounded-md border border-hairline bg-panel">
    <header
      v-if="title || $slots.header"
      class="flex shrink-0 items-center justify-between gap-2 border-b border-hairline px-3 py-2"
    >
      <slot name="header">
        <h3 class="font-mono text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">{{ title }}</h3>
      </slot>
      <div v-if="$slots.actions" class="flex gap-1.5">
        <slot name="actions" />
      </div>
    </header>
    <div class="flex min-h-0 flex-1 flex-col overflow-auto" :class="noPadding ? 'p-0' : 'p-3'">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="shrink-0 border-t border-hairline px-3 py-2">
      <slot name="footer" />
    </footer>
  </section>
</template>
