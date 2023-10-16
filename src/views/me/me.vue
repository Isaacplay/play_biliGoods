<template>
  <div class="containerME" style="height:100%" >
    <div class="filter-header">
      <div class="header-item"><div class="left-name">总购买投入：</div><div class="value"> {{itemAnalysisData.allBuyMoney.toFixed(2)}}</div></div>
      <div class="header-item"><div class="left-name">已售出金额：</div><div class="value">{{itemAnalysisData.downSellMoney.toFixed(2)}}</div></div>
      <div class="header-item"><div class="left-name">已售出利润：</div><div class="value">{{(itemAnalysisData.downSellMoney - itemAnalysisData.downSellCost).toFixed(2) }}</div></div>
      <div class="header-item"><div class="left-name">待售商品总金额：</div><div class="value">{{itemAnalysisData.nowSellMoney.toFixed(2)}}</div></div>
      <div class="header-item"><div class="left-name">预期总利润：</div><div class="value">{{(itemAnalysisData.nowSellMoney + itemAnalysisData.downSellMoney - itemAnalysisData.allBuyMoney).toFixed(2) }}</div></div>
    </div>
    <div v-if="haveCookie" class="me-box">
      <div class="rank-box">
        <div class="rank-box-tilte">最近售出商品</div>
        <div class="rank-box-item"  v-for="(item,index) in UserInfo.havePublishedList" :key="index+'havePublished'">
          <img class="goods-item-img" :src=item.detailDtoList[0].img alt="">
          <div class="item-right-box">
            <div>{{item.c2cItemsName}}</div>
            <div>售出价 {{item.showPrice}} </div>
            <div>购入价 {{item.inPrice}}</div>
          </div>
        </div>
      </div>
      <div class="rank-box">
        <div class="rank-box-tilte">累计收益排名(品类)</div>
        <div class="rank-box-item" v-for="(item,index) in UserInfo.sendCost" :key="index+'allCost'">
            <img class="goods-item-img" :src=item.img alt="">
            <div class="item-right-box">
              <div>{{item.name}}</div>
              <div>总成本{{(item.costInthis).toFixed(1)}} 数量 {{item.num}}</div>
              <div>总利润 {{(item.earnings).toFixed(1)}}</div>
            </div>
        </div>
      </div>
      <div class="rank-box">
        <div class="rank-box-tilte">累计购买排名(金额)</div>
         <div class="rank-box-item" v-for="(item,index) in UserInfo.allCost" :key="index+'allCost'">
            <img class="goods-item-img" :src=item.img alt="">
            <div class="item-right-box">
              <div>{{item.name}}</div>
              <div>平均购入价{{item.price}} 数量 {{item.num}}</div>
              <div>总购入 {{item.costInthis}}</div>
            </div>
          </div>
      </div>
    </div>
    <div class="me-box-nocookie" v-else>
      <img class="tip-img" src="@/assets/img/tip.jpg" alt="">
      <div class="tip-box">没有cookie呢，去【设置】里面添加cookie吧</div>
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
    getSelledList(1)
  }
})
function analysisAction(){
  //键值对的map 商品唯一id ： 买的时候的价格
  let buyItemMap = {}     
  //计算总金额
  for(let i of UserInfo.myPurchasedList){
    itemAnalysisData.allBuyMoney += Number(i.showPrice)
    let length = i.detailDtoList.length
    let markerPrice = 0
    for(let k of i.detailDtoList){
      markerPrice += (k.marketPrice)
    }
    for(let t of i.detailDtoList){
      let costMoney = Number(i.showPrice) * ((t.marketPrice/markerPrice))
      if(buyItemMap[t.itemsId]){
        buyItemMap[t.itemsId].costInthis = buyItemMap[t.itemsId].costInthis + costMoney
        buyItemMap[t.itemsId].num++
        buyItemMap[t.itemsId].price = ((buyItemMap[t.itemsId].costInthis)/buyItemMap[t.itemsId].num).toFixed(1)
      }else{
        buyItemMap[t.itemsId] = {
          'price':costMoney,
          'img':t.img,
          'costInthis':costMoney,
          'name':i.c2cItemsName,
          'num':1
        }
      }
    }
  }
  console.log(buyItemMap)
  //键值对的map 商品唯一id ： 卖的时候的价格
  let sendItemMap = {}     
  for(let i of UserInfo.havePublishedList){
    let allInPrice = 0
    let itemsIdList = []
    for(let k of i.detailDtoList){
      //出现可能是自己抽的商品 就算0成本吧 （摊手
      if(buyItemMap[k.itemsId]){
        allInPrice += Number(buyItemMap[k.itemsId].price)
      }else{
        allInPrice += Number((k.marketPrice/100)*0.2)
      }
      itemsIdList.push(k.itemsId)
    }
    itemAnalysisData.downSellCost = itemAnalysisData.downSellCost + allInPrice
    i.inPrice = allInPrice
    itemsIdList = itemsIdList.sort()
    let keyIds = itemsIdList.join(',')
    if(sendItemMap[keyIds]){
      sendItemMap[keyIds].earnings = sendItemMap[keyIds].earnings + Number(i.showPrice) - i.inPrice
      sendItemMap[keyIds].costInthis += i.inPrice 
      sendItemMap[keyIds].num++
    }else{
      sendItemMap[keyIds] = {
        'earnings':Number(i.showPrice) - i.inPrice,
        'img':i.detailDtoList[0].img,
        'costInthis':i.inPrice,
        'name':i.c2cItemsName,
        'num':1
      }
    }
  }
  //已经卖出的金额
  itemAnalysisData.downSellMoney = Number(UserInfo.myInfo.income)
  //在卖的商品的金额
  for(let i of UserInfo.myPublishList){
    itemAnalysisData.nowSellMoney += Number(i.showPrice)
    for(let k of i.detailDtoList){
      itemAnalysisData.nowSellCost += buyItemMap[k.itemsId].price || Number((k.marketPrice/100)*0.2)
    }
  }
  //把累计的map转成数组排序
  let arrary = []
  for(let i in buyItemMap){
    arrary.push(buyItemMap[i])
  }
  UserInfo.allCost = arrary.sort((a,b)=>{
    return b.costInthis - a.costInthis
  })
  //把卖的map转成数组排序
  let sendArrary = []
  for(let i in sendItemMap){
    sendArrary.push(sendItemMap[i])
  }
  UserInfo.sendCost = sendArrary.sort((a,b)=>{
    return b.earnings - a.earnings
  })

}
interface UserInfo {
  myInfo: {[key: string]:number};
  myPublishList:[];
  myPurchasedList:[];
  havePublishedList:[];
  allCost:[],  
  sendCost:[] 
}
const UserInfo : UserInfo = reactive({
  myInfo:{},
  myPublishList:[],     //在卖的
  myPurchasedList:[],   //总购买的
  havePublishedList:[],   //卖完的
  allCost:[],   //合并累计
  sendCost:[] 
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
        getMyPurchasedItems(1)
      }
    },
    error:function (res) {
      console.log(res)
    }
  });
}
function getMyPurchasedItems(pageNumber : number){
  $.ajax({
    type: "GET",
    url: `${settingMap.me.url}/mall-magic-c/internet/c2c/items/pageQueryMyPurchasedItems?pageSize=150&pageNo=${pageNumber}`,
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
        UserInfo.myPurchasedList = UserInfo.myPurchasedList.concat(res.data.list) 
        if(UserInfo.myPurchasedList.length < res.data.total){
          getMyPurchasedItems(pageNumber + 1)
        }else{
          console.log(UserInfo.myPurchasedList.length)
          analysisAction()
        }
      }
    },
    error:function (res) {
      console.log(res)
    }
  });
}
function getSelledList(pageNumber : number){
  $.ajax({
    type: "GET",
    url: `${settingMap.me.url}/mall-magic-c/internet/c2c/items/pageQueryMyPublish?pageSize=200&pageNo=${pageNumber}&filterType=2`,
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
        UserInfo.havePublishedList = UserInfo.havePublishedList.concat(res.data.list) 
        if(UserInfo.havePublishedList.length < res.data.total){
          getSelledList(pageNumber + 1)
        }else{
          getMyUserInfo()
        }
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
    display: flex;
    padding: 24px;
    .goods-item-img{
      width: 25%;
      height: auto;
    }
    .rank-box{
      width: 33%;
      text-align: center;
      border-right: 2px solid rgb(235,235,235);
      .rank-box-tilte{
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 12px;
      }
      .rank-box-item{
        border-bottom: 1px solid rgb(235,235,235);
        margin-bottom: 6px;
        display: flex;
        padding: 12px 24px;
        justify-content: space-between;
        * > div{
          margin-bottom: 6px;
        }
        .item-right-box{
          display: flex;
          width: 60%;
          flex-direction: column;
          justify-content: space-around;

        }
      }
    }
  }
  .me-box-nocookie{
    background-color: white;
    height: calc(100% - 120px);
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 24px;
    .tip-img{
      width: 50%;
      height: auto;
      margin-bottom: 30px;
    }
    .tip-box{
      font-size: 24px;
      font-weight: 600;
    }
  }
}

</style>