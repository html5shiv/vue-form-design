// 引入表单组件二次渲染相关程序
import formTempMap from './temp.js';
// 引入表单校验程序 用于校验各种类型数据填写是否正确
import formVerifyFnMap from './verify.js';
// 表单设计内部组件-文件上传
import dchUpload from './components/dch-upload/';
// 所有表单元数据类型的混合方法
import formModulesMixins from './mixins.js';

// 表单设计内部组件集合
const components = {
    // 文件上传
    dchUpload
};

// 工具按钮配置
export const toolbars = [
    [
        'bold', // 加粗
        'italic', // 斜体
        'underline', // 下划线
        'justifyleft', // 居左对齐
        'justifyright', // 居右对齐
        'justifycenter', // 居中对齐
        'justifyjustify', // 两端对齐
        'insertorderedlist', // 有序列表
        'insertunorderedlist', // 无序列表
        'lineheight', // 行间距
        'forecolor', // 字体颜色
        'backcolor', // 背景色
        'strikethrough', // 删除线
        'link', // 超链接
        'indent', // 首行缩进
        'touppercase', // 字母大写
        'tolowercase', // 字母小写
        'subscript', // 下标
        'superscript', // 上标
        'horizontal', // 分隔线
        'paragraph', // 段落格式
        'fontsize', // 字号
        'formatmatch', // 格式刷
        'selectall', // 全选
        'preview', // 预览
        'pasteplain', // 纯文本粘贴模式
        'removeformat', // 清除格式
        'inserttable', // 插入表格
        'mergecells', // 合并多个单元格
        'insertrow', // 前插入行
        'insertcol', // 前插入列
        'deleterow', // 删除行
        'deletecol', // 删除列
        'splittorows', // 拆分成行
        'splittocols', // 拆分成列
        'splittocells', // 完全拆分单元格
        'deletecaption', // 删除表格标题
        'inserttitle', // 插入标题
        'deletetable', // 删除表格
        'simpleupload', // 单图上传
        //'insertimage',         // 多图上传
        'edittable', // 表格属性
        'edittd', // 单元格属性
        'spechars', // 特殊字符
        'fullscreen', // 全屏
        'edittip ', // 编辑提示
        'template', // 模板
        'source', // 源代码
    ]
];


/**
 * 表单设计相关
 */

// 百度编辑器控件名称
export const pluginName = "vueForm";

// 安装百度编辑器控件方法
export function installPlugin() {
    // 安装表单设计控件
    UE.plugins[pluginName] = function () {
        // 当前编辑器实例 注意是实例
        let self = this;
        // 百度的弹出框组件
        let popup = new UE.ui.Popup({
            // 当前编辑器实例
            editor: self,
            // 弹出框内容
            content: '',
            // 弹出框class名称
            // className: 'edui-bubble',
            // 编辑表单模块
            edit: function () {
                ///设置当前编辑的DOM对象
                UE.plugins[pluginName].editdom = this.editdom;
                // 打印当前编辑的元数据
                console.log(this.editdom);
                // 打开表单组件的弹出框
                self.open(this.type);
                // 关闭弹框
                this.hide();
            },
            // 删除表单模块
            delete: function () {
                // 打印当前删除的元数据
                console.log(this.editdom);
                // 打开删除提示框
                self.remove(this.editdom);
                // 关闭弹框
                this.hide();
            }
        });
        // 渲染弹出框
        popup.render();
        // 添加数据移动事件
        this.addListener('mouseover', function (t, evt) {
            // event事件对象
            evt = evt || window.event;
            // 获得操作DOM 对象
            let $el = $(evt.target || evt.srcElement);

            // 如果当前目标不是表单模块 查找父级
            if (!$el.hasClass("form-module")) {
                $el = $el.parents(".form-module").eq(0);
            }
            // 表单设计控件名称
            let moduleClass = $el.attr(formModulePrefix + 'class'),
                // 表单模块名称
                type = $el.attr(formModulePrefix + 'type'),
                // 获得变量名
                code = $el.attr(formModulePrefix + 'code');

            // 如果是属于表单设计控件 并类型存在
            if (moduleClass === pluginName && type) {
                // 弹出框渲染内容
                let html = popup.formatHtml(
                    '<nobr>表单控件: <span onclick=$$.edit() class="edui-clickable">编辑</span>&nbsp;&nbsp;<span onclick=$$.delete() class="edui-clickable">删除</span></nobr>'
                );
                if (html) {
                    // 渲染编辑器弹出层内容
                    popup.getDom('content').innerHTML = html;
                    // 设置弹出层的操作DOM
                    popup.editdom = $el.get(0);
                    // 设置模块类型
                    popup.type = type;
                    // 设置变量名
                    popup.code = code;
                    // 显示弹出框 传入显示DOM 根据DOM控制位置
                    popup.showAnchor($el.get(0));
                } else {
                    popup.hide();
                }
            }
        });
    };

    /**
     * 表单设计器控件上的公共属性 用来获取当前编辑元数据项的配置等信息
     */
    let initData = function () {
        // 当前编辑的元数据项DOM
        UE.plugins[pluginName].editdom = null;
        // 当前表单所有元数据配置项 通过变量名 code 获取
        UE.plugins[pluginName].dataConfigs = {};
    }
    // 进行初始化
    initData();
    // 设置到控件上 方便调用
    UE.plugins[pluginName].initData = initData;
}

// 表单模块前缀 用于创建VUE组件和模块属性前缀
export const formModulePrefix = 'module_';
// 默认的输入框宽度
export const defaultWidth = 200;
// 默认的输入框和下拉框高度 单位为像素
export const defaultHeight = 30;

// 表单模块列表
export const formModules = [{
        title: "单行文本",
        type: "string",
        name: "text",
        icon: "edit"
    },
    {
        title: "多行文本",
        type: "string",
        name: "textarea",
        icon: "compose"
    },
    {
        title: "数字",
        type: "number",
        name: "number",
        icon: "ios-calculator"
    },
    {
        title: "单选",
        type: "string",
        name: "radio",
        icon: "android-radio-button-on"
    },
    {
        title: "多选",
        type: "array",
        name: "checkbox",
        icon: "android-checkbox-outline-blank"
    },
    {
        title: "下拉菜单",
        type: "string",
        name: "select",
        icon: "arrow-down-b"
    },
    {
        title: "日期",
        type: "string",
        name: "date",
        icon: "ios-clock-outline"
    },
    {
        title: "城市选择",
        type: "array",
        name: "area",
        icon: "location"
    },
    {
        title: "联级选择",
        type: "array",
        name: "cascader",
        icon: "calendar"
    },
    {
        title: "矩形单选",
        type: "object",
        name: "table_radio",
        icon: "android-checkmark-circle"
    },
    {
        title: "矩形多选",
        type: "object",
        name: "table_checkbox",
        icon: "android-checkbox-outline"
    },
    {
        title: "矩形文本",
        type: "object",
        name: "table_text",
        icon: "ios-paper-outline"
    },
    {
        title: "自增表格",
        type: "array",
        name: "table_diy",
        icon: "ios-list-outline"
    },
    {
        title: "高级自增",
        type: "array",
        name: "table_diy_plus",
        icon: "ios-list-outline"
    },
    {
        title: "文件上传",
        type: "array",
        name: "file_upload",
        icon: "ios-upload-outline"
    },
    {
        title: "滑块3",
        type: "number",
        name: "slider",
        icon: "android-remove"
    }
];

// 表单模块列表查询地图
export const formModulesMap = M.indexBy(formModules, "name");

/**
 * 创建一个主容器
 * @param   {Object} opts [
 *     配置必须包含以下参数：
 *     name: 元数据中文名称
 *     code: 元数据变量名
 *     type: 元数据类型
 * ]
 * @return  {Object}        $box [jQuery对象]
 */
export function createBox(opts) {
    // 元数据iD
    let code = opts.code,
        // 创建主容器
        $box = $('<span id="' + code + '" class="form-module" v-bind:class="{\'error\': fromVerifyError.' + code +
            '}"></span>');
    // 如果排版设置为占整行
    if (opts.display === "block") $box.addClass("block");
    // 默认参数
    let config = {
        // 元数据项标识
        class: 'vueForm',
        // 元数据变量 唯一ID
        code,
        // 元数据中文名
        name: opts.name || '未命名',
        // 元数据类型
        type: opts.type || 'text',
    };
    // 生成属性
    M.each(config, function (value, key) {
        $box.attr(formModulePrefix + key, value || "");
    });
    return $box;
}


/**
 * 设置表单模块上的属性
 * @param {Object} $obj   [jQuery对象]
 * @param {Object} attrs  [属性集合,为对象类型]
 */
export function setAttr($obj, attrs) {
    $obj = $($obj);
    // 如果为空
    if (!$obj.length) return;
    // 遍历所有属性
    M.each(attrs, function (value, key) {
        $obj.attr(formModulePrefix + key, value || "");
    })
}
/**
 * 获得表单模块上的属性
 * @param {Object}       $obj   [jQuery对象]
 * @param {String/Array} attrs [属性名称或者包含多个属性名称的数组]
 */
export function getAttr($obj, attrs) {
    $obj = $($obj);
    // 如果为空
    if (M.isNull(attrs) || !$obj.length) return;
    // 判断是否为数组
    let isArray = M.isArray(attrs),
        // 结果
        res = {};
    //处理参数
    attrs = isArray ? attrs : [attrs];
    // 遍历参数
    M.each(attrs, function (key) {
        res[key] = $obj.attr(formModulePrefix + key) || "";
    });
    // 返回结果
    return isArray ? res : res[attrs];
}

/**
 * 用于操作表单数据项的配置缓存
 * 新增、编辑: dataConfig(code, opts)
 * 获取单个配置： dataConfig(code)
 * 获取全部配置：dataConfig()
 * 删除：dataConfig(code, false)
 * @param  {String}         code [要操作的配置变量名]
 * @param  {Object/Boolean} opts [操作数据]
 * @return {[type]}              [description]
 */
export function dataConfig(code, opts) {
    // 获得所有配置
    let configs = UE.plugins[pluginName].dataConfigs;
    // 获取全部配置项
    if (M.isNull(code)) return configs;
    // 如果只存在第一个参数 用于获取配置项
    if (M.isNull(opts)) {
        return configs[code];
    }
    // 如果为对象 用于更新数据
    else if (M.isObject(opts)) {
        // 将新的数据设置到缓存中
        UE.plugins[pluginName].dataConfigs[code] = M.clone(opts);
    }
    // 如果等于 false 用于删除
    else if (opts === false) {
        delete UE.plugins[pluginName].dataConfigs[code];
    }
}


/**
 * 注册一个表单页vue组件
 * @param  {Object}  page        [表单页对象]
 * @param  {Stringg} formStatus  [表单状态：edit(编辑)、readonly(只读)]
 * @return {Object}              [表单页Vue组件 通过formPage+页的id 调用]
 */
export function registerFormPage(page, formStatus = 'edit') {
	console.log(page)
    if (page) {
        // console.log(JSON.parse(JSON.stringify(page)))
        // console.log(formStatus)
        // 组件名称
        let name = pluginName + page.id;

        // 表单保存结果数据
        let templateResult = page.templateResult,
            // 表单页数据模型
            templatePageDataModel = page.templatePageDataModel,
            // 表单数据
            formObj = {},
            // 表单页配置
            config = {},
            // 校验状态
            fromVerify = {},
            // 主容器class
            classes = [
                // 表单状态
                'form-' + formStatus
            ].join(" "),
            // 获得所有设计DOM
            $formPage = $('<div id="form_body" class="' + classes + '">' + page.templatePageContent + '</div>');

        // 如果数据模型存在
        if (templatePageDataModel) {
            // 转换成对象
            templatePageDataModel = JSON.parse(templatePageDataModel);
            // 如果之前存在数据
            if (templateResult) {
                // 转换之前录入数据成对象
                templateResult = JSON.parse(templateResult);
                // 根据数据模型 处理所有数据
                M.each(templatePageDataModel, (value, key) => {
                    // 获得已经录入的数据
                    let retValue = templateResult[key] || "";
                    // 如果存在数据
                    formObj[key] = M.isNull(retValue) ? (value || "") : retValue;
                });
            } else {
                formObj = templatePageDataModel;
            }
        }

        // 如果表单页的配置存在
        if (page.config) {
            // 转换配置项
            config = JSON.parse(page.config);
            // 初始化校验功能
            fromVerify = initFromVerify(config);
            // 将表单设计好的DOM 进行二次渲染
            renderFormPage($formPage, formObj, config);
        }

        // console.log(JSON.parse(JSON.stringify(formObj)))
        // console.log(JSON.parse(JSON.stringify(page)))
        // console.log(JSON.stringify(config, null, 4))
        console.log($formPage)
        // 注册
        Vue.component(name, {
            // 名称
            name,
            data() {
                return {
                    // 整个表单页的数据
                    formObj,
                    // 表单页包含的所有元数据的配置
                    config,
                    // 表单状态 控制显示方式
                    formStatus,
                    // 校验通过状态及提示信息
                    fromVerify,
                    // 校验失败的项目
                    fromVerifyError: {}
                }
            },
            computed: {
                // 是否编辑
                isEdit() {
                    return this.formStatus === 'edit';
                },
                // 是否为只读
                isReadonly() {
                    return this.formStatus === 'readonly';
                },
            },
            watch: {
                // 观察状态
                fromVerify: {
                    handler(val, oldVal) {
                        this.fromVerifyError = this.getFromVerifyError(val);
                    },
                    deep: true
                }
            },
            template: $formPage.prop("outerHTML"),
            // template: $formPage.prop("innerHTML"),
            mixins: formModulesMixins,
            methods: {
                // 获取表单填写数据
                getFormObj() {
                    return this.formObj;
                },
                // 校验表单
                verifyFormObj() {
                    return verifyForm(this.formObj, this.config, this.fromVerify);
                },
                // 获得校验错误项
                getFromVerifyError() {
                    let ret = {};
                    // 遍历所有字段
                    M.each(this.fromVerify, (item, code) => {
                        if (item.status === false) ret[code] = true;
                    });
                    // console.log(JSON.stringify(ret, null, 4))
                    return ret;
                }
            },
            components: {
                ...components
            }
        })
    }
}

/**
 * 将设计好的表单DOM 进行二次渲染 用于美化或特殊组件处理
 * @param  {Object} $formPage [表单DOM对象]
 * @param  {Object} formObj   [表单数据]
 * @param  {Object} configs   [表单元数据配置项]
 */
function renderFormPage($formPage, formObj, configs) {
    // 高级自增表格
    let plusTables = [];
    // 遍历所有的元数据 对需要二次编译的组件进行二次编译
    M.each(configs, item => {
        // 获得元数据类型
        let type = item.type,
            // 获得二次渲染方法
            formTemp = formTempMap[type];
        // 如果类型为高级自增
        if (type === 'table_diy_plus') {
            plusTables.push(item);
        } else {
            // 如果方法存在
            if (formTemp) {
                // 执行渲染
                formTemp($formPage, formObj, item);
            }
        }
    });

    // 处理高级自增表格
    M.each(plusTables, item => {
        // 获得二次渲染方法
        let formTemp = formTempMap[item.type];
        // 如果方法存在
        if (formTemp) {
            // 执行渲染
            formTemp($formPage, formObj, item);
        }
    });
    // console.log(plusTables);
    // console.log($formPage)
    // console.log(formObj)
    // console.log(configs)
}

/**
 * 生成所有元数据的校验状态
 * @param  {Object} configs [元数据配置项]
 * @return {Object}         [校验状态 默认都为通过]
 */
function initFromVerify(configs) {
    var ret = {};
    M.each(configs, item => {
        let code = item.code;
        if (code) {
            ret[code] = {
                status: true,
                msg: "通过校验"
            }
        }
    });
    return ret;
}
/**
 * 校验表单数据
 * @param  {Object}  formObj    [表单录入数据]
 * @param  {Object}  configs    [表单配置项]
 * @param  {Object}  fromVerify [表单验证状态]
 * @return {Bealoon}            [通过为true 失败为false 默认为true]
 */
function verifyForm(formObj, configs, fromVerify) {
    // 返回结果
    let ret = true;
    // 打印参数
    // console.log(JSON.parse(JSON.stringify(formObj)))
    // console.log(JSON.parse(JSON.stringify(configs)))
    // console.log(JSON.parse(JSON.stringify(fromVerify)))
    // 遍历所有表单数据
    M.each(formObj, (value, code) => {
        // 获得配置项
        let config = configs[code] || {},
            // 元数据类型
            type = config.type,
            // 获取该类型对应的数据校验方法
            verifyFn = formVerifyFnMap[type];
        // 校验方法存在
        if (type && verifyFn) {
            // 进行校验
            let obj = verifyFn(code, value, config, formObj, fromVerify) || {};
            // 将返回值设置到校验状态缓存中
            fromVerify[code] = obj;
            // 如果有一个没有通过
            if (obj.status === false) ret = false;
        }
    });
    // console.log(JSON.parse(JSON.stringify(fromVerify)));
    return ret;
}

/**
 * 生成表单页的元数据及值域
 * @param  {Object} configs [所有元数据的配置项]
 * @return {Array}         [所有元数据信息]
 * 返回元数据对象字段：
 * dataElementName：元数据名称
 * dataElementCode：元数据变量名
 * dataElementType：元数据类型
 * parentDataId：父元素ID  不用传
 * dataValues：值域项目 如单选多选中的选项，包含：dataValueName(名称)、dataValue(值)
 * children：子级元数据 如自增型表格的每一列为一个元数据
 * otherElement：附属元数据  如单选多选中的附属输入框 也是一个元数据
 */
export function setDataElementsAndModel(configs) {
    // 存放元数据列表的结果
    let elements = [],
        // 存放表单页数据模型
        formModel = {};

    // 遍历所有配置项
    M.each(configs, (item, code) => {
        // 获得元数据类型
        let type = item.type;

        // 是否有父级元数据 如果有 暂时不做处理 如果没有 进行处理
        if (!item.parentId) {
            setFormAllType(item, formModel, elements);
        }

    });

    // 返回结果
    return {
        elements,
        formModel
    };
}

/**
 * 对所有类型的表单模块进行元数据和数据模型的处理
 * @param {Object} item      [表单组件模块]
 * @param {Object} formModel [表单数据模型]
 * @param {Array}  elements  [所有元数据列表]
 *
 */
export function setFormAllType(item, formModel, elements) {
    // 获得表单组件类型
    let type = item.type;
    // 如果为文本
    if (type == "text" || type == "textarea" || type == "date") {
        // 创建元数据信息及对应的数据模型
        setFormByText(formModel, elements, item);
    }
    // 如果为数字
    else if (type == "number" || type == "slider") {
        // 创建元数据信息及对应的数据模型
        setFormByNumber(formModel, elements, item);
    }
    // 如果为单选和多选
    else if (type == "radio" || type == "checkbox") {
        setFormByCheck(formModel, elements, item);
    }
    // 下拉菜单
    else if (type == "select") {
        setFormBySelect(formModel, elements, item);
    }
    // 城市选择 |  联级选择
    else if (type == "area" || type == "cascader") {
        setFormByArea(formModel, elements, item);
    }
    // 如果为矩形 包含：矩形单选、矩形多选、矩形文本
    else if (type == "table_radio" || type == "table_checkbox") {
        setFormByTableCheck(formModel, elements, item);
    }
    // 如果为矩形文本
    else if (type == "table_text") {
        setFormByTableText(formModel, elements, item);
    }
    // 自增型表格
    else if (type == "table_diy") {
        setFormByTableDiy(formModel, elements, item);
    }
    // 文件上传
    else if (type == "file_upload") {
        setFormByFileUpload(formModel, elements, item);
    }
    // 如果为特殊的高级自增表格 进行标记 会进行二次处理 防止子元数据还未处理
    else if (type == "table_diy_plus") {
        setFormByTableDiyPlus(formModel, elements, item);
    }
}

/**
 * 获取各种类型的元数据信息 以及 设置表单数据模型
 */
// 生成一个最简单的文本类型元数据
function getElInfoByBasic(name = "未命名", code, type = "text") {
    return {
        dataElementName: name,
        dataElementCode: code,
        dataElementType: type,
    }
}

/**
 * 文本、时间等基本元数据类型
 * @param {Object} formModel [表单数据模型]
 * @param {Array}  elements  [所有元数据列表]
 * @param {Object} item      [当前元数据配置项]
 */
function setFormByText(formModel, elements, item) {
    // 创建元数据信息
    let elem = getElInfoByBasic(item.name, item.code, item.type),
        // 获得配置项中的默认值 默认为空字符串
        value = item.value;

    // 设置数据模型
    formModel[item.code] = value;
    // 放入当前元数据
    elements.push(elem);
}

/**
 * 数字类型
 * @param {Object} formModel [表单数据模型]
 * @param {Array}  elements  [所有元数据列表]
 * @param {Object} item      [当前元数据配置项]
 */
function setFormByNumber(formModel, elements, item) {
    // 创建元数据信息
    let elem = getElInfoByBasic(item.name, item.code, item.type),
        // 获得配置项中的默认值 默认为空字符串
        value = item.value;

    // 设置数据模型
    formModel[item.code] = value;
    // 放入当前元数据
    elements.push(elem);
}

// 单选、多选
function setFormByCheck(formModel, elements, item) {
    // 创建元数据信息
    let elem = getElInfoByBasic(item.name, item.code, item.type),
        // 值域
        dataValues = [],
        // 附属元数据
        otherElement = [],
        // 存放附属输入框的数组
        labelInputs = item.labelInputs || [],
        // 默认选中项 单选默认为空字符串 多选默认为空数组
        labelChecked = item.labelChecked;

    // 遍历
    M.each(item.labels, label => {
        // 获得选项变量
        let labelCode = label.code;
        // 如果当前的选项变量存在于附属输入框中
        if (M.includes(labelInputs, labelCode)) {
            // 元数据变量名
            let code = item.code + "$" + labelCode + "$other",
                // 生成附属输入框的元数据信息
                ortherElem = getElInfoByBasic(label.name + "-补充", code);

            // 插入附属的元数据
            otherElement.push(ortherElem);
            // 设置附属输入框的数据模型
            formModel[code] = "";
        }
        // 设置每一个值域
        dataValues.push({
            // 值域名称
            dataValueName: label.name,
            // 值域变量
            dataValue: labelCode
        });
    });
    // 设置值域列表及附属元数据列表
    elem.dataValues = dataValues;
    elem.otherElement = otherElement;

    // 设置数据模型
    formModel[item.code] = labelChecked;
    // 放入当前元数据
    elements.push(elem);
}

// 下拉菜单
function setFormBySelect(formModel, elements, item) {
    // 创建元数据信息
    let elem = getElInfoByBasic(item.name, item.code, item.type),
        // 值域
        dataValues = [],
        // 默认选中项
        optionSelected = item.optionSelected;

    // 遍历
    M.each(item.options, label => {
        // 设置每一个值域
        dataValues.push({
            // 值域名称
            dataValueName: label.name,
            // 值域变量
            dataValue: label.code
        });
    });
    // 设置值域列表及附属元数据列表
    elem.dataValues = dataValues;

    // 设置数据模型
    formModel[item.code] = optionSelected;
    // 放入当前元数据
    elements.push(elem);
}

// 城市选择
function setFormByArea(formModel, elements, item) {
    // 创建元数据信息
    let elem = getElInfoByBasic(item.name, item.code, item.type);
    // 设置数据模型
    formModel[item.code] = [];
    // 放入当前元数据
    elements.push(elem);
}

// 矩形单选、矩形多选
function setFormByTableCheck(formModel, elements, item) {
    // 配置中的行
    let rows = item.rows,
        // 配置中的项目
        labels = item.labels,
        // 表格元数据变量
        code = item.code,
        // 类型是否为多选
        isCheckbox = (item.type === "table_checkbox"),
        // 创建表格元数据
        elem = getElInfoByBasic(item.name, code, item.type),
        // 元数据数据模型 数据格式为对象
        elemModel = {},
        // 存放所有子元数据
        children = [],
        // 存放子元数据值域
        dataValues = [];

    // 遍历列 创建值域
    M.each(labels, label => {
        // 设置每一个值域
        dataValues.push({
            // 值域名称
            dataValueName: label.name,
            // 值域变量
            dataValue: label.code
        });
    });

    // 遍历行 每一行是一个元数据
    M.each(rows, row => {
        // 生成当前行的元数据变量
        let rowCode = code + "$" + row.code,
            // 元数据类型
            rowType = isCheckbox ? "checkbox" : "radio",
            // 创建元数据
            childElem = getElInfoByBasic(row.name, rowCode, rowType);

        // 设置值域列表
        childElem.dataValues = dataValues;
        // 设置子元数据的数据模型
        elemModel[rowCode] = isCheckbox ? [] : "";
        // 放入当前子元数据
        children.push(childElem);
    });

    // 设置数据模型
    formModel[code] = elemModel;
    // 放入子元数据列表
    elem.children = children;
    // 放入当前元数据
    elements.push(elem);
}

// 矩形文本
function setFormByTableText(formModel, elements, item) {
    // 配置中的行
    let rows = item.rows,
        // 配置中的项目
        labels = item.labels,
        // 表格元数据变量
        code = item.code,
        // 创建表格元数据
        elem = getElInfoByBasic(item.name, code, item.type),
        // 元数据数据模型 数据格式为对象
        elemModel = {},
        // 存放所有子元数据
        children = [];

    // 遍历行
    M.each(rows, row => {
        // 遍历列 每一行中的每一列都是一个元数据
        M.each(labels, label => {
            // 生成当前列的元数据变量
            let labelCode = code + "$" + row.code + "$" + label.code,
                // 当前元数据的名称
                labelName = row.name + "_" + label.name,
                // 创建子元数据 类型为text
                childElem = getElInfoByBasic(labelName, labelCode);

            // 设置子元数据的数据模型
            elemModel[labelCode] = "";
            // 放入当前子元数据
            children.push(childElem);
        });
    });

    // 设置数据模型
    formModel[code] = elemModel;
    // 放入子元数据列表
    elem.children = children;
    // 放入当前元数据
    elements.push(elem);
}
// 自增表格
function setFormByTableDiy(formModel, elements, item) {
    // 配置中的行
    let rows = item.rows,
        // 配置中的项目
        labels = item.cols,
        // 表格元数据变量
        code = item.code,
        // 创建表格元数据
        elem = getElInfoByBasic(item.name, code, item.type),
        // 元数据数据模型 数据格式为数组对象
        elemModel = [],
        // 存放所有子元数据
        children = [];

    // 遍历行
    for (let i = 0; i < rows; i++) {
        // 当前行数据模型
        let rowModel = {};
        // 遍历列 每一行中的每一列都是一个元数据
        M.each(labels, label => {
            // 生成当前列的元数据变量
            let labelCode = code + "$" + label.code;
            // 如果为第一行 创建列的变量
            if (i === 0) {
                // 创建子元数据 类型为text
                let childElem = getElInfoByBasic(label.name, labelCode);
                // 放入当前子元数据
                children.push(childElem);
            }
            // 设置当前行当前列的数据
            rowModel[labelCode] = "";
        });
        // 放入当前行数据模型
        elemModel.push(rowModel);
    }

    // 设置数据模型
    formModel[code] = elemModel;
    // 放入子元数据列表
    elem.children = children;
    // 放入当前元数据
    elements.push(elem);
}

/**
 * 文本、时间等基本元数据类型
 * @param {Object} formModel [表单数据模型]
 * @param {Array}  elements  [所有元数据列表]
 * @param {Object} item      [当前元数据配置项]
 */
function setFormByFileUpload(formModel, elements, item) {
    // 创建元数据信息
    let elem = getElInfoByBasic(item.name, item.code, item.type);
    // 设置数据模型
    formModel[item.code] = [];
    // 放入当前元数据
    elements.push(elem);
}

/**
 * 高级自增类型
 * @param {Object} formModel [表单数据模型]
 * @param {Array}  elements  [所有元数据列表]
 * @param {Object} item      [高级自增表格]
 */
function setFormByTableDiyPlus(formModel, elements, item) {
    // 子元数据集合
    let itemElements = [],
        // 数据模型
        itemModel = {},
        // 创建元数据信息
        elem = getElInfoByBasic(item.name, item.code, item.type);

    // 遍历所有子集 进行设置 注意这里传入的时临时空变量 而不是整个form的元数据和数据模型
    M.each(item.subConfigs, list => {
        // 调用设置所有类型的方法
        if (list.type) {
            setFormAllType(list, itemModel, itemElements);
        }
    });

    // 设置子元数据
    elem.children = itemElements;

    // 设置数据模型
    formModel[item.code] = [itemModel];
    // 放入当前元数据
    elements.push(elem);

    console.log(item);
    console.log(elements)
    console.log(formModel)
}
