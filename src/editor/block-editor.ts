import type {
  RichTextAttributeType,
  RichTextBlock,
  RichTextSpan,
  StandardBlock,
  StandardDocument,
} from 'bun-utilities/cms';
import { logger } from 'bun-utilities/logging';
import { compareRecords } from 'bun-utilities/map';
import { createLens, compose, byId } from 'bun-utilities/lenses';
import { EditorState, type BlockEditorAction, type EditorRange, type RichTextRange } from './types';

logger.format = 'logfmt';

type Span = RichTextBlock['content']['spans'][number];

export class BlockEditor {
  private readonly uuidFactory: () => string;
  private readonly dateFactory: () => Date;

  constructor(uuidFactory?: () => string, dateFactory?: () => Date) {
    this.uuidFactory = uuidFactory ?? crypto.randomUUID.bind(crypto);
    this.dateFactory = dateFactory ?? (() => new Date());
  }

  applyAction(state: EditorState, action: BlockEditorAction): EditorState {
    switch (action.type) {
      case 'insert_text':
        return this.replaceText(state, action.text);
      case 'delete_text':
        return this.replaceText(state, '');
      case 'set_attribute':
        return this.applyAttributes(state, { [action.name]: action.value });
      case 'move_block':
        return this.moveBlock(state, action.id, action.index);
      case 'insert_paragraph':
        return this.replaceText(state, '\n');
      default:
        return state;
    }
  }

  private moveBlock(state: EditorState, id: string, index: number): EditorState {
    const blockToMove = this.getBlockById(state.document, id);

    if (blockToMove) {
      const fromIndex = state.document.blocks.indexOf(blockToMove);

      if (fromIndex > -1) {
        if (fromIndex < index) {
          index -= 1;
        }

        logger.debug(`Moving block ${id} from ${fromIndex} to ${index}`);

        state.document.blocks.splice(fromIndex, 1);
        state.document.blocks.splice(index, 0, blockToMove);
      }
    }

    return state;
  }

  private getBlockById(document: StandardDocument, id: string) {
    return document.blocks.find((block) => block.id === id);
  }

  private applyAttributes(state: EditorState, attributes: Record<string, RichTextAttributeType>): EditorState {
    const newSelection: EditorRange = [];
    const updatedDocument = state.document;

    for (const block of updatedDocument.blocks) {
      if (block.type !== 'rich-text') {
        continue;
      }

      const newSpans: RichTextSpan[] = [];

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
      const plainText = this.getPlainTextRepresentation(block);
      block.content.text = plainText;
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

  expandRange(document: StandardDocument, range: EditorRange): EditorRange {
    const firstElement = range.at(0);
    const lastElement = range.at(1);

    if (firstElement?.type !== 'rich_text' || lastElement?.type !== 'rich_text') {
      return range;
    }

    const newRange: EditorRange = [];

    const firstBlockIndex = document.blocks.findIndex((block) => block.id === firstElement.blockId);
    const lastBlockIndex = document.blocks.findIndex((block) => block.id === lastElement.blockId);
    const blockSlice = document.blocks.slice(firstBlockIndex, lastBlockIndex + 1);

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

  private createEmptyRichTextBlock(
    documentId: string,
    attributes: Record<string, RichTextAttributeType>,
  ): RichTextBlock {
    const newBlockId = this.uuidFactory();
    const newDate = this.dateFactory();

    return {
      id: newBlockId,
      createdAt: newDate,
      updatedAt: newDate,
      type: 'rich-text',
      documentId: documentId,
      content: {
        text: '',
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
    logger.debug(`Replacing text with "${text}"`);

    const updatedBlocks: StandardBlock[] = [];
    let newSelection: EditorRange = [];

    // Set selection to be at the end of the first element's replaced content

    const firstElement = state.selection.at(0);

    if (firstElement && firstElement.type === 'rich_text') {
      newSelection = [
        {
          type: 'rich_text',
          blockId: firstElement.blockId,
          spanIndex: firstElement.spanIndex,
          startOffset: firstElement.startOffset + text.length,
        },
      ];
    }

    let remainingText = text;

    const copyBlock: <T>(block: T) => T = (block) => {
      const newBlock = JSON.parse(JSON.stringify(block));
      newBlock.content.spans = [];
      return newBlock;
    };

    let currentBlock: RichTextBlock | undefined;

    // Iterate over each block in the document
    for (const block of state.document.blocks) {
      if (!currentBlock) {
        currentBlock = copyBlock(block) as RichTextBlock;
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
              currentBlock = this.createEmptyRichTextBlock(state.document.id, span.attributes);

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

    for (const block of updatedDocument.blocks) {
      if (block.type === 'rich-text') {
        const plainText = this.getPlainTextRepresentation(block);
        block.content.text = plainText;
      }
    }

    return new EditorState(updatedDocument, newSelection);
  }

  private getPlainTextRepresentation(block: StandardBlock): string {
    switch (block.type) {
      case 'rich-text':
        return block.content.spans.map((span) => span.text).join('');
      default:
        if ('text' in block.content) {
          return block.content.text;
        }

        return '';
    }
  }

  private optimizeDocument(document: StandardDocument, newSelection: EditorRange): StandardDocument {
    let updatedDocument = document;

    for (const block of document.blocks) {
      if (block.type === 'rich-text') {
        updatedDocument = compose(Blocks, byId(block.id)).set(
          updatedDocument,
          this.optimizeRichTextBlock(block, newSelection),
        );
      }
    }

    updatedDocument = Blocks.set(
      updatedDocument,
      updatedDocument.blocks.filter((block) => {
        if (block.type === 'rich-text' && block.content.spans.length === 0) {
          return false;
        }

        return true;
      }),
    );

    return updatedDocument;
  }

  private optimizeRichTextBlock(block: RichTextBlock, newSelection: EditorRange): RichTextBlock {
    const optimizedSpans: Span[] = [];
    let firstRemovedSpan: Span | undefined;

    for (const [index, span] of block.content.spans.entries()) {
      const previousSpan = optimizedSpans.at(optimizedSpans.length - 1);

      // Filter out empty spans
      if (span.text.length === 0) {
        if (!firstRemovedSpan) {
          // Preserve first removed span
          firstRemovedSpan = span;
        }

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

    if (optimizedSpans.length === 0 && firstRemovedSpan) {
      // Add one empty span back to preserve editing capability
      optimizedSpans.push(firstRemovedSpan);
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

const Blocks = createLens<StandardDocument, 'blocks'>('blocks');
const RichTextContent = createLens<RichTextBlock, 'content'>('content');
const RichTextSpans = createLens<RichTextBlock['content'], 'spans'>('spans');
const SpanText = createLens<Span, 'text'>('text');
