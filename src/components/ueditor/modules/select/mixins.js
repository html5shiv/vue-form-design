export default {
    // 过滤器
    filters: {
        selectFilter(value, formObj, config = {}) {
            // 返回结果
            let ret = "",
                // 获得所有选项
                options = config.options || [];
            // 遍历所有选项
            M.each(options, item => {
                let itemCode = item.code;
                if(value === itemCode) ret = item.name || "";
            });
            // console.log(value)
            // console.log(JSON.parse(JSON.stringify(config)))
            return ret;
        }
    }
}