export default {
    // 过滤器
    filters: {
        radioFilter(value, formObj, config = {}) {
            // 返回结果
            let ret = "",
                // 获得所有选项
                labels = config.labels || [],
                // 元数据ID
                id = config.code;
            // 遍历所有选项
            M.each(labels, item => {
                let itemCode = item.code;
                // 如果找到了选项
                if(value === itemCode && item.name) {
                    ret = item.name;
                    // 其他输入框
                    let other = formObj[id + "$" + itemCode+ '$other'];
                    // 如果其他输入框存在
                    if(other !== undefined) ret = ret + "-" + other;
                }
            });
            // 打印参数
            // console.log(value)
            // console.log(JSON.parse(JSON.stringify(formObj)))
            // console.log(JSON.parse(JSON.stringify(config)))
            return ret;
        }
    }
}