import type { RichTextAttributeType, StandardDocument } from 'bun-utilities/cms';
import { EditorState, type BlockEditorAction, type EditorRange } from './types';
import { BlockEditor } from './block-editor';

type Title = {
  type: 'title';
};

export type Block = {
  type: 'block';
  blockId: string;
};

export type Span = {
  type: 'span';
  index: number;
  blockId: string;
};

export type EditorElement = Block | Span | Title;

export type EditorRangeAction = {
  rangeStart?: number;
  rangeEnd?: number;
} & (
  | {
      type: 'delete';
    }
  | {
      name: string;
      type: 'set_attribute';
      value: RichTextAttributeType;
    }
  | {
      name: string;
      type: 'remove_attribute';
    }
  | {
      name: string;
      type: 'toggle_attribute';
    }
);

export class HTMLBlockEditor {
  readonly blockEditor = new BlockEditor();

  applyAction(document: StandardDocument, action: BlockEditorAction, range?: StaticRange): EditorState {
    return this.blockEditor.applyAction(new EditorState(document, []), action);
  }

  applyRangeAction(document: StandardDocument, action: BlockEditorAction, staticRange?: StaticRange): EditorState {
    let range = staticRange;

    if (!range) {
      const selection = window.getSelection();
      range = selection?.getRangeAt(0);
    }

    let fullRange: EditorRange = [];

    if (!range) {
      console.warn('No range found for action');
    } else {
      const shallowRange = this.getShallowEditorRange(range);
      fullRange = this.blockEditor.expandRange(document, shallowRange);
    }

    return this.blockEditor.applyAction(new EditorState(document, fullRange), action);
  }

  updateWindowSelection(range: EditorRange) {
    const selection = this.editorRangeToSelection(range);

    if (selection) {
      const windowSelection = window.getSelection();
      windowSelection?.removeAllRanges();
      windowSelection?.addRange(selection);
    }
  }

  editorRangeToSelection(range: EditorRange): Range {
    const selection = new Range();

    const firstElement = range.at(0);
    const lastElement = range.at(-1);

    if (firstElement?.type !== 'rich_text' || lastElement?.type !== 'rich_text') {
      const title = document.querySelector('[data-element="title"]');

      if (title) {
        const child = this.findTextChild(title);

        if (child) {
          selection.setStart(child, firstElement?.startOffset ?? 0);
          selection.setEnd(child, lastElement?.endOffset ?? 0);
        }
      }

      return selection;
    }

    const textStart = this.findSpanTextNode(firstElement.blockId, firstElement.spanIndex);

    if (textStart) {
      selection.setStart(textStart, firstElement.startOffset);
    }

    const textEnd = this.findSpanTextNode(lastElement.blockId, lastElement.spanIndex);

    if (textEnd) {
      selection.setEnd(textEnd, lastElement.endOffset ?? lastElement.startOffset);
    }

    return selection;
  }

  getShallowEditorRange(range: StaticRange): EditorRange {
    let startElement: EditorElement | null = null;
    let startOffset = 0;
    let endElement: EditorElement | null = null;
    let endOffset: number | undefined;
    let startEndOffset: number | undefined;

    if (range.startContainer instanceof Text) {
      startElement = this.getElementAtTextNode(range.startContainer);
      startOffset = range.startOffset;
    } else if (range.startContainer instanceof Element) {
      if (range.startOffset > range.startContainer.children.length) {
        startElement = this.getLastChildElement(range.startContainer);

        if (startElement?.type === 'span') {
          const textContent = this.getSpanTextContent(startElement.blockId, startElement.index);
          startOffset = textContent?.length ?? 0;
          startEndOffset = startOffset;
        }
      } else {
        startElement = this.getElementAtNode(range.startContainer);
        startOffset = range.startContainer.textContent?.length ?? 0; // length of the last span!
      }
    }

    if (range.endContainer instanceof Text) {
      endElement = this.getElementAtTextNode(range.endContainer);
    } else if (range.endContainer instanceof Element) {
      if (range.endOffset === 0) {
        endElement = this.getFirstChildElement(range.endContainer);
      } else {
        endElement = this.getLastChildElement(range.endContainer);

        if (endElement?.type === 'span') {
          const textContent = this.getSpanTextContent(endElement.blockId, endElement.index);
          endOffset = textContent?.length ?? 0;
        }
      }
    }

    if (!startElement || !endElement) {
      return [];
    }

    if (startElement.type === 'block') {
      return [
        {
          type: 'rich_text',
          blockId: startElement.blockId,
          spanIndex: 0,
          startOffset: startOffset,
          endOffset: range.endOffset,
        },
      ];
    }

    if (startElement.type !== 'span' || endElement.type !== 'span') {
      return [
        {
          type: 'title',
          startOffset: range.startOffset,
          endOffset: range.endOffset,
        },
      ];
    }

    if (startElement.blockId === endElement.blockId && startElement.index === endElement.index) {
      return [
        {
          type: 'rich_text',
          blockId: startElement.blockId,
          spanIndex: startElement.index,
          startOffset: startOffset,
          endOffset: range.endOffset,
        },
      ];
    }

    return [
      {
        type: 'rich_text',
        blockId: startElement.blockId,
        spanIndex: startElement.index,
        startOffset: startOffset,
        endOffset: startEndOffset ?? range.startContainer.textContent?.length,
      },
      {
        type: 'rich_text',
        blockId: endElement.blockId,
        spanIndex: endElement.index,
        startOffset: 0,
        endOffset: endOffset ?? range.endOffset,
      },
    ];
  }

  private findChildAttribute(node: Node, attribute: string): string | null {
    if (node instanceof Element && node.hasAttribute(attribute)) {
      return node.getAttribute(attribute);
    }

    for (const child of node.childNodes) {
      if (child instanceof Element && child.hasAttribute(attribute)) {
        return child.getAttribute(attribute);
      }

      const childResult = this.findChildAttribute(child, attribute);

      if (childResult) {
        return childResult;
      }
    }

    return null;
  }

  private findAttribute(node: Node, attribute: string): string | null {
    if (node instanceof Element && node.hasAttribute(attribute)) {
      return node.getAttribute(attribute);
    }

    if (node.parentElement) {
      return this.findAttribute(node.parentElement, attribute);
    }

    return null;
  }

  private findTextChild(node: Node): Node | null {
    if (node instanceof Text) {
      return node;
    }

    if (node.firstChild) {
      return this.findTextChild(node.firstChild);
    }

    // Fallback to node itself. Empty spans
    // don't have a text child node.

    return node;
  }

  private findSpanTextNode(blockId: string, spanIndex: number): Node | null {
    const element = document
      .querySelector(`[data-block-id="${blockId}"]`)
      ?.querySelector(`[data-span-index="${spanIndex}"]`);

    if (element) {
      return this.findTextChild(element);
    }

    return null;
  }

  private getSpanTextContent(blockId: string, spanIndex: number): string | null {
    const element = document
      .querySelector(`[data-block-id="${blockId}"]`)
      ?.querySelector(`[data-span-index="${spanIndex}"]`);

    if (!element) {
      return null;
    }

    const textNode = this.findTextChild(element);

    if (!textNode) {
      return null;
    }

    return textNode.textContent;
  }

  getElementAtTextNode(node: Text): EditorElement | null {
    const spanIndex = this.findAttribute(node, 'data-span-index');
    const blockId = this.findAttribute(node, 'data-block-id');

    if (spanIndex && blockId) {
      return {
        blockId,
        type: 'span',
        index: Number.parseInt(spanIndex),
      };
    }

    if (blockId) {
      return {
        type: 'block',
        blockId: blockId,
      };
    }

    const element = this.findAttribute(node, 'data-element');

    if (element === 'title') {
      return {
        type: 'title',
      };
    }

    return null;
  }

  private getFirstChildElement(node: Element): EditorElement | null {
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      if (this.isSpanNode(child)) {
        const element = this.getElementAtNode(child);
        if (element) {
          return element;
        }
      } else if (child instanceof Element) {
        const childElement = this.getFirstChildElement(child);
        if (childElement) {
          return childElement;
        }
      }
    }
    return null;
  }

  private getLastChildElement(node: Element): EditorElement | null {
    for (let i = node.childNodes.length - 1; i >= 0; i--) {
      const child = node.childNodes[i];

      if (this.isSpanNode(child)) {
        const element = this.getElementAtNode(child);

        if (element) {
          return element;
        }
      } else if (child instanceof Element) {
        const childElement = this.getLastChildElement(child);

        if (childElement) {
          return childElement;
        }
      }
    }

    return null;
  }

  private isSpanNode(node: Node): node is Element {
    if (node instanceof Element) {
      return node.hasAttribute('data-span-index');
    }

    return false;
  }

  private getElementAtNode(node: Element): EditorElement | null {
    const spanIndex = this.findAttribute(node, 'data-span-index');
    const blockId = this.findAttribute(node, 'data-block-id');

    if (spanIndex && blockId) {
      return {
        blockId,
        type: 'span',
        index: Number.parseInt(spanIndex),
      };
    }

    if (blockId) {
      return {
        type: 'block',
        blockId: blockId,
      };
    }

    const element = this.findAttribute(node, 'data-element');

    if (element === 'title') {
      return {
        type: 'title',
      };
    }

    return null;
  }
}
