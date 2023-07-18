import * as VueRouter from 'vue-router';
const questionnaire = () => import('@/views/questionnaire.vue')

const Home = {path:'/',name:'home',meta:{title:'biligoods'},component:() => import('@/views/biligoods/index.vue')}
// const biligoods = {path:'/biligoods',name:'biligoods',meta:{title:'biligoods'},component:() => import('@/views/biligoods/index.vue')}



const routes = [ Home]

export const router = VueRouter.createRouter({
  // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
  history: VueRouter.createWebHashHistory(),
  routes, // `routes: routes` 的缩写
})
