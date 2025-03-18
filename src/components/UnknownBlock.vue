<template>
  <div data-element="block" :data-block-id="block.id" :data-block-type="block.type">
    <code>
      {{ block.content }}
    </code>
  </div>
</template>

<script lang="ts">
import type { CmsBlock } from 'bun-utilities/cms';
import { defineComponent, type PropType } from 'vue';

export default defineComponent({
  props: {
    block: {
      type: Object as PropType<CmsBlock>,
      required: true,
    },
  },
});
</script>