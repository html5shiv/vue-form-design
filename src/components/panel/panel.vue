<style lang="scss" scoped>

.panel {
	+ .panel {
		margin-top: 10px;
	}

	// 展开图标
	.panel-icon {
		font-size: 18px;
		float: right;
		transition: transform .2s ease-in-out;
	}

	&.is-open .panel-icon{
		transform: rotate(-90deg);
	}
}
.panel-head {
	padding: 8px 15px;
	font-size: 14px;
	font-weight: bold;
	background: #f6f9fa;
	cursor: pointer;
}
.panel-cont-body {
	padding: 15px;
}
</style>
<template>
	<div :class="wrapClasses">
		<div v-if="isShowHead" class="panel-head" @click="toggle">
			<slot name="title">{{title}}</slot>
			<Icon class="panel-icon" v-if="!closeToggle" type="ios-arrow-left" size="18"></Icon>
		</div>
		<el-collapse-transition>
			<div v-show="isOpen" class="panel-cont-body">
				<slot></slot>
			</div>
		</el-collapse-transition>
	</div>
</template>

<script>
// 输出
export default {
	// 组件名称
	name: 'dchPanel',
	// 属性
	props: {
		// 标题
		title: String,
		// 是否关闭折叠功能
		closeToggle: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			// 是否打开内容
			isOpen: true,
			// 是否显示头部
			isShowHead: true,
		}
	},
	// 计算属性
	computed: {
		wrapClasses() {
			return [
				'panel',
				{
					'is-open': this.isOpen
				}
			];
		}
	},

	// 实例创建完成
	mounted() {
		// 判断是否存在分发的内容
		this.isShowHead = this.title || this.$slots.title !== undefined;
	},
	// 方法
	methods: {
		// 切换内容打开状态
		toggle() {
			this.isOpen = !this.isOpen;
		}
	}
};
</script>