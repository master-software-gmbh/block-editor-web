import { createApp } from 'vue';
import { BlockEditor } from './editor';
import { BlockViewer, RootWrapper, ImageThumbnail } from './viewer';
import '../src/main.css';
import { Configuration, type EditorConfiguration } from '../src/config';

export function setupEditor(
  config: EditorConfiguration,
  container: string | Element | null = '#app',
  dataElement: string | Element | null = '#cms-document',
) {
  if (typeof container === 'string') {
    container = document.querySelector(container);
  }

  if (typeof dataElement === 'string') {
    dataElement = document.querySelector(dataElement);
  }

  const content = dataElement?.textContent;

  if (!container) {
    throw new Error('Container not found');
  }

  let template: string | undefined;

  if (!container.hasChildNodes()) {
    template = '<BlockEditor />';
  }

  const data = content ? JSON.parse(content) : undefined;

  const app = createApp({
    provide: {
      data: data,
      config: new Configuration(config),
    },
    components: {
      BlockEditor,
      BlockViewer,
      RootWrapper,
      ImageThumbnail,
    },
    template: template,
  });

  app.mount(container);
}

export { Configuration };
