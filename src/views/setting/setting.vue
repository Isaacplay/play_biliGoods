<template>
  <div class="containerSetting" style="height:100%">
    <div class="filter-header">
      <div class="filter-header-left">
      </div>
      <div class="filter-header-right">
        <el-button color="#626aef" plain @click="saveAction">保存</el-button>
      </div>
    </div>
    <div class="setting-box">
      <div class="setting-item">
        <div class="title">我的</div>
        <div class="setting-filter">
          <div>请求源地址：</div>
          <el-autocomplete v-model="settingMap.me.url" :fetch-suggestions="querySearch" clearable class="w480" />
        </div>
      </div>
      <div class="setting-item">
        <div class="title">COOKIE</div>
        <div class="setting-filter">
          <el-input v-model="cookie" type="textarea" :rows="10" clearable class="w960" />
        </div>
      </div>
      <div class="setting-item" v-if="DedeUserID == '2054000'">
        <div class="title">Script Config</div>
        <div class="setting-filter">
          <div>Offset：</div>
          <el-input v-model="commonConfig.offset" clearable class="w240" />
        </div>
        <div class="setting-filter">
          <div>Check Limit：</div>
          <el-input v-model="commonConfig.checkLimit" clearable class="w240" />
        </div>
        <div class="setting-filter">
          <div>Auto Pay：</div>
          <el-select v-model="commonConfig.autoPay" placeholder="Select" size="large" style="width: 240px">
            <el-option v-for="item in commonConfig.options" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <!-- <el-switch @change="autoPayChange" v-model="commonConfig.autoPay" /> -->
        </div>
        <div class="setting-filter">
          <div>浮动比例：</div>
          <el-input v-model="commonConfig.floatLimit" clearable class="w240">
            <template #append>%</template>
          </el-input>
        </div>
      </div>
      <div class="setting-item" v-if="commonConfig.autoPay == 'semiAutomatic'">
        <div class="flex-between">
          <div class="title">半自动</div>
          <el-button color="#626aef" plain @click="getPreData">获取</el-button>
        </div>
        <div>
          <div v-for="(item,index) in preList">
            <div class="flex-between">
              <div style="width: 80%;">{{ item.name }}</div>
              <div>
                <el-button color="#626aef" plain @click="confirmPreItem(item)">YES</el-button>
                <el-button color="#626aef" plain @click="deletePreItem(item)">NO</el-button>
              </div>
            </div>
            <el-progress :stroke-width="12" :percentage="item.percentage" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
const haveCookie = ref(false)
const setting = reactive({
  urlList: [
    { value: 'http://111.229.88.32:3000/biligoods/getBiligoodslist' },
    { value: 'http://localhost:7777/play_biligoods/api' },
    { value: 'https://mall.bilibili.com' },
    { value: 'http://shop.isaacplay.fun/play_biligoods/api' },
    { value: 'http://47.100.78.114' }
  ],
})
let settingMap = reactive({
  biligoods: {
    url: '',
  },
  me: {
    url: '',
  }
})

let commonConfig = reactive({
  offset: '',
  checkLimit: '',
  autoPay: "handMovement",
  options:[
    {value:'fullyAutomatic',label:'全自动'},
    {value:'semiAutomatic',label:'半自动'},
    {value:'handMovement',label:'手动'},
  ],
  floatLimit: 0
})

let cookie = ref('')
let DedeUserID = ref('')

onMounted(() => {
  cookie.value = document.cookie
  haveCookie.value = checkCookie('buvid4'); //检测是否存在cookie
  if (localStorage.getItem("settingMap")) {
    let map = JSON.parse(localStorage.getItem("settingMap") || "{}");   //获取设置
    settingMap.biligoods = map.biligoods
    settingMap.me = map.me
  }
  if (haveCookie.value) {
    DedeUserID.value = getCookie('DedeUserID')
    if (DedeUserID.value == '2054000') {
      getCommonConfig()
    }
  }
  getPreData()
})

// 半自动处理
let preList = ref([])
function getPreData(){
  $.ajax({
    type: "GET",
    url: `http://47.116.2.139:3000/lockItemPre/getlockItem?size=5`,
    timeout: 20000,
    success: function (res) {
      let nowTime = +new Date()
      let array = []
      for(let i of res){
        let second = (nowTime -i.time)/1000
        if(second < 30){
          array.push(i)
        }
        i.percentage = Math.floor(second * 100/30)
      }
      preList.value = array
    },
    error: function (res) {
      console.log(res)
    }
  });
}
function confirmPreItem(item : any){
  let list = item
  $.ajax({
    type: "POST",
    url: `http://47.116.2.139:3000/lockItemPre/confirmlockItem`,
    timeout: 20000,
    data: list,
    success: function (res) { getPreData() },
    error: function (res) {
      console.log(res)
    }
  });
}
function deletePreItem(item : any){
  $.ajax({
    type: "DELETE",
    url: `http://47.116.2.139:3000/lockItemPre/deleteLockItem?id=${item._id}`,
    timeout: 20000,
    success: function (res) { getPreData() },
    error: function (res) {
      console.log(res)
    }
  });
}

function getCommonConfig() {
  $.ajax({
    type: "GET",
    url: `http://111.229.88.32:3000/commonConfig/getCommonConfig?id=offset,checkLimit,autoPay,floatLimit`,
    timeout: 20000,
    success: function (res) {
      for (let i of res) {
        commonConfig[i._id] = i.value
      }
    },
    error: function (res) {
      console.log(res)
    }
  });
}

function saveCommonConfig(id: String, value: any) {
  let list = {
    "id": id,
    "value": value
  }
  $.ajax({
    type: "POST",
    url: `http://111.229.88.32:3000/commonConfig/changeCommonConfig`,
    timeout: 20000,
    data: list,
    success: function (res) { },
    error: function (res) {
      console.log(res)
    }
  });
}

const querySearch = (queryString: string, cb: any) => {
  const results = queryString ? setting.urlList.filter(createFilter(queryString)) : setting.urlList
  cb(results)
}

const createFilter = (queryString: string) => {
  return (url: RestaurantItem) => {
    return (
      url.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}
interface RestaurantItem {
  value: string
}

function saveAction() {
  localStorage.setItem("settingMap", JSON.stringify(settingMap));
  UpdateCookies(cookie.value)
  if (haveCookie.value && DedeUserID.value == '2054000') {
    saveCommonConfig('offset', commonConfig.offset)
    saveCommonConfig('checkLimit', commonConfig.checkLimit)
    saveCommonConfig('autoPay', commonConfig.autoPay)
    saveCommonConfig('floatLimit', commonConfig.floatLimit)
  }
  ElMessage.success('保存成功！')
}
function UpdateCookies(cookies: string) {
  let datas = cookies.split(";");
  let now = new Date();
  now.setMonth(now.getMonth() + 1);
  for (let i = 0; i < datas.length; i++) {
    document.cookie = datas[i] + ";expires=" + now.toUTCString() + ";";
  }
  console.log('set cookie success')
}

function checkCookie(objname: string) {     //获取指定名称的cookie的值
  var arrstr = document.cookie.split("; ");
  for (var i = 0; i < arrstr.length; i++) {
    var temp = arrstr[i].split("=");
    if (temp[0] == objname) return true;
  }
  return false
}

function getCookie(objname: string) {     //获取指定名称的cookie的值
  var arrstr = document.cookie.split("; ");
  for (var i = 0; i < arrstr.length; i++) {
    var temp = arrstr[i].split("=");
    if (temp[0] == objname) return temp[1];
  }
  return ''
}
</script>

<style lang="scss" scoped>
.containerSetting {
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

  .setting-box {
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
</style>