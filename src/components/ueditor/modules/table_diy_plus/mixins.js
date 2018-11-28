// 引入设计数据模型方法 用于给自增里的各种数据类型创建初始化模型
import { setFormAllType } from '../../basic.js';

export default {
    methods: {
        /**
         * 处理高级自增表格添加行点击事件
         * @param  {Object}  config   [元数据配置]
         * @param  {Object}  data     [元数据数据 格式为数组]
         * @param  {Number}  index    [当前所在位置]
         */
        tableDiyPlusAddRow(config, data, index) {
            // 是否存在父级自增表格
            let parentId = config.parentId,
                // 处理索引
                i = index !== undefined ? index : data.length - 1;

            // 默认新行数据
            let rowData = {};

            // 遍历他的所有子集 进行数据设置
            M.each(config.subConfigs, item => {
                // 调用公共方法 对数据模型进行初始化设置 这里不需要设置元数据 所以传入空数组
                setFormAllType(item, rowData, []);
            })
            // 放入新的行
            data.splice(i + 1, 0, rowData);

            // console.log(JSON.parse(JSON.stringify(config)))
            // console.log(JSON.parse(JSON.stringify(data)))
        },
        /**
         * 处理高级自增表格添加行点击事件
         * @param  {Object}  config   [元数据配置]
         * @param  {Object}  data     [元数据数据 格式为数组]
         * @param  {Number}  index    [当前所在位置]
         */
        tableDiyPlusRemoveRow(config, data, index) {
            // 如果不是只剩下一行 进行删除
            if(data.length > 1) {
                data.splice(index, 1);
            }
            else {
                this.$Message.error("已经是最后一行了！");
            }
        },
    }
}