<template>
  <div class="analysis-box-monitor">
      <div class="analysis-title-monitor" style="height: 250px">
        <div class="img-box">
          <img class="goods-item-img" @click="openAnalysis(data.id)" :src=data.img alt="">
        </div>
        <div class="chart-box" ref="main" style="height: 250px"></div>
      </div>
    </div>
    <div class="flex-between">
      <div>监控阈值：<el-input class="w60" v-model="data.lockPrice" /> </div>
      <div>
        <el-button type="primary" @click="savePrice" size="small">更新</el-button>
        <el-button @click="openAnalysis(data.id)" size="small">跳转</el-button>
      </div>
    </div>
</template>
<script setup lang="ts">
import { ref,reactive ,onMounted} from 'vue'
import {useRoute,useRouter} from 'vue-router'
import * as echarts from "echarts";
import { ElMessage , ElLoading  } from 'element-plus'
const main = ref() // 使用ref创建虚拟DOM引用，使用时用main.value

const props = defineProps({
  item: Object,
});

onMounted(() => {
  getListById(props.item.categoryId)
})

const data = reactive({
  id:'',
  lockPrice:0,
  name:'',
  img:'',
  goodsList:[]
})

function savePrice() {
  let opt = {
    "name": data.name,
    "price": Number(data.lockPrice),
    "id": data.id
  }
  let url = `http://111.229.88.32:3000/checkList/changePrice`
  $.ajax({
    type: "POST",
    url: url,
    timeout: 20000,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Credentials": "true",
    },
    data: JSON.stringify(opt),
    success: function (res) {
      ElMessage.success('success')
    },
    error: function (res) {
      ElMessage.error('error')
    }
  }); 
}

function getListById(id : any){
  $.ajax({
    type: "GET",
    url: `http://111.229.88.32:3000/checkList/getCheckList?id=${id}`,
    timeout: 20000,
    success: function (res) {
      if(res.length > 0){
        data.id = id
        data.lockPrice = res[0].price
      }
      getGoods(id)
    },
    error:function (res) {
      console.log(res)
    }
  });
}

function getGoods(id : any){
  $.ajax({
    type: "GET",
    url: `http://111.229.88.32:3000/biligoods/getBiligoodsById?id=${id}&size=40`,
    timeout: 20000,
    success: function (res) {
      if(res && res.length > 0){
        data.name = res[0].name
        data.img = res[0].img
        data.goodsList = res.map((item : any)=>{
          item.time = Number(item.time)
          item.price = Number(item.price)
          item.timeDate = new Date(item.time)
          return item
        })
      }
      init()
    },
    error:function (res) {
      console.log(res)
    }
  });
}

function openAnalysis(id:Number){
  window.open(`${window.location.origin}/#/?id=${id}`)
}

function init() {
  let list = data.goodsList.concat();
  list.sort((a,b)=>{
    return a.time - b.time
  })
  // let xAxis = []
  let value : Array<Number> = []
  let checkValue : Array<Number>= []
  list.forEach((item,index)=>{
    value.push([item.time,Number(item.price)])
    checkValue.push([item.time,Number(data.lockPrice)])
  })
  // 基于准备好的dom，初始化echarts实例
  var myChart = echarts.init(main.value);
  // 指定图表的配置项和数据
  var option = {
    grid:{
      bottom:30,
      top:30,
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
          start: 50,
          end: 100
      },
      {
          type: 'inside',
          show: true,
          yAxisIndex: [0],
          start: 0,
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
  option.series.push({
      data: checkValue,
      type: 'line',
      smooth: true
  })
  // 使用刚指定的配置项和数据显示图表。
  myChart.setOption(option);
}

function openUrl(itemId : String){
    window.open(`https://mall.bilibili.com/neul-next/index.html?page=magic-market_detail&noTitleBar=1&itemsId=${itemId}&from=market_index`)
}

</script>
<style lang="scss"  scoped>
  .analysis-box-monitor{
    background-color: white;
    overflow-y: scroll;
    .analysis-title-monitor{
      width: 100%;
      height: 100%;
      position: relative;
      // display: flex;
      // justify-content: center;
      // align-items: center;
      text-align: center;
      .img-box{
        width: 100%;
        height: 100%;
        position: absolute;
        text-align: center;
      }
      .chart-box{
        width: 100%;
        height: 250px;
      }
      .goods-item-img{
        width: auto;
        height: 100%;
        cursor: pointer;
        opacity: 0.2;
        margin-bottom: 12px;
      }
      
    }
    .analysis-box-monitor{
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
</style>