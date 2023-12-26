<template>
  <div class="containerShop" style="height:100%">
    <div class="filter-header">
      <div class="filter-header-left">
        <div class="filter-item">
          <div style="margin-bottom:12px" class="filter-name">刷新列表有: {{ UserInfo.refushList.length }} 个</div>
          <div class="filter-name">{{ UserInfo.msg }}</div>
        </div>
      </div>
      <div>
        <div style="margin-bottom:12px" class="filter-header-right">
          <el-button color="#626aef" @click="setRefushList">保存</el-button>
          <el-button color="#626aef" @click="clearRefushList">清空</el-button>
          <el-button color="#626aef" @click="refeashAction">刷新</el-button>
        </div>
        <div>
          <el-button @click="switchType">切换仓库 & 在售</el-button>
        </div>
      </div>
    </div>
    <div v-if="haveCookie" class="goods-box">
      <!-- 在卖的 -->
      <template v-if="UserInfo.sellShow">
        <div :class="checkInList(item.lowId) ? 'goods-item-instar' : 'goods-item'" v-for="(item, index) in UserInfo.lastArrary" :key="index">
          <div>
            <div>倒计时 ：{{ item.deadLine }}</div>
            <img class="goods-item-img" @click="openAnalysis(item.itemsId)" :src=item.img alt="">
            <div>{{ item.name }}</div>
            <div>截止日期 ：{{ item.endTime }}</div>
            <div style="white-space: nowrap;">
              <span v-for="(item2) in item.list" :key="item2.id" class="click-span" @click="openUrl(item2.id)">{{
                item2.price }} </span>
            </div>
          </div>
          <div @click="setTimeAction(item)" class="icon-setting"><el-icon><Setting /></el-icon></div>
          <div @click="addRefushAction(item)" class="icon-addrefush"><el-icon><Refresh /></el-icon></div>
          <div @click="addAction(item,'Refresh')" class="icon-editrefush"><el-icon><EditPen /></el-icon></div>
          <div @click="changeFishFlag(item)" class="icon-fishFlag">
            <img v-if="UserInfo.fishFlag[item.itemsId]" src="@/assets/icon/xianyu.png" alt="">
            <img v-else src="" alt="@/assets/icon/xianyu-fill.png">
          </div>
        </div>
      </template>
      <!-- 没在卖的 -->
      <template v-else>
        <div :class="item.isInsell ? 'goods-item' : 'goods-item-green'" v-for="(item, index) in UserInfo.boxItemFinList" :key="index">
          <div>
            <img class="goods-item-img" @click="openAnalysis(item.itemsId)" :src=item.img alt="">
            <div>{{ item.name }}</div>
            <div style="white-space: nowrap;">有 {{item.list.length}} 个</div>
            <div @click="addAction(item,'Add')" class="icon-addrefush"><el-icon><Plus /></el-icon></div>
          </div>
        </div>
      </template>

    </div>
    <div class="me-box-nocookie" v-else>
      <img class="tip-img" src="@/assets/img/tip.jpg" alt="">
      <div class="tip-box">没有cookie呢，去【设置】里面添加cookie吧</div>
    </div>

    <el-dialog v-model="dialogVisible" title="Tips" width="30%">
      <div class="dialog-con">
        <div class="dialog-name">{{ UserInfo.cateGoryItem.name }}</div>
        <el-date-picker
          v-model="value1"
          type="date"
          placeholder="Pick a day"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="setConfirm">Confirm</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="pushLishVisible" title="Tips" width="30%">
      <div class="dialog-con">
        <div class="dialog-name">{{ publishInfo.selectItem.itemsName || publishInfo.selectItem.name }}</div>
        <!-- <div class="dialog-name">折扣为 : {{ Number(publishInfo.price) / publishInfo.selectItem.showPrice }}</div> -->
        <el-input class="w240" v-model="publishInfo.price" />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="pushLishVisible = false">Cancel</el-button>
          <el-button type="primary" @click="publishConfirm">Confirm</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted , computed} from 'vue'
import { ElMessage } from 'element-plus'
import moment from 'moment';
const haveCookie = ref(false)
const dialogVisible = ref(false)
const value1 = ref('')
let settingMap = reactive({
  me: {
    url: '',
  }
})

// 发布 & 改价逻辑
const pushLishVisible = ref(false)
interface publishInfo {
  selectItem: {};
  price:number,
  type:string

}
const publishInfo: publishInfo = reactive({
  selectItem:{},
  price:0,
  type:'Add'
})
function addAction(item : any,type : string){
  publishInfo.selectItem = item.list[0]
  publishInfo.price = 0
  publishInfo.type = type
  pushLishVisible.value = true
}
function publishConfirm(){
  let list = {
    "type":publishInfo.type,
    "price": (Number(publishInfo.price)), 
    "cookie": document.cookie, 
  }
  if(publishInfo.type == 'Add'){
    list.blindBoxIds = [publishInfo.selectItem.blindBoxId]
  }else if (publishInfo.type == 'Refresh'){
    list.c2cItemsId = publishInfo.selectItem.id
  }
  $.ajax({
    type: "POST",
    url: `http://111.229.88.32:3000/shopAction/groundShopItem`,
    timeout: 20000,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify(list),
    success: function (res) {
      ElMessage.success('发布成功！')
      pushLishVisible.value = false
      refeashAction()
    },
    error: function (res) {
      ElMessage.error('error')
    }
  }); 
}

//老逻辑
function checkInList(id){
  let flag = false
  for(let i of UserInfo.refushList){
    if(id == Number(i)){
      flag = true
    }
  }
  return flag
}

interface UserInfo {
  myPublishList: [];
  lastArrary: {
    name: any;
    list: any;
    itemsId: string,
    id: any;
    img: any;
    price: string;
  }[],
  cateGoryItem: {
    name:string,
    itemsId:string
  },
  sellShow:boolean,
  msg:string,
  shopTime: {};
  fishFlag: {};
  boxItemList: [];
  boxItemFinList:[];
  refushList:[];
}

const UserInfo: UserInfo = reactive({
  refushList: [],     //在卖的
  myPublishList: [],     //在卖的
  lastArrary: [],
  cateGoryItem: {},
  shopTime:{},
  fishFlag:{},
  msg:'',
  sellShow:true,
  boxItemList:[],
  boxItemFinList:[]
})

onMounted(() => {
  haveCookie.value = checkCookie('buvid4'); //检测是否存在cookie
  if (localStorage.getItem("settingMap")) {
    let map = JSON.parse(localStorage.getItem("settingMap") || "{}");   //获取设置
    settingMap.me = map.me
  }
  let shopTime = JSON.parse(localStorage.getItem("shopTime") || "{}");   //获取设置
  let fishFlag = JSON.parse(localStorage.getItem("fishFlag") || "{}");   //闲鱼挂着
  UserInfo.shopTime = shopTime
  UserInfo.fishFlag = fishFlag
  refeashAction()
})

function refeashAction(){
  if (haveCookie.value) {
    getMyPublish()
    getRefushlist()
  }
}

function setConfirm(){
  let time = +new Date(value1.value)
  UserInfo.shopTime[UserInfo.cateGoryItem.itemsId] = time
  localStorage.setItem("shopTime",JSON.stringify(UserInfo.shopTime));
  ElMessage.success('保存成功！')
  dialogVisible.value = false
  // console.log(time)
}

function openAnalysis(itemId: String) {
  window.open(`http://111.229.88.32:7777/play_biligoods/#/?id=${itemId}`)
}

function openUrl(itemId: String) {
  window.open(`https://mall.bilibili.com/neul-next/index.html?page=magic-market_detail&noTitleBar=1&itemsId=${itemId}&from=market_index`)
}

function setTimeAction(item: any) {
  UserInfo.cateGoryItem = item
  dialogVisible.value = true
}

function analysisAction() {
  let arrary = UserInfo.myPublishList
  let map = {}
  for (let i of arrary) {
    if (map[i.itemsId] && map[i.itemsId].length > 0) {
      map[i.itemsId].push(i)
    } else {
      map[i.itemsId] = [i]
    }
  }
  let lastArrary = []
  for (let t in map) {
    let map2 = {
      name: map[t][0].name,
      itemsId: t,
      list: map[t],
      img: map[t][0].icon,
      id: map[t][0].id,
      price: getLowPrice(map[t]),
      lowId: getLowId(map[t])
    }
    lastArrary.push(map2)
  }
  UserInfo.lastArrary = lastArrary;
  sortByTime()
}

function sortByTime(){
  let time = +new Date()
  for(let i in UserInfo.lastArrary){
    if(UserInfo.shopTime[UserInfo.lastArrary[i].itemsId]){
      UserInfo.lastArrary[i].timesample = UserInfo.shopTime[UserInfo.lastArrary[i].itemsId]
      UserInfo.lastArrary[i].endTime = moment(UserInfo.lastArrary[i].timesample).format('YYYY-MM-DD');
      UserInfo.lastArrary[i].deadLine = getDateByTime(UserInfo.lastArrary[i].timesample - time)
    }else{
      UserInfo.lastArrary[i].timesample = -1
      UserInfo.lastArrary[i].endTime = '--'
      UserInfo.lastArrary[i].deadLine = '--'
    }
  }
  UserInfo.lastArrary.sort((x,y)=>{
    return x.timesample - y.timesample
  })
  UserInfo.boxItemList = []
  getGoodsInBOX2(1)
}

function getDateByTime(time){
  if(time > 0){
    let day = parseInt( time / (3600 * 24 * 1000) )
    let hour = (parseInt( time % (3600 * 24 * 1000) ) / (3600 * 1000)).toFixed(0)
    return `${day} 天 ${hour} 时`
  }else{
    return '--'
  }
}

function getLowId(list: any){
  let lowId = list[0].id
  let lowPrice = Number(list[0].price)
  for(let i of list){
    if(Number(i.price) < lowPrice){
      lowId = i.id
      lowPrice = i.price
    }
  }
  return lowId
}

function getLowPrice(list: any) {
  let low = Number(list[0].price)
  let high = Number(list[0].price)
  for (let i of list) {
    if (Number(i.price) < low) {
      low = Number(i.price)
    }
    if (Number(i.price) > high) {
      high = Number(i.price)
    }
  }
  return low + '~' + high
}

function changeFishFlag(item){
  if(UserInfo.fishFlag[item.itemsId]){
    UserInfo.fishFlag[item.itemsId] = false
    ElMessage.success('添加成功！')
  }else{
    UserInfo.fishFlag[item.itemsId] = true
    ElMessage.success('移除成功！')
  }
  localStorage.setItem("fishFlag",JSON.stringify(UserInfo.fishFlag));
}

function addRefushAction(item){
  let lowId = item.lowId
  let flag = true
  for(let index in UserInfo.refushList){
    if(UserInfo.refushList[index] == lowId){
      flag = false
      UserInfo.refushList.splice(index,1)
    }
  }
  if(flag){
    UserInfo.refushList.push(lowId)
  }
}

function getMyPublish() {
  $.ajax({
    type: "GET",
    url: `${settingMap.me.url}/mall-magic-c/internet/c2c/items/pageQueryMyPublish?pageSize=999&pageNo=1&filterType=1`,
    timeout: 20000,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Credentials": "true",
    },
    xhrFields: {
      withCredentials: haveCookie.value //True :允许跨域携带cookie信息 
    },
    success: function (res) {
      if (res.code == 0) {
        UserInfo.myPublishList = res.data.list.map((item: any) => {
          let itemsId = item.detailDtoList.map((itema: any) => {
            return itema.skuId
          })
          item.itemsId = itemsId.sort().join(',')
          return {
            name: item.c2cItemsName,
            icon: item.detailDtoList[0].img,
            itemsId: itemsId,
            price: item.showPrice,
            id: item.c2cItemsId
          }
        })
        analysisAction()
      }
    },
    error: function (res) {
      console.log(res)
    }
  });
}

function getRefushlist(){
  $.ajax({
    type: "GET",
    url: 'http://111.229.88.32:3000/refushList/getRefushList',
    timeout: 20000,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Credentials": "true",
    },
    success: function (res) {
      UserInfo.refushList = res.map((item)=>{
        return item.itemId
      })
    },
    error: function (res) {
      console.log(res)
    }
  });
}

function setRefushList(){
  let list = UserInfo.refushList.map((item)=>{
    return {'itemId' : item}
  })
  $.ajax({
    type: "POST",
    url: 'http://111.229.88.32:3000/refushList/refreshList',
    timeout: 20000,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Credentials": "true",
    },
    data: JSON.stringify(list),
    success: function (res) {
      ElMessage.success('保存成功！')
    },
    error: function (res) {
      ElMessage.error('error')
    }
  }); 
}

function clearRefushList(){
  UserInfo.refushList = []
}

function switchType(){
  UserInfo.sellShow = !UserInfo.sellShow
}

function analysisBox(){
  let map = {}
  let typeNum = 0
  for(let i of UserInfo.boxItemList){
    if(map[i.skuId]){
      map[i.skuId].list.push(i)
    }else{
      let flag = false
      for(let sellItem of UserInfo.lastArrary){
        if(sellItem.itemsId.indexOf(i.skuId) != -1){
          flag = true
        }
      }
      map[i.skuId] = {
        'itemsId':i.skuId,
        'img':i.itemsImage,
        'name':i.itemsName,
        'list':[i],
        'isInsell':flag
      }
      typeNum ++ 
    }
  }

  UserInfo.msg = `仓库里有一共有${UserInfo.boxItemList.length}个商品，合计${typeNum}种`

  let list = []
  for(let i in map){
    list.push(map[i])
  }
  UserInfo.boxItemFinList = list

}

function getGoodsInBOX1(){
  $.ajax({
    type: "GET",
    url: `${settingMap.me.url}/mall-magic-c/internet/c2c/items/pageFetchBlindBoxItems?pageSize=150&pageNo=1&filterType=1`,
    timeout: 20000,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Credentials": "true",
    },
    xhrFields: {
      withCredentials: haveCookie.value //True :允许跨域携带cookie信息 
    },
    success: function (res) {
      if (res.code == 0) {
        UserInfo.boxItemList = UserInfo.boxItemList.concat(res.data.boxItemsDtos) 
        analysisBox()
      }
    },
    error: function (res) {
      console.log(res)
    }
  });
}

function getGoodsInBOX2(pageNumber){
  $.ajax({
    type: "GET",
    url: `${settingMap.me.url}/mall-magic-c/internet/c2c/items/pageFetchBlindBoxItems?pageSize=150&pageNo=${pageNumber}&filterType=2`,
    timeout: 20000,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Credentials": "true",
    },
    xhrFields: {
      withCredentials: haveCookie.value //True :允许跨域携带cookie信息 
    },
    success: function (res) {
      if (res.code == 0) {
        UserInfo.boxItemList = UserInfo.boxItemList.concat(res.data.boxItemsDtos) 
        if(UserInfo.boxItemList.length < res.data.total){
          getGoodsInBOX2(pageNumber + 1)
        }else{
          console.log(UserInfo.boxItemList.length)
          getGoodsInBOX1()
        }
      }
    },
    error: function (res) {
      console.log(res)
    }
  });
}

function checkCookie(objname: string) {     //获取指定名称的cookie的值
  var arrstr = document.cookie.split("; ");
  for (var i = 0; i < arrstr.length; i++) {
    var temp = arrstr[i].split("=");
    if (temp[0] == objname) return true;
  }
  return false
}
</script>
<style lang="scss"  scoped>
.containerShop {
  .filter-header {
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

    .header-item {
      width: 33%;
      display: flex;
      align-items: center;

      .left-name {
        font-size: 16px;
      }

      .value {
        font-size: 24px;
        font-weight: 600;
      }
    }
  }

  .shop-box {
    background-color: white;
    height: calc(100% - 120px);
    overflow-y: scroll;
    padding: 24px;

    .setting-item {
      padding: 24px;
      margin-bottom: 12px;
      border-radius: 12px;
      border: 2px solid rgb(235, 235, 235);

      .title {
        font-size: 18px;
        font-weight: 600;
      }
    }
  }
}

.setting-filter {
  display: flex;
  align-items: center;
  padding-left: 24px;
  margin-top: 24px;
}

.goods-box {
  padding: 24px;
  display: flex;
  flex-wrap: wrap;
  background-color: white;
  height: calc(100% - 120px);
  overflow-y: scroll;
}
.goods-item-instar {
  width: calc(20% - 12px);
  border: 4px solid #fb7299;
  padding: 24px 0;
  margin-right: 12px;
  border-radius: 24px;
  margin-bottom: 24px;
  position: relative;
  flex: 0 0 auto;
  align-self: baseline;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  .icon-setting {
    position: absolute;
    top: 16px;
    right: 16px;
    font-size: 16px;
    cursor: pointer;
  }
  .icon-editrefush{
    position: absolute;
    bottom: 16px;
    right: 16px;
    font-size: 16px;
    cursor: pointer;
  }
  .icon-addrefush{
    position: absolute;
    top: 16px;
    left: 16px;
    font-size: 16px;
    cursor: pointer;
  }
  .icon-fishFlag{
    position: absolute;
    bottom: 16px;
    left: 16px;
    font-size: 16px;
    cursor: pointer;
    img{
      width: 16px;
      height: 16px;
    }
  }
}
.goods-item-green{
  width: calc(20% - 12px);
  border: 4px solid #94ec79;
  padding: 24px 0;
  margin-right: 12px;
  border-radius: 24px;
  margin-bottom: 24px;
  position: relative;
  flex: 0 0 auto;
  align-self: baseline;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  .icon-addrefush{
    position: absolute;
    top: 16px;
    left: 16px;
    font-size: 16px;
    cursor: pointer;
  }
}

.goods-item {
  width: calc(20% - 12px);
  border: 4px solid rgb(235, 235, 235);
  padding: 24px 0;
  margin-right: 12px;
  border-radius: 24px;
  margin-bottom: 24px;
  position: relative;
  flex: 0 0 auto;
  align-self: baseline;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  .icon-setting {
    position: absolute;
    top: 16px;
    right: 16px;
    font-size: 16px;
    cursor: pointer;
  }
  .icon-editrefush{
    position: absolute;
    bottom: 16px;
    right: 16px;
    font-size: 16px;
    cursor: pointer;
  }
  .icon-fishFlag{
    position: absolute;
    bottom: 16px;
    left: 16px;
    font-size: 16px;
    cursor: pointer;
    img{
      width: 16px;
      height: 16px;
    }
  }
  .icon-addrefush{
    position: absolute;
    top: 16px;
    left: 16px;
    font-size: 16px;
    cursor: pointer;
  }
}

.goods-item-img {
  width: 80%;
  height: auto;
  cursor: pointer;
}

.click-span {
  cursor: pointer;
  color: #409eff;
  margin-right: 6px;
}

.me-box-nocookie {
  background-color: white;
  height: calc(100% - 120px);
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 24px;

  .tip-img {
    width: 50%;
    height: auto;
    margin-bottom: 30px;
  }

  .tip-box {
    font-size: 24px;
    font-weight: 600;
  }
}
.dialog-con{
  width: 100%;
  text-align: center;
  .dialog-name{
    font-size: 18px;
    margin-bottom: 12px;
  }
}
.filter-name{
  font-size: 20px;
  color: white;
}
</style>