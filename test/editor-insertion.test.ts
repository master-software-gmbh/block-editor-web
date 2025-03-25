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
        createdAt: date,
        updatedAt: date,
        title: 'Test Document',
        id: documentId,
        blocks: [
          {
            type: 'rich-text',
            createdAt: date,
            updatedAt: date,
            id: blockId,
            documentId: documentId,
            content: {
              text: 'ello world',
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
        createdAt: date,
        updatedAt: date,
        title: 'Test Document',
        id: documentId,
        blocks: [
          {
            type: 'rich-text',
            createdAt: date,
            updatedAt: date,
            id: blockId,
            documentId: documentId,
            content: {
              text: 'Hello world',
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
        createdAt: date,
        updatedAt: date,
        title: 'Test Document',
        id: documentId,
        blocks: [
          {
            type: 'rich-text',
            createdAt: date,
            updatedAt: date,
            id: blockId,
            documentId: documentId,
            content: {
              text: 'Hello world',
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
        createdAt: date,
        updatedAt: date,
        title: 'Test Document',
        id: documentId,
        blocks: [
          {
            type: 'rich-text',
            createdAt: date,
            updatedAt: date,
            id: blockId,
            documentId: documentId,
            content: {
              text: 'Hello, world',
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
        createdAt: date,
        updatedAt: date,
        title: 'Test Document',
        id: documentId,
        blocks: [
          {
            type: 'rich-text',
            createdAt: date,
            updatedAt: date,
            id: blockId,
            documentId: documentId,
            content: {
              text: 'Hello world',
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
        createdAt: date,
        updatedAt: date,
        title: 'Test Document',
        id: documentId,
        blocks: [
          {
            type: 'rich-text',
            createdAt: date,
            updatedAt: date,
            id: blockId,
            documentId: documentId,
            content: {
              text: 'Hello world!',
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
        createdAt: date,
        updatedAt: date,
        title: 'Test Document',
        id: documentId,
        blocks: [
          {
            type: 'rich-text',
            createdAt: date,
            updatedAt: date,
            id: blockId,
            documentId: documentId,
            content: {
              text: 'ello world',
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
        createdAt: date,
        updatedAt: date,
        title: 'Test Document',
        id: documentId,
        blocks: [
          {
            type: 'rich-text',
            createdAt: date,
            updatedAt: date,
            id: blockId,
            documentId: documentId,
            content: {
              text: 'Hello world!',
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
        createdAt: date,
        updatedAt: date,
        title: 'Test Document',
        id: documentId,
        blocks: [
          {
            type: 'rich-text',
            createdAt: date,
            updatedAt: date,
            id: blockId,
            documentId: documentId,
            content: {
              text: 'Hello world!',
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
        createdAt: date,
        updatedAt: date,
        title: 'Test Document',
        id: documentId,
        blocks: [
          {
            type: 'rich-text',
            createdAt: date,
            updatedAt: date,
            id: blockId,
            documentId: documentId,
            content: {
              text: 'Hello world!!',
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
        createdAt: date,
        updatedAt: date,
        title: 'Test Document',
        id: documentId,
        blocks: [
          {
            type: 'rich-text',
            createdAt: date,
            updatedAt: date,
            id: blockId,
            documentId: documentId,
            content: {
              text: 'Hello world!',
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
        createdAt: date,
        updatedAt: date,
        title: 'Test Document',
        id: documentId,
        blocks: [
          {
            type: 'rich-text',
            createdAt: date,
            updatedAt: date,
            id: blockId,
            documentId: documentId,
            content: {
              text: 'Hello world!!',
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
        createdAt: date,
        updatedAt: date,
        title: 'Test Document',
        id: documentId,
        blocks: [
          {
            type: 'rich-text',
            createdAt: date,
            updatedAt: date,
            id: blockId,
            documentId: documentId,
            content: {
              text: 'Hello world!',
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
        createdAt: date,
        updatedAt: date,
        title: 'Test Document',
        id: documentId,
        blocks: [
          {
            type: 'rich-text',
            createdAt: date,
            updatedAt: date,
            id: blockId,
            documentId: documentId,
            content: {
              text: 'HelloHello world!',
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
        createdAt: date,
        updatedAt: date,
        title: 'Test Document',
        id: documentId,
        blocks: [
          {
            type: 'rich-text',
            createdAt: date,
            updatedAt: date,
            id: blockId,
            documentId: documentId,
            content: {
              text: 'Hello world!',
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
        createdAt: date,
        updatedAt: date,
        title: 'Test Document',
        id: documentId,
        blocks: [
          {
            type: 'rich-text',
            createdAt: date,
            updatedAt: date,
            id: blockId,
            documentId: documentId,
            content: {
              text: 'Hello worldworld!',
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
        createdAt: date,
        updatedAt: date,
        title: 'Test Document',
        id: documentId,
        blocks: [
          {
            type: 'rich-text',
            createdAt: date,
            updatedAt: date,
            id: blockId,
            documentId: documentId,
            content: {
              text: 'Hello world!',
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
        createdAt: date,
        updatedAt: date,
        title: 'Test Document',
        id: documentId,
        blocks: [
          {
            type: 'rich-text',
            createdAt: date,
            updatedAt: date,
            id: blockId,
            documentId: documentId,
            content: {
              text: 'Hello world!!!!',
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
        createdAt: date,
        updatedAt: date,
        title: 'Test Document',
        id: documentId,
        blocks: [
          {
            type: 'rich-text',
            createdAt: date,
            updatedAt: date,
            id: blockId,
            documentId: documentId,
            content: {
              text: 'Hello Hello bold world world',
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
        createdAt: date,
        updatedAt: date,
        title: 'Test Document',
        id: documentId,
        blocks: [
          {
            type: 'rich-text',
            createdAt: date,
            updatedAt: date,
            id: blockId,
            documentId: documentId,
            content: {
              text: 'Hello b world',
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
        createdAt: date,
        updatedAt: date,
        title: 'Test Document',
        id: documentId,
        blocks: [
          {
            type: 'rich-text',
            createdAt: date,
            updatedAt: date,
            id: blockId,
            documentId: documentId,
            content: {
              text: 'Hello world',
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
        createdAt: date,
        updatedAt: date,
        title: 'Test Document',
        id: documentId,
        blocks: [
          {
            type: 'rich-text',
            createdAt: date,
            updatedAt: date,
            id: blockId,
            documentId: documentId,
            content: {
              text: 'Hello world',
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
            createdAt: date,
            updatedAt: date,
            id: blockId2,
            documentId: documentId,
            content: {
              text: '',
              spans: [
                {
                  text: '',
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

    const editor = new BlockEditor(
      () => blockId2,
      () => date,
    );
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should insert paragraph at the middle of a rich text block', () => {
    const blockId = crypto.randomUUID();
    const blockId2 = crypto.randomUUID();

    const state = new EditorState(
      {
        createdAt: date,
        updatedAt: date,
        title: 'Test Document',
        id: documentId,
        blocks: [
          {
            type: 'rich-text',
            createdAt: date,
            updatedAt: date,
            id: blockId,
            documentId: documentId,
            content: {
              text: 'Hello world',
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
        createdAt: date,
        updatedAt: date,
        title: 'Test Document',
        id: documentId,
        blocks: [
          {
            type: 'rich-text',
            createdAt: date,
            updatedAt: date,
            id: blockId,
            documentId: documentId,
            content: {
              text: 'Hello ',
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
            createdAt: date,
            updatedAt: date,
            id: blockId2,
            documentId: documentId,
            content: {
              text: 'world',
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

    const editor = new BlockEditor(
      () => blockId2,
      () => date,
    );
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should insert paragraph at the beginning of a rich text block', () => {
    const blockId = crypto.randomUUID();
    const blockId2 = crypto.randomUUID();
    const blockId3 = crypto.randomUUID();

    const state = new EditorState(
      {
        createdAt: date,
        updatedAt: date,
        title: 'Test Document',
        id: documentId,
        blocks: [
          {
            type: 'rich-text',
            createdAt: date,
            updatedAt: date,
            id: blockId,
            documentId: documentId,
            content: {
              text: 'Hello world',
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
            createdAt: date,
            updatedAt: date,
            id: blockId3,
            documentId: documentId,
            content: {
              text: 'Hello world',
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
        createdAt: date,
        updatedAt: date,
        title: 'Test Document',
        id: documentId,
        blocks: [
          {
            type: 'rich-text',
            createdAt: date,
            updatedAt: date,
            id: blockId,
            documentId: documentId,
            content: {
              text: '',
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
            createdAt: date,
            updatedAt: date,
            id: blockId2,
            documentId: documentId,
            content: {
              text: 'Hello world',
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
            createdAt: date,
            updatedAt: date,
            id: blockId3,
            documentId: documentId,
            content: {
              text: 'Hello world',
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

    const editor = new BlockEditor(
      () => blockId2,
      () => date,
    );
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
        createdAt: date,
        updatedAt: date,
        title: 'Test Document',
        id: documentId,
        blocks: [
          {
            type: 'rich-text',
            createdAt: date,
            updatedAt: date,
            id: blockId,
            documentId: documentId,
            content: {
              text: 'The quick brown fox',
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
            createdAt: date,
            updatedAt: date,
            id: blockId3,
            documentId: documentId,
            content: {
              text: 'jumps over the lazy',
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
            createdAt: date,
            updatedAt: date,
            id: blockId4,
            documentId: documentId,
            content: {
              text: 'dog.',
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
        createdAt: date,
        updatedAt: date,
        title: 'Test Document',
        id: documentId,
        blocks: [
          {
            type: 'rich-text',
            createdAt: date,
            updatedAt: date,
            id: blockId,
            documentId: documentId,
            content: {
              text: 'The quick brown',
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
            createdAt: date,
            updatedAt: date,
            id: blockId2,
            documentId: documentId,
            content: {
              text: 'the lazy',
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
            createdAt: date,
            updatedAt: date,
            id: blockId4,
            documentId: documentId,
            content: {
              text: 'dog.',
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

    const editor = new BlockEditor(
      () => blockId2,
      () => date,
    );
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });
});
