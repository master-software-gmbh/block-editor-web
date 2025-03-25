<template>
  <div class="image-preview" contenteditable="false">
    <img :src="source" />
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    source: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
})
</script>

<style lang="css" scoped>
.image-preview {
  display: flex;
  align-items: center;
  column-gap: 1rem;

  img {
    border-radius: var(--internal-block-editor-border-radius);
    width: 75px;
    height: 75px;
  }
}
</style>