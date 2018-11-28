export default {
    // 过滤器
    filters: {
        checkboxFilter(values, formObj, config = {}) {
            // 返回结果
            let ret = [],
                // 获得所有选项
                labels = config.labels || [],
                // 元数据ID
                id = config.code,
                // 查询地图
                labelsMap = M.indexBy(labels, 'code');
            // 遍历所有选项
            M.each(values, code => {
                let val = (labelsMap[code] || {}).name;
                // 如果选项存在
                if(val) {
                    // 其他输入框
                    let other = formObj[id + "$" + code+ '$other'];
                    // 如果其他输入框存在
                    if(other !== undefined) val = val + "-" + other;
                    // 放入值
                    ret.push(val);
                }
            });
            // console.log(values)
            // console.log(formObj)
            // console.log(JSON.parse(JSON.stringify(config)))
            return ret.join("，");
        }
    }
}