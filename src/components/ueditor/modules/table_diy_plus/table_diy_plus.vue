<style lang="scss" scoped>
// 引入表单配置页公共样式
@import '../../scss/data-config-style';


</style>
<template>
    <div>
        <!-- 组件基础公共 -->
        <dchPanel title="高级自增表格" >
            <div class="form-item">
                <div class="form-item-tit">
                    名称
                </div>
                <div class="form-item-cont">
                    <Input v-model="dataConfig.name" placeholder="请输入数据项名称"></Input>
                </div>
            </div> <!-- form-item 结束 -->
            <div class="form-item">
                <div class="form-item-tit">
                    添加按钮文字
                </div>
                <div class="form-item-cont">
                    <Input v-model="dataConfig.addText" placeholder="请输入数据项名称"></Input>
                </div>
            </div> <!-- form-item 结束 -->
            <div class="form-item">
                <div class="form-item-tit">
                    删除按钮文字
                </div>
                <div class="form-item-cont">
                    <Input v-model="dataConfig.removeText" placeholder="请输入数据项名称"></Input>
                </div>
            </div> <!-- form-item 结束 -->

        </dchPanel>

    </div>
</template>

<script>
// 引入编辑器组件使用的变量、函数等资源
import { createBox, pluginName, getAttr, dataConfig } from '../../basic.js';

// 默认配置
const defaultConfig = {
    // 元数据名称
    name: "未命名",
    // 数据项类型
    type: 'table_diy_plus',
    // 排版方式
    display: "block",
    // 添加删除按钮文字
    addText: "添加",
    removeText: "删除",
};

// 输出
export default {
    data() {
        return {
            // 表单数据项配置
            dataConfig: {},
            // 当前编辑DOM对象
            editdom: null
        };
    },
    // 观察者
    watch: {
        dataConfig: {
            handler(val, oldVal) {
                this.dataConfigChange(val, oldVal);
            },
            deep: true
        }
    },
    // 实例创建完成
    created() {
        // 进行初始化
        this.init();
    },
    // 方法
    methods: {
        // 初始化
        init() {
            this.isReady = false;
            // 获取当前编辑的数据项DOM
            let editdom = UE.plugins[pluginName].editdom;
            // 如果当前编辑的DOM为空 创建一个新的数据项
            if(M.isNull(editdom)) {
                // 设置当前配置为默认配置
                this.dataConfig = M.extend(M.clone(defaultConfig), {
                    // 元数据变量名 唯一标识
                    code: 'dch_' + M.now(),
                });
            }
            // 如果当前编辑DOM存在
            else {
                // 获得元数据变量 用于获取配置项
                let code = getAttr($(editdom), 'code'),
                    // 获得之前的配置对象
                    oldDataConfig = UE.plugins[pluginName].dataConfigs[code];

                // 设置当前编辑的DOM对象
                this.editdom = editdom;
                // 如果配置对象存在
                if(oldDataConfig) {
                    this.dataConfig = M.extend(M.clone(defaultConfig), M.clone(oldDataConfig));
                }
            }
        },
        // 根据配置项渲染DOM
        renderDom() {
            // 相关配置
            let opts = this.dataConfig,
                // 之前编辑的DOM对象
                editdom = this.editdom,
                // 数据项变量
                code = opts.code,
                // 传入默认配置项 创建数据项主容器
                $box = createBox(opts),
                // 表格
                $table = $('<table></table>'),
                // 表头
                $head = editdom ? $(editdom).find('.diy-plus-head').first().clone() : $('<tbody class="diy-plus-head"><tr class="firstRow"><td>标题</td><td>标题</td><td>标题</td></tr></tbody>'),
                // 表格自增内容
                $body = editdom ? $(editdom).find('.diy-plus-body').first().clone() : $('<tbody class="diy-plus-body" v-for="(diyRow, plusIndex) in formObj.'+code+'" v-bind:key="plusIndex"><tr><td colspan="3">自增内容只有添加灰色容器中才有效，可以设置为多列！</td></tr></table>');

            // 放入表头
            $table.html($head);
            // 放入内容
            $table.append($body);
            // 放入表格
            $box.html($table);


            // console.log(editdom)
            console.log(JSON.stringify(opts, null, 4));
            console.log($box.get(0));
            // 向父级组件提交改变dom的操作
            this.$emit('dom-change', $box.get(0));
        },
        // 更新元数据项
        dataConfigChange(opts, oldOpts) {
            // 如果配置项存在 且长度大于0 且code存在
            if(M.isObject(opts) && M.size(opts) && opts.code) {
                // 找到之前的编辑对象
                let editdom = UE.plugins[pluginName].editdom;
                this.editdom = editdom;
                // 渲染对应的DOM
                this.renderDom();
                // 将当前配置项设置到编辑器缓存中
                dataConfig(opts.code, opts);
                // 打印当前配置项
                // console.log(JSON.stringify(opts, null, 4));
                // 打印当前所有元数据配置项
                console.log(UE.plugins[pluginName].dataConfigs);
            }
        },
        // 选项的增加和删除
        colBtnClick(type, item, index) {
            // 获得当前选项变量名
            let itemCode = item.code;
            // 如果为新增
            if(type === "add") {
                // 获得选项计数并增加1
                let colCount = this.dataConfig.colCount + 1,
                    // 生成选项
                    label = {
                        // 选项中文名
                        name: "选项",
                        // 选项变量名
                        code: M.toString(colCount)
                    };

                // 往数组里面放入一行
                this.dataConfig.cols.splice(index + 1, 0, label);
                // 重新设置计数
                this.dataConfig.colCount = colCount;
            }
            // 如果为删除
            else {
                // 删除该选项
                this.dataConfig.cols.splice(index, 1);
            }
            // console.log(JSON.stringify(item, null, 4))
            // console.log(index)
            // console.log(JSON.stringify(this.dataConfig, null, 4))
        }
    },
    components: {
        dchPanel: resolve => require(['components/panel/panel.vue'], resolve)
    }
};
</script>