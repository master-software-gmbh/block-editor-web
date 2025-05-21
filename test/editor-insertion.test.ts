import { describe, expect, it } from 'bun:test';
import { EditorState, type BlockEditorAction } from '../src/editor/types';
import { BlockEditor } from '../src/editor/block-editor';

const date = new Date().toISOString();
const documentId = '95f20aea-f289-4046-aa82-966338f6a0f0';

describe('BlockEditor', () => {
  it('should insert a single character at the beginning of a rich text block (single span)', () => {
    const blockId = crypto.randomUUID();

    const state = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'ello world',
                  attributes: {},
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 0,
          startOffset: 0,
        },
      ],
    );

    const expectedState = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello world',
                  attributes: {},
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 0,
          startOffset: 1,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'insert_text',
      text: 'H',
    };

    const editor = new BlockEditor();
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should insert a single character at the middle of a rich text block (single span)', () => {
    const blockId = crypto.randomUUID();

    const state = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello world',
                  attributes: {},
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 0,
          startOffset: 5,
        },
      ],
    );

    const expectedState = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello, world',
                  attributes: {},
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 0,
          startOffset: 6,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'insert_text',
      text: ',',
    };

    const editor = new BlockEditor();
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should insert a single character at the end of a rich text block (single span)', () => {
    const blockId = crypto.randomUUID();

    const state = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello world',
                  attributes: {},
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 0,
          startOffset: 11,
        },
      ],
    );

    const expectedState = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello world!',
                  attributes: {},
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 0,
          startOffset: 12,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'insert_text',
      text: '!',
    };

    const editor = new BlockEditor();
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should insert a single character at the beginning of a rich text block (multiple spans)', () => {
    const blockId = crypto.randomUUID();

    const state = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'ello world',
                  attributes: {},
                },
                {
                  text: '!',
                  attributes: {},
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 0,
          startOffset: 0,
        },
      ],
    );

    const expectedState = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello world!',
                  attributes: {},
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 0,
          startOffset: 1,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'insert_text',
      text: 'H',
    };

    const editor = new BlockEditor();
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should insert a single character at the middle of a rich text block (multiple spans)', () => {
    const blockId = crypto.randomUUID();

    const state = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello',
                  attributes: {},
                },
                {
                  text: ' world',
                  attributes: {
                    bold: true,
                  },
                },
                {
                  text: '!',
                  attributes: {
                    underline: true,
                  },
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 1,
          startOffset: 6,
        },
      ],
    );

    const expectedState = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello',
                  attributes: {},
                },
                {
                  text: ' world!',
                  attributes: {
                    bold: true,
                  },
                },
                {
                  text: '!',
                  attributes: {
                    underline: true,
                  },
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 1,
          startOffset: 7,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'insert_text',
      text: '!',
    };

    const editor = new BlockEditor();
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should insert a single character at the end of a rich text block (multiple spans)', () => {
    const blockId = crypto.randomUUID();

    const state = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello world',
                  attributes: {},
                },
                {
                  text: '!',
                  attributes: {
                    bold: true,
                  },
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 1,
          startOffset: 1,
        },
      ],
    );

    const expectedState = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello world',
                  attributes: {},
                },
                {
                  text: '!!',
                  attributes: {
                    bold: true,
                  },
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 1,
          startOffset: 2,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'insert_text',
      text: '!',
    };

    const editor = new BlockEditor();
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should insert multiple characters at the beginning of a rich text block (multiple spans)', () => {
    const blockId = crypto.randomUUID();

    const state = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello world',
                  attributes: {},
                },
                {
                  text: '!',
                  attributes: {
                    bold: true,
                  },
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 0,
          startOffset: 0,
        },
      ],
    );

    const expectedState = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'HelloHello world',
                  attributes: {},
                },
                {
                  text: '!',
                  attributes: {
                    bold: true,
                  },
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 0,
          startOffset: 5,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'insert_text',
      text: 'Hello',
    };

    const editor = new BlockEditor();
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should insert multiple characters at the middle of a rich text block (multiple spans)', () => {
    const blockId = crypto.randomUUID();

    const state = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello',
                  attributes: {},
                },
                {
                  text: ' world',
                  attributes: {
                    underline: true,
                  },
                },
                {
                  text: '!',
                  attributes: {
                    bold: true,
                  },
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 1,
          startOffset: 6,
        },
      ],
    );

    const expectedState = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello',
                  attributes: {},
                },
                {
                  text: ' worldworld',
                  attributes: {
                    underline: true,
                  },
                },
                {
                  text: '!',
                  attributes: {
                    bold: true,
                  },
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 1,
          startOffset: 11,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'insert_text',
      text: 'world',
    };

    const editor = new BlockEditor();
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should insert multiple characters at the end of a rich text block (multiple spans)', () => {
    const blockId = crypto.randomUUID();

    const state = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello',
                  attributes: {},
                },
                {
                  text: ' world',
                  attributes: {
                    underline: true,
                  },
                },
                {
                  text: '!',
                  attributes: {
                    bold: true,
                  },
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 2,
          startOffset: 1,
        },
      ],
    );

    const expectedState = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello',
                  attributes: {},
                },
                {
                  text: ' world',
                  attributes: {
                    underline: true,
                  },
                },
                {
                  text: '!!!!',
                  attributes: {
                    bold: true,
                  },
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 2,
          startOffset: 4,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'insert_text',
      text: '!!!',
    };

    const editor = new BlockEditor();
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should replace multiple characters at the middle of a rich text block (multiple spans)', () => {
    const blockId = crypto.randomUUID();

    const state = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello Hello',
                  attributes: {},
                },
                {
                  text: ' world',
                  attributes: {
                    bold: true,
                  },
                },
                {
                  text: ' world world',
                  attributes: {},
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 0,
          startOffset: 6,
          endOffset: 11,
        },
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 1,
          startOffset: 0,
          endOffset: 6,
        },
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 2,
          startOffset: 0,
          endOffset: 6,
        },
      ],
    );

    const expectedState = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello b world',
                  attributes: {},
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 0,
          startOffset: 7,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'insert_text',
      text: 'b',
    };

    const editor = new BlockEditor();
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should insert paragraph at the end of a rich text block', () => {
    const blockId = crypto.randomUUID();
    const blockId2 = crypto.randomUUID();

    const state = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello',
                  attributes: {},
                },
                {
                  text: ' world',
                  attributes: {
                    bold: true,
                  },
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 1,
          startOffset: 6,
        },
      ],
    );

    const expectedState = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello',
                  attributes: {},
                },
                {
                  text: ' world',
                  attributes: {
                    bold: true,
                  },
                },
              ],
            },
          },
          {
            type: 'rich-text',
            children: [],
            id: blockId2,
            content: {
              spans: [
                {
                  text: '',
                  attributes: {},
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId2,
          spanIndex: 0,
          startOffset: 0,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'insert_paragraph',
    };

    const editor = new BlockEditor(() => blockId2);
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should insert paragraph at the middle of a rich text block', () => {
    const blockId = crypto.randomUUID();
    const blockId2 = crypto.randomUUID();

    const state = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello',
                  attributes: {},
                },
                {
                  text: ' world',
                  attributes: {
                    bold: true,
                  },
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 1,
          startOffset: 1,
        },
      ],
    );

    const expectedState = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello',
                  attributes: {},
                },
                {
                  text: ' ',
                  attributes: {
                    bold: true,
                  },
                },
              ],
            },
          },
          {
            type: 'rich-text',
            children: [],
            id: blockId2,
            content: {
              spans: [
                {
                  text: 'world',
                  attributes: {
                    bold: true,
                  },
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId2,
          spanIndex: 0,
          startOffset: 0,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'insert_paragraph',
    };

    const editor = new BlockEditor(() => blockId2);
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should insert paragraph at the beginning of a rich text block', () => {
    const blockId = crypto.randomUUID();
    const blockId2 = crypto.randomUUID();
    const blockId3 = crypto.randomUUID();

    const state = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello',
                  attributes: {},
                },
                {
                  text: ' world',
                  attributes: {
                    bold: true,
                  },
                },
              ],
            },
          },
          {
            type: 'rich-text',
            children: [],
            id: blockId3,
            content: {
              spans: [
                {
                  text: 'Hello',
                  attributes: {},
                },
                {
                  text: ' world',
                  attributes: {
                    bold: true,
                  },
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 0,
          startOffset: 0,
        },
      ],
    );

    const expectedState = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: '',
                  attributes: {},
                },
              ],
            },
          },
          {
            type: 'rich-text',
            children: [],
            id: blockId2,
            content: {
              spans: [
                {
                  text: 'Hello',
                  attributes: {},
                },
                {
                  text: ' world',
                  attributes: {
                    bold: true,
                  },
                },
              ],
            },
          },
          {
            type: 'rich-text',
            children: [],
            id: blockId3,
            content: {
              spans: [
                {
                  text: 'Hello',
                  attributes: {},
                },
                {
                  text: ' world',
                  attributes: {
                    bold: true,
                  },
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId2,
          spanIndex: 0,
          startOffset: 0,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'insert_paragraph',
    };

    const editor = new BlockEditor(() => blockId2);
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should insert paragraph across multiple rich text blocks', () => {
    const blockId = crypto.randomUUID();
    const blockId2 = crypto.randomUUID();
    const blockId3 = crypto.randomUUID();
    const blockId4 = crypto.randomUUID();

    const state = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'The',
                  attributes: {},
                },
                {
                  text: ' quick brown',
                  attributes: {
                    bold: true,
                  },
                },
                {
                  text: ' fox',
                  attributes: {},
                },
              ],
            },
          },
          {
            type: 'rich-text',
            children: [],
            id: blockId3,
            content: {
              spans: [
                {
                  text: 'jumps over the',
                  attributes: {},
                },
                {
                  text: ' lazy',
                  attributes: {
                    underline: true,
                  },
                },
              ],
            },
          },
          {
            type: 'rich-text',
            children: [],
            id: blockId4,
            content: {
              spans: [
                {
                  text: 'dog.',
                  attributes: {},
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 2,
          startOffset: 0,
          endOffset: 4,
        },
        {
          type: 'rich_text',
          blockId: blockId3,
          spanIndex: 0,
          startOffset: 0,
          endOffset: 11,
        },
      ],
    );

    const expectedState = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'The',
                  attributes: {},
                },
                {
                  text: ' quick brown',
                  attributes: {
                    bold: true,
                  },
                },
              ],
            },
          },
          {
            type: 'rich-text',
            children: [],
            id: blockId2,
            content: {
              spans: [
                {
                  text: 'the',
                  attributes: {},
                },
                {
                  text: ' lazy',
                  attributes: {
                    underline: true,
                  },
                },
              ],
            },
          },
          {
            type: 'rich-text',
            children: [],
            id: blockId4,
            content: {
              spans: [
                {
                  text: 'dog.',
                  attributes: {},
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId2,
          spanIndex: 0,
          startOffset: 0,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'insert_paragraph',
    };

    const editor = new BlockEditor(() => blockId2);
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should insert text with a line break at the end of a rich text block', () => {
    const blockId = crypto.randomUUID();
    const blockId2 = crypto.randomUUID();

    const state = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello',
                  attributes: {},
                },
                {
                  text: ' world',
                  attributes: {
                    bold: true,
                  },
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 1,
          startOffset: 6,
        },
      ],
    );

    const expectedState = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello',
                  attributes: {},
                },
                {
                  text: ' worldHello\nworld',
                  attributes: {
                    bold: true,
                  },
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 1,
          startOffset: 17,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'insert_text',
      text: 'Hello\nworld',
    };

    const editor = new BlockEditor(() => blockId2);
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should insert text with multiple line breaks at the end of a rich text block', () => {
    const blockId = crypto.randomUUID();
    const blockId2 = crypto.randomUUID();

    const state = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello',
                  attributes: {},
                },
                {
                  text: ' world',
                  attributes: {
                    bold: true,
                  },
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 1,
          startOffset: 6,
        },
      ],
    );

    const expectedState = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello',
                  attributes: {},
                },
                {
                  text: ' worldHello',
                  attributes: {
                    bold: true,
                  },
                },
              ],
            },
          },
          {
            type: 'rich-text',
            children: [],
            id: blockId2,
            content: {
              spans: [
                {
                  text: 'world',
                  attributes: {},
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId2,
          spanIndex: 0,
          startOffset: 5,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'insert_text',
      text: 'Hello\n\nworld',
    };

    const editor = new BlockEditor(() => blockId2);
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should insert text at the beginning of the title', () => {
    const blockId = crypto.randomUUID();

    const state = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello',
                  attributes: {},
                },
                {
                  text: ' world',
                  attributes: {
                    bold: true,
                  },
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'title',
          startOffset: 0,
          endOffset: 0,
        },
      ],
    );

    const expectedState = new EditorState(
      {
        type: 'document',
        content: {
          title: 'ABCTest Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello',
                  attributes: {},
                },
                {
                  text: ' world',
                  attributes: {
                    bold: true,
                  },
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'title',
          startOffset: 3,
          endOffset: 3,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'insert_text',
      text: 'ABC',
    };

    const editor = new BlockEditor();
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should insert text at the end of the title', () => {
    const blockId = crypto.randomUUID();

    const state = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello',
                  attributes: {},
                },
                {
                  text: ' world',
                  attributes: {
                    bold: true,
                  },
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'title',
          startOffset: 13,
          endOffset: 13,
        },
      ],
    );

    const expectedState = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test DocumentABC',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello',
                  attributes: {},
                },
                {
                  text: ' world',
                  attributes: {
                    bold: true,
                  },
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'title',
          startOffset: 16,
          endOffset: 16,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'insert_text',
      text: 'ABC',
    };

    const editor = new BlockEditor();
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should insert new line at the end of the title', () => {
    const blockId = crypto.randomUUID();
    const blockId2 = crypto.randomUUID();

    const state = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello',
                  attributes: {},
                },
                {
                  text: ' world',
                  attributes: {
                    bold: true,
                  },
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'title',
          startOffset: 13,
          endOffset: 13,
        },
      ],
    );

    const expectedState = new EditorState(
      {
        type: 'document',
        content: {
          title: 'Test Document',
        },
        id: documentId,
        children: [
          {
            type: 'rich-text',
            children: [],
            id: blockId2,
            content: {
              spans: [
                {
                  text: '',
                  attributes: {},
                },
              ],
            },
          },
          {
            type: 'rich-text',
            children: [],
            id: blockId,
            content: {
              spans: [
                {
                  text: 'Hello',
                  attributes: {},
                },
                {
                  text: ' world',
                  attributes: {
                    bold: true,
                  },
                },
              ],
            },
          },
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId2,
          spanIndex: 0,
          startOffset: 0,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'insert_paragraph',
    };

    const editor = new BlockEditor(() => blockId2);
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });
});
