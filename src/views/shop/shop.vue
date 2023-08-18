<template>
  <div class="containerShop" style="height:100%" >
    <div class="filter-header">
      <div class="filter-header-left">
      </div>
      <div class="filter-header-right">
      </div>
    </div>
    <div class="goods-box">
        <div class="goods-item" v-for="(item,index) in UserInfo.lastArrary" :key="index">
          <div>
            <img class="goods-item-img" :src=item.img alt="">
            <div>{{item.name}}</div>
            <div style="white-space: nowrap;">
              <span v-for="(item2) in item.list" :key="item2.id" class="click-span" @click="openUrl(item2.id)">{{ item2.price }} </span>
            </div>
          </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref,reactive ,onMounted} from 'vue'
import { ElMessage  } from 'element-plus'
const haveCookie = ref(false)
let settingMap = reactive({
  me:{
    url:'',
  }
})

interface UserInfo {
  myPublishList:[];
  lastArrary:[],
  keyMap:{}
}
const UserInfo : UserInfo = reactive({
  myPublishList:[],     //在卖的
  lastArrary:[],
  keyMap:{}
})

onMounted(() => {
  haveCookie.value = checkCookie('buvid4'); //检测是否存在cookie
  if(localStorage.getItem("settingMap")){
    let map  = JSON.parse(localStorage.getItem("settingMap") || "{}") ;   //获取设置
    settingMap.me = map.me
  }
  if(haveCookie.value){
    getMyPublish()
  }
})

function openUrl(itemId : String){
    window.open(`https://mall.bilibili.com/neul-next/index.html?page=magic-market_detail&noTitleBar=1&itemsId=${itemId}&from=market_index`)
}

function analysisAction(){
  let arrary = UserInfo.myPublishList
  let map ={}
  for(let i of arrary){
    if(map[i.itemsId] && map[i.itemsId].length > 0){
      map[i.itemsId].push(i)
    }else{
      map[i.itemsId] = [i]
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
  UserInfo.lastArrary = lastArrary;
  UserInfo.keyMap = keyMap;
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

function getMyPublish(){
  $.ajax({
    type: "GET",
    url: `${settingMap.me.url}/mall-magic-c/internet/c2c/items/pageQueryMyPublish?pageSize=999&pageNo=1&filterType=1`,
    timeout: 20000,
    headers : {
      "Content-Type": "application/json",
      "Access-Control-Allow-Credentials":"true",
    },
    xhrFields: {
      withCredentials: haveCookie.value //True :允许跨域携带cookie信息 
    },
    success: function (res) {
      if(res.code == 0){
        UserInfo.myPublishList = res.data.list.map((item)=>{
          let itemsId = item.detailDtoList.map((itema)=>{
              return itema.skuId
          })
          item.itemsId = itemsId.sort().join(',')
          return{
            name:item.c2cItemsName,
            icon:item.detailDtoList[0].img,
            itemsId:itemsId,
            price:item.showPrice,
            id:item.c2cItemsId
          }
        })
        analysisAction()
      }
    },
    error:function (res) {
      console.log(res)
    }
  });
}

function checkCookie(objname : string){     //获取指定名称的cookie的值
  var arrstr = document.cookie.split("; ");
  for(var i = 0;i < arrstr.length;i ++){
    var temp = arrstr[i].split("=");
    if(temp[0] == objname) return true;
  }
  return false
}

</script>
<style lang="scss"  scoped>
.containerShop{
  .filter-header{
    position: sticky;
    height: 120px;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 999;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    padding: 24px;
    .header-item{
      width: 33%;
      display: flex;
      align-items: center;
      .left-name{
        font-size: 16px;
      }
      .value{
        font-size: 24px;
        font-weight: 600;
      }
    }
  }
  .shop-box{
    background-color: white;
    height: calc(100% - 120px);
    overflow-y: scroll;
    padding: 24px;
    .setting-item{
      padding: 24px;
      margin-bottom: 12px;
      border-radius: 12px;
      border: 2px solid rgb(235,235,235);
      .title{
        font-size: 18px;
        font-weight: 600;
      }
    }
  }
}
.setting-filter{
  display: flex;
  align-items: center;
  padding-left: 24px;
  margin-top: 24px;
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
.click-span{
  cursor: pointer;
  color: #409eff;
  margin-right: 6px;
}

</style>