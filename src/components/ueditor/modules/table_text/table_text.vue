<style lang="scss" scoped>
// 引入表单配置页公共样式
@import '../../scss/data-config-style';


</style>
<template>
    <div>
        <!-- 组件基础公共 -->
        <dchPanel title="矩形文本" >
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
                    选项(列)
                    <Poptip
                        title="提示"
                        placement="bottom-start"
                        trigger="hover" >
                        <Icon class="pop-icon" type="help-circled"></Icon>
                        <div slot="content">
                            <p>如果已经存在填写数据，</p>
                            <p>请不要轻易删除！</p>
                        </div>
                    </Poptip>
                </div>
                <div v-if="dataConfig.labels" class="form-item-cont">
                    <div
                        v-for="(item, i) in dataConfig.labels"
                        :key="i"
                        class="table-row">
                        <div class="table-col">
                            <Input v-model="item.name" placeholder="请输入选项名称" style="width: 100%"></Input>
                        </div>
                        <div class="table-col">
                            <Button type="ghost" shape="circle" icon="plus" size="small" @click="labelBtnClick('add', item, i)" title="添加"></Button>
                        </div>
                        <div class="table-col">
                            <Button type="ghost" shape="circle" icon="minus" size="small" @click="labelBtnClick('remove', item, i)" title="删除"></Button>
                        </div>
                    </div> <!-- table-item 结束 -->
                </div>
            </div> <!-- form-item 结束 -->

            <div class="form-item">
                <div class="form-item-tit">
                    项目(行)
                    <Poptip
                        title="提示"
                        placement="bottom-start"
                        trigger="hover" >
                        <Icon class="pop-icon" type="help-circled"></Icon>
                        <div slot="content">
                            <p>如果已经存在填写数据，</p>
                            <p>请不要轻易删除！</p>
                        </div>
                    </Poptip>
                </div>
                <div v-if="dataConfig.rows" class="form-item-cont">
                    <div
                        v-for="(row, i) in dataConfig.rows"
                        :key="i"
                        class="table-row">
                        <div class="table-col">
                            <Input v-model="row.name" placeholder="请输入项目名称" style="width: 100%"></Input>
                        </div>
                        <div class="table-col">
                            <Button type="ghost" shape="circle" icon="plus" size="small" @click="rowBtnClick('add', row, i)" title="添加"></Button>
                        </div>
                        <div class="table-col">
                            <Button type="ghost" shape="circle" icon="minus" size="small" @click="rowBtnClick('remove', row, i)" title="删除"></Button>
                        </div>
                    </div> <!-- table-item 结束 -->
                </div>
            </div> <!-- form-item 结束 -->
        </dchPanel>

        <!-- 布局设置 -->
        <dchPanel title="布局设置" >
            <div class="form-item">
                <div class="form-item-cont">
                    排版方式：
                    <i-switch v-model="dataConfig.display" size="large" true-value="block" false-value="inline-block">
                        <span slot="open">整行</span>
                        <span slot="close">并列</span>
                    </i-switch>
                </div>
            </div> <!-- form-item 结束 -->
            <div class="form-item">
                <div class="form-item-cont">
                    是否有边框：
                    <i-switch v-model="dataConfig.isBorder" size="large" true-value="是" false-value="否">
                        <span slot="open">是</span>
                        <span slot="close">否</span>
                    </i-switch>
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
    type: 'table_text',
    // 排版方式
    display: "block",
    // 选项数据（列）
    labels: [
        {
            // 选项中文名
            name: "选项1",
            // 选项变量名
            code: "0"
        },
        {
            name: "选项2",
            code: "1"
        },
        {
            name: "选项3",
            code: "2"
        },
    ],
    // 项目（行）
    rows: [
        {
            // 项目中文名
            name: "项目1",
            // 项目变量名
            code: "0"
        },
        {
            name: "项目2",
            code: "1"
        },
        {
            name: "项目3",
            code: "2"
        },
    ],
    // 变量生成计数 从0开始
    labelCount: 2,
    // 行数统计
    rowCount: 2,
    // 输入框是否有边框
    isBorder: "是"
};

// 输出
export default {
    data() {
        return {
            // 表单数据项配置
            dataConfig: {}
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
                // 数据项变量
                code = opts.code,
                // 选项(列)列表
                cols = opts.labels,
                // 项目(行)列表
                rows = opts.rows,
                // 边框class
                noBorderClass = opts.isBorder !== "是" ? 'no-border' : "",
                // 传入默认配置项 创建数据项主容器
                $box = createBox(opts),
                // 创建一个表格
                $table = $('<table class="data-table first-col-left"></table>'),
                colHtml = '<th></th>',
                $tbody = $('<tbody></tbody>');


            // 生成表格
            M.each(rows, (row, i) => {
                let rowName = row.name ||"",
                    // 当前行变量
                    rowCode = row.code,
                    rowHtml = '<td>'+rowName+'</td>';

                // 生成每一行的列
                M.each(cols,(col, j) => {
                    let colName = col.name || "",
                        // 每一列的变量等于元数据的变量加上行变量加上自身的变量
                        colCode = code + "$" + rowCode + "$" +col.code;

                    // 如果为第一行 创建选项之前 创建列
                    if(i === 0) {
                        colHtml += '<th>'+colName+'</th>';
                    }
                    // 生成每一行数据
                    rowHtml += '<td>\
                        <input v-if="isEdit" v-model="formObj.'+code+'.'+colCode+'" type="text" name="'+colCode+'" value="">\
                        <strong v-else-if="isReadonly" class="readonly">{{formObj.'+code+'.'+colCode+'}}</strong>\
                    </td>';
                });

                $tbody.append('<tr>'+rowHtml+'</tr>');
            });
            // 放入表格
            $table.html('<thead><tr>'+colHtml+'</tr></thead>');
            $table.append($tbody);
            // 是否为有边框
            $table.addClass(noBorderClass);
            // 放入主容器中
            $box.html($table);

            console.log(JSON.stringify(opts, null, 4));
            console.log($box.get(0));
            // 向父级组件提交改变dom的操作
            this.$emit('dom-change', $box.get(0));
        },
        // 更新元数据项
        dataConfigChange(opts, oldOpts) {
            // 如果配置项存在 且长度大于0 且code存在
            if(M.isObject(opts) && M.size(opts) && opts.code) {
                // 渲染对应的DOM
                this.renderDom();
                // 将当前配置项设置到编辑器缓存中
                dataConfig(opts.code, opts);
                // 打印当前配置项
                // console.log(JSON.stringify(opts, null, 4));
                // 打印当前所有元数据配置项
                // console.log(UE.plugins[pluginName].dataConfigs);
            }
        },
        // 选项的增加和删除
        labelBtnClick(type, item, index) {
            // 获得当前选项变量名
            let itemCode = item.code;
            // 如果为新增
            if(type === "add") {
                // 获得选项计数并增加1
                let labelCount = this.dataConfig.labelCount + 1,
                    // 生成选项
                    label = {
                        // 选项中文名
                        name: "选项",
                        // 选项变量名
                        code: M.toString(labelCount)
                    };

                // 往数组里面放入一行
                this.dataConfig.labels.splice(index + 1, 0, label);
                // 重新设置计数
                this.dataConfig.labelCount = labelCount;
            }
            // 如果为删除
            else {
                // 删除该选项
                this.dataConfig.labels.splice(index, 1);
            }
            // console.log(JSON.stringify(item, null, 4))
            // console.log(index)
            // console.log(JSON.stringify(this.dataConfig, null, 4))
        },
        rowBtnClick(type, item, index) {
            // 获得当前选项变量名
            let itemCode = item.code;
            // 如果为新增
            if(type === "add") {
                // 获得选项计数并增加1
                let rowCount = this.dataConfig.rowCount + 1,
                    // 生成选项
                    label = {
                        // 选项中文名
                        name: "选项",
                        // 选项变量名
                        code: M.toString(rowCount)
                    };

                // 往数组里面放入一行
                this.dataConfig.rows.splice(index + 1, 0, label);
                // 重新设置计数
                this.dataConfig.rowCount = rowCount;
            }
            // 如果为删除
            else {
                // 删除该选项
                this.dataConfig.rows.splice(index, 1);
            }
        }
    },
    components: {
        dchPanel: resolve => require(['components/panel/panel.vue'], resolve)
    }
};
</script>