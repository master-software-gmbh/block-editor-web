import type { DocumentBlockDto, RichTextAttributeType } from 'bun-utilities/cms';
import { BlockEditor } from './block-editor';
import { type BlockEditorAction, type EditorRange, EditorState } from './types';

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

type PlainText = {
  type: 'plain';
  blockId: string;
  property: string;
};

export type EditorElement = Block | Span | Title | PlainText;

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

  applyAction(document: DocumentBlockDto, action: BlockEditorAction): EditorState {
    return this.blockEditor.applyAction(new EditorState(document, []), action);
  }

  applyRangeAction(document: DocumentBlockDto, action: BlockEditorAction, range?: Range): EditorState {
    const fullRange = this.selectionToEditorRange(document, range);
    return this.blockEditor.applyAction(new EditorState(document, fullRange), action);
  }

  selectionToEditorRange(document: DocumentBlockDto, selection?: Range): EditorRange {
    let range = selection;

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

    return fullRange;
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

    if (!firstElement || !lastElement) {
      return selection;
    }

    if (firstElement.type === 'title' && lastElement.type === 'title') {
      const title = document.querySelector('[data-element="title"]');

      if (title) {
        const child = this.findTextChild(title);

        if (child) {
          selection.setStart(child, firstElement.startOffset);
          selection.setEnd(child, lastElement.endOffset ?? 0);
        }
      }

      return selection;
    }

    if (firstElement.type === 'plain_text' && lastElement.type === 'plain_text') {
      const block = document.querySelector(`[data-block-id="${firstElement.blockId}"]`);
      const property = block?.querySelector(`[data-editing-property="${firstElement.property}"]`);

      if (property) {
        const child = this.findTextChild(property);

        if (child) {
          selection.setStart(child, firstElement.startOffset);
          selection.setEnd(child, lastElement.endOffset ?? firstElement.startOffset);
        }
      }

      return selection;
    }

    if (firstElement.type === 'rich_text' && lastElement.type === 'rich_text') {
      const textStart = this.findSpanTextNode(firstElement.blockId, firstElement.spanIndex);

      if (textStart) {
        selection.setStart(textStart, firstElement.startOffset);
      }

      const textEnd = this.findSpanTextNode(lastElement.blockId, lastElement.spanIndex);

      if (textEnd) {
        selection.setEnd(textEnd, lastElement.endOffset ?? lastElement.startOffset);
      }
    }

    return selection;
  }

  getShallowEditorRange(range: Range): EditorRange {
    let startElement: EditorElement | null = null;
    let startOffset = 0;
    let endElement: EditorElement | null = null;
    let endOffset: number | undefined;
    let startEndOffset: number | undefined;

    this.normalizeRange(range);

    if (range.startContainer instanceof Text) {
      startElement = this.getElementAtNode(range.startContainer);
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
      endElement = this.getElementAtNode(range.endContainer);
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

      if (endElement === null) {
        endElement = this.getElementAtNode(range.endContainer);
        endOffset = range.endContainer.textContent?.length ?? 0; // length of the last span!
      }
    }

    if (startElement?.type === 'block') {
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

    if (startElement?.type === 'plain') {
      return [
        {
          type: 'plain_text',
          blockId: startElement.blockId,
          property: startElement.property,
          startOffset: startOffset,
          endOffset: range.endOffset,
        },
      ];
    }

    if (startElement?.type !== 'span' || endElement?.type !== 'span') {
      let endOffset: number;

      if (startElement?.type === 'title' && endElement === null) {
        endOffset = range.startContainer.textContent?.length ?? 0; // Full title selected
      } else {
        endOffset = Math.max(range.startOffset, range.endOffset); // Prevent startOffset from being larger than endOffset
      }

      return [
        {
          type: 'title',
          startOffset: range.startOffset,
          endOffset: endOffset,
        },
      ];
    }

    if (!startElement || !endElement) {
      return [];
    }

    if (startElement.blockId === endElement.blockId && startElement.index === endElement.index) {
      return [
        {
          type: 'rich_text',
          blockId: startElement.blockId,
          spanIndex: startElement.index,
          startOffset: startOffset,
          endOffset: endOffset ?? range.endOffset,
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

  private normalizeRange(range: Range): Range {
    const unwrapChildren = (range: Range) => {
      if (range.startContainer.nodeType !== Node.TEXT_NODE) {
        let childNode: ChildNode | null = null;
        let childOffset = 0;

        if (range.startOffset === range.startContainer.childNodes.length) {
          // If the start offset is at the end of the container, set it to the end of the last child
          childNode = range.startContainer.lastChild;
          childOffset = childNode?.textContent?.length ?? 0;
        } else {
          childNode = range.startContainer.childNodes.item(range.startOffset) as ChildNode | null;
        }

        if (childNode?.nodeType === Node.TEXT_NODE) {
          range.setStart(childNode, childOffset);
          console.log('Set range start to child node');
        } else {
          console.log('Failed to set range start to child node');
        }
      }

      if (range.endContainer.nodeType !== Node.TEXT_NODE) {
        let childNode: ChildNode | null = null;
        let childOffset = 0;

        if (range.endOffset === range.endContainer.childNodes.length) {
          // If the end offset is at the end of the container, set it to the end of the last child
          childNode = range.endContainer.lastChild;
          childOffset = childNode?.textContent?.length ?? 0;
        } else {
          childNode = range.endContainer.childNodes.item(range.endOffset) as ChildNode | null;
        }

        if (childNode?.nodeType === Node.TEXT_NODE) {
          range.setEnd(childNode, childOffset);
          console.log('Set range end to child node');
        } else {
          console.log('Failed to set range end to child node');
        }
      }
    };

    const moveLateral = (range: Range) => {
      if (range.startContainer.nodeType === Node.TEXT_NODE) {
        if (range.startContainer.textContent === '' && range.startOffset === 0) {
          const previousNode = range.startContainer.previousSibling;

          if (previousNode) {
            range.setStart(previousNode, previousNode.childNodes.length);
            console.log('Set range start to previous sibling');
          } else {
            const nextNode = range.startContainer.nextSibling;

            if (nextNode) {
              range.setStart(nextNode, 0);
              console.log('Set range start to next sibling');
            }
          }
        }
      }

      if (range.endContainer.nodeType === Node.TEXT_NODE) {
        if (range.endContainer.textContent === '' && range.endOffset === 0) {
          const previousNode = range.endContainer.previousSibling;

          if (previousNode) {
            range.setEnd(previousNode, previousNode.childNodes.length);
            console.log('Set range end to previous sibling');
          } else {
            const nextNode = range.endContainer.nextSibling;

            if (nextNode) {
              range.setEnd(nextNode, 0);
              console.log('Set range end to next sibling');
            }
          }
        }
      }
    };

    unwrapChildren(range);
    moveLateral(range);
    unwrapChildren(range);

    return range;
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

  private getElementAtNode(node: Node): EditorElement | null {
    const spanIndex = this.findAttribute(node, 'data-span-index');
    const editingType = this.findAttribute(node, 'data-editing-type');
    const editingProperty = this.findAttribute(node, 'data-editing-property');
    const blockId = this.findAttribute(node, 'data-block-id');

    if (spanIndex && blockId) {
      return {
        blockId,
        type: 'span',
        index: Number.parseInt(spanIndex),
      };
    }

    if (editingType === 'plain' && editingProperty && blockId) {
      return {
        type: 'plain',
        blockId: blockId,
        property: editingProperty,
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
