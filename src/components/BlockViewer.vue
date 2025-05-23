<template>
  <RootWrapper>
    <TitleBlock :title="document.content.title" />

    <div class="blocks">
      <template v-for="block in document.children">
        <RichTextBlock v-if="block.type === 'rich-text'" :block="block" />
        <FileBlock v-else-if="block.type === 'file-ref' && getFileSourceUrl" :block="block"
          :source="getFileSourceUrl(block.content.id)" :editable="false" />
      </template>
    </div>

    <div>
      <slot name="bottom"></slot>
    </div>

  </RootWrapper>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BlockWrapper from './BlockWrapper.vue';
import FileBlock from './FileBlock.vue';
import RichTextBlock from './RichTextBlock.vue';
import RootWrapper from './RootWrapper.vue';
import TitleBlock from './TitleBlock.vue';
import { useConfig } from '../composables/useConfig';
import { useDocument } from '../composables/useDocument';

export default defineComponent({
  setup() {
    const config = useConfig();
    const document = useDocument();

    return {
      document: document,
      getFileSourceUrl: config.callbacks.getFileSourceUrl,
    };
  },
  components: {
    FileBlock,
    TitleBlock,
    RootWrapper,
    BlockWrapper,
    RichTextBlock,
  },
});
</script>

<style scoped>
.blocks {
  display: flex;
  row-gap: 0.5em;
  margin-top: 6px;
  flex-direction: column;
}
</style>