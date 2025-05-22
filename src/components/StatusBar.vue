<template>
  <div>
    <p>{{ characterStatus }}, {{ wordStatus }}</p>
    <p v-if="status === 'saved'">
      <CheckCircleIcon />
      Gespeichert
    </p>
    <p v-else-if="status === 'saving'">
      <LoadingSpinnerIcon />
      Wird gespeichert
    </p>
  </div>
</template>

<script lang="ts">
import type { DocumentBlockDto } from 'bun-utilities/cms';
import { type PropType, defineComponent } from 'vue';
import type { EditorStatus } from '../editor/types';
import CheckCircleIcon from './icons/CheckCircleIcon.vue';
import LoadingSpinnerIcon from './icons/LoadingSpinnerIcon.vue';

export default defineComponent({
  props: {
    status: {
      type: String as PropType<EditorStatus>,
      required: true,
    },
    document: {
      type: Object as PropType<DocumentBlockDto>,
      required: true,
    },
  },
  computed: {
    wordStatus(): string {
      if (this.wordCount > 1) {
        return `${this.wordCount} Wörter`;
      }

      if (this.wordCount === 1) {
        return '1 Wort';
      }

      return '0 Wörter';
    },
    wordCount(): number {
      let count = 0;

      for (const block of this.document.children) {
        if ('text' in block.content) {
          count += block.content.text.split(/\s+/).filter((word) => word.length > 0).length;
        }
      }

      return count;
    },
    characterStatus(): string {
      return `${this.characterCount} Zeichen`;
    },
    characterCount(): number {
      let count = 0;

      for (const block of this.document.children) {
        if ('text' in block.content) {
          count += block.content.text.length;
        }
      }

      return count;
    },
  },
  components: {
    CheckCircleIcon,
    LoadingSpinnerIcon,
  },
});
</script>

<style lang="css" scoped>
div {
  display: flex;
  column-gap: 0.5em;
  align-items: center;
}

p {
  font-size: 0.8em;
  color: #666;
  margin: 0;
  display: flex;
  align-items: center;
}

svg {
  width: 1em;
  height: 1em;
}
</style>