import { inject } from 'vue';
import type { Configuration } from '../config';
import type { DocumentBlockDto } from 'bun-utilities/cms';

export const useDocument = () => {
  const document = inject<DocumentBlockDto>('data');

  if (!document) {
    throw new Error('Missing document');
  }

  return document;
};
