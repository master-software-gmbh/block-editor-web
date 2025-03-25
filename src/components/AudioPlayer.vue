<template>
  <div class="audio-player" contenteditable="false">
    <svg class="play-icon" v-show="!isPlaying" v-on:click="play" xmlns="http://www.w3.org/2000/svg" height="24px"
      viewBox="0 -960 960 960" width="24px" fill="currentColor">
      <path
        d="m380-300 280-180-280-180v360ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
    </svg>
    <svg class="pause-icon" v-show="isPlaying" v-on:click="pause" xmlns="http://www.w3.org/2000/svg" height="24px"
      viewBox="0 -960 960 960" width="24px" fill="currentColor">
      <path
        d="M360-320h80v-320h-80v320Zm160 0h80v-320h-80v320ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
    </svg>
    <div class="column">
      <div class="row">
        <progress :value="currentTime" max="1"></progress>
        <span>{{ duration }}</span>
      </div>
      <slot></slot>
    </div>
    <audio ref="audio" preload="metadata">
      <source :src="source" :type="type" />
    </audio>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  props: {
    source: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  setup() {
    return {
      player: ref<HTMLAudioElement | null>(null),
      isPlaying: ref(false),
      currentTime: ref(0),
      duration: ref('00:00'),
    };
  },
  mounted() {
    const player = this.$refs['audio'] as HTMLAudioElement;

    player.addEventListener('playing', () => {
      this.isPlaying = true;
    });

    player.addEventListener('pause', () => {
      this.isPlaying = false;
    });

    player.addEventListener('loadedmetadata', () => {
      if (player.duration !== Number.POSITIVE_INFINITY) {
        const minutes = Math.floor(player.duration / 60);
        const seconds = Math.floor(player.duration % 60);

        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');

        this.duration = `${formattedMinutes}:${formattedSeconds}`;
      }
    });

    player.addEventListener('timeupdate', () => {
      this.currentTime = player.currentTime / player.duration;
    });

    this.player = player;
  },
  methods: {
    play() {
      this.player?.play();
    },
    pause() {
      this.player?.pause();
    },
  },
});
</script>

<style lang="css" scoped>
.audio-player {
  --player-height: 10px;
  --player-border-radius: var(--internal-block-editor-border-radius);
  --player-background: var(--internal-block-editor-color-tertiary);

  width: 100%;
  display: flex;
  cursor: default;
  column-gap: 0.5rem;
  align-items: flex-start;
}

svg {
  width: 40px;
  height: 40px;
  color: var(--internal-block-editor-color-primary);
}

.column {
  width: 100%;
  display: flex;
  row-gap: 0.25rem;
  flex-direction: column;
}

.row {
  align-items: center;
  column-gap: 0.5rem;
}

progress {
  flex-grow: 1;
  appearance: none;
  -webkit-appearance: none;
  height: var(--player-height);

  &::-webkit-progress-inner-element {
    height: var(--player-height);
  }

  &::-webkit-progress-bar,
  & {
    display: flex;
    align-items: center;
    height: var(--player-height);
    border-radius: var(--player-border-radius);
    background-color: var(--player-background);
  }

  &::-webkit-progress-value {
    background: var(--internal-block-editor-color-primary);
    border-radius: var(--player-border-radius) 0 0 var(--player-border-radius);
  }

  &::-moz-progress-bar {
    background: var(--internal-block-editor-color-primary);
    border-radius: var(--player-border-radius) 0 0 var(--player-border-radius);
  }
}
</style>