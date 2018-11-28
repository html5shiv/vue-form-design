import vueFormDesign from './vue-form-design.vue'

const formdesign ={
    install(Vue,options){
        Vue.component(vueFormDesign.name,vueFormDesign)//设置组件name属性
    }
}

if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(formdesign);
}
export default formdesign