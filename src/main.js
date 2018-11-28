import "babel-polyfill";
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import App from "./App";
// iView UI框架
import iView from "iview";
// 城市选择
import iviewArea from "iview-area";
// iView 样式与主题
import "common/less/iview-theme.less";
// 引入jQuery
import "static/jquery/jquery.min.js";
// Mcake工具集
import "@/frame/Mcake/Mcake.js";
// collapse 展开折叠
import CollapseTransition from "element-ui/lib/transitions/collapse-transition";
// 引入全局组件
//自定义报表设计器
import vueFormDesign from "./lib/index.js";
Vue.use(vueFormDesign);
// 注册组件
Vue.use(iView);
Vue.use(iviewArea);
Vue.config.productionTip = false;
// 注册element-ui 组件
Vue.component(CollapseTransition.name, CollapseTransition);
// 暴露Vue对象
window.Vue = Vue;
// 注册全局组件
// 创建应用
new Vue({
  el: "#app",
  template: "<App/>",
  components: {
    App
  }
});
