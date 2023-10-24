<template>
  <div class="containerSetting" style="height:100%" >
    <div class="filter-header">
      <div class="filter-header-left">
        <div class="filter-item">
          <div class="filter-name">ID:</div>
          <el-input style="margin-right: 24px;" v-model="searchAbout.id" />
          <el-input class="w120" style="margin-right: 24px;" v-model="searchAbout.page" />
          <el-button  @click="sortByTime">时间</el-button>
          <el-button  @click="sortByPrice">价格</el-button>
        </div>
        <div>
          <div style="margin-top: 12px;" v-show="buyItems.num > 0" class="filter-name">累计购入数: {{ buyItems.num }}   平均购入价: {{ buyItems.price }}</div>
        </div>
      </div>
      <div class="filter-header-right">
        <el-button color="#626aef" @click="getItemsByid">查询</el-button>
        <el-button color="#626aef" @click="checkStatus">检测状态</el-button>
      </div>
    </div>
    <div class="analysis-box">
      <div class="analysis-title">
        <div class="img-box">
          <img class="goods-item-img" :src=searchAbout.img alt="">
          <div>{{searchAbout.name}}</div>
        </div>
        <div class="chart-box" ref="main" style="height: 400px"></div>
      </div>
      <div class="analysis-box">
        <div class="analysis-item" v-for="(item,index) in searchAbout.goodsList" :key="index">
          <div :class="searchAbout.index == index ? 'index-selected' : 'index'" @click="changeIndexTothis(index)">{{ index + 1 }}</div>
          <div class="price click-span" @click="openUrl(item._id)">{{ item.price }}</div>
          <div class="status" :style="{'color':item.color}" @click="openUrl(item._id)">{{ item.status || '' }}</div>
        </div>
      </div>

    </div>
  </div>
</template>
<script setup lang="ts">
import { ref,reactive ,onMounted} from 'vue'
import {useRoute,useRouter} from 'vue-router'
import * as echarts from "echarts";
import { ElMessage , ElLoading  } from 'element-plus'

const route = useRoute()
const main = ref() // 使用ref创建虚拟DOM引用，使用时用main.value

onMounted(() => {
  if(route.query.id && route.query.id.length > 0){
    searchAbout.id = route.query.id
    getItemsByid()
  }
})

interface searchAbout {
  goodsList: any[];
  img: string;
  id: string;
  page:number;
  name: string;
  index: number;
  limit: number;
}
const searchAbout : searchAbout = reactive({
  goodsList:[],
  page:500,
  img:'',
  id:'1000381740',
  name:'',
  index:0,
  limit:0
})

function checkStatus(){
  searchAbout.limit = searchAbout.index + 15
  getStatusInfo(searchAbout.index)
}

function changeIndexTothis(index : number){
  searchAbout.index = index
}

function getStatusInfo(index : keyof searchAbout['goodsList']){
  $.ajax({
    type: "GET",
    url: `https://mall.bilibili.com/mall-magic-c/internet/c2c/items/queryC2cItemsDetail?c2cItemsId=${searchAbout.goodsList[index]._id}`,
    timeout: 20000,
    success: function (res) {
      if(res.code == 0){
        if(res.data.publishStatus == '2' && res.data.saleStatus == '1'){
          searchAbout.goodsList[index].status = '下架'
          searchAbout.goodsList[index].color = 'gray'
        }else if(res.data.publishStatus == '1' && res.data.saleStatus == '1'){
          searchAbout.goodsList[index].status = '在卖'
          searchAbout.goodsList[index].color = 'green'
        }else if(res.data.saleStatus == '2'){
          searchAbout.goodsList[index].status = '卖掉了'
          searchAbout.goodsList[index].color = 'red'
        }else{
          searchAbout.goodsList[index].status = '未知类型'
          searchAbout.goodsList[index].color = 'red'
        }
        if(searchAbout.index < searchAbout.limit){
          searchAbout.index++
          setTimeout(()=>{
            getStatusInfo(searchAbout.index)
          },500)
        }else{

        }
      }

    },
    error:function (res) {
      console.log(res)
    }
  });
}

function getItemsByid(){
  getBuyItemsById()
  const loading = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  $.ajax({
    type: "GET",
    url: `http://111.229.88.32:3000/biligoods/getBiligoodsById?id=${searchAbout.id}&size=${searchAbout.page}`,
    timeout: 20000,
    success: function (res) {
      loading.close()
      if(res && res.length > 0){
        searchAbout.name = res[0].name
        searchAbout.img = res[0].img
        searchAbout.goodsList = res.map((item)=>{
          item.time = Number(item.time)
          item.price = Number(item.price)
          item.timeDate = new Date(item.time)
          return item
        })
      }
      init()
    },
    error:function (res) {
      loading.close()
      console.log(res)
    }
  });
}

interface buyItems {
  img: string;
  _id: string;
  costInthis:number;
  name: string;
  price: number;
  num: number;
}
const buyItems : buyItems = reactive({
  _id:'',
  name:'',
  img:'',
  price:0,
  num:0,
  costInthis:0
})

function getBuyItemsById(){
  $.ajax({
    type: "GET",
    url: `http://111.229.88.32:3000/shopList/getBuyShopItem?id=${searchAbout.id}`,
    timeout: 20000,
    success: function (res) {
      if(res && res.length > 0){
        buyItems.price = res[0].price
        buyItems.num = res[0].num
      }else{
        buyItems.price = 0
        buyItems.num = 0
      }
    },
    error:function (res) {
      console.log(res)
    }
  });
}

function sortByTime(){
  searchAbout.goodsList.sort((a,b)=>{
    return  b.time - a.time
  })
}

function sortByPrice(){
  searchAbout.goodsList.sort((a,b)=>{
    return a.price - b.price
  })
}

function init() {
  let list = searchAbout.goodsList.concat();
  list.sort((a,b)=>{
    return a.time - b.time
  })
  // let xAxis = []
  let value = []
  list.forEach((item)=>{
    value.push([item.time,Number(item.price)])
    // value.push(Number(item.price))
  })
  // 基于准备好的dom，初始化echarts实例
  var myChart = echarts.init(main.value);
  // 指定图表的配置项和数据
  var option = {
    title: {
      text: '时间价格走势'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    xAxis: {
      type: 'time',
      // data: xAxis
    },
    yAxis: {
      type: 'value'
    },
    dataZoom: [
      {
          type: 'inside',
          show: true,
          xAxisIndex: [0],
          start: 70,
          end: 100
      },
      {
          type: 'inside',
          show: true,
          yAxisIndex: [0],
          start: 1,
          end: 100
      },
    ],
    series: [
      {
        data: value,
        type: 'line',
        smooth: true
      }
    ]
  };
  // 使用刚指定的配置项和数据显示图表。
  myChart.setOption(option);
}

function openUrl(itemId : String){
    window.open(`https://mall.bilibili.com/neul-next/index.html?page=magic-market_detail&noTitleBar=1&itemsId=${itemId}&from=market_index`)
}

</script>
<style lang="scss"  scoped>
.containerSetting{
  .filter-header{
    position: sticky;
    height: 120px;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 999;
    display: flex;
    justify-content: space-between;
    padding: 24px;
    .filter-item{
      display: flex;
      align-items: center;
      margin-right: 24px;
    }
    .filter-name{
        font-size: 18px;
        margin-right: 24px;
        white-space: nowrap;
      }
  }
  .analysis-box{
    background-color: white;
    height: calc(100% - 120px);
    overflow-y: scroll;
    padding: 24px;
    .analysis-title{
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 2px solid rgb(235,235,235);
      text-align: center;
      .img-box{
        width: 30%;
      }
      .chart-box{
        width: 70%;
      }
      .goods-item-img{
        width: 80%;
        height: auto;
        margin-bottom: 12px;
      }
      
    }
    .analysis-box{
      display: flex;
      flex-wrap: wrap;
      .analysis-item{
        width: 20%;
        display: flex;
        padding: 6px;
        align-items: center;
        .index{
          font-weight: 16;
          font-size: 18px;
          margin-right: 6px;
          cursor: pointer;
          // width: 20%;
          text-align: center;
        }
        .index-selected{
          font-weight: 16;
          font-size: 20px;
          margin-right: 6px;
          cursor: pointer;
          color: red;
          text-align: center;
        }
        .price{

        }
        .satus{

        }
      }
    }
  }
}
@media screen and (max-width: 600px){
  .filter-header{
    display: block !important;
  }
  .filter-header-right{
    margin-top: 20px;
    text-align: left !important;
  }
  .analysis-title{
    display: block !important;
    text-align: center;
    .img-box{
      width: 100% !important;
    }
    .chart-box{
      width: 100% !important;
    }
    .goods-item-img{
      width: 100% !important;
    }
  }
  .analysis-box{
    padding: 12px 6px !important;
  }
  .analysis-item{
    width: 50% !important;
    padding: 6px 0 !important;
  }
}
</style>