<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import BlockStructurePanel from '@/components/studio/BlockStructurePanel.vue'
import HotkeysPanel from '@/components/studio/HotkeysPanel.vue'
import SectionFieldsPanel from '@/components/studio/SectionFieldsPanel.vue'
import FieldInspectorPanel from '@/components/studio/FieldInspectorPanel.vue'
import ControlInspectorPanel from '@/components/studio/ControlInspectorPanel.vue'
import BlockCodeTabs from '@/components/studio/BlockCodeTabs.vue'
import DiagnosticsPanel from '@/components/studio/DiagnosticsPanel.vue'
import AuditModePanel from '@/components/studio/AuditModePanel.vue'
import RepairScenariosPanel from '@/components/studio/RepairScenariosPanel.vue'
import CompareModePanel from '@/components/studio/CompareModePanel.vue'
import BulkEditCenter from '@/components/studio/BulkEditCenter.vue'
import ImportModal from '@/components/studio/ImportModal.vue'
import ExportModal from '@/components/studio/ExportModal.vue'
import ResizeHandle from '@/components/layout/ResizeHandle.vue'
import { useWidgetBlockStore } from '@/stores/widgetBlockStore'
import { useEditorStore } from '@/stores/editorStore'
import { useWidgetStudioStore } from '@/stores/widgetStudioStore'
import { useHotkeys } from '@/composables/useHotkeys'

import { useAuditStore } from '@/stores/auditStore'
import { useCompareStore } from '@/stores/compareStore'

const store = useWidgetBlockStore()
const editorStore = useEditorStore()
const studio = useWidgetStudioStore()
const auditStore = useAuditStore()
const compareStore = useCompareStore()
useHotkeys()

const sidebarWidth = ref(editorStore.layout.sidebarWidth)
const inspectorWidth = ref(editorStore.layout.inspectorWidth)
const codeHeight = ref(editorStore.layout.codePanelHeight)

const gridStyle = computed(() => ({
  gridTemplateColumns: `${sidebarWidth.value}px 4px 1fr 4px ${inspectorWidth.value}px`,
}))

const centerStyle = computed(() => ({
  gridTemplateRows: `1fr 4px ${codeHeight.value}px auto`,
}))

onMounted(() => {
  editorStore.initTheme()
  store.loadMockBlock()
  editorStore.seedHistory()
})

function onSidebarResize(w: number) {
  sidebarWidth.value = w
  editorStore.updateLayout({ sidebarWidth: w })
}

function onInspectorResize(w: number) {
  inspectorWidth.value = w
  editorStore.updateLayout({ inspectorWidth: w })
}

function onCodeResize(h: number) {
  codeHeight.value = h
  editorStore.updateLayout({ codePanelHeight: h })
}
</script>

<template>
  <div class="studio" :style="gridStyle">
    <aside class="studio__sidebar flex flex-col">
      <div class="min-h-0 flex-1 overflow-hidden">
        <BlockStructurePanel />
      </div>
      <HotkeysPanel />
    </aside>

    <ResizeHandle
      :initial="sidebarWidth"
      :min="180"
      :max="400"
      @resize="onSidebarResize"
    />

    <div class="studio__center" :style="centerStyle">
      <div class="studio__table">
        <SectionFieldsPanel />
      </div>

      <ResizeHandle
        direction="vertical"
        :initial="codeHeight"
        :min="160"
        :max="500"
        @resize="onCodeResize"
      />

      <div class="studio__code">
        <BlockCodeTabs />
      </div>

      <RepairScenariosPanel v-if="studio.showRepairPanel" />
      <CompareModePanel v-if="studio.showComparePanel && compareStore.isActive" />
      <AuditModePanel v-if="auditStore.isAuditMode" />
      <DiagnosticsPanel v-if="editorStore.diagnosticsExpanded && !auditStore.isAuditMode" />
    </div>

    <ResizeHandle
      side="right"
      :initial="inspectorWidth"
      :min="260"
      :max="480"
      @resize="onInspectorResize"
    />

    <aside class="studio__inspector">
      <FieldInspectorPanel />
      <ControlInspectorPanel />
    </aside>

    <BulkEditCenter v-if="studio.showBulkEditCenter" @close="studio.showBulkEditCenter = false" />
    <ImportModal v-if="editorStore.showImportModal" @close="editorStore.showImportModal = false" />
    <ExportModal v-if="editorStore.showExportModal" @close="editorStore.showExportModal = false" />
  </div>
</template>

<style scoped>
.studio {
  display: grid;
  height: 100%;
  overflow: hidden;
}

.studio__sidebar {
  overflow: hidden;
  border-right: none;
}

.studio__center {
  display: grid;
  min-width: 0;
  overflow: hidden;
}

.studio__table {
  min-height: 0;
  overflow: hidden;
}

.studio__code {
  min-height: 0;
  overflow: hidden;
}

.studio__inspector {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  overflow-y: auto;
  background: var(--color-bg-app);
}

</style>
