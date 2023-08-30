<template>
  <div style="height: 100%;">
    <div class="filter-header">
      <div class="filter-header-top">
        <div class="filter-header-left">
          <!-- <div v-if="haveCookie" class="filter-item">
            <div class="filter-name">类型:</div>
            <el-select v-model="categoryFilter" clearable class="m-2 w120" placeholder="Select" size="default">
              <el-option v-for="item in categoryFilterList" :key="item.value" :label="item.label" :value="item.value"/>
            </el-select>
          </div> -->
          <div class="filter-item">
            <div class="filter-name">名称:</div>
            <el-input class="w240" v-model="nodeSearch.name" />
          </div>
          <!-- <div class="filter-item">
            <div class="filter-name">排序:</div>
            <el-select v-model="sortType" clearable class="m-2 w120" placeholder="Select" size="default">
              <el-option v-for="item in sortTypeList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </div>
          <div v-if="haveCookie" class="filter-item">
            <div class="filter-name">价格:</div>
            <el-select v-model="priceFilters" multiple clearable class="m-2" placeholder="Select" size="default">
              <el-option v-for="item in priceFiltersList" :key="item.value" :label="item.label" :value="item.value"/>
            </el-select>
          </div> -->
          <!-- <div v-if="haveCookie" class="filter-item">
            <div class="filter-name">折扣:</div>
            <el-select v-model="discountFilters" multiple clearable class="m-2 w120" placeholder="Select" size="default">
              <el-option v-for="item in discountFiltersList" :key="item.value" :label="item.label" :value="item.value"/>
            </el-select>
          </div> -->
        </div>
        <div class="filter-header-right">
          <el-input-number v-model="step" :step="10" :min="10" :max="4000" controls-position="right" step-strictly />
          <el-button color="#626aef" @click="search">查询</el-button>
          <el-button color="#626aef"  plain @click="reset">重置</el-button>
          <!-- <el-button color="#626aef"  plain @click="likeWater">流水刷新</el-button> -->
          <!-- <el-button color="#626aef"  plain @click="showStarList">收藏夹</el-button> -->
        </div>
      </div>
      <div v-show="searchAbout.inSearch" class="search-more">
          <div class="search-front">Total : {{searchAbout.allStep}},Now : {{searchAbout.now_step}}</div>
          <div v-show="searchAbout.allStep == searchAbout.now_step">
            <el-input-number style="margin-right: 24px;" v-model="addStep" :step="10" :min="10" :max="2000" controls-position="right" step-strictly />
            <el-button style="margin-right: 24px;" color="#626aef" @click="addSearch">追加</el-button>
          </div>
          <el-button v-show="searchAbout.allStep == searchAbout.now_step" color="#626aef"  plain @click="clear">重新搜索</el-button>
          <el-button style="margin-right: 24px;" v-if="searchAbout.isBan" color="#626aef">自求多福</el-button>
      </div>
      
    </div>
    <div class="goods-box">
      <div :class="searchAbout.keyMap[item.itemsId]?'goods-item-instar':(item.breakNewPrice?'goods-item-break':'goods-item')" v-for="(item,index) in searchAbout.lastArrary" :key="index">
        <div>
          <div v-if="searchAbout.keyMap[item.itemsId]">收藏夹最低价：{{ searchAbout.keyMap[item.itemsId] }}</div>
          <div v-if="searchAbout.lowestMap[item.itemsId]">历史搜索最低价：{{ searchAbout.lowestMap[item.itemsId] }}</div>
          <img class="goods-item-img" style="cursor:pointer ;" @click="openAnalysis(item.itemsId)" :src=item.img alt="">
          <div>{{item.name}}</div>
          <div v-if="item.list.length > 0">
            <el-collapse>
              <el-collapse-item :title="item.price" name="1">
                <div v-for="(item2) in item.list" :key="item2.id">
                  <span class="click-span" @click="openUrl(item2.id)">{{ item2.price }} </span>
                  <span class="click-span" @click="addToStar(item2)"> + </span>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </div>
    </div>
    <el-drawer v-model="searchAbout.drawer" title="收藏夹" direction="rtl">
      <div class="gray-text">添加收藏夹的商品的最低价会显示在列表的同名商品中，建议即使链接过期也保留最低价的收藏，方便对比</div>
      <el-button color="#626aef"  plain @click="exportList">导出</el-button>
      <div class="goods-box">
        <div class="goods-star-item" v-for="(item,index) in searchAbout.starList" :key="index">
          <div>
            <img class="goods-item-img" :src=item.img alt="">
            <div>{{item.name}}</div>
            <div v-for="(item2) in item.list" :key="item2.id">
              <span class="click-span" @click="openUrl(item2.id)">{{ item2.price }} </span>
              <span class="click-span" @click="removeFromStar(item2)"> - </span>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>
<script setup lang="ts">
import { ref,reactive ,onMounted} from 'vue'
import { ElMessage  } from 'element-plus'
const addStep = ref(10)
const stopWater = ref(false)
const haveCookie = ref(false)
let settingMap = reactive({
  biligoods:{
    url:'',
  },
})

onMounted(() => {
  document.onkeydown=function(e){    //对整个页面监听  
    var keyNum=window.event ? e.keyCode :e.which;       //获取被按下的键值  
    // console.log(keyNum)
    if(keyNum==70){  
      search()
    } 
    stopWater.value = true
  }
  haveCookie.value = checkCookie('buvid4'); //检测是否存在cookie
  analysisStar()  //生成收藏夹
  searchAbout.lowestMap = JSON.parse(localStorage.getItem("lowestMap") || "{}") ;   //获取最低价
  if(localStorage.getItem("settingMap")){
    let map  = JSON.parse(localStorage.getItem("settingMap") || "{}") ;   //获取设置
    settingMap.biligoods = map.biligoods
  }
})
function checkCookie(objname : string){//获取指定名称的cookie的值
  var arrstr = document.cookie.split("; ");
  for(var i = 0;i < arrstr.length;i ++){
    var temp = arrstr[i].split("=");
    if(temp[0] == objname) return true;
  }
  return false
}
function UpdateCookies(cookies : string){
  let datas = cookies.split(";");
  var now = new Date();
  now.setMonth( now.getMonth() + 1 );
  document.cookie = "expires=" + now.toUTCString() + ";";
  for(var i=0; i<datas.length; i++)
  {
    document.cookie = datas[i] + ";expires=" + now.toUTCString() + ";";
  }
  return "success";
};
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
  console.log(arrary)
}
function likeWater(){
  stopWater.value = false
  search()
  let waterSearch = setInterval(()=>{
    if(stopWater.value){
      clearInterval(waterSearch)
    }else{
      search()
    }
  },10000)
}
function addSearch(){
  searchAbout.allStep += addStep.value
  bilibiliGoodsSearch()
}
interface searchAbout {
  goodsList: any[];
  lastArrary: {
    breakNewPrice: any
    name: any;
    list: any;
    itemsId:string,
    id:any;
    img: any;
    price: string;
  }[];
  inSearch: boolean;
  nextId: string;
  allStep: number;
  now_step: number;
  drawer: boolean;
  isBan:boolean;
  starList: any[];
  keyMap: {[key: string]:number};
  lowestMap: {[key: string]:any};
  showAnalysis: boolean;
}
interface starMap {
  name: string;
  id: any;
  icon: any;
  price: string;
}
const searchAbout : searchAbout = reactive({
  goodsList:[],
  lastArrary:[],
  inSearch:false,
  nextId:'',
  allStep:0,
  now_step:0,
  drawer:false,
  starList:[],
  keyMap:{},
  lowestMap:{},
  showAnalysis:false,
  isBan:false
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
function showStarList(){
  analysisStar()
  searchAbout.drawer = true
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
function addToStar(item : starMap){
  let list = JSON.parse(localStorage.getItem("starList") || "[]") ;
  list = list.concat([item])
  localStorage.setItem("starList",JSON.stringify(list));
  ElMessage.success('添加到收藏夹成功！')
  analysisStar()
}
function openAnalysis(itemId : String){
  window.open(`http://111.229.88.32:7777/play_biligoods/#/?id=${itemId}`)
}
function openUrl(itemId : String){
    window.open(`https://mall.bilibili.com/neul-next/index.html?page=magic-market_detail&noTitleBar=1&itemsId=${itemId}&from=market_index`)
}
function search(){
  searchAbout.now_step = 0
  searchAbout.lastArrary = []
  searchAbout.nextId = ''
  searchAbout.inSearch = true
  searchAbout.allStep = step.value
  nodeSearch.size = step.value
  nodeSearch.page = 1
  searchAbout.goodsList =[]
  bilibiliGoodsSearch()
}
function analysisAction(){
  let arrary = searchAbout.goodsList
  let map ={}
  for(let i of arrary){
    if(map[i.itemsId.join(',')] && map[i.itemsId.join(',')].length > 0){
      map[i.itemsId.join(',')].push(i)
    }else{
      map[i.itemsId.join(',')] = [i]
    }
  } 
  let filterMap = {
    'star':[],
    'newLow':[],
    'nomal':[]
  }
  let lastArrary = []
  for(let t in map){
    let map2 ={
      name:map[t][0].name,
      itemsId:t,
      list:map[t],
      breakNewPrice:getBreakPrice(map[t]),
      img:map[t][0].icon,
      id:map[t][0].id,
      price:getLowPrice(map[t])
    }
    if(searchAbout.keyMap[t]){
      filterMap.star.push(map2)
    }else if(map2.breakNewPrice){
      filterMap.newLow.push(map2)
    }else{
      filterMap.nomal.push(map2)
    }
  }
  console.log(filterMap.star)
  lastArrary = filterMap.star.concat(filterMap.newLow,filterMap.nomal)
  searchAbout.lastArrary = lastArrary
  searchAbout.showAnalysis = true
}
function getBreakPrice(list : any){
  let flag = false
  for(let i of list){
    if(i.breakNewPrice){
      flag = true
    }
  }
  return flag
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
function bilibiliGoodsSearch(){
  if(settingMap.biligoods.url == 'http://111.229.88.32:3000/biligoods/getBiligoodslist'){
    biliNodeSearch()
    return
  }
  let data = {
    nextId:searchAbout.nextId.length == 0?null:searchAbout.nextId,
    categoryFilter:categoryFilter.value,
    sortType:sortType.value,
    priceFilters:priceFilters.value,
    discountFilters:discountFilters.value
  }
  $.ajax({
    type: "POST",
    url: `${settingMap.biligoods.url}/mall-magic-c/internet/c2c/v2/list`,
    timeout: 20000,
    headers : {
      "Content-Type": "application/json",
      "Access-Control-Allow-Credentials":"true",
    },
    // xhrFields: {
    //   withCredentials: haveCookie.value //True :允许跨域携带cookie信息 
    // },
    data: JSON.stringify(data),
    success: function (res) {
      if(res.code == 0){
        searchAbout.isBan = false
        //精简内容 优化 数组
        res.data.data = res.data.data.map((item : any)=>{
          let breakNewPrice = false
          let itemsId = item.detailDtoList.map((itema)=>{
            return itema.skuId
          })
          itemsId = itemsId.sort()
          if(itemsId.length == 1){
            let key = itemsId[0]
            if(searchAbout.lowestMap[key]){
              if(Number(item.showPrice) < Number(searchAbout.lowestMap[key])){
                searchAbout.lowestMap[key] = Number(item.showPrice)
                breakNewPrice = true
              }
            }else{
              searchAbout.lowestMap[key] = Number(item.showPrice)
            }
          }else{
            let all = 0
            for(let i of itemsId){
              let price = searchAbout.lowestMap[i] || 0
              all += Number(price)
            }
            if(Number(item.showPrice) < Number(all)){
              breakNewPrice = true
            }
          }
          return{
            name:item.c2cItemsName,
            icon:item.detailDtoList[0].img,
            itemsId:itemsId,
            price:item.showPrice,
            breakNewPrice:breakNewPrice,
            id:item.c2cItemsId
          }
        })
        let arrary = searchAbout.goodsList
        arrary = arrary.concat(res.data.data)
        searchAbout.goodsList = arrary
        searchAbout.nextId = res.data.nextId
        searchAbout.now_step += res.data.data.length
        if(searchAbout.now_step < searchAbout.allStep){
          setTimeout(()=>{
            bilibiliGoodsSearch()
          },2000)
        }else{
          analysisAction()
          localStorage.setItem("lowestMap",JSON.stringify(searchAbout.lowestMap));
        }
      }else{
        //失败重发
        analysisAction()
        localStorage.setItem("lowestMap",JSON.stringify(searchAbout.lowestMap));
        searchAbout.isBan = true
        // setTimeout(()=>{
        //   bilibiliGoodsSearch()
        // },10000)
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

function biliNodeSearch(){
  $.ajax({
    type: "GET",
    url: `http://111.229.88.32:3000/biligoods/getBiligoodslist?page=${nodeSearch.page}&size=${nodeSearch.size}&name=${nodeSearch.name}`,
    timeout: 20000,
    success: function (res) {
      //精简内容 优化 数组
      res = res.map((item : any)=>{
          let breakNewPrice = false
          let itemsId = item.categoryId.split(',')
          itemsId = itemsId.sort()
          if(itemsId.length == 1){
            let key = itemsId[0]
            if(searchAbout.lowestMap[key]){
              if(Number(item.showPrice) < Number(searchAbout.lowestMap[key])){
                searchAbout.lowestMap[key] = Number(item.showPrice)
                breakNewPrice = true
              }
            }else{
              searchAbout.lowestMap[key] = Number(item.showPrice)
            }
          }else{
            let all = 0
            for(let i of itemsId){
              let price = searchAbout.lowestMap[i] || 0
              all += Number(price)
            }
            if(Number(item.showPrice) < Number(all)){
              breakNewPrice = true
            }
          }
          return{
            name:item.name,
            icon:item.img,
            itemsId:itemsId,
            price:item.price,
            breakNewPrice:breakNewPrice,
            id:item._id
          }
        })
        let arrary = searchAbout.goodsList
        arrary = arrary.concat(res)
        let obj = {};
        arrary = arrary.reduce((cur,next) => {
            obj[next.id] ? "" : obj[next.id] = true && cur.push(next);
            return cur;
        },[])
        searchAbout.goodsList = arrary
        searchAbout.now_step += res.length
        nodeSearch.page ++
        analysisAction()
        localStorage.setItem("lowestMap",JSON.stringify(searchAbout.lowestMap));
      
    },
    error:function (res) {
      console.log(res)
    }
  });
}
function clear(){
  searchAbout.goodsList =[]
  searchAbout.nextId = ''
  searchAbout.inSearch = false
  searchAbout.allStep = 0
  searchAbout.now_step = 0
  searchAbout.lastArrary = []
}
function reset(){
  searchAbout.goodsList =[]
  searchAbout.nextId = ''
  searchAbout.inSearch = false
  searchAbout.allStep = 0
  searchAbout.now_step = 0
  searchAbout.lastArrary = []

  categoryFilter.value = ''
  sortType.value = 'TIME_DESC'
  priceFilters.value = []
  discountFilters.value = []
}
//常量
const categoryFilter = ref('')
const categoryFilterList = [
  {value:'2312',label:'手办'},
  {value:'2066',label:'模型'},
  {value:'2331',label:'周边'},
  {value:'2273',label:'3C'},
  {value:'fudai_cate_id',label:'福袋'},
]
const sortType = ref('TIME_DESC')
const sortTypeList = [
  {value:'TIME_DESC',label:'时间排序（默认）'},
  {value:'PRICE_ASC',label:'价格升序'},
  {value:'PRICE_DESC',label:'价格降序'},
]
const priceFilters = ref([])
const priceFiltersList = [
  {value:'0-2000',label:'0-20'},
  {value:'2000-3000',label:'20-30'},
  {value:'3000-5000',label:'30-50'},
  {value:'5000-10000',label:'50-100'},
  {value:'10000-20000',label:'100-200'},
  {value:'20000-0',label:'200以上'},
]
const discountFilters = ref([])
const discountFiltersList = [
  {value:'0-30',label:'3折以下'},
  {value:'30-50',label:'3-5折'},
  {value:'50-70',label:'5-7折'},
  {value:'70-100',label:'7折以上'},
]
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
  width: calc(20% - 12px);
  border: 4px solid rgb(235,235,235);
  padding: 24px 0;
  margin-right: 12px;
  border-radius: 24px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;  
  text-align: center;
}
.goods-item-instar{
  width: calc(20% - 12px);
  border: 4px solid #fb7299;
  padding: 24px 0;
  margin-right: 12px;
  border-radius: 24px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;  
  text-align: center;
}
.goods-item-break{
  width: calc(20% - 12px);
  border: 4px solid #6dc781;
  padding: 24px 0;
  margin-right: 12px;
  border-radius: 24px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;  
  text-align: center;
}
.goods-star-item{
  width: 40%;
  border: 1px solid gray;
  padding: 24px 0;
  margin-right: 12px;
  border-radius: 24px;
  margin-bottom: 24px;
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