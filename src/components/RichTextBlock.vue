<template>
  <div data-element="block" :autofocus="autofocus" :data-block-id="block.id" :data-block-type="block.type"
    :data-placeholder="placeholder">
    <span v-for="(span, index) in block.content.spans" :class="span.attributes" data-element="span"
      :data-span-index="index" data-editing-mode="rich">
      {{ span.text }}
    </span>
  </div>
</template>

<script lang="ts">
import type { RichTextBlock } from 'bun-utilities/cms';
import { defineComponent, type PropType } from 'vue';

export default defineComponent({
  props: {
    block: {
      type: Object as PropType<RichTextBlock>,
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

<style lang="css">
[data-block-type="rich-text"] {
  min-height: 1em;
  line-height: 1em;
  margin: 0.5rem 0;

  .bold {
    font-weight: bold;
  }

  .underline {
    text-decoration: underline;
  }

  .italic {
    font-style: italic;
  }
}
</style>