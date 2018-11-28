<style lang="scss">
    .edui-default .edui-editor-toolbarbox {
        position: absolute;
        top: 0;
        left: 0;
    }
</style>
<style lang="scss" scoped>
    .ueditor-wrap {
        position: relative;
        z-index: 0;
    }
</style>
<template>
    <div :id="wrapId" :class="['ueditor-wrap',{'no-border': noBorder}]">
        <!-- 编辑器 -->
        <div :id="id" :style="ueditorStyle" ref="ueditor"></div>
        <!-- 表单设计控件 -->
        <div v-if="formDesign">
            <!-- 删除表单项目模块弹出框 -->
            <Modal v-model="removeModal" width="360" title="提示信息">
                <div style="font-size: 16px; text-align:center">
                    <p>您确定要删除当前元数据吗?</p>
                </div>
                <div class="foot-btn" slot="footer">
                    <Button type="error" shape="circle" @click="removeEditdom">删除</Button>
                </div>
            </Modal>
        </div>
    </div>
</template>



<script>
     // 引入编辑器配置
    import 'static/ueditor/ueditor.config.js';
    // 编辑器程序
    import 'static/ueditor/ueditor.all.js';
    // 编辑器语言
    import 'static/ueditor/lang/zh-cn/zh-cn.js';
    // 引入编辑器组件使用的变量、函数等资源
    import {
        toolbars,
        pluginName,
        installPlugin,
        formModulePrefix,
        getAttr,
        dataConfig
    } from './basic.js';

    // 安装百度编辑器控件-vueForm 用于表单设计
    installPlugin();

    // 配置项
    const options = {
        // 自定义操作工具
        toolbars,
        // 关闭elementPath
        elementPathEnabled: true,
        // 关闭DIV转换
        allowDivTransToP: false,
        // 自动清除空节点
        autoClearEmptyNode: false,
        // 关闭字数统计
        wordCount: true,
        // 回车标签
        enterTag: "br",
        // css文件组
        iframeCssUrls: [
            // 自定义表单样式
            '/static/ueditor/vue-form/vue-form.css'
        ]
    };

    // 输出
    export default {
        // 组件名称
        name: 'ueditor',
        // 属性
        props: {
            // 画布宽度
            width: {
                type: String,
                default: '100%'
            },
            // 画布高度
            height: {
                type: Number,
                default: 220
            },
            // 根据父容器高度自适应
            autoHeight: {
                type: Boolean,
                default: false
            },
            // 初始化参数配置
            options: Object,
            // 工具配置
            toolbars: Array,
            // 内容
            content: String,
            // 是否启动表单设计功能
            formDesign: {
                type: Boolean,
                default: false
            },
            // 取消边框
            noBorder: {
                type: Boolean,
                default: false
            },
            // 主容器是否占满父容器
            full: {
                type: Boolean,
                default: false
            },
        },
        data() {
            return {
                // 百度编辑器实例
                ueditor: null,
                // 删除表单模块弹框打开状态
                removeModal: false,
                // 当前编辑元数据
                nowMeta: {},
                // 当前删除的DOM
                removeDom: null
            }
        },
        // 计算属性
        computed: {
            // 主容器ID
            wrapId() {
                return "ueditorWrap_" + M.now()
            },
            // 动态生成ID
            id() {
                return "ueditor_" + M.now()
            },
            // 高度
            heightStr() {
                let height = this.height;
                return M.isNumber(height) ? height + "px" : height;
            },
            // 画布样式
            ueditorStyle() {
                return {
                    width: this.width,
                    height: this.heightStr
                }
            },
            // 是否渲染表单设计控件
            isRenderForm() {
                return this.ueditor && this.formDesign;
            },
        },
        watch: {
            // 数据发生改变时
            content(val) {
                console.log(val);

                this.setContent(val);
            },
        },
        created() {
            // 初始化编辑器
            //this.init();
        },
        // 实例创建完成
        mounted() {
            // 初始化编辑器
            this.init();
            // 处理编辑器高度
            this.handleHeight();
        },
        // 方法
        methods: {
            init() {
                // 获得配置项
                let opts = this.options || options,
                    // 获得工具配置
                    tools = this.toolbars || toolbars;
                // 设置工具配置
                opts.toolbars = tools;
                // 设置编辑器高度
                // opts.initialFrameHeight = this.height;

                // 获得编辑器对象
                this.ueditor = UE.getEditor(this.id, opts);
                // 暴露表单设计弹出框打开方法
                if (this.formDesign) {
                    // 设置打开弹框方法
                    this.ueditor.open = this.open;
                    // 设置删除弹框方法
                    this.ueditor.remove = this.remove;
                }
                // 设置默认内容
                if (this.content) {
                    this.setContent(this.content);
                }
            },
            // 处理编辑器高度
            handleHeight() {
                // 如果为自适应高度
                if (this.autoHeight) {

                    // 编辑器渲染完毕
                    this.ueditor.ready(() => {
                        // 主容器
                        let $wrap = $("#" + this.wrapId),
                            // 编辑器主容器分父元素
                            $wrapParent = $wrap.parent(),
                            // 父容器高度
                            wrapParentHeight = $wrapParent.outerHeight() || 0,
                            // 工具条
                            $tools = $wrap.find(".edui-editor-toolbarbox"),
                            // 工具条高度
                            toolsHeight = $tools.outerHeight() || 0,
                            // 编辑区域高度
                            height = wrapParentHeight - toolsHeight - 30;
                        // 如果高度计算成功
                        if (height > 0) {
                            // 重新设置编辑区域高度
                            $wrap.find(".edui-editor-iframeholder").height(height);
                        }
                    });
                }
            },
            // 获取内容
            getContent() {
                return this.ueditor.getContent();
            },
            // 设置内容
            setContent(val) {
                if (this.ueditor) {
                    // 编辑器渲染完毕
                    this.ueditor.ready(() => {
                        // 设置默认内容
                        this.ueditor.setContent(val);
                    });
                }
            },
            /**
             * 表单设计器方法
             */
            // 在当前焦点处放入一个元数据项DOM
            setDataDom(dom) {
                // 之前编辑的DOM
                let oldDom = UE.plugins[pluginName].editdom;
                // console.log(oldDom)
                // console.log(dom)
                // 如果传入内容是DOM元素
                if (M.isElement(dom)) {
                    // 获得元数据code
                    let code = getAttr($(dom), 'code'),
                        $dom = $(dom),
                        // 是否为自增表格
                        isTablePlus = $dom.attr("module_type") === "table_diy_plus";

                    // 删除之前的DOM
                    if (oldDom) {
                        // 处理自增表格元数据层级
                        if (isTablePlus) $dom.attr("level", $(oldDom).attr("level") || 'level-1');
                        // 替换新的DOM
                        $(oldDom).replaceWith(dom);
                    } else {
                        // 获得当前焦点所在位置
                        let range = this.ueditor.selection.getRange(),
                            // 开始标签
                            $start = $(range.startContainer),
                            // 是否为表单模块
                            isFormModule = $start.hasClass("form-module"),
                            // 是否在自增表格内部

                            // 获得父元素表单模块
                            $formModule = $start.parents(".form-module"),
                            // 如果父级
                            // 获取高级自增容器 如果为高级自增 允许嵌套
                            isTableDiyPlus = $formModule.attr('module_type') === 'table_diy_plus';

                        // 如果为自增表格 设置默认为1级自增
                        if (isTablePlus) {
                            $dom.attr('level', 'level-1');
                        }

                        // 如果当前元素就是表单模块
                        if (isFormModule && $start.attr('module_type') !== 'table_diy_plus') {
                            // 插入到他的后面
                            $start.after($dom);
                        }
                        // 如果父元素为表单模块 同时不是高级自增表格
                        else if ($formModule.length && !isTableDiyPlus) {
                            // 如果父元素
                            $formModule.after($dom);
                        } else {
                            // 如果父元素为高级自增
                            if (isTablePlus && $start.parents('[module_type="table_diy_plus"]').length) {
                                $dom.attr('level', 'level-2');
                            }
                            // 在当前位置插入
                            this.ueditor.execCommand('insertHtml', dom.outerHTML);
                        }
                    }
                    // 设置刚刚新增的为当前编辑DOM
                    UE.plugins[pluginName].editdom = this.get("#" + code).get(0);
                } else {
                    this.$Message.error("获取DOM失败!");
                }
            },
            // 打开表单模块弹框
            open(type) {
                // 如果模块类型
                if (type) {
                    this.$emit('open-config', type);
                } else {
                    this.$Message.error("没有指定元数据类型");
                }
            },
            // 删除表单模块弹框
            remove(dom) {
                // 当前编辑DOM
                this.removeDom = dom;
                // console.log(dom)
                // 打开弹框
                this.removeModal = true;
            },
            // 删除编辑器DOM确定按钮点击事件
            removeEditdom() {
                // 或是删除DOM的code
                let removeCode = getAttr(this.removeDom, 'code'),
                    // 当前编辑DOM的code
                    editCode = getAttr(UE.plugins[pluginName].editdom, 'code');

                // 删除DOM
                UE.dom.domUtils.remove(this.removeDom, false);
                // 删除缓存
                dataConfig(removeCode, false);
                // 如果删除的DOM 和 当前编辑的DOM一样
                if (removeCode === editCode) {
                    this.$emit('close-config');
                }
                // console.log(dataConfig())
                // 关闭弹框
                this.removeModal = false;
            },
            // 获取编辑器内容中的DOM元素
            get(selector) {
                return $(this.ueditor.body).find(selector);
            },
        },
        // 组件
        components: {}
    };
</script>
