import { ref } from 'vue';

const preview = ref<string | null>(null);

export function useImagePreview() {
  const setPreview = (source: string | null) => {
    preview.value = source;
  };

  return {
    preview,
    setPreview,
  };
}
