import type { RichTextAttributeType } from 'bun-utilities/cms';

type EditorElementType = 'editor' | 'block' | 'span';

type Editor = {
  type: 'editor';
  documentId: string;
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

export type EditorElement = Block | Span;

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
  /**
   * Retrieves the ID of the block associated with the given node.
   * If the recursive option is set, walks up the node tree to
   * check parent nodes.
   */
  getBlockId(node: Node): string | null | undefined {
    return this.findAttribute(node, 'data-block-id');
  }

  findAttribute(node: Node, attribute: string): string | null {
    if (node instanceof Element && node.hasAttribute(attribute)) {
      return node.getAttribute(attribute);
    }

    if (node.parentElement) {
      return this.findAttribute(node.parentElement, attribute);
    }

    return null;
  }

  getElementAtNode(node: Node): EditorElement | null {
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

    return null;
  }

  getTextNodeAtPosition(root: Node, index: number) {
    const NODE_TYPE = NodeFilter.SHOW_TEXT;

    const treeWalker = document.createTreeWalker(root, NODE_TYPE, (elem) => {
      if (elem.textContent !== null && index > elem.textContent.length) {
        index -= elem.textContent.length;
        return NodeFilter.FILTER_REJECT;
      }

      return NodeFilter.FILTER_ACCEPT;
    });

    const c = treeWalker.nextNode();

    return {
      node: c ?? root,
      position: index,
    };
  }

  saveCursorPosition(element: Node): ((offset?: number) => void) | undefined {
    const selection = window.getSelection();

    if (!selection) {
      return;
    }

    const range = selection.getRangeAt(0);
    range.setStart(element, 0);
    const len = range.toString().length;

    return (offset = 0) => {
      const pos = this.getTextNodeAtPosition(element, len);
      selection.removeAllRanges();
      const range = new Range();
      console.log(pos.node);
      range.setStart(pos.node, pos.position + offset);
      selection.addRange(range);
    };
  }
}
