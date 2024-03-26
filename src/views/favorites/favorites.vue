<template>
  <div style="height:100%" >
    <div class="filter-header">
      <div class="filter-header-top">
        <div class="filter-header-left">
        </div>
        <div class="filter-header-right">
          <el-button color="#626aef"  plain @click="addMonitor">管理</el-button>
        </div>
      </div>   
    </div>
    <div class="goods-box">
      <div class="goods-item" v-for="(item,index) in commonConfig.readyMap" :key="index">
        <component :is="chartCom" :item="item"></component>
      </div>
    </div>
    <el-dialog v-model="commonConfig.show" width="400px" title="管理">
      <div class="">
        <el-input v-model="commonConfig.inputArea" type="textarea" :rows="10" clearable class="w240" />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="commonConfig.show = false">Cancel</el-button>
          <el-button type="primary" @click="ok">Confirm</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref,reactive ,onMounted} from 'vue'
import { ElMessage , ElLoading  } from 'element-plus'
import chartCom from './chartCom.vue'
const commonConfig = reactive({
  monitorIds: [],
  monitorMap:{},
  show:false,
  inputArea:'',
  readyMap:[]
})

onMounted(() => {
  getMonitorIds()
})

function ok(){
  commonConfig.readyMap = []
  commonConfig.monitorIds = commonConfig.inputArea.split(`,`)
  commonConfig.show = false
  setMonitorIds()
}

function addMonitor(){
  commonConfig.inputArea = commonConfig.monitorIds.join(`,`)
  commonConfig.show = true
}

function setMonitorIds(){
  let list = {
    "id": 'monitorIds',
    "value": commonConfig.inputArea
  }
  $.ajax({
    type: "POST",
    url: `http://111.229.88.32:3000/commonConfig/changeCommonConfig`,
    timeout: 20000,
    data: list,
    success: function (res) { 
      getMonitorDetail()
    },
    error: function (res) {
      console.log(res)
    }
  });
}

function getMonitorIds(){
  let loading = ElLoading.service({
    lock: true,
    text: '拉取监控数据中...',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  $.ajax({
    type: "GET",
    url: `http://111.229.88.32:3000/commonConfig/getCommonConfig?id=monitorIds`,
    timeout: 20000,
    success: function (res) {
      loading.close()
      commonConfig.monitorIds = res[0].value.split(`,`)
      getMonitorDetail()
    },
    error: function (res) {
      loading.close()
      console.log(res)
    }
  });
}

function getMonitorDetail(){
  for(let i of commonConfig.monitorIds){
    commonConfig.monitorMap[i] = {}
    getCheckList(i)
  }
}

function getCheckList(id){
  $.ajax({
    type: "GET",
    url: `http://111.229.88.32:3000/checkList/getCheckList?id=${id}`,
    timeout: 20000,
    success: function (res) {
      if(res.length > 0){
        commonConfig.monitorMap[id].id = id
        commonConfig.monitorMap[id].lockPrice = res[0].price
        commonConfig.monitorMap[id].name = res[0].name
      }
      getGoods(id)
    },
    error:function (res) {
      console.log(res)
    }
  });
}

function getGoods(id){
  $.ajax({
    type: "GET",
    url: `http://111.229.88.32:3000/biligoods/getBiligoodsById?id=${id}&size=50`,
    timeout: 20000,
    success: function (res) {
      if(res && res.length > 0){
        commonConfig.monitorMap[id].name = res[0].name
        commonConfig.monitorMap[id].img = res[0].img
        commonConfig.monitorMap[id].goodsList = res.map((item)=>{
          item.time = Number(item.time)
          item.price = Number(item.price)
          item.timeDate = new Date(item.time)
          return item
        })
      }
      commonConfig.readyMap.push(commonConfig.monitorMap[id])
    },
    error:function (res) {
      loading.close()
      console.log(res)
    }
  });
}

function init(id) {
  let list = commonConfig.monitorMap[id].goodsList.concat();
  list.sort((a,b)=>{
    return a.time - b.time
  })
  // let xAxis = []
  let value = []
  let checkValue = []
  list.forEach((item,index)=>{
    value.push([item.time,Number(item.price)])
    checkValue.push([item.time,Number(commonConfig.monitorMap[id].lockPrice)])
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
  if(LockList.isInList){
    option.series.push({
        data: checkValue,
        type: 'line',
        smooth: true
    })
  }
  // 使用刚指定的配置项和数据显示图表。
  myChart.setOption(option);
}



</script>
<style scoped>
.click-span{
  cursor: pointer;
  color: #409eff;
  margin-right: 12px;
}
.goods-box{
  padding: 24px 12px;
  background-color: white;
  height: calc(100% - 120px);
  overflow-y: scroll;
  display: flex;
  flex-wrap: wrap;
}
.goods-item{
  width: 49%;
  border: 4px solid rgb(235,235,235);
  padding: 6px 0;
  margin-right: 12px;
  border-radius: 6px;
  margin-bottom: 24px;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;  
  text-align: center;
}
.goods-item-img{
  width: 80%;
  height: auto;
}
.filter-header{
  position: sticky;
  height: 120px;
  top: 0;
  left: 0;
  width: 100%;
  background-color: none;
  z-index: 999;
}
.filter-header-top{
  display: flex;
  padding: 12px 24px; 
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
}
.filter-header-right > div{
  margin-right: 24px;
}
.search-more{
  display: flex;
  padding: 12px 24px;
  align-items: center;
}
.search-front{
  font-size: 24px;
  margin-right: 24px;
}
</style>