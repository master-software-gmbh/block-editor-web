<template>
  <div id="floating-bar" contenteditable="false">
    <button @click="$emit('formatBold')" style="font-weight: bold">F</button>
    <button @click="$emit('formatItalic')" style="font-style: italic">K</button>
    <button @click="$emit('formatUnderline')" style="text-decoration: underline">U</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  emits: ['formatBold', 'formatItalic', 'formatUnderline'],
});
</script>

<style lang="css" scoped>
div {
  z-index: 2;
  padding: 4px;
  display: none;
  column-gap: 5px;
  user-select: none;
  position: absolute;
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 14px 28px -6px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px, rgba(84, 72, 49, 0.08) 0px 0px 0px 1px;
  border-radius: var(--internal-block-editor-border-radius);

  [data-tooltip]:hover::after {
    display: block;
    position: absolute;
    content: attr(data-tooltip);
    border: 1px solid black;
    background: #eee;
    padding: .25em;
  }

  button {
    width: 28px;
    height: 28px;
    padding: 6px;

    border-radius: var(--internal-block-editor-border-radius);
    cursor: pointer;
    background-color: unset;
    transition: background-color 50ms ease-in;

    &:hover {
      background-color: var(--internal-block-editor-color-tertiary);
    }

    &:active {
      background-color: var(--internal-block-editor-color-secondary);
    }
  }
}
</style>