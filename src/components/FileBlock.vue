<template>
  <div data-element="block" :data-block-id="block.id" :data-block-type="block.type">
    <template v-if="!file || file.state === 'uploaded'">
      <AudioPlayer :source="sourceUrl" :type="block.content.type">
        <div class="row">
          <div data-backspace-target ref="element" data-placeholder="Titel">{{ block.content.name
          }}</div>
          <button type="button" @click="$emit('remove', block.id)" data-display="plain"
            data-variant="tertiary">Entfernen</button>
        </div>
      </AudioPlayer>
    </template>
    <template v-else>
      <svg v-if="file.state === 'pending'" width="100%" height="100%" viewBox="0 0 24 24" version="1.1"
        xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve"
        xmlns:serif="http://www.serif.com/"
        style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" class="loading_spinner"
        fill="currentColor">
        <clipPath id="_clip1">
          <rect x="1.944" y="1.951" width="10.056" height="10.056" />
        </clipPath>
        <g clip-path="url(#_clip1)">
          <path
            d="M12,1.951C17.55,1.951 22.056,6.457 22.056,12.007C22.056,17.557 17.55,22.063 12,22.063C6.45,22.063 1.944,17.557 1.944,12.007C1.944,6.457 6.45,1.951 12,1.951ZM12,3.951C7.554,3.951 3.944,7.561 3.944,12.007C3.944,16.453 7.554,20.063 12,20.063C16.446,20.063 20.056,16.453 20.056,12.007C20.056,7.561 16.446,3.951 12,3.951Z" />
        </g>
      </svg>
      <svg v-else-if="file.state === 'error'" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960"
        width="24px" fill="currentColor">
        <path
          d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
      </svg>
      <svg v-else-if="file.type === 'audio'" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960"
        width="24px" fill="currentColor">
        <path
          d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm0-240Zm-40 520v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Zm40-360q17 0 28.5-11.5T520-520v-240q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v240q0 17 11.5 28.5T480-480Z" />
      </svg>
      <div data-backspace-target ref="element" data-placeholder="Titel">{{ block.content.name }}
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import AudioPlayer from './AudioPlayer.vue';
import type { FileRefBlock } from 'bun-utilities/cms';
import type { CmsFile } from '../types';

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

  .loading_spinner {
    transform-origin: center;
    animation: loading_spinner .75s infinite linear;
  }

  @keyframes loading_spinner {
    100% {
      transform: rotate(360deg);
    }
  }
}
</style>