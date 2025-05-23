import { inject } from 'vue';
import type { Configuration } from '../config';

export const useConfig = () => {
  const config = inject<Configuration>('config');

  if (!config) {
    throw new Error('Missing configuration');
  }

  return config;
};
