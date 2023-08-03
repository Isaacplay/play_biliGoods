<template>
  <div class="container">
    <div class="top-header">
      <div class="left-header"></div>
      <div class="right-header" ></div>
    </div>
    <div class="contant">
      <div class="left-con"></div>
      <div class="main-con">
        <biligoods v-if="homePage.isbiliGoods"></biligoods>
        <favorites v-if="homePage.isFavorites"></favorites>
        <me v-if="homePage.isMe"></me>
        <setting v-if="homePage.isSetting"></setting>
      </div>
      <div class="right-con"></div>
    </div>
    <div class="bottom-con">
      <div class="box">
        <div :class="homePage.isbiliGoods?'icon-con max-img':'icon-con'" @click="changeToHome()">
          <img  src="@/assets/icon/home.png"/>
          <div>首页</div>
        </div>
        <div :class="homePage.isFavorites?'icon-con max-img':'icon-con'" @click="changeToFav()">
          <img src="@/assets/icon/fav.png"/>
          <div>收藏夹</div>
        </div>
        <div :class="homePage.isMe?'icon-con max-img':'icon-con'" @click="changeToMe()">
          <img src="@/assets/icon/me.png"/>
          <div>我的</div>
        </div>
        <div :class="homePage.isSetting?'icon-con max-img':'icon-con'" @click="changeToSetting()">
          <img src="@/assets/icon/setting.png"/>
          <div>设置</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive,nextTick } from 'vue'
import {useRoute,useRouter} from 'vue-router'
import biligoods from './biligoods/index.vue'
import favorites from './favorites/favorites.vue'
import me from './me/me.vue'
import setting from './setting/setting.vue'
const homePage = reactive({
  isbiliGoods:true,
  isFavorites:false,
  isMe:false,
  isSetting:false
})
function changeToSetting(){
  homePage.isbiliGoods = false
  homePage.isFavorites = false
  homePage.isMe = false
  homePage.isSetting = true
}
function changeToMe(){
  homePage.isbiliGoods = false
  homePage.isFavorites = false
  homePage.isSetting = false
  homePage.isMe = true
}
function changeToHome(){
  homePage.isbiliGoods = true
  homePage.isFavorites = false
  homePage.isMe = false
  homePage.isSetting = false
}
function changeToFav(){
  homePage.isbiliGoods = false
  homePage.isFavorites = true
  homePage.isMe = false
  homePage.isSetting = false
}
</script>
<style lang="scss" scoped>
.container{
  width: 100%;
  height: 100%;
  font-size: 14px;
  background-color: rgb(235,235,235);
  position: relative;
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
      height: calc(100% + 40px);
      overflow: scroll;
    }
    .left-con{
      width: 10%;
    }
    .right-con{
      width: 10%;
    }
  }
  .bottom-con{
    position: absolute;
    bottom: 0;
    width: 80%;
    left: 10%;
    height: 80px;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    padding-bottom: 4px;
    left: 50%;
    background: white;
    -webkit-transform: translate3d(-50%,0,0);
    .box{
      display: flex;
      align-items: center;
      border: 1px solid rgb(235,235,235);
      border-radius: 24px;
      padding: 3px 24px;
      .icon-con{
        margin: 0 12px;
        font-size: 12px;
        text-align: center;
        img{
          width: auto;
          height: 35px;
          cursor: pointer;
        }
      }
      .max-img > img{
        width: auto;
        height: 50px !important;
        cursor: pointer;
      }
    }
  }
}
</style>
