import { describe, expect, it } from 'bun:test';
import { EditorState, type BlockEditorAction } from '../src/editor/types';
import { BlockEditor } from '../src/editor/block-editor';

const date = new Date().toISOString();
const documentId = '95f20aea-f289-4046-aa82-966338f6a0f0';

describe('BlockEditor', () => {
  it('should delete a single character at the end of a rich text block (single span)', () => {
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
          spanIndex: 0,
          startOffset: 10,
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
              text: 'Hello worl',
              spans: [
                {
                  text: 'Hello worl',
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
          spanIndex: 0,
          startOffset: 10,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'delete_text',
    };

    const editor = new BlockEditor();
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should delete a single character at the middle of a rich text block (single span)', () => {
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
          spanIndex: 0,
          startOffset: 5,
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
              text: 'Helloworld',
              spans: [
                {
                  text: 'Helloworld',
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
          spanIndex: 0,
          startOffset: 5,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'delete_text',
    };

    const editor = new BlockEditor();
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should delete a single character at the middle of a rich text block (multiple spans)', () => {
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
                  text: 'Hello',
                  attributes: {
                    underline: true,
                  },
                },
                {
                  text: ' world',
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
          spanIndex: 0,
          startOffset: 5,
        },
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 1,
          startOffset: 0,
          endOffset: 1,
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
              text: 'Helloworld',
              spans: [
                {
                  text: 'Helloworld',
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
          spanIndex: 0,
          startOffset: 5,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'delete_text',
    };

    const editor = new BlockEditor();
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should delete multiple characters at the beginning of a rich text block (multiple spans)', () => {
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
                  text: 'Hello',
                  attributes: {
                    underline: true,
                  },
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
          endOffset: 3,
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
              text: 'lo world',
              spans: [
                {
                  text: 'lo',
                  attributes: {
                    underline: true,
                  },
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

    const action: BlockEditorAction = {
      type: 'delete_text',
    };

    const editor = new BlockEditor();
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should delete multiple characters at the beginning of a rich text block (multiple spans)', () => {
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
                  text: 'Hello',
                  attributes: {
                    underline: true,
                  },
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
          endOffset: 5,
        },
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 1,
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
              text: ' world',
              spans: [
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

    const action: BlockEditorAction = {
      type: 'delete_text',
    };

    const editor = new BlockEditor();
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should delete multiple characters at the middle of a rich text block (multiple spans)', () => {
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
                  text: 'Hello',
                  attributes: {
                    underline: true,
                  },
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
          startOffset: 2,
          endOffset: 4,
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
              text: 'Heo world',
              spans: [
                {
                  text: 'Heo',
                  attributes: {
                    underline: true,
                  },
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
          startOffset: 2,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'delete_text',
    };

    const editor = new BlockEditor();
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should delete multiple characters at the middle of a rich text block (multiple spans)', () => {
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
                  text: 'Hello',
                  attributes: {
                    underline: true,
                  },
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
          startOffset: 3,
          endOffset: 5,
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
              text: 'Hello wod',
              spans: [
                {
                  text: 'Hello',
                  attributes: {
                    underline: true,
                  },
                },
                {
                  text: ' wod',
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
          startOffset: 3,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'delete_text',
    };

    const editor = new BlockEditor();
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should delete multiple characters at the middle of a rich text block (multiple spans)', () => {
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
          spanIndex: 0,
          startOffset: 8,
          endOffset: 10,
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
              text: 'Hello wod',
              spans: [
                {
                  text: 'Hello wod',
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
          spanIndex: 0,
          startOffset: 8,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'delete_text',
    };

    const editor = new BlockEditor();
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should delete multiple characters of multiple rich text blocks', () => {
    const blockId1 = crypto.randomUUID();
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
            id: blockId1,
            documentId: documentId,
            content: {
              text: 'Hello world',
              spans: [
                {
                  text: 'Hello world',
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
              text: 'Hello world',
              spans: [
                {
                  text: 'Hello world',
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
          blockId: blockId1,
          spanIndex: 0,
          startOffset: 9,
          endOffset: 11,
        },
        {
          type: 'rich_text',
          blockId: blockId2,
          spanIndex: 0,
          startOffset: 0,
          endOffset: 2,
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
            id: blockId1,
            documentId: documentId,
            content: {
              text: 'Hello worllo world',
              spans: [
                {
                  text: 'Hello wor',
                  attributes: {
                    bold: true,
                  },
                },
                {
                  text: 'llo world',
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
          blockId: blockId1,
          spanIndex: 0,
          startOffset: 9,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'delete_text',
    };

    const editor = new BlockEditor();
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should delete characters at the middle of a rich text block', () => {
    const blockId1 = crypto.randomUUID();
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
            id: blockId1,
            documentId: documentId,
            content: {
              text: 'Hello world',
              spans: [
                {
                  text: 'Hello world',
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
              text: 'Hello world Hello world',
              spans: [
                {
                  text: 'Hello world',
                  attributes: {
                    underline: true,
                  },
                },
                {
                  text: ' Hello world',
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
          spanIndex: 1,
          startOffset: 0,
          endOffset: 1,
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
            id: blockId1,
            documentId: documentId,
            content: {
              text: 'Hello world',
              spans: [
                {
                  text: 'Hello world',
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
              text: 'Hello worldHello world',
              spans: [
                {
                  text: 'Hello world',
                  attributes: {
                    underline: true,
                  },
                },
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
          blockId: blockId2,
          spanIndex: 1,
          startOffset: 0,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'delete_text',
    };

    const editor = new BlockEditor();
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should delete newlines', () => {
    const blockId1 = crypto.randomUUID();
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
            id: blockId1,
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
              text: '',
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
          blockId: blockId1,
          spanIndex: 0,
          startOffset: 0,
          endOffset: 0,
        },
        {
          type: 'rich_text',
          blockId: blockId2,
          spanIndex: 0,
          startOffset: 0,
          endOffset: 0,
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
            id: blockId1,
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
        ],
      },
      [
        {
          type: 'rich_text',
          blockId: blockId1,
          spanIndex: 0,
          startOffset: 0,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'delete_text',
    };

    const editor = new BlockEditor();
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });

  it('should move the cursor to the previous span if a span is deleted', () => {
    const blockId1 = crypto.randomUUID();
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
            id: blockId1,
            documentId: documentId,
            content: {
              text: 'Hello world',
              spans: [
                {
                  text: 'Hello world',
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
              text: 'Hello world Hello world',
              spans: [
                {
                  text: 'Hello world',
                  attributes: {
                    underline: true,
                  },
                },
                {
                  text: ' Hello world',
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
          spanIndex: 1,
          startOffset: 0,
          endOffset: 12,
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
            id: blockId1,
            documentId: documentId,
            content: {
              text: 'Hello world',
              spans: [
                {
                  text: 'Hello world',
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
              text: 'Hello world',
              spans: [
                {
                  text: 'Hello world',
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
          blockId: blockId2,
          spanIndex: 0,
          startOffset: 11,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'delete_text',
    };

    const editor = new BlockEditor();
    const newState = editor.applyAction(state, action);

    expect(newState).toEqual(expectedState);
  });
});
