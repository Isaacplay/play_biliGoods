import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import {router} from './router/index'
import './utils/css/base.css'
import $ from 'jquery'
import vue3TsJsoneditor from 'vue3-ts-jsoneditor';
import '@/styles/index.scss'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'


const app = createApp(App)

app.use(ElementPlus)
app.use(router)
app.use($)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

if(!localStorage.getItem("settingMap")){
  let settingMap = {
    biligoods:{
      url:'http://111.229.88.32:3000/biligoods/getBiligoodslist',
    },
    me:{
      url:'http://111.229.88.32:7777/play_biligoods/api',
    }
  }
  localStorage.setItem("settingMap",JSON.stringify(settingMap));
  console.log('初始化 配置')
}

app.use(vue3TsJsoneditor, {
  componentName: '/JsonEditor/', // Default: 'JsonEditor',
  options: {
    /**
     *
     * SET GLOBAL OPTIONS
     *
     * */
    readOnly:true,
  }
});

app.mount('#app')

