<template>
  <div data-element="editor-root">
    <slot></slot>
    <ImagePreview />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ImagePreview from './ImagePreview.vue';

export default defineComponent({
  components: {
    ImagePreview,
  },
});
</script>
