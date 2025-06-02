import type { StandardBlockDto } from 'ts-utilities/cms';

type SaveFunction = (document: StandardBlockDto) => Promise<void>;
type Feature = (typeof Configuration.Feature)[keyof typeof Configuration.Feature];

export type EditorConfiguration = {
  features?: Record<Feature, boolean>;
  callbacks: {
    onSave?: SaveFunction;
    onExit?: () => Promise<void>;
    onUpload?: (data: File, documentId: string, fileId: string) => Promise<'uploaded' | 'error'>;
    getFileSourceUrl?: (fileId: string) => string;
  };
};

export class Configuration {
  static readonly Feature = {
    FileUpload: 'file-upload',
  } as const;

  static defaultSave(endpoint: string): SaveFunction {
    return async (document: StandardBlockDto) => {
      await fetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(document),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    };
  }

  private readonly config: EditorConfiguration;

  constructor(config: EditorConfiguration) {
    this.config = config;
  }

  get callbacks(): EditorConfiguration['callbacks'] {
    return this.config.callbacks;
  }

  isEnabled(feature: Feature): boolean {
    return this.config.features?.[feature] === true;
  }
}
