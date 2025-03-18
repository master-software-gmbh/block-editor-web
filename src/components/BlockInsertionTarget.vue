<template>
  <div :class="{ dragging }" data-element="insertion-target" contenteditable="false">
    <div @dragenter="handleDragEnter" @dragover="handleDragOver" @dragleave="handleDragLeave" @drop="handleDrop" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { DataTransferPayload } from '../types';

export default defineComponent({
  setup() {
    return {
      dragging: ref(false),
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
      this.dragging = false;
      const blockId = event.dataTransfer?.getData(DataTransferPayload.BlockId);

      if (blockId?.length) {
        this.$emit('move', blockId);
      }
    },
  },
});
</script>

<style lang="css" scoped>
[data-element="insertion-target"] {
  position: relative;
  height: 6px;
  border-radius: 1px;
  background-color: var(--block-editor-color-primary);
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