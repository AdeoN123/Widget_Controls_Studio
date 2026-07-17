<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'default' | 'primary' | 'ghost' | 'danger'
    size?: 'sm' | 'md'
    disabled?: boolean
  }>(),
  { variant: 'default', size: 'md', disabled: false },
)

defineEmits<{ click: [] }>()
</script>

<template>
  <button
    class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm border font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
    :class="[
      size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-[13px]',
      variant === 'default' && 'border-hairline bg-panel-elevated text-[var(--color-text)] hover:bg-hairline-strong',
      variant === 'primary' && 'border-accent bg-accent text-white hover:bg-[var(--color-accent-hover)]',
      variant === 'ghost' && 'border-transparent bg-transparent text-[var(--color-text-muted)] hover:bg-panel-elevated hover:text-[var(--color-text)]',
      variant === 'danger' && 'border-[var(--color-error)] bg-transparent text-[var(--color-error)]',
    ]"
    :disabled="disabled"
    type="button"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>
