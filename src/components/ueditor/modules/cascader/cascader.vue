<style lang="scss" scoped>
// 引入表单配置页公共样式
@import '../../scss/data-config-style';
// 根节点添加按钮
.root-add-btn {
    float: right;
}
// 弹框底部按钮
.foot-btn {
    width: 250px;
    margin: 0 auto;
}
</style>
<template>
    <div>
        <!-- 组件基础公共 -->
        <dchPanel title="城市选择" >
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
                <div class="form-item-cont" style="background-color: #f7f7f7">
                    <Input v-model="dataConfig.placeholder" placeholder="请输入数据项名称"></Input>
                </div>
            </div> <!-- form-item 结束 -->
            <div class="form-item">
                <div class="form-item-tit">
                    选项数据
                    <Button class="root-add-btn" icon="ios-plus-empty" size="small" title="添加根节点" @click="rootNodeAddClick"></Button>
                </div>
                <div class="form-item-cont">
                    <Tree :data="optionsData" :render="renderContent"></Tree>
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

        <!-- 选项数据添加弹框 -->
        <Modal v-model="addOptsModal" title="选项名称" :label-width="100">
            <Form :model="editNodeForm">
                <FormItem>
                    <Input v-model="editNodeForm.label" placeholder="请输入选项名称"></Input>
                </FormItem>
            </Form>
             <!-- 自定义页脚 -->
            <div slot="footer" class="foot-btn">
                <Button type="primary" shape="circle" @click="addOptsModalOk" class="foot-btn">保存</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
// 引入编辑器组件使用的变量、函数等资源
import { createBox, pluginName, getAttr, dataConfig, defaultWidth, defaultHeight } from '../../basic.js';

// 默认配置
const defaultConfig = {
    // 元数据名称
    name: "未命名",
    // 数据项类型
    type: 'cascader',
    // 排版方式
    display: "inline-block",
    // 提示信息
    placeholder: "请选择",
    // 联动级别
    // level: '2',
    // 宽度
    width: defaultWidth,
    // 宽度单位
    widthUnit: "px",
    // 高度
    height: defaultHeight,
    // 选项数据
    options: [
        {
            "label": "北京市",
            "children": [
                {
                    "label": "海淀区",
                },
                {
                    "label": "朝阳区",
                },
                {
                    "label": "东城区",
                }
            ]
        },
        {
            "label": "江西省",
            "children": [
                {
                    "label": "南昌市",
                },
                {
                    "label": "赣州市",
                }
            ]
        },
        {
            "label": "广东省",
        }
    ]
};

function getOptions(data, ret) {
    ret = ret || [];
    // 遍历所有子节点
    M.each(data, item => {
        // 新的数据节点
        let obj = {};
        // 设置标题
        obj.label = item.label;
        obj.value = item.label;
        // 获取子节点
        if(item.children) {
            obj.children = [];
            getOptions(item.children, obj.children)
        }
        ret.push(obj);
    });
    return ret;
}

// 输出
export default {
    data() {
        return {
            // 表单数据项配置
            dataConfig: {},
            // 选项树形数据
            optionsData: [],
            // 选项数据添加弹框
            addOptsModal: false,
            // 当前操作的数据节点
            nowEditNode: null,
            // 选项节点编辑表单
            editNodeForm: {
                label: "未命名"
            }
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
            let editdom = UE.plugins[pluginName].editdom,
                // 选项数据
                options = M.clone(defaultConfig.options)
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
                    oldDataConfig = M.clone(oldDataConfig);
                    this.dataConfig = M.extend(M.clone(defaultConfig), oldDataConfig);
                    options = oldDataConfig.options || [];
                }
            }

            // 处理树形数据
            this.optionsData = options;
            console.log(JSON.parse(JSON.stringify(this.optionsData)))
        },
        // 根据配置项渲染DOM
        renderDom() {
            // 相关配置
            let opts = this.dataConfig,
                // 数据项变量
                code = opts.code,
                // 提示信息
                placeholder = opts.placeholder || '请选择',
                // 输入框宽度
                width = M.toNumber(opts.width),
                // 传入默认配置项 创建数据项主容器
                $box = createBox(opts),
                // 下拉框
                $select = $('<select v-if="isEdit" v-model="formObj.'+code+'"><option>'+placeholder+'</option></select>'),
                // 只读模式下显示内容
                $readonly = $('<strong v-else-if="isReadonly" class="readonly">{{formObj.'+opts.code +' | areaFilter(formObj, config.'+opts.code+')}}</strong>');


            // 处理宽度
            width = M.isNumber(width) && width >= 0 ? width : defaultWidth;

            // 设置高度
            $select.css({
                width: width + opts.widthUnit,
                height: opts.height + 'px'
            });
            // 放入下拉菜单
            $box.html($select);
            // 放入只读文本
            $box.append($readonly);

            // console.log(JSON.stringify(opts, null, 4));
            // console.log($box.get(0))
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
        },
        // 树形菜单自定义操作按钮
        renderContent (h, { root, node, data }) {
            return h('span', {
                style: {
                    display: 'inline-block',
                    width: '100%'
                }
            }, [
                h('span', [
                    h('span', data.label)
                ]),
                h('span', {
                    style: {
                        display: 'inline-block',
                        float: 'right',
                        marginRight: '15px'
                    }
                }, [
                    h('Button', {
                        props: Object.assign({}, this.buttonProps, {
                            icon: 'ios-plus-empty',
                            size: 'small',
                        }),
                        attrs: {
                            title: '添加子节点',
                        },
                        style: {
                            marginRight: '8px'
                        },
                        on: {
                            click: () => { this.append(root, node, data) }
                        }
                    }),
                    h('Button', {
                        props: Object.assign({}, this.buttonProps, {
                            icon: 'ios-minus-empty',
                            size: 'small',
                        }),
                        attrs: {
                            title: '删除子节点',
                        },
                        on: {
                            click: () => { this.remove(root, node, data) }
                        }
                    })
                ])
            ]);
        },
        // 添加某选项下的子选项
        append(root, node, data) {
            // 设置当前编辑的数据节点
            this.nowEditNode = data;
            // 打开弹框
            this.addOptsModal = true;
            // console.log(data)

        },
        rootNodeAddClick() {
            // 设置当前编辑的数据节点
            this.nowEditNode = null;
            // 打开弹框
            this.addOptsModal = true;
        },
        // 添加弹框保存事件
        addOptsModalOk() {
            // 获取当前编辑节点名称
            let label = this.editNodeForm.label || "未命名",
                // 是否为根节点
                isRoot = this.nowEditNode === null,
                // 目标节点
                target = this.nowEditNode || this.optionsData,
                // 子节点集合
                children = isRoot ? this.optionsData : (this.nowEditNode.children || []),
                // 根据当前节点所有子节点名称 生成查询地图 用于判断是否重复出现
                childrenMap = M.indexBy(children, "label");

            // 如果重复了
            if(childrenMap[label]) {
                this.$Message.error("选项名称不能重复！");
                return false;
            }
            // 如果当前编辑节点存在
            if(this.nowEditNode) {
                // 插入刚刚创建的节点
                children.push({
                    label,
                    expand: true
                });
                // 放入新的节点集合
                this.$set(this.nowEditNode, 'children', children);
            }
            else {
                children.push({
                    label,
                    expand: true
                });
            }

            // 重置当前编辑节点
            this.nowEditNode = null;
            // 重置弹框表单绑定数据
            this.initOptForm();
            // 关闭弹框
            this.addOptsModal = false;
            // 重新设置参数
            this.dataConfig.options = this.getOptions();

            console.log(JSON.parse(JSON.stringify(this.dataConfig)))
        },
        // 删除某选项
        remove(root, node, data) {
            // 获得父元素的key
            let parentKey = root.find(el => el === node).parent,
                // 删除位置
                index;
            // 如果父元素的key 存在
            if(parentKey !== undefined) {
                // 获得父元素数据
                let parent = root.find(el => el.nodeKey === parentKey).node;
                // 获得数据所在索引
                index = parent.children.indexOf(data);
                // 删除数据
                parent.children.splice(index, 1);
            }
            else {
                // 获得数据所在索引
                index = this.optionsData.indexOf(data);
                // 删除数据
                this.optionsData.splice(index, 1);
            }
            // 重新设置参数
            this.dataConfig.options = this.getOptions();
            console.log(JSON.parse(JSON.stringify(this.dataConfig)))
        },
        // 初始化选项节点数据
        initOptForm() {
            this.editNodeForm = {
                label: "未命名"
            }
        },
        // 获取选项数据
        getOptions() {
            return getOptions(this.optionsData)
        }
    },
    components: {
        dchPanel: resolve => require(['components/panel/panel.vue'], resolve)
    }
};
</script>