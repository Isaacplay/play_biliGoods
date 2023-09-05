import * as VueRouter from 'vue-router';


const Home = {path:'/',name:'home',meta:{title:'home'},component:() => import('@/views/home.vue')}
const script = {path:'/script',name:'script',meta:{title:'script'},component:() => import('@/views/script/script.vue')}


const routes = [ Home ,script]

export const router = VueRouter.createRouter({
  // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
  history: VueRouter.createWebHashHistory(),
  routes, // `routes: routes` 的缩写
})
