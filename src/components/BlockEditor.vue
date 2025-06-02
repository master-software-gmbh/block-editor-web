<template>
  <RootWrapper>
    <div data-element="editor" contenteditable="true" @beforeinput="handleBeforeInput" @keydown="handleKeydown">
      <div contenteditable="false">
        <slot name="title" :onSave="handleSave" :onAddFile="handleAddFile" :onFormatBold="() => handleFormatBold()"
          :onFormatItalic="() => handleFormatItalic()" :onFormatUnderline="() => handleFormatUnderline()"></slot>
      </div>
      <TitleBlock :title="document.content.title" />
      <template v-for="(block, index) in document.children">
        <BlockInsertionTarget @move="(id) => handleMove(id, index)" @file="(file) => handleFileDrop(file, index)" />
        <BlockWrapper :block-id="block.id">
          <RichTextBlock v-if="block.type === 'rich-text'" :block="block"
            :placeholder="index === 0 ? placeholder : undefined" />
          <FileBlock v-else-if="block.type === 'file-ref' && getFileSourceUrl" :block="block"
            :file="files[block.content.id]" :source="getFileSourceUrl(block.content.id)" @remove="handleRemoveBlock" />
          <UnknownBlock v-else="block.type" :block="block" />
        </BlockWrapper>
      </template>
      <BlockInsertionTarget @move="(id) => handleMove(id, document.children.length)"
        @file="(file) => handleFileDrop(file, document.children.length)" />
      <hr style="margin-top: 5em" />
      <div class="bottom" contenteditable="false">
        <StatusBar :document="document" :status="status" />
        <slot name="bottom" :onSave="handleSave"></slot>
      </div>
      <div contenteditable="false">
        <RichTextFloatingBar @formatBold="handleFormatBold" @formatItalic="handleFormatItalic"
          @formatUnderline="handleFormatUnderline" />
      </div>
    </div>
  </RootWrapper>
</template>

<script lang="ts">
import type { DocumentBlockDto, FileBlockDto, StandardBlockDto } from 'ts-utilities/cms';
import { logger } from 'ts-utilities/logging';
import { debounce, withConstantTime } from 'ts-utilities/time';
import { defineComponent, ref } from 'vue';
import { HTMLBlockEditor } from '../editor/html-editor';
import type { EditorState, EditorStatus } from '../editor/types';
import type { CmsFile } from '../types';
import { KeyName } from '../utilities';
import BlockInsertionTarget from './BlockInsertionTarget.vue';
import BlockWrapper from './BlockWrapper.vue';
import FileBlock from './FileBlock.vue';
import PlainTextBlock from './PlainTextBlock.vue';
import RichTextBlock from './RichTextBlock.vue';
import RichTextFloatingBar from './RichTextFloatingBar.vue';
import RootWrapper from './RootWrapper.vue';
import StatusBar from './StatusBar.vue';
import TitleBlock from './TitleBlock.vue';
import UnknownBlock from './UnknownBlock.vue';
import { useConfig } from '../composables/useConfig';
import { useDocument } from '../composables/useDocument';

const htmlEditor = new HTMLBlockEditor();

export default defineComponent({
  setup() {
    const config = useConfig();
    const document = useDocument();
    const documentRef = ref<DocumentBlockDto>(document);

    const dirty = ref(false);
    const status = ref<EditorStatus>('idle');

    const autoSave = debounce(async () => {
      status.value = 'saving';

      await withConstantTime(async () => {
        await config.callbacks.onSave?.(documentRef.value);
      }, 1000);

      dirty.value = false;
      status.value = 'saved';
    }, 1500);

    return {
      dirty: dirty,
      status: status,
      autoSave: autoSave,
      document: documentRef,
      onSave: config.callbacks.onSave,
      onExit: config.callbacks.onExit,
      onUpload: config.callbacks.onUpload,
      getFileSourceUrl: config.callbacks.getFileSourceUrl,
      files: ref<Record<string, CmsFile>>({}),
    };
  },
  computed: {
    placeholder(): string | undefined {
      return this.isEmptyDocument ? 'Beginne zu schreiben..' : undefined;
    },
    isEmptyDocument() {
      if (this.document.children.length > 1) {
        return false;
      }

      for (const block of this.document.children) {
        if ('text' in block.content && block.content.text.trim().length) {
          return false;
        }
      }

      return true;
    },
  },
  mounted() {
    // Focus end of the document
    const lastBlock = this.document.children.at(-1);

    if (lastBlock?.type === 'rich-text') {
      const lastSpan = lastBlock.content.spans.at(-1);

      if (lastSpan) {
        htmlEditor.updateWindowSelection([
          {
            blockId: lastBlock.id,
            type: 'rich_text',
            spanIndex: lastBlock.content.spans.length - 1,
            startOffset: lastSpan.text.length,
            endOffset: lastSpan.text.length,
          },
        ]);
      }
    }

    // Listen for selection changes
    const debouncedSelectionChange = debounce(this.handleSelectionChange, 150);
    document.addEventListener('selectionchange', debouncedSelectionChange);

    // Trigger warning when navigating away
    window.addEventListener('beforeunload', (event) => {
      if (this.dirty) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return event.returnValue;
      }
    });
  },
  methods: {
    handleBeforeInput(event: InputEvent) {
      event.preventDefault();
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);

      if (!range) {
        logger.warn('Received beforeinput event without range', { type: event.inputType });
        return;
      }

      const data = this.getPlainInputData(event);

      switch (event.inputType) {
        case 'insertText': {
          if (!data) return;
          return this.handleInsertText(range, data);
        }
        case 'insertLineBreak':
        case 'insertParagraph':
          return this.handleInsertParagraph(range);
        case 'insertFromPaste':
          if (!data) return;
          return this.handlePaste(range, data);
        case 'formatBold':
          return this.handleFormatBold(range);
        case 'formatItalic':
          return this.handleFormatItalic(range);
        case 'formatUnderline':
          return this.handleFormatUnderline(range);
        case 'deleteContentBackward':
        case 'deleteByCut':
          return this.handleDeleteContentBackward(range);
        case 'insertReplacementText':
          if (!data) return;
          return this.handleInsertText(range, data);
        default:
          logger.warn('Unhandled beforeinput event', { type: event.inputType });
      }
    },
    handleSelectionChange() {
      const selection = window.getSelection();

      if (!selection) {
        logger.warn('Selection is null');
        return;
      }

      const floatingBar = document.getElementById('floating-bar');

      if (!floatingBar) {
        return;
      }

      const range = selection.getRangeAt(0);
      const editorRange = htmlEditor.selectionToEditorRange(this.document, range);

      const includesRichText = editorRange.find((block) => block.type === 'rich_text');

      if (!includesRichText || range.collapsed) {
        // Hide floating bar
        floatingBar.style.display = 'none';
        return;
      }

      floatingBar.style.display = 'flex';

      const rect = range.getBoundingClientRect();
      floatingBar.style.top = `${rect.top + window.scrollY - floatingBar.offsetHeight - 10}px`;
      floatingBar.style.left = `${rect.left + window.scrollX - 10}px`;
    },
    getPlainInputData(event: InputEvent): string | undefined {
      if (event.data) {
        return event.data;
      }

      return event.dataTransfer?.getData('text/plain');
    },
    handleFormatBold(range?: Range) {
      const newState = htmlEditor.applyRangeAction(
        this.document,
        {
          type: 'toggle_attribute',
          name: 'bold',
        },
        range,
      );
      this.updateEditorState(newState);
    },
    handleFormatItalic(range?: Range) {
      const newState = htmlEditor.applyRangeAction(
        this.document,
        {
          type: 'toggle_attribute',
          name: 'italic',
        },
        range,
      );
      this.updateEditorState(newState);
    },
    handleFormatUnderline(range?: Range) {
      const newState = htmlEditor.applyRangeAction(
        this.document,
        {
          type: 'toggle_attribute',
          name: 'underline',
        },
        range,
      );
      this.updateEditorState(newState);
    },
    handleDeleteContentBackward(range: Range) {
      const newState = htmlEditor.applyRangeAction(
        this.document,
        {
          type: 'delete_text',
        },
        range,
      );
      this.updateEditorState(newState);
    },
    handleInsertText(range: Range, text: string) {
      const newState = htmlEditor.applyRangeAction(
        this.document,
        {
          type: 'insert_text',
          text: text,
        },
        range,
      );
      this.updateEditorState(newState);
    },
    handleInsertParagraph(range: Range) {
      const newState = htmlEditor.applyRangeAction(
        this.document,
        {
          type: 'insert_paragraph',
        },
        range,
      );

      this.updateEditorState(newState);
    },
    insertBlock(block: StandardBlockDto, atIndex?: number) {
      const index = atIndex ?? this.document.children.length;
      this.document.children.splice(index, 0, block);
      this.dirty = true;
      // TODO: migrate to block-editor
      this.$nextTick(() => {
        this.autoSave();
      });
    },
    handlePaste(range: Range, data: string) {
      const newState = htmlEditor.applyRangeAction(
        this.document,
        {
          type: 'insert_text',
          text: data,
        },
        range,
      );

      this.updateEditorState(newState);
    },
    updateEditorState(state: EditorState) {
      this.document = state.document;
      this.dirty = true;
      this.$nextTick(() => {
        htmlEditor.updateWindowSelection(state.selection);
        this.autoSave();
      });
    },
    handleMove(blockId: string, toIndex: number) {
      const newState = htmlEditor.applyAction(this.document, {
        id: blockId,
        index: toIndex,
        type: 'move_block',
      });
      this.updateEditorState(newState);
    },
    handleFileDrop(file: File, index: number) {
      this.addFile(file, index);
    },
    handleRemoveBlock(blockId: string) {
      const newState = htmlEditor.applyAction(this.document, {
        id: blockId,
        type: 'remove_block',
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
    async handleSave() {
      await this.onSave?.(this.document);
      this.dirty = false;
      this.onExit?.();
    },
    handleAddFile(event: Event) {
      if (event.target instanceof HTMLInputElement && event.target.files) {
        for (let i = 0; i < event.target.files.length; i++) {
          const file = event.target.files.item(i);

          if (!file) {
            return;
          }

          this.addFile(file);
        }
      }
    },
    addFile(file: File, atIndex?: number) {
      const fileType = this.getFileType(file);

      if (!fileType) {
        logger.warn('Unsupported file type', { file });
        return;
      }

      const fileId = crypto.randomUUID();

      this.files[fileId] = {
        state: 'pending',
        type: fileType,
        source: file,
      };

      const newBlock: FileBlockDto = {
        id: crypto.randomUUID(),
        type: 'file-ref',
        content: {
          id: fileId,
          name: file.name.split('.').at(0) ?? file.name,
          type: file.type,
        },
        children: [],
      };

      this.insertBlock(newBlock, atIndex);
      this.uploadFile(fileId);
    },
    getFileType(file: File): 'audio' | 'image' | undefined {
      if (file.type.startsWith('audio/')) {
        return 'audio';
      }

      if (file.type.startsWith('image/')) {
        return 'image';
      }

      return undefined;
    },
    async uploadFile(id: string) {
      const file = this.files[id];

      if (!file) {
        logger.warn('File not found', { id });
        return;
      }

      const result = await withConstantTime(async () => this.onUpload?.(file.source, this.document.id, id), 1000);

      if (result && this.files[id]) {
        this.files[id].state = result;
      }
    },
  },
  components: {
    StatusBar,
    FileBlock,
    TitleBlock,
    RootWrapper,
    UnknownBlock,
    BlockWrapper,
    RichTextBlock,
    PlainTextBlock,
    RichTextFloatingBar,
    BlockInsertionTarget,
  },
});
</script>

<style scoped>
.bottom {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>