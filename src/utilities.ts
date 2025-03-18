import type { PropType } from 'vue';

export const Booleanish = [String, Boolean] as PropType<boolean | 'true' | 'false'>;

export const KeyName = {
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  Backspace: 'Backspace',
  Enter: 'Enter',
} as const;

export function insertString(str: string, index: number, value: string): string {
  return str.slice(0, index) + value + str.slice(index);
}
