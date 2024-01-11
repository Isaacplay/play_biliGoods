<template>
  <div style="height: 100%;">
    <div class="filter-header">
      <div class="filter-header-top">
        <div class="filter-header-left">
          <div class="filter-item">
            <div class="filter-name">名称:</div>
            <el-input class="w240" v-model="nodeSearch.name" />
          </div>
        </div>
        <div class="filter-header-right">
          <el-input-number v-model="step" :step="10" :min="10" :max="maxStep" controls-position="right" step-strictly />
          <el-button color="#626aef" @click="search">查询</el-button>
          <el-button color="#626aef" plain @click="reset">重置</el-button>
        </div>
      </div>
      <div v-show="searchAbout.inSearch" class="search-more">
        <div class="search-front">这是第{{ nodeSearch.page }}页</div>
        <el-button style="margin-right: 24px;" color="#626aef" @click="addSearch">下一页</el-button>
      </div>
    </div>
    <div class="goods-box">
      <div
        :class="searchAbout.keyMap[item.itemsId] ? 'goods-item-instar' : 'goods-item'"
        v-for="(item, index) in searchAbout.lastArrary" :key="index">
        <div>
          <template v-if="haveCookie">
            <div v-if="searchAbout.keyMap[item.itemsId]" @click="editCheck(item)">监控阈值：{{ searchAbout.keyMap[item.itemsId] }}</div>
            <div class='click-span' v-else @click="addToStar(item)">无监控阈值,是否添加？</div>
          </template>
          <img class="goods-item-img" style="cursor:pointer ;" @click="openAnalysis(item.itemsId)" :src=item.img alt="">
          <div>{{ item.name }}</div>
          <div v-if="item.list.length > 0">
            <el-collapse>
              <el-collapse-item :title="item.price" name="1">
                <div v-for="(item2) in item.list" :key="item2.id">
                  <span class="click-span" @click="openUrl(item2.id)">{{ item2.price }} </span>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </div>
    </div>
    <el-dialog v-model="dialogFormVisible" title="CheckList">
      <el-form :model="form">
        <el-form-item label="Id" :label-width="formLabelWidth">
          <el-input v-model="form.id" autocomplete="off" />
        </el-form-item>
        <el-form-item label="Name" :label-width="formLabelWidth">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="Price" :label-width="formLabelWidth">
          <el-input v-model="form.price" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div>
        <vue-jsoneditor
            height="180"
            mode="text"
            v-model:json="from_json" 
          />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">Cancel</el-button>
          <el-button type="primary" @click="insertCheckList">
            Confirm
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted,computed} from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import VueJsoneditor from 'vue3-ts-jsoneditor'
//常量
const step = ref(2000)
const addStep = ref(2000)
const maxStep = ref(50)
const isAdd = ref(false)
const dialogFormVisible = ref(false)
const haveCookie = ref(false)
const formLabelWidth = '140px'
const form = reactive({
  name: '',
  price: '',
  id: '',
})

const from_json = computed<object>(() => {
  let map = {}
  map[form.id] = {
    'name':form.name,
    'price':Number(form.price)
  }
  return map
})

onMounted(() => {
  haveCookie.value = checkCookie('buvid4'); //检测是否存在cookie
  if(haveCookie.value){
    getCheckList()
    step.value = 6000
    maxStep.value = 99999
  }else{
    step.value = 20
    maxStep.value = 50
  }
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
      searchAbout.keyMap = map
    },
    error: function (res) {
      console.log(res)
    }
  });
}
function addToStar(item) {
  form.name = item.name
  form.id = item.itemsId
  form.price = item.price.split('~')[0]
  isAdd.value = true
  dialogFormVisible.value = true
}
function insertCheckList() {
  let data = {
    "name": form.name,
    "price": Number(form.price),
    "id": form.id
  }
  let url = isAdd.value ? `http://111.229.88.32:3000/checkList/insertCheckList`:`http://111.229.88.32:3000/checkList/changePrice`
  $.ajax({
    type: "POST",
    url: url,
    timeout: 20000,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Credentials": "true",
    },
    data: JSON.stringify(data),
    success: function (res) {
      ElMessage.success('success')
      dialogFormVisible.value = false
      getCheckList()
    },
    error: function (res) {
      ElMessage.error('error')
      dialogFormVisible.value = false
    }
  }); 
}
function editCheck(item){
  form.name = item.name
  form.id = item.itemsId
  form.price = String(searchAbout.keyMap[item.itemsId])
  isAdd.value = false
  dialogFormVisible.value = true
}
function checkCookie(objname: string) {//获取指定名称的cookie的值
  var arrstr = document.cookie.split("; ");
  for (var i = 0; i < arrstr.length; i++) {
    var temp = arrstr[i].split("=");
    if (temp[0] == objname) return true;
  }
  return false
}
function addSearch() {
  searchAbout.goodsList = []
  nodeSearch.page++
  biliNodeSearch()
}
interface searchAbout {
  goodsList: any[];
  lastArrary: {
    name: any;
    list: any;
    itemsId: string,
    id: any;
    img: any;
    price: string;
  }[];
  inSearch: boolean;
  drawer: boolean;
  isBan: boolean;
  starList: any[];
  keyMap: { [key: string]: number };
  lowestMap: { [key: string]: any };
  showAnalysis: boolean;
}
const searchAbout: searchAbout = reactive({
  goodsList: [],
  lastArrary: [],
  inSearch: false,
  drawer: false,
  starList: [],
  keyMap: {},
  lowestMap: {},
  showAnalysis: false,
  isBan: false
})
function openAnalysis(itemId: String) {
  window.open(`${window.location.origin}/#/?id=${itemId}`)
}
function openUrl(itemId: String) {
  window.open(`https://mall.bilibili.com/neul-next/index.html?page=magic-market_detail&noTitleBar=1&itemsId=${itemId}&from=market_index`)
}
function search() {
  searchAbout.lastArrary = []
  searchAbout.inSearch = true
  nodeSearch.size = step.value
  nodeSearch.page = 1
  searchAbout.goodsList = []
  biliNodeSearch()
}
function analysisAction() {
  let arrary = searchAbout.goodsList
  let map = {}
  for (let i of arrary) {
    if (map[i.itemsId.join(',')] && map[i.itemsId.join(',')].length > 0) {
      map[i.itemsId.join(',')].push(i)
    } else {
      map[i.itemsId.join(',')] = [i]
    }
  }
  let filterMap = {
    'star': [],
    'newLow': [],
    'nomal': []
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
    if (searchAbout.keyMap[t]) {
      filterMap.star.push(map2)
    } else {
      filterMap.nomal.push(map2)
    }
  }
  console.log(filterMap.star)
  lastArrary = filterMap.star.concat(filterMap.newLow, filterMap.nomal)
  searchAbout.lastArrary = lastArrary
  searchAbout.showAnalysis = true
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

interface nodeSearch {
  page: number;
  size: number;
  name: string;
}
const nodeSearch: nodeSearch = reactive({
  page: 1,
  size: 500,
  name: ''
})

function biliNodeSearch() {
  const loading = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  $.ajax({
    type: "GET",
    url: `http://111.229.88.32:3000/biligoods/getBiligoodslist?page=${nodeSearch.page}&size=${nodeSearch.size}&name=${nodeSearch.name}`,
    timeout: 20000,
    success: function (res) {
      loading.close()
      //精简内容 优化 数组
      res = res.map((item: any) => {
        let itemsId = item.categoryId.split(',')
        itemsId = itemsId.sort()
        return {
          name: item.name,
          icon: item.img,
          itemsId: itemsId,
          price: item.price,
          id: item._id
        }
      })
      // let arrary = searchAbout.goodsList
      // arrary = arrary.concat(res)
      // let obj = {};
      // arrary = arrary.reduce((cur, next) => {
      //   obj[next.id] ? "" : obj[next.id] = true && cur.push(next);
      //   return cur;
      // }, [])
      searchAbout.goodsList = res
      analysisAction()
    },
    error: function (res) {
      loading.close()
      console.log(res)
    }
  });
}
function clear() {
  searchAbout.goodsList = []
  searchAbout.inSearch = false
  searchAbout.lastArrary = []
}
function reset() {
  searchAbout.goodsList = []
  searchAbout.inSearch = false
  searchAbout.lastArrary = []
}

</script>
<style scoped>
.click-span {
  cursor: pointer;
  color: #409eff;
  margin-right: 12px;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.goods-item-instar {
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

.goods-item-break {
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

.goods-star-item {
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

.goods-item-img {
  width: 80%;
  height: auto;
}

.filter-header {
  position: sticky;
  height: 120px;
  top: 0;
  left: 0;
  width: 100%;
  background-color: none;
  z-index: 999;
}

.filter-header-top {
  display: flex;
  padding: 12px 24px;
  justify-content: space-between;
  align-items: center;
}

.filter-header-left {
  display: flex;
  flex-wrap: wrap;
}

.filter-name {
  font-size: 18px;
  margin-right: 24px;
}

.filter-item {
  display: flex;
  align-items: center;
  margin-right: 24px;
}

.m-2 {
  width: 180px;
}

.filter-header-right {
  align-items: center;
}

.filter-header-right>div {
  margin-right: 24px;
}

.search-more {
  display: flex;
  padding: 12px 24px;
  align-items: center;
}

.search-front {
  font-size: 24px;
  margin-right: 24px;
}</style>