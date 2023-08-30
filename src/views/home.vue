<template>
  <div class="container">
    <div class="top-header">
      <div class="left-header"></div>
      <div class="right-header" ></div>
    </div>
    <div class="contant">
      <div class="left-con"></div>
      <div class="main-con">
        <component :is="tab"></component>
      </div>
      <div class="right-con"></div>
    </div>
    <div class="bottom-con">
      <div class="box">
        <div :class="homePage.flag == 'biligoods'?'icon-con max-img':'icon-con'" @click="changeToFlag('biligoods')">
          <img  src="@/assets/icon/home.png"/>
          <div>首页</div>
        </div>
        <div :class="homePage.flag == 'biliShop'?'icon-con max-img':'icon-con'" @click="changeToFlag('biliShop')">
          <img  src="@/assets/icon/Myhome.png"/>
          <div>分析</div>
        </div>
        <div :class="homePage.flag == 'lost'?'icon-con max-img':'icon-con'" @click="changeToFlag('lost')">
          <img  src="@/assets/icon/lost.png"/>
          <div>耻辱榜</div>
        </div>
        <div :class="homePage.flag == 'favorites'?'icon-con max-img':'icon-con'" @click="changeToFlag('favorites')">
          <img src="@/assets/icon/fav.png"/>
          <div>收藏夹</div>
        </div>
        <div :class="homePage.flag == 'shop'?'icon-con max-img':'icon-con'" @click="changeToFlag('shop')">
          <img src="@/assets/icon/shopping.png"/>
          <div>橱窗</div>
        </div>
        <div :class="homePage.flag == 'me'?'icon-con max-img':'icon-con'" @click="changeToFlag('me')">
          <img src="@/assets/icon/me.png"/>
          <div>统计</div>
        </div>
        <div :class="homePage.flag == 'setting'?'icon-con max-img':'icon-con'" @click="changeToFlag('setting')">
          <img src="@/assets/icon/setting.png"/>
          <div>设置</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive,markRaw,ref,onMounted} from 'vue'
import {useRoute,useRouter} from 'vue-router'
import biliShop from './biliShop/index.vue'
import biligoods from './biligoods/index.vue'
import favorites from './favorites/favorites.vue'
import me from './me/me.vue'
import setting from './setting/setting.vue'
import shop from './shop/shop.vue'
import lost from './lost/lost.vue'

const tab = ref(null)
const route = useRoute()

const homePage = reactive({
  flag:'biligoods',
})

onMounted(() => {
  changeToFlag('biligoods')
  if(route.query.id && route.query.id.length > 0){
    changeToFlag('biliShop')
  }
})

function changeToFlag(flag : string){
  homePage.flag = flag
  const lookup = {
    biligoods,favorites,me,setting,shop,biliShop,lost
  }
  tab.value = markRaw(lookup[flag])
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
