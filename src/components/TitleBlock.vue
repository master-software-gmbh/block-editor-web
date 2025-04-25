<template>
  <h1 data-element="title" data-placeholder="Titel" @input="handleInput">
    {{ title }}
  </h1>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true,
    },
  },
  methods: {
    handleInput() {
      this.$emit('update', this.$el.textContent);
    },
  },
});
</script>

<style lang="css" scoped>
[data-element="title"] {
  z-index: 1;
  min-height: 1em;
  line-height: 1em;
  position: relative;
  margin: 0.5em 0 0 0;
}
</style>