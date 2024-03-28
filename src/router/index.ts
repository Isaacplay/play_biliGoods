import * as VueRouter from 'vue-router';


const Home = {path:'/',name:'home',meta:{title:'home'},component:() => import('@/views/home.vue')}
const mobileShop = {path:'/mobileShop',name:'mobileShop',meta:{title:'mobileShop'},component:() => import('@/views/mobileShop/mobileShop.vue')}
const semiAutomatic = {path:'/semiAutomatic',name:'semiAutomatic',meta:{title:'semiAutomatic'},component:() => import('@/views/semiAutomatic/index.vue')}

const routes = [ Home ,mobileShop,semiAutomatic]

export const router = VueRouter.createRouter({
  // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
  history: VueRouter.createWebHashHistory(),
  routes, // `routes: routes` 的缩写
})
