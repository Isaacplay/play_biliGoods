<template>
  <div class="container">
    <div class="top-header">
      <div class="left-header">
        <div v-if="!homePage.isbiliGoods" @click="changeToHome()">
          <img  src="@/assets/imgs/home1.png"/>
          <div>首页</div>
        </div>
        <div v-if="!homePage.isFavorites && homePage.isbiliGoods" @click="changeToFav()">
          <img src="@/assets/imgs/home2.png"/>
          <div>收藏夹</div>
        </div>
      </div>
      <div class="right-header" >
        <div v-if="!homePage.isFavorites && !homePage.isbiliGoods" @click="changeToFav()">
          <img src="@/assets/imgs/home2.png"/>
          <div>收藏夹</div>
        </div>
        <div v-if="!homePage.isMe" @click="changeToMe()">
          <img src="@/assets/imgs/fa2.png"/>
          <div>我的</div>
        </div>
      </div>
    </div>
    <div class="contant">
      <div class="left-con"></div>
      <div class="main-con">
        <biligoods v-if="homePage.isbiliGoods"></biligoods>
        <favorites v-if="homePage.isFavorites"></favorites>
        <me v-if="homePage.isMe"></me>
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
import me from './me/me.vue'
const homePage = reactive({
  isbiliGoods:true,
  isFavorites:false,
  isMe:false
})
function changeToMe(){
  homePage.isbiliGoods = false
  homePage.isFavorites = false
  homePage.isMe = true
}
function changeToHome(){
  homePage.isbiliGoods = true
  homePage.isFavorites = false
  homePage.isMe = false
}
function changeToFav(){
  homePage.isbiliGoods = false
  homePage.isFavorites = true
  homePage.isMe = false
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
      width: 50%;
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
