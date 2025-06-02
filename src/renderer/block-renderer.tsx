/** @jsxImportSource hono/jsx */
import type { DocumentBlock, PlainTextBlock, RichTextBlock, StandardBlock } from 'ts-utilities/cms';
import type { BlockRenderer } from './interface';
import 'ts-utilities/array';
import type { JSX } from 'hono/jsx/jsx-runtime';

export class HonoJsxBlockRenderer implements BlockRenderer {
  async renderStandardBlock(block: StandardBlock): Promise<string> {
    switch (block.type) {
      case 'document':
        return this.renderDocumentBlock(block);
      case 'rich-text':
        return this.renderRichTextBlock(block);
      case 'plain-text':
        return this.renderPlainTextBlock(block);
      default:
        return <p>Unknown block: {block.type}</p>;
    }
  }

  renderDocumentBlock(block: DocumentBlock): Promise<string> {
    return this.renderBlock(block, <h1>{block.content.title}</h1>);
  }

  renderRichTextBlock(block: RichTextBlock): Promise<string> {
    return this.renderBlock(
      block,
      <p>
        {block.content.spans.map((span) => {
          const classes = Object.entries(span.attributes)
            .compactMap(([key, value]) => (value ? key : null))
            .join(' ');

          return <span class={classes}>{span.text}</span>;
        })}
      </p>,
    );
  }

  renderPlainTextBlock(block: PlainTextBlock): Promise<string> {
    return this.renderBlock(block, <p>{block.content.text}</p>);
  }

  private async renderBlock(block: StandardBlock, content: JSX.Element | JSX.Element[]): Promise<string> {
    return (
      <div data-block-id={block.id} data-block-type={block.type}>
        {content}
        {block.children.map((child) => this.renderStandardBlock(child))}
      </div>
    );
  }
}
