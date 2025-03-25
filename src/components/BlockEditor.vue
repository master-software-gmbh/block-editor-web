<template>
  <div data-element="editor" contenteditable @beforeinput="handleBeforeInput" @keydown="handleKeydown">
    <TitleBlock :title="document.title" />

    <div contenteditable="false">
      <slot name="title" :onSave="handleSave" :onAddAudio="handleAddAudio" :onAddImage="handleAddImage"
        :onFormatBold="() => handleFormatBold()" :onFormatItalic="() => handleFormatItalic()"
        :onFormatUnderline="() => handleFormatUnderline()"></slot>
    </div>

    <template v-for="(block, index) in document.blocks">
      <BlockInsertionTarget @move="(id) => handleMove(id, index)" />
      <BlockWrapper :block-id="block.id">
        <PlainTextBlock v-if="block.type === 'plain-text'" :block="block" />
        <RichTextBlock v-else-if="block.type === 'rich-text'" :block="block" />
        <HeadingBlock v-else-if="block.type === 'heading'" :block="block" />
        <FileBlock v-else-if="block.type === 'file-ref'" :block="block" :file="files[block.content.id]" />
        <UnknownBlock v-else="block.type" :block="block" />
      </BlockWrapper>
    </template>

    <BlockInsertionTarget @move="(id) => handleMove(id, document.blocks.length)" />

    <div contenteditable="false">
      <slot name="bottom" :onSave="handleSave"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import type { CmsFile } from '../types';
import { Booleanish, KeyName } from '../utilities';
import BlockInsertionTarget from './BlockInsertionTarget.vue';
import FileBlock from './FileBlock.vue';
import HeadingBlock from './HeadingBlock.vue';
import RichTextBlock from './RichTextBlock.vue';
import PlainTextBlock from './PlainTextBlock.vue';
import TitleBlock from './TitleBlock.vue';
import type { FileRefBlock, StandardBlock, StandardDocument } from 'bun-utilities/cms';
import { HTMLBlockEditor } from '../editor/html-editor';
import UnknownBlock from './UnknownBlock.vue';
import BlockWrapper from './BlockWrapper.vue';
import { withConstantTime } from 'bun-utilities/time';
import type { EditorState } from '../editor/types';
import { logger } from 'bun-utilities/logging';

const htmlEditor = new HTMLBlockEditor();

export default defineComponent({
  props: {
    document: {
      type: String,
      required: true,
    },
    editable: {
      type: Booleanish,
      required: true,
    },
  },
  setup(props) {
    const document = JSON.parse(props.document);

    console.log('Document:', document);

    return {
      document: ref<StandardDocument>(document),
      files: ref<Record<string, CmsFile>>({}),
    };
  },
  computed: {
    placeholder(): string | undefined {
      return this.editable && this.isEmptyDocument ? 'Beginne zu schreiben..' : undefined;
    },
    isEmptyDocument() {
      for (const block of this.document.blocks) {
        if ('text' in block.content && block.content.text.trim().length) {
          return false;
        }
      }

      return true;
    },
  },
  mounted() {
    // Focus first block
  },
  methods: {
    handleBeforeInput(event: InputEvent) {
      const range = event.getTargetRanges().at(0);

      if (!range) {
        logger.warn('Received beforeinput event without range', { type: event.inputType });
        return;
      }

      const data = this.getPlainInputData(event);

      switch (event.inputType) {
        case 'insertText': {
          if (!data) return;
          event.preventDefault();
          return this.handleInsertText(range, data);
        }
        case 'insertLineBreak':
        case 'insertParagraph':
          event.preventDefault();
          return this.handleInsertParagraph(range);
        case 'insertFromPaste':
          if (!data) return;
          event.preventDefault();
          return this.handlePaste(range, data);
        case 'formatBold':
          event.preventDefault();
          return this.handleFormatBold(range);
        case 'formatItalic':
          event.preventDefault();
          return this.handleFormatItalic(range);
        case 'formatUnderline':
          event.preventDefault();
          return this.handleFormatUnderline(range);
        case 'deleteContentBackward':
          event.preventDefault();
          return this.handleDeleteContentBackward(range);
        case 'insertReplacementText':
          if (!data) return;
          event.preventDefault();
          return this.handleInsertText(range, data);
        case 'deleteByCut':
        case 'deleteSoftLineBackward':
          return;
        default:
          logger.warn('Unhandled beforeinput event', { type: event.inputType });
          event.preventDefault();
      }
    },
    getPlainInputData(event: InputEvent): string | undefined {
      if (event.data) {
        return event.data;
      }

      return event.dataTransfer?.getData("text/plain");
    },
    handleFormatBold(range?: StaticRange) {
      const newState = htmlEditor.applyRangeAction(
        this.document,
        {
          type: 'set_attribute',
          name: 'bold',
          value: true,
        },
        range,
      );
      this.updateEditorState(newState);
    },
    handleFormatItalic(range?: StaticRange) {
      const newState = htmlEditor.applyRangeAction(
        this.document,
        {
          type: 'set_attribute',
          name: 'italic',
          value: true,
        },
        range,
      );
      this.updateEditorState(newState);
    },
    handleFormatUnderline(range?: StaticRange) {
      const newState = htmlEditor.applyRangeAction(
        this.document,
        {
          type: 'set_attribute',
          name: 'underline',
          value: true,
        },
        range,
      );
      this.updateEditorState(newState);
    },
    handleDeleteContentBackward(range: StaticRange) {
      const newState = htmlEditor.applyRangeAction(this.document, {
        type: 'delete_text',
      }, range);
      this.updateEditorState(newState);
    },
    handleInsertText(range: StaticRange, text: string) {
      const newState = htmlEditor.applyRangeAction(this.document, {
        type: 'insert_text',
        text: text,
      }, range);
      this.updateEditorState(newState);
    },
    handleInsertParagraph(range: StaticRange) {
      const newState = htmlEditor.applyRangeAction(this.document, {
        type: 'insert_paragraph',
      }, range);

      this.updateEditorState(newState);
    },
    insertBlock(block: StandardBlock, afterId?: string) {
      let index = this.document.blocks.length;

      if (afterId) {
        index = this.document.blocks.findIndex((b) => b.id === afterId) + 1;
      }

      this.document.blocks.splice(index, 0, block);
    },
    handlePaste(range: StaticRange, data: string) {
      const newState = htmlEditor.applyRangeAction(this.document, {
        type: 'insert_text',
        text: data,
      }, range);

      this.updateEditorState(newState);
    },
    updateEditorState(state: EditorState) {
      this.document = state.document;
      this.$nextTick(() => htmlEditor.updateWindowSelection(state.selection));
    },
    handleMove(blockId: string, toIndex: number) {
      const newState = htmlEditor.applyAction(this.document, {
        id: blockId,
        index: toIndex,
        type: 'move_block',
      });
      this.updateEditorState(newState);
    },
    handleKeydown(event: KeyboardEvent) {
      const withSpecialKey = event.shiftKey || event.altKey || event.metaKey || event.ctrlKey;
      const withControlKey = event.ctrlKey || event.metaKey;

      switch (event.key) {
        case 'a':
          if (withControlKey) {
            event.preventDefault();
            return this.handleSelectAll();
          }
          break;
        case KeyName.ArrowUp:
          if (withSpecialKey) return;
          event.preventDefault();
          return this.handleArrowUpKey();
        case KeyName.ArrowDown:
          if (withSpecialKey) return;
          event.preventDefault();
          return this.handleArrowDownKey();

      }
    },
    handleArrowUpKey() {
      logger.debug('Arrow Up key pressed');
    },
    handleArrowDownKey() {
      logger.debug('Arrow Down key pressed');
    },
    handleArrowLeftKey() {
      logger.debug('Arrow Left key pressed');
    },
    handleArrowRightKey() {
      logger.debug('Arrow Right key pressed');
    },
    handleSelectAll() {
      logger.debug('Select All pressed');
    },
    handleSave() {
      this.$root?.$data.onSave(this.document);
    },
    handleAddImage(event: Event) {
      if (event.target instanceof HTMLInputElement && event.target.files) {
        for (let i = 0; i < event.target.files.length; i++) {
          const file = event.target.files.item(i);

          if (!file) {
            return;
          }

          const fileId = crypto.randomUUID();

          this.files[fileId] = {
            state: 'pending',
            type: 'image',
            source: file,
          };

          const newBlock: FileRefBlock = {
            id: crypto.randomUUID(),
            type: 'file-ref',
            createdAt: new Date(),
            updatedAt: new Date(),
            documentId: this.document.id,
            content: {
              id: fileId,
              name: file.name,
              type: file.type,
            },
          };

          this.insertBlock(newBlock);

          this.uploadFile(fileId);
        }
      }
    },
    handleAddAudio(event: Event) {
      if (event.target instanceof HTMLInputElement && event.target.files) {
        for (let i = 0; i < event.target.files.length; i++) {
          const file = event.target.files.item(i);

          if (!file) {
            return;
          }

          const fileId = crypto.randomUUID();
          this.files[fileId] = {
            state: 'pending',
            type: 'audio',
            source: file,
          };

          const newBlock: FileRefBlock = {
            id: crypto.randomUUID(),
            type: 'file-ref',
            createdAt: new Date(),
            updatedAt: new Date(),
            documentId: this.document.id,
            content: {
              id: fileId,
              name: file.name,
              type: file.type,
            },
          };

          this.insertBlock(newBlock);

          this.uploadFile(fileId);
        }
      }
    },
    async uploadFile(id: string) {
      const file = this.files[id];

      if (!file) {
        logger.warn('File not found', { id });
        return;
      }

      const result = await withConstantTime(async () => {
        const result = await this.$root?.$data.onUpload(file.source, this.document.id, id);
        return result;
      }, 1000);

      if (this.files[id]) {
        this.files[id].state = result;
      }
    },
  },
  components: {
    FileBlock,
    TitleBlock,
    HeadingBlock,
    UnknownBlock,
    BlockWrapper,
    RichTextBlock,
    PlainTextBlock,
    BlockInsertionTarget,
  },
});
</script>