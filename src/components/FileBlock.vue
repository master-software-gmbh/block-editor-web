<template>
  <div data-element="block" :data-block-id="block.id" :data-block-type="block.type">
    <template v-if="!file || file?.state === 'uploaded'">
      <AudioPlayer v-if="block.content.type.startsWith('audio')" :source="sourceUrl" :type="block.content.type">
        <div class="row">
          <div data-placeholder="Titel">
            {{ block.content.name }}
          </div>
          <button type="button" @click="$emit('remove', block.id)" data-display="plain"
            data-variant="tertiary">Entfernen</button>
        </div>
      </AudioPlayer>
      <ImagePreview v-else-if="block.content.type.startsWith('image')" :source="sourceUrl" :type="block.content.type">
        <div class="row">
          <div data-placeholder="Titel">
            {{ block.content.name }}
          </div>
          <button type="button" @click="$emit('remove', block.id)" data-display="plain"
            data-variant="tertiary">Entfernen</button>
        </div>
      </ImagePreview>
    </template>
    <template v-else>
      <LoadingSpinnerIcon v-if="file?.state === 'pending'" />
      <WarningIcon v-else-if="file?.state === 'error'" />
      <div data-placeholder="Titel">
        {{ block.content.name }}
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import AudioPlayer from './AudioPlayer.vue';
import type { FileRefBlock } from 'bun-utilities/cms';
import type { CmsFile } from '../types';
import LoadingSpinnerIcon from './icons/LoadingSpinnerIcon.vue';
import WarningIcon from './icons/WarningIcon.vue';
import ImagePreview from './ImagePreview.vue';

export default defineComponent({
  props: {
    block: {
      type: Object as PropType<FileRefBlock>,
      required: true,
    },
    file: {
      type: Object as PropType<CmsFile | undefined>,
      required: false,
    },
  },
  emits: ['remove'],
  computed: {
    sourceUrl() {
      return `/api/v1/files/${this.block.content.id}`;
    },
  },
  components: {
    AudioPlayer,
    ImagePreview,
    LoadingSpinnerIcon,
    WarningIcon,
  },
});
</script>

<style lang="css" scoped>
[data-block-type="file-ref"] {
  display: flex;
  column-gap: 0.5rem;
  align-items: center;

  border-radius: 4px;
  padding: 0.75rem;
  border: 1px solid var(--block-editor-color-secondary);

  svg {
    width: 40px;
    height: 40px;
    color: var(--block-editor-color-primary);
  }
}
</style>