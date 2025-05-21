import type { StandardBlockDto } from 'bun-utilities/cms';

const DataTransferNamespace = 'de.master-software.cms';

export const DataTransferPayload = {
  BlockId: `${DataTransferNamespace}/block-id`,
} as const;

export interface CmsFile {
  source: File;
  type: 'audio' | 'image';
  state: 'pending' | 'uploaded' | 'error';
}

export interface EditorConfiguration {
  features: {
    fileUpload: boolean;
  };
  callbacks: {
    onSave: (document: StandardBlockDto) => Promise<void>;
    onExit: () => void;
    onUpload?: (data: File, documentId: string, fileId: string) => Promise<'uploaded' | 'error'>;
    getFileSourceUrl?: (fileId: string) => string;
  };
}
