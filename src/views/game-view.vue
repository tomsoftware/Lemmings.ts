<template>

  <div class="main">
     <canvas height="480" width="800" ref="gameCanvas" class="pixelatedRendering">
      Sorry! Your browser does not support HTML5 Canvas and can not run this Application.
    </canvas>

    <br />

    <div v-if="level">
      {{level.name}}
    </div>

    <button v-on:click="moveToLevel(-1)">⇦</button>
    <button v-on:click="start()">start</button>
    <button v-on:click="moveToLevel(1)">⇨</button>
    

    <br />

    Music:
    <button v-on:click="playMusic(-1)">⇦</button>
    <button v-on:click="playMusic()">play Music {{musicIndex}}</button>
    <button v-on:click="stopMusic()">stop Music</button>
    <button v-on:click="playMusic(1)">⇨</button>
    


    <br />
    Sound: 
    <button v-on:click="playSound(-1)">⇦</button>
    <button v-on:click="playSound()">play Sound {{soundIndex}}</button>
    <button v-on:click="playSound(1)">⇨</button>

  </div>

</template>

<script src="./game-view.ts"></script>

<style scoped>

  .pixelatedRendering {
    border: 0px;
    border-color: red;
  }

  .switch {
    float: left;
    font-size: 800%;
    height: 100%;
  }

  .switch:hover {
    background-color: darkgray;
  }

  .main {
    float: left;
  }

</style>
