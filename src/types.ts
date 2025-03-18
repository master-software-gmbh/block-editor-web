const DataTransferNamespace = 'de.master-software.cms';

export const DataTransferPayload = {
  BlockId: `${DataTransferNamespace}/block-id`,
} as const;

export interface CmsFile {
  source: File;
  type: 'audio' | 'image';
  state: 'pending' | 'uploaded' | 'error';
}
