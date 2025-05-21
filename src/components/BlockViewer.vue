<template>
  <RootWrapper>
    <TitleBlock :title="document.content.title" />

    <div class="blocks">
      <template v-for="block in document.children">
        <RichTextBlock v-if="block.type === 'rich-text'" :block="block" />
        <FileBlock v-else-if="block.type === 'file-ref'" :block="block" :source="getFileSourceUrl(block.content.id)"
          :editable="false" />
      </template>
    </div>

    <div>
      <slot name="bottom"></slot>
    </div>

  </RootWrapper>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue';
import FileBlock from './FileBlock.vue';
import RichTextBlock from './RichTextBlock.vue';
import TitleBlock from './TitleBlock.vue';
import BlockWrapper from './BlockWrapper.vue';
import RootWrapper from './RootWrapper.vue';
import type { DocumentBlock } from 'bun-utilities/cms';

export default defineComponent({
  props: {
    document: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const getFileSourceUrl = inject<(fileId: string) => string>('getFileSourceUrl');

    if (!getFileSourceUrl) {
      throw new Error('Missing dependencies');
    }

    const document: DocumentBlock = JSON.parse(props.document);
    console.log('Document:', document);

    return {
      document: document,
      getFileSourceUrl: getFileSourceUrl,
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