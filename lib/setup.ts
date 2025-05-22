import { createApp } from 'vue';
import type { EditorConfiguration } from '../src/types';
import { BlockEditor } from './editor';
import '../src/main.css';
import type { StandardBlockDto } from 'bun-utilities/cms';

export function setupEditor(config: Partial<EditorConfiguration>, rootId = 'app', dataId = 'cms-document') {
  const container = document.getElementById(rootId);
  const content = document.getElementById(dataId)?.textContent;

  if (!container) {
    throw new Error('Container not found');
  }

  if (!content) {
    throw new Error('Content not found');
  }

  const data = JSON.parse(content);

  let onSave: (doc: StandardBlockDto) => Promise<void>;

  if (config.callbacks?.onSave) {
    onSave = config.callbacks.onSave;
  } else if (config.saveEndpoint) {
    onSave = async (document: StandardBlockDto) => {
      await fetch(config.saveEndpoint!, {
        method: 'PUT',
        body: JSON.stringify(document),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    };
  } else {
    onSave = async () => {
      console.error('No save endpoint or callback provided');
    };
  }

  const app = createApp({
    provide: {
      data: data,
      config: {
        features: {
          fileUpload: config.features?.fileUpload ?? false,
        },
        callbacks: {
          onSave: onSave,
          onExit: config.callbacks?.onExit ?? (() => {}),
          getFileSourceUrl: config.callbacks?.getFileSourceUrl,
          onUpload: config.callbacks?.onUpload,
        },
      } satisfies EditorConfiguration,
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
