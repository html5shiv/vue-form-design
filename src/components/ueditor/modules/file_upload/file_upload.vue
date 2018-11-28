<style lang="scss" scoped>
// 引入表单配置页公共样式
@import '../../scss/data-config-style';
</style>
<template>
    <div>
        <!-- 组件基础公共 -->
        <dchPanel title="文件上传" >
            <div class="form-item">
                <div class="form-item-tit">
                    名称
                </div>
                <div class="form-item-cont">
                    <Input v-model="dataConfig.name" placeholder="请输入数据项名称" />
                </div>
            </div> <!-- form-item 结束 -->

            <div class="form-item">
                <div class="form-item-tit">
                    提示信息
                </div>
                <div class="form-item-cont">
                    <Input v-model="dataConfig.placeholder" placeholder="请输入提示信息" />
                </div>
            </div> <!-- form-item 结束 -->

            <div class="form-item">
                <div class="form-item-tit">
                    最大上传文件数(1-100之间)
                </div>
                <div class="form-item-cont">
                    <InputNumber v-model="dataConfig.max" class="long" :max="100" :min="1" />
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
        </dchPanel>


    </div>
</template>

<script>
// 引入编辑器组件使用的变量、函数等资源
import { createBox, pluginName, getAttr, dataConfig } from '../../basic.js';

// 文件上传支持格式分类
// const fileTypes = {
//     {
//         "txt"
//     }

// };


// 默认配置
const defaultConfig = {
    // 元数据名称
    name: "未命名",
    // 数据项类型
    type: 'file_upload',
    // 排版方式
    display: "block",
    // 提示文字
    placeholder: "",
    // 文件上传最大数量 默认上传一个
    max: 1,
    // 单个文件上传大小限制 100MB
    maxSize: 104857600
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
                // 传入默认配置项 创建数据项主容器
                $box = createBox(opts),
                // 上传按钮
                $btn = $('<button class="file-upload-btn" type="button">点击上传</button>');

            // 放入输入框
            $box.html($btn);
            // 设置提示信息
            if(opts.placeholder) $box.append('<p class="file-upload-info">'+opts.placeholder+'</p>');
            // 向父级组件提交改变dom的操作
            this.$emit('dom-change', $box.get(0));

            console.log(JSON.stringify(opts, null, 4));
            console.log($box.get(0));
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
        }
    },
    components: {
        dchPanel: resolve => require(['components/panel/panel.vue'], resolve)
    }
};
</script>