<template>
  <div id="app">
    <vue-form-design @on-done="getFormContent"></vue-form-design> 
  </div>
</template>

<script>

export default {
  name: 'app',
  methods:{
      getFormContent(obj){
        console.log(obj)
      }
  }
}
</script>

<style lang="scss">
// 引入全局样式
@import 'common/scss/base-style';

/* 主容器 */

html,
body,
#app {
    width: 100%;
}

body {
    font-size: 14px;
    color: #333;
}


/* 后台主容器 */
html{
    &,
    body,
    #app {
        height: 100%;
        overflow: hidden;
    }
}

// 前台页面
html.home {
    &,
    body,
    #app {
        height: 100%;
    }
}
</style>
