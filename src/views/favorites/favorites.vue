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
            <img class="goods-item-img" :src=item.img alt="">
            <div>{{item.name}}</div>
            <div v-for="(item2) in item.list" :key="item2.id">
              <span class="click-span" @click="openUrl(item2.id)">{{ item2.price }} </span>
              <span class="click-span" @click="removeFromStar(item2)"> - </span>
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
  analysisStar()  //生成收藏夹
  searchAbout.lowestMap = JSON.parse(localStorage.getItem("lowestMap") || "{}") ;   //获取最低价
})

function exportList(){
  analysisStar()
  let arrary = []
  for(let i of searchAbout.starList){
    let map = {
      name:i.name,
      itemsId:i.itemsId,
      price:Number(i.price.split('~')[0])
    }
    arrary.push(map)
  }
  arrary = arrary.sort((a,b)=>{
    return a.name.localeCompare(b.name)
  })
  let Fmap = {}
  for(let i of arrary){
    Fmap[i.itemsId] = i
  }
  console.log(Fmap)
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
  let list = JSON.parse(localStorage.getItem("starList") ) ;
  for(let i in list){
    if(item.id == list[i].id){
      console.log(i)
      list.splice(i,1)
    }
  }
  localStorage.setItem("starList",JSON.stringify(list));
  analysisStar()
  ElMessage.success('移除收藏夹成功！')
}
function analysisStar(){
  let arrary = JSON.parse(localStorage.getItem("starList") || "[]");
  let map = {}
  for(let i of arrary){
    if(map[i.itemsId.join(',')] && map[i.itemsId.join(',')].length > 0){
      map[i.itemsId.join(',')].push(i)
    }else{
      map[i.itemsId.join(',')] = [i]
    }
  } 
  let lastArrary = []
  let keyMap = {}
  for(let t in map){
    let map2 ={
      name:map[t][0].name,
      itemsId:t,
      list:map[t],
      img:map[t][0].icon,
      id:map[t][0].id,
      price:getLowPrice(map[t])
    }
    lastArrary.push(map2)
    keyMap[t] = map2.price.split('~')[0]
  }
  lastArrary = lastArrary.sort((a,b)=>{
    return a.name.localeCompare(b.name)
  })
  searchAbout.starList = lastArrary;
  searchAbout.keyMap = keyMap;
}
function openUrl(itemId : String){
    window.open(`https://mall.bilibili.com/neul-next/index.html?page=magic-market_detail&noTitleBar=1&itemsId=${itemId}&from=market_index`)
}
function getLowPrice(list : any){
  let low = Number(list[0].price)
  let high = Number(list[0].price)
  for(let i of list){
    if(Number(i.price) < low){
      low = Number(i.price)
    }
    if(Number(i.price) > high){
      high = Number(i.price)
    }
  }
  return low + '~' + high
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
  width: calc(20% - 12px);
  border: 4px solid rgb(235,235,235);
  padding: 24px 0;
  margin-right: 12px;
  border-radius: 24px;
  margin-bottom: 24px;
  flex: 0 0 auto;
  align-self: baseline;
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