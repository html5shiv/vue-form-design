
export default {
    // 过滤器
    filters: {
        cascaderFilter(value, formObj, config = {}) {
            // 获取所有值
            let ret = M.map(value, item => {
                return item;
            });
            // console.log(JSON.parse(JSON.stringify(config)))
            return ret.join("-");
        }
    },
}