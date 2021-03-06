<style lang="scss" scoped>
// 引入表单配置页公共样式
@import '../../scss/data-config-style';


</style>
<template>
    <div>
        <!-- 组件基础公共 -->
        <dchPanel title="下拉菜单" >
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
                    提示信息
                </div>
                <div class="form-item-cont">
                    <Input v-model="dataConfig.placeholder" placeholder="请输入数据项名称"></Input>
                </div>
            </div> <!-- form-item 结束 -->
            <div class="form-item">
                <div class="form-item-tit">
                    空数据提示
                </div>
                <div class="form-item-cont">
                    <Input v-model="dataConfig.notFoundText" placeholder="请输入空数据提示"></Input>
                </div>
            </div> <!-- form-item 结束 -->
            <div class="form-item">
                <div class="form-item-tit">
                    选项
                    <Poptip
                        title="提示"
                        placement="bottom-start"
                        trigger="hover" >
                        <Icon class="pop-icon" type="help-circled"></Icon>
                        <div slot="content">
                            <p>如果选项已经存在填写数据，</p>
                            <p>请不要轻易删除，会影响读取！</p>
                        </div>
                    </Poptip>
                </div>
                <div v-if="dataConfig.options" class="form-item-cont">
                    <div
                        v-for="(item, i) in dataConfig.options"
                        :key="i"
                        class="table-row">
                        <div class="table-col">
                            <Tooltip content="设为选中" placement="right">
                                <input v-model="dataConfig.optionSelected" type="radio" :value="item.code">
                            </Tooltip>
                        </div>
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
                <div class="form-item-tit">
                    宽度
                </div>
                <div class="form-item-cont">
                    <Input v-model="dataConfig.width">
                        <Select v-model="dataConfig.widthUnit" slot="append" style="width: 80px">
                            <Option value="%">百分比</Option>
                            <Option value="px">像素</Option>
                        </Select>
                    </Input>
                </div>
            </div> <!-- form-item 结束 -->
        </dchPanel>
    </div>
</template>

<script>
// 引入编辑器组件使用的变量、函数等资源
import { createBox, pluginName, getAttr, dataConfig, defaultWidth } from '../../basic.js';

// 默认配置
const defaultConfig = {
    // 元数据名称
    name: "未命名",
    // 数据项类型
    type: 'select',
    // 排版方式
    display: "inline-block",
    // 提示信息
    placeholder: "请选择",
    // 宽度
    width: defaultWidth,
    // 宽度单位
    widthUnit: "px",
    // 空数据提示
    notFoundText: "无匹配数据",
    // 选项数据
    options: [
        {
            // 选项中文名
            name: "选项1",
            // 选项变量名
            code: "0"
        },
        {
            // 选项中文名
            name: "选项2",
            // 选项变量名
            code: "1"
        },
        {
            // 选项中文名
            name: "选项3",
            // 选项变量名
            code: "2"
        },
    ],
    // 选项默认选中
    optionSelected: "",
    // 变量生成计数 从0开始
    optionCount: 2
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
                // 选项列表
                options = opts.options,
                // 当前选中项
                optionSelected = opts.optionSelected,
                // 提示信息
                placeholder = opts.placeholder || '请选择',
                // 输入框宽度
                width = M.toNumber(opts.width),
                // 传入默认配置项 创建数据项主容器
                $box = createBox(opts),
                // 下拉框
                $select = $('<select v-if="isEdit" v-model="formObj.'+code+'"><option>'+placeholder+'</option></select>'),
                // 只读模式下显示内容
                $readonly = $('<strong v-else-if="isReadonly" class="readonly">{{formObj.'+opts.code +' | selectFilter(formObj, config.'+opts.code+')}}</strong>');

            // 创建每一个选项
            M.each(options, item => {
                // 创建选项
                let itemCode = item.code,
                    // 是否被选中
                    isSelected = ( optionSelected === itemCode ) ? 'selected' : '',
                    // 创建选项
                    $option = $('<option value="'+itemCode+'" '+isSelected+'>'+item.name+'</option>');
                // 放入选项
                $select.append($option);
            });

            // 处理宽度
            width = M.isNumber(width) && width >= 0 ? width : defaultWidth;

            // 设置高度
            $select.css({
                width: width + opts.widthUnit
            });
            // 放入下拉菜单
            $box.html($select);
            // 放入只读文本
            $box.append($readonly);

            console.log(JSON.stringify(opts, null, 4));
            console.log($box.get(0))
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
                let optionCount = this.dataConfig.optionCount + 1,
                    // 生成选项
                    label = {
                        // 选项中文名
                        name: "选项",
                        // 选项变量名
                        code: M.toString(optionCount)
                    };

                // 往数组里面放入一行
                this.dataConfig.options.splice(index + 1, 0, label);
                // 重新设置计数
                this.dataConfig.optionCount = optionCount;
            }
            // 如果为删除
            else {
                // 如果当前值等于被选中的值 删除被选中值
                if(itemCode === this.dataConfig.optionSelected) {
                    this.dataConfig.optionSelected = "";
                }
                // 删除该选项
                this.dataConfig.options.splice(index, 1);
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