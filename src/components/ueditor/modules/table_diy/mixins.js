
export default {
    methods: {
        /**
         * 处理自增表格添加行点击事件
         * @param  {Object}  config [配置项]
         * @param  {Array}   data   [自增表格数据 格式为数组对象]
         * @param  {Number}  index  [当前所在位置]
         */
        tableDiyAddRow(config, data, index) {
            // 处理索引
            index = index !== undefined ? index : data.length;
            // 插入的数据模型
            let obj = {};
            // 如果为高级自增 处理多选框出现的问题
            if(config.type === 'table_diy_plus') {
                M.each(config.subConfigs, item => {
                    if(item.type === 'checkbox') {
                        obj[item.code] = [];
                    }
                })
            }
            // 插入一行新的
            data.splice(index + 1, 0, obj);
            // console.log(JSON.parse(JSON.stringify(config)))
            // console.log(data)
        },
        /**
         * 处理自增表格删除行点击事件
         * @param  {Object}  config [配置项]
         * @param  {Array}   data   [自增表格数据 格式为数组对象]
         * @param  {Number}  index  [当前所在位置]
         */
        tableDiyRemoveRow(config, data, index) {
            // 插入一行新的
            // data.push({});
            // console.log(JSON.parse(JSON.stringify(config)))
            // console.log(data)
            // console.log(data)
            if(data.length > 1) {
                data.splice(index, 1);
            }
            else {
                this.$Message.error("已经是最后一行了！");
            }
        },
    }
}