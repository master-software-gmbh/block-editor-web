<template>
  <svg width="100%" height="100%" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/"
    style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" class="loading_spinner"
    fill="currentColor">
    <clipPath id="_clip1">
      <rect x="1.944" y="1.951" width="10.056" height="10.056" />
    </clipPath>
    <g clip-path="url(#_clip1)">
      <path
        d="M12,1.951C17.55,1.951 22.056,6.457 22.056,12.007C22.056,17.557 17.55,22.063 12,22.063C6.45,22.063 1.944,17.557 1.944,12.007C1.944,6.457 6.45,1.951 12,1.951ZM12,3.951C7.554,3.951 3.944,7.561 3.944,12.007C3.944,16.453 7.554,20.063 12,20.063C16.446,20.063 20.056,16.453 20.056,12.007C20.056,7.561 16.446,3.951 12,3.951Z" />
    </g>
  </svg>
</template>

<style lang="css" scoped>
.loading_spinner {
  transform-origin: center;
  animation: loading_spinner .75s infinite linear;
}

@keyframes loading_spinner {
  100% {
    transform: rotate(360deg);
  }
}
</style>