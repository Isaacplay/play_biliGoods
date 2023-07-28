<template>
  <div class="container">
    <div class="top-header">
      <div class="left-header" @click="changeToHome()">
        <img v-if="homePage.isbiliGoods" src="@/assets/imgs/home1.png"/>
        <img v-if="!homePage.isbiliGoods" src="@/assets/imgs/home2.png"/>
      </div>
      <div class="right-header" @click="changeToFav()">
        <img v-if="homePage.isFavorites" src="@/assets/imgs/fa1.jpg"/>
        <img v-if="!homePage.isFavorites" src="@/assets/imgs/fa2.png"/>
      </div>
    </div>
    <div class="contant">
      <div class="left-con"></div>
      <div class="main-con">
        <biligoods v-if="homePage.isbiliGoods"></biligoods>
        <favorites v-if="homePage.isFavorites"></favorites>
      </div>
      <div class="right-con"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive,nextTick } from 'vue'
import {useRoute,useRouter} from 'vue-router'
import biligoods from './biligoods/index.vue'
import favorites from './favorites/favorites.vue'
const homePage = reactive({
  isbiliGoods:true,
  isFavorites:false
})
components: {
  biligoods,favorites
}
function changeToHome(){
  if(!homePage.isbiliGoods){
    homePage.isbiliGoods = true
    homePage.isFavorites = false
  }
}
function changeToFav(){
  if(!homePage.isFavorites){
    homePage.isFavorites = true
    homePage.isbiliGoods = false
  }
}
</script>
<style lang="scss" scoped>
.container{
  width: 100%;
  height: 100%;
  font-size: 14px;
  background-color: rgb(235,235,235);
  // background-image: url('@/assets/imgs/top_bar.jpg');
  // background-position: top;
  // background-size: contain;
  // background-repeat: no-repeat;
  .top-header{
    width: 100%;
    height: 120px;
    background-color: #66ccff;
    position: relative;
    // z-index: 5;
    // background-image: url('@/assets/imgs/top_bar.jpg');
    // background-position: top;
    // background-size: contain;
    // background-repeat: no-repeat;
    img{
      width: 60%;
      height: auto;
      cursor: pointer;
    }
    .right-header{
      position: absolute;
      width: 10%;
      right: 0;
      top: 0;
      height: 100%;
      text-align: center;
    }
    .left-header{
      position: absolute;
      text-align: center;
      width: 10%;
      left: 0;
      top: 0;
      height: 100%;
    }
  }
  .contant{
    display: flex;
    height: calc(100% - 120px);
    .main-con{
      width: 80%;
      transform: translateY(-120px);
      height: calc(100% + 120px);
      overflow: scroll;
    }
    .left-con{
      width: 10%;
    }
    .right-con{
      width: 10%;
    }
  }
}
</style>
