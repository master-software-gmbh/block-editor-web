<template>
  <div data-element="block" :data-block-id="block.id" :data-block-type="block.type" contenteditable="false">
    <template v-if="!file || file?.state === 'uploaded'">
      <AudioPlayer v-if="block.content.type.startsWith('audio')" :source="source" :type="block.content.type">
        <div class="row">
          <div data-placeholder="Titel" data-editing-type="plain" data-editing-property="name" :contenteditable="editable">
            {{ block.content.name }}
          </div>
          <button v-if="editable" type="button" @click="$emit('remove', block.id)" data-display="plain"
            data-variant="tertiary">Entfernen</button>
        </div>
      </AudioPlayer>
      <ImageThumbnail v-else-if="block.content.type.startsWith('image')" :source="source">
        <div class="row">
          <div data-placeholder="Titel" data-editing-type="plain" data-editing-property="name" :contenteditable="editable">
            {{ block.content.name }}
          </div>
          <button v-if="editable" type="button" @click="$emit('remove', block.id)" data-display="plain"
            data-variant="tertiary">Entfernen</button>
        </div>
      </ImageThumbnail>
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
import type { FileBlockDto } from 'ts-utilities/cms';
import { type PropType, defineComponent } from 'vue';
import type { CmsFile } from '../types';
import AudioPlayer from './AudioPlayer.vue';
import ImageThumbnail from './ImageThumbnail.vue';
import LoadingSpinnerIcon from './icons/LoadingSpinnerIcon.vue';
import WarningIcon from './icons/WarningIcon.vue';

export default defineComponent({
  props: {
    block: {
      type: Object as PropType<FileBlockDto>,
      required: true,
    },
    file: {
      type: Object as PropType<CmsFile | undefined>,
      required: false,
    },
    source: {
      type: String,
      required: true,
    },
    editable: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['remove'],
  components: {
    AudioPlayer,
    ImageThumbnail,
    LoadingSpinnerIcon,
    WarningIcon,
  },
});
</script>

<style lang="css">
[data-block-type="file-ref"] {
  display: flex;
  column-gap: 0.5rem;
  align-items: center;

  border-radius: 4px;
  padding: 0.75rem;
  border: 1px solid var(--internal-block-editor-color-secondary);

  svg {
    width: 40px;
    height: 40px;
    color: var(--internal-block-editor-color-primary);
  }

  .row {
    width: 100%;
  }
}
</style>