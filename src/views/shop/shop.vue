<template>
  <div class="containerShop" style="height:100%">
    <div class="filter-header">
      <div class="filter-header-left">
      </div>
      <div class="filter-header-right">
      </div>
    </div>
    <div v-if="haveCookie" class="goods-box">
      <div class="goods-item" v-for="(item, index) in UserInfo.lastArrary" :key="index">
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
        <div @click="setTimeAction(item)" class="icon-setting"><el-icon>
            <Setting />
          </el-icon></div>
      </div>
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
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
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
    name:string
  },
  shopTime: {}
}

const UserInfo: UserInfo = reactive({
  myPublishList: [],     //在卖的
  lastArrary: [],
  cateGoryItem: {},
  shopTime:{},
})

onMounted(() => {
  haveCookie.value = checkCookie('buvid4'); //检测是否存在cookie
  if (localStorage.getItem("settingMap")) {
    let map = JSON.parse(localStorage.getItem("settingMap") || "{}");   //获取设置
    settingMap.me = map.me
  }
  let shopTime = JSON.parse(localStorage.getItem("shopTime") || "{}");   //获取设置
  UserInfo.shopTime = shopTime
  if (haveCookie.value) {
    getMyPublish()
  }
})

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
      price: getLowPrice(map[t])
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
</style>