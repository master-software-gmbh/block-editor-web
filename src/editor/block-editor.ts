import type {
  RichTextBlockDto,
  RichTextSpanDto,
  DocumentBlockDto,
  RichTextAttributeType,
  StandardBlockDto,
} from 'bun-utilities/cms';
import { logger } from 'bun-utilities/logging';
import { compareRecords } from 'bun-utilities/map';
import { createLens, compose, byId } from 'bun-utilities/lenses';
import { EditorState, type BlockEditorAction, type EditorRange, type RichTextRange } from './types';

logger.format = 'logfmt';

type Span = RichTextBlockDto['content']['spans'][number];

export class BlockEditor {
  private readonly uuidFactory: () => string;

  constructor(uuidFactory?: () => string) {
    this.uuidFactory = uuidFactory ?? crypto.randomUUID.bind(crypto);
  }

  applyAction(state: EditorState, action: BlockEditorAction): EditorState {
    switch (action.type) {
      case 'insert_text': {
        const paragraphs = action.text.split('\n\n');

        let newState = state;

        for (const [index, paragraph] of paragraphs.entries()) {
          newState = this.replaceText(newState, paragraph);

          if (index < paragraphs.length - 1) {
            newState = this.replaceText(newState, '\n');
          }
        }

        return newState;
      }
      case 'delete_text': {
        if (state.selection.length === 1) {
          const firstSelection = state.selection[0];

          if (firstSelection.startOffset === firstSelection.endOffset) {
            // If the selection is empty, we need to delete the previous character
            if (firstSelection.startOffset > 0) {
              firstSelection.startOffset -= 1;
              console.log('Deleting previous character');
            } else if (firstSelection.type === 'rich_text') {
              // If the selection is at the beginning of the block, we need to delete the current block
              const blockIndex = state.document.children.findIndex((b) => b.id === firstSelection.blockId);

              // Find the previous block of type rich-text
              const block = state.document.children
                .slice(0, blockIndex)
                .reverse()
                .find((b) => b.type === 'rich-text');

              if (block?.type === 'rich-text') {
                // Add the block to the beginning of the selection
                state.selection.unshift({
                  type: 'rich_text',
                  blockId: block.id,
                  spanIndex: block.content.spans.length - 1,
                  startOffset: block.content.spans.at(-1)?.text.length ?? 0,
                  endOffset: block.content.spans.at(-1)?.text.length ?? 0,
                });
              }
            }
          }
        }

        return this.replaceText(state, '');
      }
      case 'set_attribute':
        return this.applyAttributes(state, { [action.name]: action.value });
      case 'toggle_attribute': {
        const currentValue = Boolean(this.getRangeAttribute(state, action.name));
        const newValue = !currentValue;
        return this.applyAttributes(state, { [action.name]: newValue });
      }
      case 'move_block':
        return this.moveBlock(state, action.id, action.index);
      case 'remove_block':
        return this.removeBlock(state, action.id);
      case 'insert_paragraph':
        return this.replaceText(state, '\n');
      default:
        return state;
    }
  }

  getRangeAttribute(state: EditorState, name: string): boolean {
    for (const range of state.selection) {
      if (range.type !== 'rich_text') {
        continue;
      }

      const block = this.getBlockById(state.document, range.blockId);

      if (block?.type === 'rich-text') {
        const span = block.content.spans.at(range.spanIndex);

        if (!span?.attributes[name]) {
          return false;
        }
      }
    }

    return true;
  }

  private moveBlock(state: EditorState, id: string, index: number): EditorState {
    const blockToMove = this.getBlockById(state.document, id);

    if (blockToMove) {
      const fromIndex = state.document.children.indexOf(blockToMove);

      if (fromIndex > -1) {
        if (fromIndex < index) {
          index -= 1;
        }

        logger.debug(`Moving block ${id} from ${fromIndex} to ${index}`);

        state.document.children.splice(fromIndex, 1);
        state.document.children.splice(index, 0, blockToMove);
      }
    }

    return state;
  }

  private removeBlock(state: EditorState, id: string): EditorState {
    const index = state.document.children.findIndex((block) => block.id === id);

    if (index > -1) {
      state.document.children.splice(index, 1);
    }

    return state;
  }

  private getBlockById(document: DocumentBlockDto, id: string) {
    return document.children.find((block) => block.id === id);
  }

  private applyAttributes(state: EditorState, attributes: Record<string, RichTextAttributeType>): EditorState {
    const newSelection: EditorRange = [];
    const updatedDocument = state.document;

    for (const block of updatedDocument.children) {
      if (block.type !== 'rich-text') {
        continue;
      }

      const newSpans: RichTextSpanDto[] = [];

      for (const [index, span] of block.content.spans.entries()) {
        const blockRange = state.selection.find(
          (range) => range.type === 'rich_text' && range.blockId === block.id && range.spanIndex === index,
        );

        if (blockRange?.type !== 'rich_text') {
          // Span is outside of range
          newSpans.push(span);
          continue;
        }

        const { after, before, inside } = this.splitSpan(span, blockRange);

        if (before.length) {
          newSpans.push({
            ...span,
            text: before,
          });
        }

        if (inside.length) {
          newSelection.push({
            type: 'rich_text',
            blockId: block.id,
            spanIndex: newSpans.length,
            startOffset: 0,
            endOffset: inside.length,
          });

          newSpans.push({
            ...span,
            text: inside,
            attributes: {
              ...span.attributes,
              ...attributes,
            },
          });
        }

        if (after.length) {
          newSpans.push({
            ...span,
            text: after,
          });
        }
      }

      block.content.spans = newSpans;
    }

    return new EditorState(updatedDocument, newSelection);
  }

  private splitSpan(span: Span, range: RichTextRange) {
    const before = span.text.slice(0, range.startOffset);
    const inside = span.text.slice(range.startOffset, range.endOffset);
    const after = span.text.slice(range.endOffset ?? range.startOffset);

    return {
      before,
      inside,
      after,
    };
  }

  expandRange(document: DocumentBlockDto, range: EditorRange): EditorRange {
    const firstElement = range.at(0);
    const lastElement = range.at(1);

    if (firstElement?.type !== 'rich_text' || lastElement?.type !== 'rich_text') {
      return range;
    }

    const newRange: EditorRange = [];

    const firstBlockIndex = document.children.findIndex((block) => block.id === firstElement.blockId);
    const lastBlockIndex = document.children.findIndex((block) => block.id === lastElement.blockId);
    const blockSlice = document.children.slice(firstBlockIndex, lastBlockIndex + 1);

    for (const block of blockSlice) {
      if (block.type === 'rich-text') {
        for (const [index, span] of block.content.spans.entries()) {
          if (block.id === firstElement.blockId && index < firstElement.spanIndex) {
            continue;
          }

          if (block.id === firstElement.blockId && index === firstElement.spanIndex) {
            newRange.push(firstElement);
            continue;
          }

          if (block.id === lastElement.blockId && index > lastElement.spanIndex) {
            continue;
          }

          if (block.id === lastElement.blockId && index === lastElement.spanIndex) {
            newRange.push(lastElement);
            continue;
          }

          newRange.push({
            type: 'rich_text',
            blockId: block.id,
            spanIndex: index,
            startOffset: 0,
            endOffset: span.text.length,
          });
        }
      }
    }

    return newRange;
  }

  private createEmptyRichTextBlock(attributes: Record<string, RichTextAttributeType>): RichTextBlockDto {
    const newBlockId = this.uuidFactory();

    return {
      children: [],
      id: newBlockId,
      type: 'rich-text',
      content: {
        spans: [
          {
            text: '',
            attributes: attributes,
          },
        ],
      },
    };
  }

  private replaceText(state: EditorState, text: string): EditorState {
    logger.info(`Replacing text with "${text}"`);

    const updatedBlocks: StandardBlockDto[] = [];
    let newSelection: EditorRange = [];

    // Set selection to be at the end of the first element's replaced content

    const firstElement = state.selection.at(0);

    if (firstElement?.type === 'rich_text') {
      newSelection = [
        {
          type: 'rich_text',
          blockId: firstElement.blockId,
          spanIndex: firstElement.spanIndex,
          startOffset: firstElement.startOffset + text.length,
        },
      ];
    } else if (firstElement?.type === 'plain_text') {
      const cleanText = text.replace(/\n/g, '');

      newSelection = [
        {
          type: 'plain_text',
          blockId: firstElement.blockId,
          property: firstElement.property,
          startOffset: firstElement.startOffset + cleanText.length,
          endOffset: firstElement.startOffset + cleanText.length,
        },
      ];
    }

    let remainingText = text;

    const copyBlock: <T>(block: T) => T = (block) => {
      const newBlock = JSON.parse(JSON.stringify(block));
      newBlock.content.spans = [];
      return newBlock;
    };

    let currentBlock: RichTextBlockDto | undefined;

    for (const range of state.selection) {
      if (range.type === 'title') {
        if (text === '\n') {
          // A line break inserts an empty block below the title

          // Initialize a new empty rich text block
          const newBlock = this.createEmptyRichTextBlock({});

          // Override selection to be a cursor at the beginning of the new block
          newSelection = [
            {
              blockId: newBlock.id,
              spanIndex: 0,
              startOffset: 0,
              type: 'rich_text',
            },
          ];

          remainingText = '';

          updatedBlocks.push(newBlock);
        } else {
          const cleanText = text.replace(/\n/g, '');
          state.document.content.title =
            state.document.content.title.slice(0, range.startOffset) +
            cleanText +
            state.document.content.title.slice(range.endOffset);

          const newStartOffset = range.startOffset + cleanText.length;
          const newEndOffset = range.startOffset + cleanText.length;

          newSelection = [
            {
              type: 'title',
              startOffset: newStartOffset,
              endOffset: newEndOffset,
            },
          ];
        }
      }
    }

    // Iterate over each block in the document
    for (const block of state.document.children) {
      if (!currentBlock) {
        currentBlock = copyBlock(block) as RichTextBlockDto;
      }

      let isLastSelectedBlock = false;
      let isSelectedBlock = false;

      if (block.type === 'rich-text') {
        // Iterate over each span in the current block
        for (const [spanIndex, span] of block.content.spans.entries()) {
          // Find the selection range corresponding to the current block and span
          const selectionRangeIndex = state.selection.findIndex(
            (range) => range.type === 'rich_text' && range.blockId === block.id && range.spanIndex === spanIndex,
          );

          const selectionRange = selectionRangeIndex === -1 ? undefined : state.selection.at(selectionRangeIndex);

          if (selectionRange?.type !== 'rich_text') {
            // Span is not selected rich text, keep it unchanged
            currentBlock.content.spans.push(span);
          } else {
            // Span is selected (completely or partially)
            isSelectedBlock = true;

            if (selectionRangeIndex === state.selection.length - 1) {
              isLastSelectedBlock = true;
            }

            // Split the span into parts which are before, inside and after the selected range
            // Hel[lo Worl]d -> [Hel, lo World, d]
            const { before, after } = this.splitSpan(span, selectionRange);

            // Add the part before the selection to the span list with the same attributes

            currentBlock.content.spans.push({
              text: before,
              attributes: span.attributes,
            });

            if (remainingText === '\n') {
              // A line break moves the after part to a new block

              // Push the updatedBlock early and initialize a new empty block
              updatedBlocks.push(currentBlock);

              // Initialize a new empty rich text block
              currentBlock = this.createEmptyRichTextBlock(span.attributes);

              // Override selection to be a cursor at the beginning of the new block
              newSelection = [
                {
                  blockId: currentBlock.id,
                  spanIndex: 0,
                  startOffset: 0,
                  type: 'rich_text',
                },
              ];

              remainingText = '';
            }

            // If it's not a line break, the span text just needs to be replaced with the new text
            // Push the remaining text with the text of the after part and discard the inside part
            currentBlock.content.spans.push({
              text: remainingText + after,
              attributes: span.attributes,
            });

            // Clear the remaining text so the remaining selected spans are just replaced with nothing
            remainingText = '';
          }
        }
      } else {
        const selectionRange = state.selection.find(
          (range) => range.type === 'plain_text' && range.blockId === currentBlock?.id,
        );

        if (selectionRange?.type === 'plain_text' && selectionRange.property in currentBlock.content) {
          const content = currentBlock.content[selectionRange.property];
          const cleanText = remainingText.replace(/\n/g, '');
          currentBlock.content[selectionRange.property] =
            content.slice(0, selectionRange.startOffset) + cleanText + content.slice(selectionRange.endOffset);
        }
      }

      if (isLastSelectedBlock || !isSelectedBlock) {
        updatedBlocks.push(currentBlock);
        currentBlock = undefined;
      }
    }

    if (currentBlock) {
      updatedBlocks.push(currentBlock);
    }

    const updatedDocument = this.optimizeDocument(Blocks.set(state.document, updatedBlocks), newSelection);

    return new EditorState(updatedDocument, newSelection);
  }

  private optimizeDocument(document: DocumentBlockDto, newSelection: EditorRange): DocumentBlockDto {
    let updatedDocument = document;

    for (const block of document.children) {
      if (block.type === 'rich-text') {
        updatedDocument = compose(Blocks, byId(block.id)).set(
          updatedDocument,
          this.optimizeRichTextBlock(block, newSelection),
        );
      }
    }

    updatedDocument = Blocks.set(
      updatedDocument,
      updatedDocument.children.filter((block) => {
        if (block.type === 'rich-text' && block.content.spans.length === 0) {
          return false;
        }

        return true;
      }),
    );

    return updatedDocument;
  }

  private optimizeRichTextBlock(block: RichTextBlockDto, newSelection: EditorRange): RichTextBlockDto {
    const optimizedSpans: Span[] = [];

    for (const [index, span] of block.content.spans.entries()) {
      const previousSpan = optimizedSpans.at(optimizedSpans.length - 1);

      // Filter out empty spans
      if (span.text.length === 0) {
        const startSelection = newSelection.at(0);

        if (
          startSelection?.type === 'rich_text' &&
          startSelection.blockId === block.id &&
          startSelection.spanIndex === index
        ) {
          if (index > 0) {
            // Move selection to previous span
            startSelection.spanIndex = index - 1;
            startSelection.startOffset = optimizedSpans.at(-1)?.text.length ?? 0;
          }
        }

        continue;
      }

      if (previousSpan) {
        const result = this.compareAttributes(previousSpan.attributes, span.attributes);

        if (result) {
          // Combine spans
          previousSpan.text += span.text;
          continue;
        }
      }

      optimizedSpans.push(span);
    }

    if (optimizedSpans.length === 0) {
      // Add one empty span back to preserve editing capability
      optimizedSpans.push({
        text: '',
        attributes: {},
      });
    }

    return compose(RichTextContent, RichTextSpans).set(block, optimizedSpans);
  }

  private compareAttributes(
    first: Record<string, RichTextAttributeType>,
    second: Record<string, RichTextAttributeType>,
  ): boolean {
    return compareRecords(first, second) && compareRecords(second, first);
  }
}

const Blocks = createLens<DocumentBlockDto, 'children'>('children');
const RichTextContent = createLens<RichTextBlockDto, 'content'>('content');
const RichTextSpans = createLens<RichTextBlockDto['content'], 'spans'>('spans');
const SpanText = createLens<Span, 'text'>('text');
