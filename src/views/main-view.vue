<template>
<div class="root">
  <button class="switch"  v-on:click="selectGameType(-1)">
    ❮
  </button>

  <div class="main" :style="{backgroundImage: backgroundImage}">

    <br />

    <img :src="logo" class="logo"/>

    <br />

    <router-link :to="{ name: 'game', params: { gameType: gameType }}">
      <img :src="f1" class="lemButton" />
    </router-link>

    <img :src="f2" class="lemButton" />
    <img :src="f3" class="lemButton"  />
    <img :src="f4" class="lemButton"  />
    <!--
    <img :src="fx" class="lemButton" />
    <img :src="music" class="lemButton" />
    <img :src="rate" class="lemButton" />
    -->
    <img :src="exit" class="lemButton" />

    <br />
    <br />
    <br />

    <img :src="leftScroll" class="" />
    <div :style="{backgroundImage: reel}"  class="reel"> Hallo World </div>
    <img :src="rightScroll" class="" />

    <br />
    <br />

  </div>

  <button class="switch"  v-on:click="selectGameType(1)">
    ❯
  </button>
</div>
</template>

<script src="./main-view.ts"></script>

<style scoped>
  .root {
    position: absolute;
    top: 0px; /* Header Height */
    bottom: 0px; /* Footer Height */
    width: 100%;
    padding: 0px 0px 0px 0px;
    margin: 0px 0px 0px 0px;
  }

  .reel {
    width: 60%;
    height: 16px;
    font-size: 13px;
    font-weight: bold;
    display: inline-block;
    vertical-align:top;
    border: 0px;
    padding: 0px;
    margin: 0px;
    background-repeat: repeat-x;
  }

  .lemButton {
    padding: 10px;
  }

  .pixelatedRendering {
    border: 0px;
    border-color: red;
  }

  .logo {
    padding: 20px 0px 20px 0px;;
  }

  .switch {
    font-size: 10vw;
    height: 100%;
    display:inline-block;
    vertical-align:middle;
    width: 10%;
    background-color: black;
    color:white;
    border: none;
  }

  .switch:hover {
    background-color: darkgray;
  }

  .main {
    display: inline-block;
    vertical-align: middle;
    height: 100%;
    width: 80%;
  }

</style>
