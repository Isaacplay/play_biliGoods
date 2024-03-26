<template>
  <div class="analysis-box">
      <div class="analysis-title" style="height: 250px">
        <div class="img-box">
          <img class="goods-item-img" @click="openAnalysis(item.id)" :src=item.img alt="">
          <div>{{item.name}}</div>
        </div>
        <div class="chart-box" ref="main" style="height: 250px"></div>
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
  setTimeout(() => {
    init()
  }, 20);
})

function openAnalysis(id:Number){
  window.open(`${window.location.href}?id=${id}`)
}

function init() {
  let list = props.item.goodsList.concat();
  list.sort((a,b)=>{
    return a.time - b.time
  })
  // let xAxis = []
  let value : Array<Number> = []
  let checkValue : Array<Number>= []
  list.forEach((item,index)=>{
    value.push([item.time,Number(item.price)])
    checkValue.push([item.time,Number(props.item.lockPrice)])
  })
  // 基于准备好的dom，初始化echarts实例
  var myChart = echarts.init(main.value);
  // 指定图表的配置项和数据
  var option = {
    title: {
      text: `时间价格走势${props.item.id}`
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
          start: 60,
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
  .analysis-box{
    background-color: white;
    overflow-y: scroll;
    padding: 12px 24px 0 24px;
    .analysis-title{
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      .img-box{
        width: 30%;
      }
      .chart-box{
        width: 70%;
        height: 250px;
      }
      .goods-item-img{
        width: 80%;
        height: auto;
        cursor: pointer;
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