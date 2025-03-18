<template>
  <div data-element="editor" contenteditable @beforeinput="handleBeforeInput" @keydown="handleKeydown">
    <TitleBlock :title="document.title" />

    <div contenteditable="false">
      <slot name="title" :onSave="handleSave" :onAddAudio="handleAddAudio"></slot>
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
import { Booleanish, insertString, KeyName } from '../utilities';
import BlockInsertionTarget from './BlockInsertionTarget.vue';
import FileBlock from './FileBlock.vue';
import HeadingBlock from './HeadingBlock.vue';
import RichTextBlock from './RichTextBlock.vue';
import PlainTextBlock from './PlainTextBlock.vue';
import TitleBlock from './TitleBlock.vue';
import type { CmsDocument, FileRefBlock, RichTextSpan, StandardBlock } from 'bun-utilities/cms';
import { HTMLBlockEditor, type EditorRangeAction, type Span } from '../editor';
import UnknownBlock from './UnknownBlock.vue';
import BlockWrapper from './BlockWrapper.vue';
import { withConstantTime } from 'bun-utilities/time';

const editor = new HTMLBlockEditor();

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
      document: ref<CmsDocument>(document),
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
    getBlockById(id: string) {
      return this.document.blocks.find((block) => block.id === id);
    },
    getBlockSlice(startId?: string, endId?: string) {
      let startIndex: number | undefined;
      let endIndex: number | undefined;

      if (startId) {
        startIndex = this.document.blocks.findIndex((block) => block.id === startId);
      }

      if (endId) {
        endIndex = this.document.blocks.findIndex((block) => block.id === endId);
      }

      console.log('Start index:', startIndex, startId);
      console.log('End index:', endIndex, endId);

      if (startIndex === -1 || endIndex === -1) {
        return [];
      }

      return this.document.blocks.slice(startIndex, endIndex !== undefined ? endIndex + 1 : undefined);
    },
    getSpanAtOffset(spans: RichTextSpan[], offset: number): {
      index: number;
      offset: number;
    } {
      let remainingOffset = offset;
      let index = 0;

      console.log(spans, offset);

      for (index; index <= spans.length; index++) {
        const span = spans[index];

        if (remainingOffset > span.text.length) {
          remainingOffset -= span.text.length;
        } else {
          break;
        }
      }

      return {
        index,
        offset: remainingOffset,
      }
    },
    /**
     * 
     * @param range 
     */
    getBlocksAtRange(range: StaticRange): {
      block: StandardBlock,
      start?: number,
      end?: number,
    }[] {
      const startContainer = range.startContainer;
      const endContainer = range.endContainer;

      console.log('Start container:', startContainer);
      console.log('End container:', endContainer);

      const startElement = editor.getElementAtNode(startContainer);
      const endElement = editor.getElementAtNode(endContainer);

      if (!startElement) {
        // Start is outside of the editor
        return [];
      }

      if (!endElement) {
        // End is outside of the editor
        return [];
      }

      console.log('Start element:', startElement);
      console.log('End element:', endElement);

      let startOffset = range.startOffset;

      if (startElement.type === 'span') {
        // Start offset is inside a span and should be adjusted
        const block = this.getBlockById(startElement.blockId);

        if (block && 'spans' in block.content) {

          for (const [index, span] of block.content.spans.entries()) {
            if (index < startElement.index) {
              startOffset += span.text.length;
            } else {
              break;
            }
          }
        }
      }

      let endOffset = range.endOffset;

      if (endElement.type === 'span') {
        // End offset is inside a span and should be adjusted
        const block = this.getBlockById(endElement.blockId);

        if (block && 'spans' in block.content) {
          for (const [index, span] of block.content.spans.entries()) {
            if (index < endElement.index) {
              endOffset += span.text.length;
            } else {
              break;
            }
          }
        }
      }

      const blocks = this.getBlockSlice(startElement?.blockId, endElement?.blockId);

      console.log('blocks in range:', blocks);

      return blocks.map((block, index) => {
        return {
          block,
          start: index === 0 ? startOffset : undefined,
          end: index === blocks.length - 1 ? endOffset : undefined,
        }
      })
    },
    splitSpansByRangeContainment(span: RichTextSpan, start: number, end: number): {
      before: string,
      inside: string,
      after: string,
    } {
      const before = span.text.slice(0, start);
      const inside = span.text.slice(start, end);
      const after = span.text.slice(end);

      return {
        before,
        inside,
        after,
      };
    },
    applyActionToBlockRange(blockId: string, action: EditorRangeAction) {
      const block = this.getBlockById(blockId);

      if (block?.type === 'plain-text') {
        if (action.type === 'delete') {
          const text = block.content.text;
          const newText = text.slice(0, action.rangeStart) + text.slice(action.rangeEnd);
          block.content.text = newText;
        }
      } else if (block?.type === 'rich-text') {
        const spans = block.content.spans;

        let currentOffset = 0;
        const newSpans: RichTextSpan[] = [];

        for (const span of spans) {
          let relativeStart: number;
          let relativeEnd: number;

          if (action.rangeStart === undefined) {
            relativeStart = 0;
          } else {
            relativeStart = Math.max(0, action.rangeStart - currentOffset);
          }

          if (action.rangeEnd === undefined) {
            relativeEnd = span.text.length;
          } else {
            relativeEnd = Math.max(0, action.rangeEnd - currentOffset);
          }

          const {
            before,
            inside,
            after,
          } = this.splitSpansByRangeContainment(span, relativeStart, relativeEnd);

          // console.log('Split spans:', span.text, relativeStart, relativeEnd, 'before', before, 'inside', inside, 'after', after);

          if (before.length) {
            newSpans.push({
              ...span,
              text: before,
            });
          }

          switch (action.type) {
            case 'set_attribute':
              if (inside.length) {
                newSpans.push({
                  ...span,
                  text: inside,
                  attributes: {
                    ...span.attributes,
                    [action.name]: action.value,
                  },
                });
              }
              break;
            case 'toggle_attribute':
              if (inside.length) {
                newSpans.push({
                  ...span,
                  text: inside,
                  attributes: {
                    ...span.attributes,
                    [action.name]: !Boolean(span.attributes[action.name]),
                  },
                });
              }
              break;
            case 'delete':
              // Do not add the inside span
              break;
          }

          if (after.length) {
            newSpans.push({
              ...span,
              text: after,
            });
          }

          currentOffset += span.text.length;
        }

        // TODO: Optimize by merging spans with the same attributes

        block.content.spans = newSpans;
      }
    },
    handleBeforeInput(event: InputEvent) {
      const range = event.getTargetRanges().at(0);

      if (!range) {
        console.warn('Received beforeinput event without range', event);
        return;
      }

      switch (event.inputType) {
        case 'insertText':
          if (!event.data) return;
          event.preventDefault();
          return this.handleInsertText(range, event.data);
        case 'insertLineBreak':
          event.preventDefault();
          return this.handleInsertParagraph(range);
        case 'insertParagraph':
          event.preventDefault();
          return this.handleInsertParagraph(range);
        case 'insertFromPaste':
          if (!event.dataTransfer) return;
          event.preventDefault();
          return this.handlePaste(range, event.dataTransfer.items);
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
        case 'deleteByCut':
        case 'deleteSoftLineBackward':
          return;
      }
    },
    insertTextToSpan(element: Span, range: StaticRange, text: string) {
      const block = this.getBlockById(element.blockId);

      if (!block) {
        console.warn('Block not found for element:', element);
        return;
      }

      console.log(`Insert text at block ${element.blockId} of span ${element.index} at offset ${range.startOffset}`);

      // const restore = range.startContainer.parentElement && editor.saveCursorPosition(range.startContainer.parentElement);

      switch (block.type) {
        case 'rich-text':
          block.content.spans[element.index].text = insertString(block.content.spans[element.index].text, range.startOffset, text);
          break;
      }

      this.$nextTick(() => {
        // restore?.(1);
        this.recoverCursor({
          block,
          start: range.startOffset + text.length,
        })
      });
    },
    handleInsertText(range: StaticRange, text: string) {
      console.log('Insert text:', text, range);

      if (range.collapsed) {
        const element = editor.getElementAtNode(range.startContainer);

        if (!element) {
          console.warn('No element found at range start:', range);
          return;
        }

        // Insert text at the current element

        if (element?.type === 'span') {
          this.insertTextToSpan(element, range, text);
        } else {
          console.warn('Skipping insertion at element', element);

          if (range.startOffset === 0) {
            this.insertTextToSpan({
              index: 0,
              type: 'span',
              blockId: element.blockId,
            }, range, text);
          }
        }
      } else {
        // Replace selected text with the new text
        console.log('Replacing text in range ', range.startContainer, range.startOffset, range.endContainer, range.endOffset);
      }
    },
    handleInsertParagraph(range: StaticRange) {
      console.log('Insert paragraph');

      if (range.collapsed) {
        // Insert new empty block after the current one
        const blocks = this.getBlocksAtRange(range);

        const newBlock: StandardBlock = {
          type: 'rich-text',
          createdAt: new Date(),
          updatedAt: new Date(),
          id: crypto.randomUUID(),
          documentId: this.document.id,
          content: {
            text: "",
            spans: [
              {
                text: "",
                attributes: {}
              }
            ],
          }
        }

        this.insertBlock(newBlock, blocks[0].block.id);

        this.recoverCursor({
          block: newBlock,
          start: 0,
        })
      }
    },
    insertBlock(block: StandardBlock, afterId?: string) {
      let index = this.document.blocks.length;

      if (afterId) {
        index = this.document.blocks.findIndex((b) => b.id === afterId) + 1;
      }

      this.document.blocks.splice(index, 0, block);
    },
    handlePaste(range: StaticRange, items: DataTransferItemList | undefined) {
      if (!items) {
        return;
      }

      console.log('Paste event:', items);
    },
    recoverCursor(block: {
      block: StandardBlock,
      start?: number,
    }) {
      if (block.block.type === 'rich-text') {
        const { index: startIndex, offset: startOffset } = this.getSpanAtOffset(block.block.content.spans, (block.start ?? 0));
        console.log('Original selection is starting at span', startIndex);

        this.$nextTick(() => {
          const selection = window.getSelection();
          const range = selection?.getRangeAt(0);

          if (range) {
            let startElement: Node | null | undefined = document
              .querySelector(`[data-block-id="${block.block.id}"]`)
              ?.querySelector(`[data-span-index="${startIndex}"]`);

            if (startElement?.childNodes.length) {
              startElement = startElement.firstChild;
            }

            if (startElement) {
              range.setStart(startElement, startOffset);
              range.setEnd(startElement, startOffset);
            }
          }
        })
      } else {
        this.$nextTick(() => {
          const selection = window.getSelection();
          const range = selection?.getRangeAt(0);

          if (range) {
            const startElement = document
              .querySelector(`[data-block-id="${block.block.id}"]`)
              ?.querySelector(`[data-editing-mode="plain"]`)
              ?.firstChild;

            if (startElement) {
              range.setStart(startElement, block.start ?? 0);
              range.setEnd(startElement, block.start ?? 0);
            }
          }
        });
      }
    },
    recoverSelection(startBlock: {
      block: StandardBlock,
      start?: number,
    }, endBlock: {
      block: StandardBlock,
      end?: number,
    }) {
      // Get the text nodes corresponding to the start and end of the block selection
      // The original range containers might have changed due to the formatting

      if (startBlock.block.type === 'rich-text') {
        const { index: startIndex, offset: startOffset } = this.getSpanAtOffset(startBlock.block.content.spans, (startBlock.start ?? 0));
        console.log('Original selection is starting at span', startIndex);

        if (endBlock.block.type === 'rich-text') {
          const { index: endIndex, offset: endOffset } = this.getSpanAtOffset(endBlock.block.content.spans, (endBlock.end ?? 0));
          console.log('Original selection is ending at span', endIndex);

          this.$nextTick(() => {
            const selection = window.getSelection();
            const range = selection?.getRangeAt(0);

            if (range) {
              const startElement = document
                .querySelector(`[data-block-id="${startBlock.block.id}"]`)
                ?.querySelector(`[data-span-index="${startIndex}"]`)
                ?.firstChild;

              const endElement = document
                .querySelector(`[data-block-id="${endBlock.block.id}"]`)
                ?.querySelector(`[data-span-index="${endIndex}"]`)
                ?.firstChild;

              if (startElement && endElement) {
                range.setStart(startElement, startOffset);
                range.setEnd(endElement, endOffset);
              }
            }
          })
        }
      }
    },
    handleFormatBold(range: StaticRange) {
      console.log('Format bold');

      const blocks = this.getBlocksAtRange(range);

      console.log('Blocks in range:', blocks);

      for (const block of blocks) {
        this.applyActionToBlockRange(block.block.id, {
          type: 'toggle_attribute',
          name: 'bold',
          rangeStart: block.start,
          rangeEnd: block.end,
        });
      }

      this.recoverSelection(blocks[0], blocks[blocks.length - 1]);
    },
    handleFormatItalic(range: StaticRange) {
      console.log('Format italic');

      const blocks = this.getBlocksAtRange(range);

      console.log('Blocks in range:', blocks);

      for (const block of blocks) {
        this.applyActionToBlockRange(block.block.id, {
          type: 'toggle_attribute',
          name: 'italic',
          rangeStart: block.start,
          rangeEnd: block.end,
        })
      }

      this.recoverSelection(blocks[0], blocks[blocks.length - 1]);
    },
    handleFormatUnderline(range: StaticRange) {
      console.log('Format underline');

      const blocks = this.getBlocksAtRange(range);

      console.log('Blocks in range:', blocks);

      for (const block of blocks) {
        this.applyActionToBlockRange(block.block.id, {
          type: 'toggle_attribute',
          name: 'underline',
          rangeStart: block.start,
          rangeEnd: block.end,
        })
      }

      this.recoverSelection(blocks[0], blocks[blocks.length - 1]);
    },
    handleDeleteContentBackward(range: StaticRange) {
      console.log('Delete content backward');

      const blocks = this.getBlocksAtRange(range);

      console.log('Blocks in range:', blocks);

      if (blocks.length) {
        for (const block of blocks) {
          this.applyActionToBlockRange(block.block.id, {
            type: 'delete',
            rangeStart: block.start,
            rangeEnd: block.end,
          });
        }

        this.recoverCursor(blocks[0]);
      } else {

      }
    },
    handleMove(blockId: string, toIndex: number) {
      const blockToMove = this.getBlockById(blockId);

      if (blockToMove) {
        const fromIndex = this.document.blocks.indexOf(blockToMove);

        if (fromIndex > -1) {
          if (fromIndex < toIndex) {
            toIndex -= 1;
          }

          console.log(`Moving block ${blockId} from ${fromIndex} to ${toIndex}`);

          this.document.blocks.splice(fromIndex, 1);
          this.document.blocks.splice(toIndex, 0, blockToMove);
        }
      }
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
      console.log('Arrow Up key pressed');
    },
    handleArrowDownKey() {
      console.log('Arrow Down key pressed');
    },
    handleArrowLeftKey() {
      console.log('Arrow Left key pressed');
    },
    handleArrowRightKey() {
      console.log('Arrow Right key pressed');
    },
    handleSelectAll() {
      console.log('Select All pressed');
    },
    handleSave() {
      this.$root?.$data.onSave(this.document);
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
        console.warn('File not found', id);
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