export default {
    // 过滤器
    filters: {
        tableCheckboxFilter(values, iptValue) {
            // 返回结果
            let ret = "";
            // 如果等于当前输入框值 返回一个圆点
            if(M.includes(values, iptValue + '')) ret = "✔";
            // console.log(values)
            // console.log(iptValue)
            return ret;
        }
    }
}