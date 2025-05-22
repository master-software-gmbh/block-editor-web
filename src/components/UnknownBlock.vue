<template>
  <div data-element="block" :data-block-id="block.id" :data-block-type="block.type">
    <code>
      {{ block.content }}
    </code>
  </div>
</template>

<script lang="ts">
import type { BaseBlock } from 'bun-utilities/cms';
import { type PropType, defineComponent } from 'vue';

export default defineComponent({
  props: {
    block: {
      type: Object as PropType<BaseBlock>,
      required: true,
    },
  },
});
</script>