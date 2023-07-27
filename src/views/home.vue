<template>
  <div class="container">
    <div class="top-header">

    </div>
    <div class="contant">
      <div class="left-con">

      </div>
      <div class="main-con">
        <biligoods></biligoods>
      </div>
      <div class="right-con">

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive,nextTick } from 'vue'
import {useRoute,useRouter} from 'vue-router'
import biligoods from './biligoods/index.vue'
const router = useRouter()
const route = useRoute()
components: {
  biligoods
}




</script>

<style lang="scss" scoped>
.container{
  width: 100%;
  font-size: 14px;
  background-color: rgb(235,235,235);
  .top-header{
    width: 100%;
    height: 120px;
    background-color: #66ccff;
  }
  .contant{
    display: flex;
    height: calc(100% - 120px);
    .main-con{
      width: 80%;
      background-color: white;
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
