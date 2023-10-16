<template>
  <div style="height:100%" >
    <div class="filter-header">
      <div class="filter-header-top">
        <div class="filter-header-left">
        </div>
        <div class="filter-header-right">
          <el-button color="#626aef"  plain @click="exportList">导出</el-button>
        </div>
      </div>   
    </div>
    <div class="goods-box">
        <div class="goods-item" v-for="(item,index) in searchAbout.starList" :key="index">
          <div>
            <div v-if="searchAbout.lowestMap[item.itemsId]">历史搜索最低价：{{ searchAbout.lowestMap[item.itemsId] }}</div>
            <div>{{item.name}}</div>
            <div>{{item.price}} 
              <span class="click-span" @click="removeFromStar(item)"> 修改 </span>
              <span class="click-span" @click="removeFromStar(item)"> 删除 </span>
            </div>
          </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref,reactive ,onMounted} from 'vue'
import { ElMessage  } from 'element-plus'
const addStep = ref(10)
const stopWater = ref(false)
const haveCookie = ref(false)

onMounted(() => {
  searchAbout.lowestMap = JSON.parse(localStorage.getItem("lowestMap") || "{}") ;   //获取最低价
  getCheckList()
})

function getCheckList() {
  $.ajax({
    type: "GET",
    url: `http://111.229.88.32:3000/checkList/getCheckList`,
    timeout: 20000,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Credentials": "true",
    },
    success: function (res) {
      let map = {}
      for (let i of res) {
        map[i._id] = i.price
      }
      searchAbout.starList = res
      searchAbout.keyMap = map
    },
    error: function (res) {
      console.log(res)
    }
  });
}

function exportList(){
  console.log(map)
}
interface searchAbout {
  starList: any[];
  keyMap: {[key: string]:number};
  lowestMap: {[key: string]:any};
}
interface starMap {
  name: string;
  id: any;
  icon: any;
  price: string;
}
const searchAbout : searchAbout = reactive({
  starList:[],
  keyMap:{},
  lowestMap:{},
})
function removeFromStar(item : starMap){
  
}
function openUrl(itemId : String){
    window.open(`https://mall.bilibili.com/neul-next/index.html?page=magic-market_detail&noTitleBar=1&itemsId=${itemId}&from=market_index`)
}
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