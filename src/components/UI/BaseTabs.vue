<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  tabs: { id: string; label: string; badge?: number }[]
  modelValue: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const active = ref(props.modelValue)

watch(
  () => props.modelValue,
  (v) => {
    active.value = v
  },
)

function select(id: string) {
  active.value = id
  emit('update:modelValue', id)
}
</script>

<template>
  <div class="flex shrink-0 border-b border-hairline">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="border-b-2 px-3.5 py-2 font-mono text-[11px] font-semibold uppercase tracking-wide transition-colors"
      :class="active === tab.id
        ? 'border-accent text-accent'
        : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'"
      type="button"
      @click="select(tab.id)"
    >
      {{ tab.label }}
      <span v-if="tab.badge" class="ml-1 rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] text-accent">{{ tab.badge }}</span>
    </button>
  </div>
</template>
