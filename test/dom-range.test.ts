import { GlobalRegistrator } from '@happy-dom/global-registrator';
import { expect, it, describe } from 'bun:test';
import { HTMLBlockEditor } from '../src/editor/html-editor';
import type { EditorRange } from '../src/editor/types';

GlobalRegistrator.register();

const editor = new HTMLBlockEditor();

const default1 = `
<div data-element="editor" contenteditable="">
  <h1 data-element="title" data-placeholder="Titel">Beitrag vom 24.03.2025</h1>
  <div contenteditable="false"></div>
  <div data-element="insertion-target" contenteditable="false">
    <div></div>
  </div>
  <div class="block-wrapper">
    <div data-element="block" data-block-id="fc754f08-da7f-4590-9d4d-30836db832b6"
      data-block-type="rich-text">
      <span data-element="span" data-span-index="0">The </span>
      <span class="bold" data-element="span" data-span-index="1">quick brown</span>
      <span data-element="span" data-span-index="2"> fox</span>
    </div>
    <div class="dragger" contenteditable="false" draggable="true"></div>
  </div>
  <div data-element="insertion-target" contenteditable="false">
    <div></div>
  </div>
  <div class="block-wrapper">
    <div data-element="block"
      data-block-id="a920289b-88a5-47d8-8771-a77b69b6dd40" data-block-type="rich-text">
      <span data-element="span" data-span-index="0">jumps over the </span>
      <span class="underline" data-element="span" data-span-index="1">lazy</span>
    </div>
    <div class="dragger" contenteditable="false" draggable="true"></div>
  </div>
  <div data-element="insertion-target" contenteditable="false">
    <div></div>
  </div>
  <div class="block-wrapper">
    <div data-element="block"
      data-block-id="f8f21ff6-f839-4bbf-8635-0f4dbf04601a" data-block-type="rich-text">
      <span data-element="span" data-span-index="0">dog.</span>
    </div>
    <div class="dragger" contenteditable="false" draggable="true"></div>
  </div>
  <div data-element="insertion-target" contenteditable="false">
    <div></div>
  </div>
  <div contenteditable="false"></div>
</div>
`;

const getSpanContainer = (blockId: string, spanIndex: number) => {
  const spanContainer = document
    .querySelector(`[data-block-id="${blockId}"]`)
    ?.querySelector(`[data-span-index="${spanIndex}"]`);

  if (!spanContainer || !(spanContainer.firstChild instanceof Text)) {
    throw new Error(`Span container not found for blockId: ${blockId}, spanIndex: ${spanIndex}`);
  }

  return spanContainer.firstChild;
};

describe('getEditorRange', () => {
  it('should work with a selection across two blocks', () => {
    document.body.innerHTML = default1;

    const startContainer = getSpanContainer('fc754f08-da7f-4590-9d4d-30836db832b6', 1);
    const endContainer = getSpanContainer('a920289b-88a5-47d8-8771-a77b69b6dd40', 0);

    const domRange = new Range();
    domRange.setStart(startContainer, 9);
    domRange.setEnd(endContainer, 8);

    const result: EditorRange = editor.getShallowEditorRange(domRange);

    expect(result).toEqual([
      {
        type: 'rich_text',
        blockId: 'fc754f08-da7f-4590-9d4d-30836db832b6',
        spanIndex: 1,
        startOffset: 9,
        endOffset: 11,
      },
      {
        type: 'rich_text',
        blockId: 'a920289b-88a5-47d8-8771-a77b69b6dd40',
        spanIndex: 0,
        startOffset: 0,
        endOffset: 8,
      },
    ]);
  });

  it('should work with a selection within a single block', () => {
    document.body.innerHTML = default1;

    const startContainer = getSpanContainer('fc754f08-da7f-4590-9d4d-30836db832b6', 1);
    const endContainer = getSpanContainer('fc754f08-da7f-4590-9d4d-30836db832b6', 2);

    const domRange = new Range();
    domRange.setStart(startContainer, 6);
    domRange.setEnd(endContainer, 3);

    const result: EditorRange = editor.getShallowEditorRange(domRange);

    expect(result).toEqual([
      {
        type: 'rich_text',
        blockId: 'fc754f08-da7f-4590-9d4d-30836db832b6',
        spanIndex: 1,
        startOffset: 6,
        endOffset: 11,
      },
      {
        type: 'rich_text',
        blockId: 'fc754f08-da7f-4590-9d4d-30836db832b6',
        spanIndex: 2,
        startOffset: 0,
        endOffset: 3,
      },
    ]);
  });

  it('should work with a selection within a single span', () => {
    document.body.innerHTML = default1;

    const startContainer = getSpanContainer('fc754f08-da7f-4590-9d4d-30836db832b6', 1);
    const endContainer = getSpanContainer('fc754f08-da7f-4590-9d4d-30836db832b6', 1);

    const domRange = new Range();
    domRange.setStart(startContainer, 2);
    domRange.setEnd(endContainer, 4);

    const result: EditorRange = editor.getShallowEditorRange(domRange);

    expect(result).toEqual([
      {
        type: 'rich_text',
        blockId: 'fc754f08-da7f-4590-9d4d-30836db832b6',
        spanIndex: 1,
        startOffset: 2,
        endOffset: 4,
      },
    ]);
  });

  it('should work with a selection of a whole block', () => {
    document.body.innerHTML = default1;

    const startContainer = getSpanContainer('a920289b-88a5-47d8-8771-a77b69b6dd40', 0);
    const endContainer = getSpanContainer('a920289b-88a5-47d8-8771-a77b69b6dd40', 1);

    const domRange = new Range();
    domRange.setStart(startContainer, 0);
    domRange.setEnd(endContainer, 4);

    const result: EditorRange = editor.getShallowEditorRange(domRange);

    expect(result).toEqual([
      {
        type: 'rich_text',
        blockId: 'a920289b-88a5-47d8-8771-a77b69b6dd40',
        spanIndex: 0,
        startOffset: 0,
        endOffset: 15,
      },
      {
        type: 'rich_text',
        blockId: 'a920289b-88a5-47d8-8771-a77b69b6dd40',
        spanIndex: 1,
        startOffset: 0,
        endOffset: 4,
      },
    ]);
  });

  it('should work with a selection of a whole block (double-click)', () => {
    document.body.innerHTML = default1;

    const startContainer = getSpanContainer('a920289b-88a5-47d8-8771-a77b69b6dd40', 0);
    const endContainer = document.querySelector('[data-block-id="a920289b-88a5-47d8-8771-a77b69b6dd40"]')
      ?.parentElement!;

    const domRange = new Range();
    domRange.setStart(startContainer, 0);
    domRange.setEnd(endContainer, 3);

    const result: EditorRange = editor.getShallowEditorRange(domRange);

    expect(result).toEqual([
      {
        type: 'rich_text',
        blockId: 'a920289b-88a5-47d8-8771-a77b69b6dd40',
        spanIndex: 0,
        startOffset: 0,
        endOffset: 15,
      },
      {
        type: 'rich_text',
        blockId: 'a920289b-88a5-47d8-8771-a77b69b6dd40',
        spanIndex: 1,
        startOffset: 0,
        endOffset: 4,
      },
    ]);
  });

  it('should work when deleting a block at the beginning of the line', () => {
    document.body.innerHTML = default1;

    const startContainer = document.querySelector('[data-block-id="fc754f08-da7f-4590-9d4d-30836db832b6"]')
      ?.parentElement!;
    const endContainer = document.querySelector('[data-block-id="a920289b-88a5-47d8-8771-a77b69b6dd40"]')!;

    const domRange = new Range();
    domRange.setStart(startContainer, 4);
    domRange.setEnd(endContainer, 0);

    const result: EditorRange = editor.getShallowEditorRange(domRange);

    expect(result).toEqual([
      {
        type: 'rich_text',
        blockId: 'fc754f08-da7f-4590-9d4d-30836db832b6',
        spanIndex: 2,
        startOffset: 4,
        endOffset: 4,
      },
      {
        type: 'rich_text',
        blockId: 'a920289b-88a5-47d8-8771-a77b69b6dd40',
        spanIndex: 0,
        startOffset: 0,
        endOffset: 0,
      },
    ]);
  });
});
