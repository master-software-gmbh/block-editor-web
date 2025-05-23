<template>
  <div :class="{ dragging }" data-element="insertion-target" contenteditable="false">
    <div @dragenter="handleDragEnter" @dragover="handleDragOver" @dragleave="handleDragLeave" @drop="handleDrop"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { DataTransferPayload } from '../types';
import { Configuration } from '../config';
import { useConfig } from '../composables/useConfig';

export default defineComponent({
  setup() {
    const config = useConfig();

    return {
      dragging: ref(false),
      fileUpload: config.isEnabled(Configuration.Feature.FileUpload),
    };
  },
  methods: {
    handleDragEnter(event: DragEvent) {
      event.preventDefault();
      this.dragging = true;
    },
    handleDragOver(event: DragEvent) {
      event.preventDefault();
    },
    handleDragLeave(_event: DragEvent) {
      this.dragging = false;
    },
    handleDrop(event: DragEvent) {
      event.preventDefault();
      this.dragging = false;

      if (!event.dataTransfer) {
        return;
      }

      const blockId = event.dataTransfer.getData(DataTransferPayload.BlockId);

      if (blockId?.length) {
        this.$emit('move', blockId);
      }

      // Handle file drop

      if (!this.fileUpload) {
        return;
      }

      if (event.dataTransfer.items) {
        [...event.dataTransfer.items].forEach((item, i) => {
          if (item.kind === 'file') {
            const file = item.getAsFile();

            if (file) {
              this.$emit('file', file);
            }
          }
        });
      } else {
        [...event.dataTransfer.files].forEach((file, i) => {
          this.$emit('file', file);
        });
      }
    },
  },
});
</script>

<style lang="css" scoped>
[data-element="insertion-target"] {
  position: relative;
  height: 6px;
  border-radius: var(--internal-block-editor-border-radius);
  background-color: var(--internal-block-editor-color-primary);
  transition: opacity 0.2s;
  opacity: 0;

  &.dragging {
    opacity: 0.25;
  }

  >div {
    height: 60px;
    width: 100%;
    left: -32px;
    position: relative;
    transform: translateY(-50%);
    top: 50%;
  }
}
</style>