<template>
  <div class="image-preview" contenteditable="false">
    <img :src="source" @click="showPreview" />
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useImagePreview } from '../composables/useImagePreview';

export default defineComponent({
  inject: ['preview'],
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
  methods: {
    showPreview() {
      const { setPreview } = useImagePreview();
      setPreview(this.source);
    },
  },
})
</script>

<style lang="css" scoped>
.image-preview {
  width: 100%;
  display: flex;
  column-gap: 1rem;
  align-items: center;

  >img {
    width: 50px;
    height: 50px;
    flex-shrink: 0;
    object-fit: cover;
    border-radius: var(--internal-block-editor-border-radius);
  }
}
</style>