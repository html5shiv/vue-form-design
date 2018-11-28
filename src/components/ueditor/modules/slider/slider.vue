<style lang="scss" scoped>// 引入表单配置页公共样式
@import '../../scss/data-config-style';</style>
<template>
    <div>
        <!-- 组件基础公共 -->
        <dchPanel title="单行文本" >
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
                    默认值
                </div>
                <div class="form-item-cont">
                    <InputNumber v-model="dataConfig.value" :max="100" :min="0" />
                    <!-- <Input v-model="dataConfig.value" placeholder="请输入默认值"></Input> -->
                </div>
            </div> <!-- form-item 结束 -->
        </dchPanel>

        <!-- 布局设置 -->
        <dchPanel title="布局设置" >
            <div class="form-item">
                <div class="form-item-tit">
                    宽度
                </div>
                <div class="form-item-cont">
                    <Input v-model="dataConfig.width">
                        <Select v-model="dataConfig.widthUnit" slot="append" style="width: 80px">
                            <Option value="%" disabled="disabled">百分比</Option>
                            <Option value="px">像素</Option>
                        </Select>
                    </Input>
                </div>
            </div> <!-- form-item 结束 -->

            <div class="form-item">
                <div class="form-item-tit">
                    高度
                </div>
                <div class="form-item-cont">
                    <Input v-model="dataConfig.height">
                        <span slot="append">像素</span>
                    </Input>
                </div>
            </div> <!-- form-item 结束 -->

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

<script>// 引入编辑器组件使用的变量、函数等资源
import { createBox, pluginName, defaultWidth, defaultHeight, getAttr, dataConfig } from '../../basic.js';

// 默认配置
const defaultConfig = {
	// 元数据名称
	name: "未命名",
	// 数据项类型
	type: 'slider',
	// 布局方式
	display: "inline-block",
	// 宽度
	width: defaultWidth,
	// 默认值
	value: 0,
	// 宽度单位
	widthUnit: "px",
	// 高度
	height: defaultHeight,
	// 是否带边框
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
				// 传入默认配置项 创建数据项主容器
				$box = createBox(opts),
				// 默认值
				value = opts.value,
				// 输入框
				$input = $('<input v-if="isEdit" v-model="formObj.' + opts.code + '" type="range" value="' + value + '">'),
				// 输入框宽度
				width = M.toNumber(opts.width),
				// 输入框高度
				height = M.toNumber(opts.height),
				// 边框class
				noBorderClass = opts.isBorder !== "是" ? 'no-border' : "",
				// 只读模式下显示内容
				$readonly = $('<strong v-else-if="isReadonly" class="readonly">{{formObj.' + opts.code + '}}</strong>');
			console.log(opts);

			// 处理宽度
			width = M.isNumber(width) && width >= 0 ? width : defaultWidth;
			// 处理高度
			height = M.isNumber(height) && height >= 0 ? height : defaultHeight;

			// 设置高度
			$input.css({
				width: width + opts.widthUnit,
				height: height
			});

			// 设置输入框提示文字
			$input.val(opts.value);
			// 设置默认值
			$input.attr("placeholder", opts.placeholder || "");
			// 是否为有边框
			$input.addClass(noBorderClass);

			// 放入输入框
			$box.html($input);
			// 放入只读文本
			$box.append($readonly);
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
				console.log(UE.plugins[pluginName].dataConfigs);
			}
		}
	},
	components: {
		dchPanel: resolve => require(['components/panel/panel.vue'], resolve)
	}
};</script>