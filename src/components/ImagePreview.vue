<template>
  <Transition name="fade">
    <div v-if="preview" @click="setPreview(null)">
      <img :src="preview" />
    </div>
  </Transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useImagePreview } from '../composables/useImagePreview';

export default defineComponent({
  setup() {
    const { preview, setPreview } = useImagePreview();

    return {
      preview,
      setPreview,
    };
  },
});
</script>

<style lang="css" scoped>
div {
  top: 0;
  left: 0;
  z-index: 3;
  width: 100%;
  height: 100%;
  display: flex;
  position: fixed;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.4);
}

img {
  width: auto;
  height: auto;
  max-width: 80%;
  max-height: 80%;
}


.fade-enter-active,
.fade-leave-active {
  transition: opacity 150ms ease-out;

  img {
    transition: transform 150ms ease-out;
  }
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;

  img {
    transform: scale(0.95);
  }
}
</style>