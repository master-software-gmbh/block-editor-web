import { describe, expect, it } from 'bun:test';
import { EditorState, type BlockEditorAction } from '../src/editor/types';
import { BlockEditor } from '../src/editor/block-editor';

const editor = new BlockEditor();
const date = new Date();
const documentId = '95f20aea-f289-4046-aa82-966338f6a0f0';

describe('set_attribute', () => {
  it('should format a single span', () => {
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
              text: 'Hello world',
              spans: [
                {
                  text: 'Hello world',
                  attributes: {
                    underline: true,
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
          endOffset: 11,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'set_attribute',
      name: 'bold',
      value: true,
    };

    const newState = editor.applyAction(state, action);
    expect(newState).toEqual(expectedState);
  });

  it('should format a single span and leave trailing spans', () => {
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
              text: 'Hello world!',
              spans: [
                {
                  text: 'Hello world',
                  attributes: {
                    underline: true,
                    bold: true,
                  },
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
          endOffset: 11,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'set_attribute',
      name: 'bold',
      value: true,
    };

    const newState = editor.applyAction(state, action);
    expect(newState).toEqual(expectedState);
  });

  it('should split and format a single span', () => {
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
                  text: 'Hello world!',
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
          startOffset: 6,
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
              text: 'Hello world!',
              spans: [
                {
                  text: 'Hello ',
                  attributes: {
                    underline: true,
                  },
                },
                {
                  text: 'world',
                  attributes: {
                    underline: true,
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
          startOffset: 0,
          endOffset: 5,
        },
      ],
    );

    const action: BlockEditorAction = {
      type: 'set_attribute',
      name: 'bold',
      value: true,
    };

    const newState = editor.applyAction(state, action);
    expect(newState).toEqual(expectedState);
  });
});

describe('get_attribute', () => {
  it('should handle a single span', () => {
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
          startOffset: 0,
          endOffset: 11,
        },
      ],
    );

    expect(editor.getRangeAttribute(state, 'bold')).toBe(false);
    expect(editor.getRangeAttribute(state, 'underline')).toBe(true);
  });

  it('should handle multiple spans', () => {
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
                  text: 'Hello ',
                  attributes: {
                    underline: true,
                    italic: true,
                  },
                },
                {
                  text: 'world',
                  attributes: {
                    underline: false,
                    bold: true,
                    italic: true,
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
          endOffset: 6,
        },
        {
          type: 'rich_text',
          blockId: blockId,
          spanIndex: 1,
          startOffset: 0,
          endOffset: 5,
        },
      ],
    );

    expect(editor.getRangeAttribute(state, 'bold')).toBe(false);
    expect(editor.getRangeAttribute(state, 'italic')).toBe(true);
    expect(editor.getRangeAttribute(state, 'underline')).toBe(false);
  });
});
