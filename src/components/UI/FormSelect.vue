<script setup lang="ts">
defineProps<{
  label: string
}>()

const model = defineModel<string>({ default: '' })
</script>

<template>
  <label class="flex flex-col gap-1">
    <span class="font-mono text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">{{ label }}</span>
    <select
      v-model="model"
      class="rounded-sm border border-hairline bg-input px-2 py-1.5 text-[12px] text-[var(--color-text)] outline-none transition-colors focus:border-accent"
    >
      <slot />
    </select>
  </label>
</template>
