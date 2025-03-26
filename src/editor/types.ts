import type { RichTextAttributeType, StandardDocument } from 'bun-utilities/cms';

export class EditorState {
  readonly document: StandardDocument;
  readonly selection: EditorRange;

  constructor(document: StandardDocument, selection: EditorRange) {
    this.document = document;
    this.selection = selection;
  }
}
/**
 * Represents a range of a title element in the editor.
 */
export interface TitleRange {
  type: 'title';
  startOffset: number;
  endOffset?: number;
}

/**
 * Represents a range of a rich text element in the editor.
 */
export interface RichTextRange {
  type: 'rich_text';
  blockId: string;
  spanIndex: number;
  startOffset: number;
  endOffset?: number;
}

interface PlainTextRange {
  type: 'plain_text';
  blockId: string;
  property: string;
  startOffset: number;
  endOffset?: number;
}

export type EditorRange = (TitleRange | RichTextRange | PlainTextRange)[];

export type BlockEditorAction =
  | {
      text: string;
      type: 'insert_text';
    }
  | {
      type: 'delete_text';
    }
  | {
      type: 'set_attribute';
      name: string;
      value: RichTextAttributeType;
    }
  | {
      type: 'toggle_attribute';
      name: string;
    }
  | {
      type: 'move_block';
      id: string;
      index: number;
    }
  | {
      type: 'remove_block';
      id: string;
    }
  | {
      type: 'insert_paragraph';
    };
