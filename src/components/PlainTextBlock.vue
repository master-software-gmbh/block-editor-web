<template>
  <div data-element="block" :autofocus="autofocus" :data-block-id="block.id" :data-block-type="block.type"
    :data-placeholder="placeholder">
    <span data-editing-mode="plain">{{ block.content.text }}</span>
  </div>
</template>

<script lang="ts">
import type { PlainTextBlock } from 'ts-utilities/cms';
import { type PropType, defineComponent } from 'vue';

export default defineComponent({
  props: {
    block: {
      type: Object as PropType<PlainTextBlock>,
      required: true,
    },
    placeholder: {
      type: String,
      required: false,
    },
    autofocus: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
});
</script>

<style lang="css" scoped>
[data-block-type="plain-text"] {
  margin: 0.5rem 0;
}
</style>