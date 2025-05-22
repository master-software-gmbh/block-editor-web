<template>
  <div class="block-wrapper" :class="{ dragging: isDragged }">
    <slot></slot>
    <div class="dragger" contenteditable="false" :draggable="true" @dragstart="handleDragStart"
      @dragend="handleDragEnd"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { DataTransferPayload } from '../types';

export default defineComponent({
  props: {
    blockId: {
      type: String,
      required: true,
    },
  },
  setup() {
    return {
      isDragged: ref(false),
    };
  },
  methods: {
    handleDragStart(event: DragEvent) {
      if (event.dataTransfer) {
        this.isDragged = true;
        event.dataTransfer.setData(DataTransferPayload.BlockId, this.blockId);
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.dropEffect = 'move';
      }
    },
    handleDragEnd(_event: DragEvent) {
      this.isDragged = false;
    },
  },
});
</script>

<style lang="css">
.dragger {
  position: absolute;
  top: 0;
  right: 100%;
  margin-right: 2px;
  width: 20px;
  height: 20px;
  opacity: 0;
  cursor: grab;
  background-repeat: no-repeat;
  background-size: contain;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='currentColor'%3E%3Cpath d='M360-160q-33 0-56.5-23.5T280-240q0-33 23.5-56.5T360-320q33 0 56.5 23.5T440-240q0 33-23.5 56.5T360-160Zm240 0q-33 0-56.5-23.5T520-240q0-33 23.5-56.5T600-320q33 0 56.5 23.5T680-240q0 33-23.5 56.5T600-160ZM360-400q-33 0-56.5-23.5T280-480q0-33 23.5-56.5T360-560q33 0 56.5 23.5T440-480q0 33-23.5 56.5T360-400Zm240 0q-33 0-56.5-23.5T520-480q0-33 23.5-56.5T600-560q33 0 56.5 23.5T680-480q0 33-23.5 56.5T600-400ZM360-640q-33 0-56.5-23.5T280-720q0-33 23.5-56.5T360-800q33 0 56.5 23.5T440-720q0 33-23.5 56.5T360-640Zm240 0q-33 0-56.5-23.5T520-720q0-33 23.5-56.5T600-800q33 0 56.5 23.5T680-720q0 33-23.5 56.5T600-640Z'/%3E%3C/svg%3E");
  transition: opacity 0.2s;
}

.block-wrapper {
  z-index: 2;
  position: relative;

  &.dragging .dragger {
    cursor: grabbing;
  }

  &:hover .dragger {
    opacity: 0.3;
  }
}
</style>