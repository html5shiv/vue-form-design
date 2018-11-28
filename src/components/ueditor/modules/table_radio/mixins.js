export default {
    // 过滤器
    filters: {
        tableRadioFilter(value, iptValue) {
            // 返回结果
            let ret = "";
            // 如果等于当前输入框值 返回一个圆点
            if(value == iptValue) ret = "✔";
            // console.log(value == iptValue)
            // console.log(iptValue)
            return ret;
        }
    }
}