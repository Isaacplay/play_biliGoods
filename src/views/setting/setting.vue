<template>
  <div class="containerSetting" style="height:100%" >
    <div class="filter-header">
      <div class="filter-header-left">
      </div>
      <div class="filter-header-right">
        <el-button color="#626aef"  plain @click="saveAction">保存</el-button>
      </div>
    </div>
    <div class="setting-box">
      <div class="setting-item">
        <div class="title">我的</div>
        <div class="setting-filter">
          <div>请求源地址：</div>
          <el-autocomplete
            v-model="settingMap.me.url"
            :fetch-suggestions="querySearch"
            clearable
            class="w480"
          />
        </div>
      </div>
      <div class="setting-item">
        <div class="title">COOKIE</div>
        <div class="setting-filter">
          <el-input
            v-model="cookie"
            type="textarea"
            :rows="10"
            clearable
            class="w960"
          />
        </div>
      </div>
      <div class="setting-item" v-if="DedeUserID == '2054000'">
        <div class="title">Script Config</div>
        <div class="setting-filter">
          <div>Offset：</div>
          <el-input v-model="commonConfig.offset" clearable class="w240"/>
        </div>
        <div class="setting-filter">
          <div>Check Limit：</div>
          <el-input v-model="commonConfig.checkLimit" clearable class="w240"/>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref,reactive ,onMounted} from 'vue'
import { ElMessage  } from 'element-plus'
const haveCookie = ref(false)
const setting = reactive({
  urlList:[
    {value:'http://111.229.88.32:3000/biligoods/getBiligoodslist'},
    {value:'http://localhost:7777/play_biligoods/api'},
    {value:'https://mall.bilibili.com'},
    {value:'http://shop.isaacplay.fun/play_biligoods/api'},
    {value:'http://47.100.78.114'}
  ],
})
let settingMap = reactive({
  biligoods:{
    url:'',
  },
  me:{
    url:'',
  }
})

let commonConfig = reactive({
  offset:'',
  checkLimit:''
})

let cookie = ref('')
let DedeUserID = ref('')

onMounted(() => {
  cookie.value = document.cookie
  haveCookie.value = checkCookie('buvid4'); //检测是否存在cookie
  if(localStorage.getItem("settingMap")){
    let map  = JSON.parse(localStorage.getItem("settingMap") || "{}") ;   //获取设置
    settingMap.biligoods = map.biligoods
    settingMap.me = map.me
  }
  if(haveCookie.value){
    DedeUserID.value = getCookie('DedeUserID')  
    if(DedeUserID.value == '2054000'){
      getCommonConfig()
    }
  }
})

function getCommonConfig(){
  $.ajax({
    type: "GET",
    url: `http://111.229.88.32:3000/commonConfig/getCommonConfig?id=offset,checkLimit`,
    timeout: 20000,
    success: function (res) {
      for(let i of res){
        commonConfig[i._id] = i.value
      }
    },
    error: function (res) {
      console.log(res)
    }
  });
}

function saveCommonConfig(id : String,value : String){
  let list = {
    "id": id,
    "value": value
  }
  $.ajax({
    type: "POST",
    url: `http://111.229.88.32:3000/commonConfig/changeCommonConfig`,
    timeout: 20000,
    data: list,
    success: function (res) {},
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

function saveAction(){
  localStorage.setItem("settingMap",JSON.stringify(settingMap));
  UpdateCookies(cookie.value)
  if(haveCookie.value && DedeUserID.value == '2054000'){
    saveCommonConfig('offset',commonConfig.offset)
    saveCommonConfig('checkLimit',commonConfig.checkLimit)
  }
  ElMessage.success('保存成功！')
}
function UpdateCookies(cookies : string){
  let datas = cookies.split(";");
  let now = new Date();
  now.setMonth( now.getMonth() + 1 );
  for(let i = 0;i < datas.length;i++){
    document.cookie = datas[i] + ";expires=" + now.toUTCString() + ";";
  }
  console.log('set cookie success')
}

function checkCookie(objname : string){     //获取指定名称的cookie的值
  var arrstr = document.cookie.split("; ");
  for(var i = 0;i < arrstr.length;i ++){
    var temp = arrstr[i].split("=");
    if(temp[0] == objname) return true;
  }
  return false
}

function getCookie(objname : string){     //获取指定名称的cookie的值
  var arrstr = document.cookie.split("; ");
  for(var i = 0;i < arrstr.length;i ++){
    var temp = arrstr[i].split("=");
    if(temp[0] == objname) return temp[1];
  }
  return ''
}
</script>
<style lang="scss"  scoped>
.containerSetting{
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
  .setting-box{
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


</style>