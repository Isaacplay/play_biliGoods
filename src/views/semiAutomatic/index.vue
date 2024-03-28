<template>
  <div class="containerMonitor" style="height:100%">
    <div class="monitor-header">
      <el-select v-model="commonConfig.autoPay" placeholder="Select" size="large" style="width: 120px">
        <el-option v-for="item in commonConfig.options" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <div class="flex-between">
        <el-button type="primary" @click="saveAction" size="large">保存</el-button>
        <el-button @click="getPreData" size="large">刷新</el-button>
      </div>
    </div>
    <div>
      <div class="monitor-item" v-for="(item, index) in preList">
        <div class="flex-between">
          <div style="width: 60%;">
            <div>{{ item.cname }}</div>
            <div>价格是 : {{ item.price }}</div>
          </div>
          <div class="flex-between" style="width: 39%; text-align: center;">
            <el-button color="#626aef" plain @click="confirmPreItem(item)">YES</el-button>
            <el-button color="#626aef" plain @click="deletePreItem(item)">NO</el-button>
          </div>
        </div>
        <component :is="chartCom" :item="item"></component>
        <el-progress :stroke-width="12" :percentage="item.percentage" />
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import chartCom from './chartCom.vue'
const haveCookie = ref(false)


onMounted(() => {
  getCommonConfig()
  getPreData()
})

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

// 半自动处理
let preList = ref([])
function getPreData() {
  preList.value = []
  $.ajax({
    type: "GET",
    url: `http://47.116.2.139:3000/lockItemPre/getlockItem?size=5`,
    timeout: 20000,
    success: function (res) {
      let nowTime = +new Date()
      let array = []
      for (let i of res) {
        let second = (nowTime - i.time) / 1000
        if (second < 120) {
          array.push(i)
        }
        i.percentage = Math.floor(second * 100 / 120)
      }
      preList.value = array.map(item => {
        let list = item.name.split(',')
        item.cname = list[0]
        item.price = list[1].match(/现在价格是(\S*)/)[1];
        return item
      })
    },
    error: function (res) {
      console.log(res)
    }
  });
}
//=================================================================================================================================
let commonConfig = reactive({
  autoPay: "handMovement",
  options: [
    { value: 'fullyAutomatic', label: '全自动' },
    { value: 'semiAutomatic', label: '半自动' },
    { value: 'handMovement', label: '手动' },
  ],
})
function getCommonConfig() {
  $.ajax({
    type: "GET",
    url: `http://111.229.88.32:3000/commonConfig/getCommonConfig?id=autoPay`,
    timeout: 20000,
    success: function (res) {
      commonConfig.autoPay = res[0].value
    },
    error: function (res) {
      console.log(res)
    }
  });
}

function saveAction() {
  let list = {
    "id": 'autoPay',
    "value": commonConfig.autoPay
  }
  $.ajax({
    type: "POST",
    url: `http://111.229.88.32:3000/commonConfig/changeCommonConfig`,
    timeout: 20000,
    data: list,
    success: function (res) { ElMessage.success('保存成功！') },
    error: function (res) {
      console.log(res)
    }
  });
}

</script>

<style lang="scss" scoped>
.containerMonitor {
  padding: 24px;

  .monitor-header {
    padding-bottom: 24px;
    border-bottom: 2px solid rgb(235, 235, 235);
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px
  }

  .monitor-item{
    font-size: 14px;
    padding: 12px 6px;
    border-radius: 12px;
    border: 1px solid rgba(102, 204, 255,0.8);
    margin-bottom: 12px;
  }
}
</style>