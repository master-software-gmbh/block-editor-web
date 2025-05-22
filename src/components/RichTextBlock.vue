<template>
  <div data-element="block" :autofocus="autofocus" :data-block-id="block.id" :data-block-type="block.type">
    <span v-for="(span, index) in block.content.spans" :class="span.attributes" data-element="span"
      :data-span-index="index" data-editing-mode="rich" :data-placeholder="index === 0 ? placeholder : undefined">
      {{ span.text }}
    </span>
  </div>
</template>

<script lang="ts">
import type { RichTextBlockDto } from 'bun-utilities/cms';
import { type PropType, defineComponent } from 'vue';

export default defineComponent({
  props: {
    block: {
      type: Object as PropType<RichTextBlockDto>,
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
  min-height: 1.4em;
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