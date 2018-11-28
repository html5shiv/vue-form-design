export default {
    /*单行文本*/
    text(code, value, config, formObj, fromVerify) {
        // 返回结果
        let ret = {
                status: true,
                msg: "通过校验"
            },
            // 获取校验配置
            verify = config.verify || {},
            // 错误提示文字
            errorMsg = verify.errorMsg,
            // 验证规则
            rules = verify.rules,
            // 是否需要验证
            isVerify = verify.required || verify.isRules;

        // 如果不需要验证
        if(!isVerify) return ret;

        // 是否为必填项
        if(verify.required && M.isNull(value)) {
            ret.status = false;
            ret.msg = errorMsg || "该项不能为空！";
            return ret;
        }

        // 是否添加验证规则
        if(verify.isRules) {
            // 如果为手机号
            if(verify.rules == 'phone' && !M.isPhoneNumber(value)) {
                ret.status = false;
                ret.msg = errorMsg || "请输入正确的手机号！";
            }
            // 如果为身份证
            else if(verify.rules == 'idNumber' && !M.isIdCard(value).state) {
                ret.status = false;
                ret.msg = errorMsg || "请输入正确的身份证号码！";
            }
            // 如果为邮箱
            else if(verify.rules == 'email' && !M.isEmail(value)) {
                ret.status = false;
                ret.msg = errorMsg || "请输入正确的邮箱！";
            }
        }
        // console.log(code)
        // console.log(value)
        // console.log(JSON.parse(JSON.stringify(formObj)))
        // console.log(JSON.parse(JSON.stringify(config)))
        // console.log(JSON.parse(JSON.stringify(fromVerify)))
        return ret;
    }
}