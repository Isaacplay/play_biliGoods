import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import inject from '@rollup/plugin-inject';  // 必须重要！效果和webpack.ProvidePlugin中相同

// https://vitejs.dev/config/
export default defineConfig({
  base:'./',
  plugins: [
    vue(), 
    vueJsx(),
    inject({ 
      $: "jquery",  // 这里会自动载入 node_modules 中的 jquery   jquery全局变量
      jQuery: "jquery",
      "windows.jQuery": "jquery"
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        javascriptEnabled: true,
        additionalData: '@import "./src/styles/variable.scss";'
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server:{
    host: '0.0.0.0',//自定义主机名
		port: 7777,//自定义端口
    proxy: {
        '/api/trans/vip/translate': { // 匹配请求路径，localhost:3000/snow
            target: 'https://fanyi-api.baidu.com/api/trans/vip/translate', // 代理的目标地址
            changeOrigin: true, // 开发模式，默认的origin是真实的 origin:localhost:3000 代理服务会把origin修改为目标地址
            // secure: true, // 是否https接口
            // ws: true, // 是否代理websockets
            // rewrite target目标地址 + '/abc'，如果接口是这样的，那么不用重写
            // rewrite: (path) => path.replace(/^\/snow/, '') // 路径重写，本项目不需要重写
        },
        '/v1/guest/save': { // 匹配请求路径，localhost:3000/snow
            target: 'http://xwthome.top:8989/', // 代理的目标地址
            changeOrigin: true, // 开发模式，默认的origin是真实的 origin:localhost:3000 代理服务会把origin修改为目标地址
        },
        '/biligoods/getBiligoodsById': { // 匹配请求路径，localhost:3000/snow
            target: 'http://111.229.88.32:3000/', // 代理的目标地址
            changeOrigin: true, // 开发模式，默认的origin是真实的 origin:localhost:3000 代理服务会把origin修改为目标地址
        },
        // '/mall-magic-c/internet/c2c/v2/list':{
        //   target: 'https://mall.bilibili.com/', // 代理的目标地址
        //     changeOrigin: true, // 开发模式，默认的origin是真实的 origin:localhost:3000 代理服务会把origin修改为目标地址
        // }
    }
  }
})
