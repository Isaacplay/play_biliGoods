<template>
  <div style="height: 100%;">
    <div class="filter-header">
      <div class="filter-header-top">
        <div class="filter-header-left">
          <div class="filter-item">
            <div class="filter-name">名称:</div>
            <el-input class="w240" v-model="nodeSearch.name" />
          </div>
        </div>
        <div class="filter-header-right">
          <el-input-number v-model="nodeSearch.size" :step="10" :min="10" controls-position="right" step-strictly />
          <el-button color="#626aef" @click="search">查询</el-button>
          <el-button color="#626aef" @click="checkStatus">检测状态</el-button>
        </div>
      </div>  
    </div>
    <div class="goods-box">
      <div class="goods-item" @click="openUrl(item.itemId)" :style="{'border-color':item.color}" v-for="(item,index) in searchAbout.goodsList" :key="index">
        <div>
          <div>{{item.remark}}</div>
          <div>{{item.time}}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref,reactive ,onMounted} from 'vue'
import { ElMessage  } from 'element-plus'
import moment from 'moment';
const addStep = ref(10)
const stopWater = ref(false)
const haveCookie = ref(false)
let settingMap = reactive({
  biligoods:{
    url:'',
  },
})

onMounted(() => {
  search()
})
interface searchAbout {
  goodsList: any[];
  index: number;
  limit: number;
}
const searchAbout : searchAbout = reactive({
  goodsList:[],
  index:0,
  limit:0
})
function openUrl(itemId : String){
    window.open(`https://mall.bilibili.com/neul-next/index.html?page=magic-market_detail&noTitleBar=1&itemsId=${itemId}&from=market_index`)
}
function search(){
  nodeSearch.page = 1
  searchAbout.goodsList =[]
  biliNodeSearch()
}
function biliNodeSearch(){
  $.ajax({
    type: "GET",
    url: `http://111.229.88.32:3000/biligoods/getBiliAlarmList?page=1&size=${nodeSearch.size}`,
    timeout: 20000,
    success: function (res) {
      //精简内容 优化 数组
        let arrary = res.map((item)=>{
          item.time = moment(item.time).format('YYYY-MM-DD HH:mm:ss');
          return item
        })
        let obj = {};
        arrary = arrary.reduce((cur,next) => {
            obj[next.itemId] ? "" : obj[next.itemId] = true && cur.push(next);
            return cur;
        },[])
        searchAbout.goodsList = arrary    
    },
    error:function (res) {
      console.log(res)
    }
  });
}

function checkStatus(){
  searchAbout.limit += 10
  getStatusInfo(searchAbout.index)
}

function getStatusInfo(index : Number){
  $.ajax({
    type: "GET",
    url: `https://mall.bilibili.com/mall-magic-c/internet/c2c/items/queryC2cItemsDetail?c2cItemsId=${searchAbout.goodsList[index].itemId}`,
    timeout: 20000,
    success: function (res) {
      if(res.code == 0){
        if(res.data.publishStatus == '2'){
          searchAbout.goodsList[index].status = '下架'
          searchAbout.goodsList[index].color = 'gray'
        }else if(res.data.saleStatus == '1'){
          searchAbout.goodsList[index].status = '在卖'
          searchAbout.goodsList[index].color = 'rgba(0,255,0,1)'
        }else if(res.data.saleStatus == '2'){
          searchAbout.goodsList[index].status = '卖掉了'
          searchAbout.goodsList[index].color = 'rgba(255,0,0,0.2)'
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

interface nodeSearch {
  page: number;
  size: number;
  name: string;
}
const nodeSearch : nodeSearch = reactive({
  page:1,
  size:500,
  name:''
})
function clear(){
  searchAbout.goodsList =[]
}
function reset(){
  searchAbout.goodsList =[]
}
//常量
const step = ref(20)
</script>
<style scoped>
.click-span{
  cursor: pointer;
  color: #409eff;
  margin-right: 12px;
}
.goods-box{
  padding: 24px;
  display: flex;
  flex-wrap: wrap;
  background-color: white;
  height: calc(100% - 120px);
  overflow-y: scroll;
}
.goods-item{
  width: calc(50% - 12px);
  border: 4px solid rgb(245,245,245);
  padding: 6px 0;
  margin-right: 12px;
  border-radius: 6px;
  margin-bottom: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;  
  text-align: center;
  cursor: pointer;
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