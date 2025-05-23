import { createApp } from 'vue';
import { BlockEditor } from './editor';
import '../src/main.css';
import { Configuration, type EditorConfiguration } from '../src/config';

export function setupEditor(config: EditorConfiguration, rootId = 'app', dataId = 'cms-document') {
  const container = document.getElementById(rootId);
  const content = document.getElementById(dataId)?.textContent;

  if (!container) {
    throw new Error('Container not found');
  }

  if (!content) {
    throw new Error('Content not found');
  }

  const data = JSON.parse(content);

  const app = createApp({
    provide: {
      data: data,
      config: new Configuration(config),
    },
    components: {
      BlockEditor,
    },
    template: `
      <BlockEditor />
    `,
  });

  app.mount(container);
}

export { Configuration };
