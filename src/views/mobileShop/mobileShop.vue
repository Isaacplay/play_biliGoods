<template>
  <div>
    <div class="filter-header">
        <div class="filter-header-top">
          <div class="filter-header-left">
            <div class="filter-item">
              <div class="filter-name">名称搜索:</div>
              <el-input class="w240" @input="dataChange" v-model="searchAbout.name" clearable/>
            </div>
          </div>
      </div>
    </div>
    <div ref="container" class="filter-con">
      <div class="filter-con-item" v-for="(item,index) in searchAbout.goodsList" @click="openBilbili(item._id)" :key="index">
        <div class="goods">
            <div class="img-box">
              <img class="goods-images goods-item-img" :src=item.icon alt="">
            </div>
            <div class="goods-info">
                <div class="goods-name">{{item.name}}</div>
                <div class="goods-price">￥ {{item.price}}</div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref,reactive ,onMounted} from 'vue'
import { ElMessage  } from 'element-plus'

onMounted(() => {
  getMyGoods()
})

function openBilbili(id : string){
    let url = encodeURIComponent(`https://mall.bilibili.com/neul-next/index.html?page=magic-market_detail&noTitleBar=1&itemsId=${id}&from=market_index`)
    window.location.href = `bilibili://mall/web?url=${url}`;

    // window.location.href = 'bilibili://mall/web?url=https%3A%2F%2Fmall.bilibili.com%2Fdetail.html%3Ffrom%3Ddraw-items%26jumpLinkType%3D0%26loadingShow%3D1%26noTitleBar%3D1%23goFrom%3Dna%26noReffer%3Dtrue%26itemsId%3D10175858'
}

interface searchAbout {
  goodsList: any[];
  name:string;
}
const searchAbout : searchAbout = reactive({
  goodsList:[],
  name:''
})

function getMyGoods(){
    $.ajax({
        type: "GET",
        url: `http://111.229.88.32:3000/biligoods/getShopGoods`,
        timeout: 20000,
        success: function (res) {
            searchAbout.goodsList = res
        },
        error:function (res) {
            console.log(res)
        }
    });
}

function dataChange(res){
  console.log(res)
  let originList = searchAbout.goodsList.concat()
  let lList = []
  let Rlist = []
  for(let i of originList){
    if(i.name.indexOf(res) != -1){
      lList.push(i)
    }else{
      Rlist.push(i)
    }
  }
  searchAbout.goodsList = lList.concat(Rlist)
}

</script>
<style scoped>
.filter-header{
  padding: 24px; 
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  background-color: white;
  border-bottom: 1px solid rgb(235,235,235); 
  z-index: 999;
}
.filter-header-top{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.filter-header-left{
  display: flex;
  flex-wrap: wrap;
}
.filter-name{
  font-size: 18px;
  margin-right: 24px;
  white-space: nowrap;
}
.filter-item{
  display: flex;
  align-items: center;
  margin-right: 24px;
}
.m-2{
  width: 180px;
}
.filter-header-right{
  align-items: center;
  display: flex;
}
.filter-header-right > div{
  margin-right: 24px;
}
.search-more{
  display: flex;
  padding: 12px 24px;
  align-items: center;
}
.filter-con{
  padding: 24px 6px;
  font-size: 12px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  background-color: #edededa6;
}
.filter-con-item{
  margin-bottom: 12px;
  width: 45%;
  border-radius: 12px;
}
.goods-item-img{
  width: 100%;
  height: auto;
}
.click-span{
  cursor: pointer;
  color: #409eff;
  margin-right: 6px;
}
.img-box{
  width: 100%;
  padding: 12px ;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 12px 12px 0 0;
  background-color: #EDEDED;
}
.goods-info{
  padding: 8px 10px;
  border-radius: 0 0 12px 12px;
  background-color: white;
}
.goods-name{
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  margin-bottom: 8px;
}
.goods-price{
  font-weight: 500;
  font-size: 18px;
  color: rgb(120 109 246);
}

</style>