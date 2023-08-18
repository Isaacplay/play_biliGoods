<template>
  <div class="container">
    <div class="top-header">
      <div class="left-header"></div>
      <div class="right-header" ></div>
    </div>
    <div class="contant">
      <div class="left-con"></div>
      <div class="main-con">
        <biligoods v-if="homePage.flag == 'biliGoods'"></biligoods>
        <favorites v-if="homePage.flag == 'Favorites'"></favorites>
        <me v-if="homePage.flag == 'Me'"></me>
        <setting v-if="homePage.flag == 'Setting'"></setting>
        <shop v-if="homePage.flag == 'Shop'"></shop>
      </div>
      <div class="right-con"></div>
    </div>
    <div class="bottom-con">
      <div class="box">
        <div :class="homePage.flag == 'biliGoods'?'icon-con max-img':'icon-con'" @click="changeToFlag('biliGoods')">
          <img  src="@/assets/icon/home.png"/>
          <div>首页</div>
        </div>
        <div :class="homePage.flag == 'Favorites'?'icon-con max-img':'icon-con'" @click="changeToFlag('Favorites')">
          <img src="@/assets/icon/fav.png"/>
          <div>收藏夹</div>
        </div>
        <div :class="homePage.flag == 'Shop'?'icon-con max-img':'icon-con'" @click="changeToFlag('Shop')">
          <img src="@/assets/icon/shopping.png"/>
          <div>橱窗</div>
        </div>
        <div :class="homePage.flag == 'Me'?'icon-con max-img':'icon-con'" @click="changeToFlag('Me')">
          <img src="@/assets/icon/me.png"/>
          <div>统计</div>
        </div>
        <div :class="homePage.flag == 'Setting'?'icon-con max-img':'icon-con'" @click="changeToFlag('Setting')">
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
import shop from './shop/shop.vue'
const homePage = reactive({
  flag:'biliGoods',
})
function changeToFlag(flag : string){
  homePage.flag = flag
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
