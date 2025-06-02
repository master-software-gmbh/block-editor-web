import type { DocumentBlock, PlainTextBlock, RichTextBlock, StandardBlock } from 'ts-utilities/cms';

export interface BlockRenderer {
  renderStandardBlock(block: StandardBlock): Promise<string>;
  renderDocumentBlock(block: DocumentBlock): Promise<string>;
  renderRichTextBlock(block: RichTextBlock): Promise<string>;
  renderPlainTextBlock(block: PlainTextBlock): Promise<string>;
}
