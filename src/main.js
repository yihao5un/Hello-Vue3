import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
// import ElementPlus from 'element-plus'
// import 'element-plus/dist/index.css'
import router from './router'
// less
import './assets/less/index.less'
// 图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// vuex store
import store from './store/index.js';
// Mock Data
import './api/mock.js'
// api
import api from './api/api';

const app = createApp(App)
// 完整引用 (打包的文件可能会大一些)
// app.use(ElementPlus)
// 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
// 链式写法
app.config.globalProperties.$api = api // 全局挂载API
store.commit("addMenu", router) // 动态路由添加
app.use(router).use(store)
app.mount('#app')


