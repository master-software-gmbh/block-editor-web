<template>
  <div data-element="block" :autofocus="autofocus" :data-block-id="block.id" :data-block-type="block.type"
    :data-placeholder="placeholder">
    <h1>{{ block.content.text }}</h1>
  </div>
</template>

<script lang="ts">
import type { HeadingBlock } from 'bun-utilities/cms';
import { defineComponent, type PropType } from 'vue';

export default defineComponent({
  props: {
    block: {
      type: Object as PropType<HeadingBlock>,
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
  computed: {
    headingTag() {
      return `h${this.block.content.level}`;
    },
  },
});
</script>