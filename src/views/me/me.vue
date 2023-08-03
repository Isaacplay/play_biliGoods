<template>
  <div class="containerME" style="height:100%" >
    <div class="filter-header">
      <div class="header-item"><div class="left-name">总购买投入：</div><div class="value"> {{itemAnalysisData.allBuyMoney.toFixed(2)}}</div></div>
      <div class="header-item"><div class="left-name">已售出金额：</div><div class="value">{{itemAnalysisData.downSellMoney.toFixed(2)}}</div></div>
      <div class="header-item"><div class="left-name">已售出利润：</div><div class="value">{{(itemAnalysisData.downSellMoney - itemAnalysisData.downSellCost).toFixed(2) }}</div></div>
      <div class="header-item"><div class="left-name">待售商品总金额：</div><div class="value">{{itemAnalysisData.nowSellMoney.toFixed(2)}}</div></div>
      <div class="header-item"><div class="left-name">预期总利润：</div><div class="value">{{(itemAnalysisData.nowSellMoney + itemAnalysisData.downSellMoney - itemAnalysisData.allBuyMoney).toFixed(2) }}</div></div>
    </div>
    <div class="me-box">

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

onMounted(() => {
  haveCookie.value = checkCookie('buvid4'); //检测是否存在cookie
  if(localStorage.getItem("settingMap")){
    let map  = JSON.parse(localStorage.getItem("settingMap") || "{}") ;   //获取设置
    settingMap.me = map.me
  }
  if(haveCookie.value){
    getMyUserInfo()
    getSelledList()
  }
})
function analysisAction(){
  //键值对的map 商品唯一id ： 买的时候的价格
  let buyItemMap = {}     
  //计算总金额
  for(let i of UserInfo.myPurchasedList){
    itemAnalysisData.allBuyMoney += Number(i.showPrice)
    buyItemMap[i.detailDtoList[0].itemsId] = Number(i.showPrice)
  }
  //键值对的map 商品唯一id ： 卖的时候的价格
  for(let i of UserInfo.havePublishedList){
    itemAnalysisData.downSellCost += buyItemMap[i.detailDtoList[0].itemsId]
  }
  //已经卖出的金额
  itemAnalysisData.downSellMoney = Number(UserInfo.myInfo.income)
  //在卖的商品的金额
  for(let i of UserInfo.myPublishList){
    itemAnalysisData.nowSellMoney += Number(i.showPrice)
    itemAnalysisData.nowSellCost += buyItemMap[i.detailDtoList[0].itemsId]
  }

}
interface UserInfo {
  myInfo: {[key: string]:number};
  myPublishList:[];
  myPurchasedList:[];
  havePublishedList:[];
}
const UserInfo : UserInfo = reactive({
  myInfo:{},
  myPublishList:[],     //在卖的
  myPurchasedList:[],   //总购买的
  havePublishedList:[],   //卖完的
})
const itemAnalysisData = reactive({
  allBuyMoney:0,  //总购买的金额
  downSellMoney:0, //已经卖出的金额
  downSellCost:0,  //已经卖出的商品的成本
  nowSellMoney:0,  //在卖的商品的金额
  nowSellCost:0,   //在卖的商品的成本
  waitSellCost:0,   //没卖的商品的成本
})
function getMyUserInfo(){
  $.ajax({
    type: "GET",
    url: `${settingMap.me.url}/mall-magic-c/internet/c2c/items/queryUserInfo`,
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
        UserInfo.myInfo = res.data
        getMyPublish()
    
      }
    },
    error:function (res) {
      console.log(res)
    }
  });
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
        UserInfo.myPublishList = res.data.list
        getMyPurchasedItems()
      }
    },
    error:function (res) {
      console.log(res)
    }
  });
}
function getMyPurchasedItems(){
  $.ajax({
    type: "GET",
    url: `${settingMap.me.url}/mall-magic-c/internet/c2c/items/pageQueryMyPurchasedItems?pageSize=150&pageNo=1`,
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
        UserInfo.myPurchasedList = res.data.list
        analysisAction()
      }
    },
    error:function (res) {
      console.log(res)
    }
  });
}
function getSelledList(){
  $.ajax({
    type: "GET",
    url: `${settingMap.me.url}/mall-magic-c/internet/c2c/items/pageQueryMyPublish?pageSize=200&pageNo=1&filterType=2`,
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
        UserInfo.havePublishedList = res.data.list
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
.containerME{
  .filter-header{
    position: sticky;
    height: 120px;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 999;
    display: flex;
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
  .me-box{
    background-color: white;
    height: calc(100% - 120px);
    overflow-y: scroll;
  }
}

</style>