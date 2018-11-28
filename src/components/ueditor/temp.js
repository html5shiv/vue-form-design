// 用于高级自增表格中单选。多选类型的二次渲染
function tableDiyPlusHandleCheck($item, code) {
    // 获取选择框name值
    let itemName = $item.attr('name');
    // 处理选择框绑定的Name值
    $item.attr("name", "");
    // 重新设置他的name
    $item.attr("v-bind:name", "'" + code + "&'+plusIndex" + "+'$" + itemName + "'");
}



// 输出二次渲染方法
export default {
    // 城市选择
    area($form, formObj, opts) {
        // 元数据ID
        let code = opts.code,
            // 获得元数据DOM对象
            $el = $form.find("#" + opts.code),
            // 输入框宽度
            width = M.toNumber(opts.width),
            // 上传组件
            $select = $('\
                <al-cascader\
                    v-if="isEdit"\
                    v-model="formObj.'+opts.code+'"\
                    v-bind:placeholder="\''+opts.placeholder+'\'"\
                    v-bind:level="\''+opts.level+'\'"\
                    data-type="name" />\
            ');

        // 处理宽度
        width = M.isNumber(width) && width >= 0 ? width : 300;

        // 设置高度
        $select.css({
            width: width + opts.widthUnit,
        });

        // 设置新的组件
        $el.find("select").replaceWith($select);
        console.log($el.get(0));
        console.log($select.get(0));
        console.log(JSON.parse(JSON.stringify(opts)))
    },
    // 联级选择
    cascader($form, formObj, opts) {
        // 元数据ID
        let code = opts.code,
            // 获得元数据DOM对象
            $el = $form.find("#" + opts.code),
            // 输入框宽度
            width = M.toNumber(opts.width),
            // 上传组件
            $select = $('\
                <cascader\
                    v-if="isEdit"\
                    v-model="formObj.'+opts.code+'"\
                    v-bind:data="config.'+opts.code+'.options"\
                    placeholder="'+opts.placeholder+'"\
                    clearable />\
            ');

        // 处理宽度
        width = M.isNumber(width) && width >= 0 ? width : 300;

        // 设置高度
        $select.css({
            width: width + opts.widthUnit,
        });

        // 设置新的组件
        $el.find("select").replaceWith($select);
        // console.log($el.get(0));
        // console.log($select.get(0));
        // console.log(JSON.parse(JSON.stringify(opts)))
    },
    // 联级选择
    select($form, formObj, opts) {
        // 元数据ID
        let code = opts.code,
            // 获得元数据DOM对象
            $el = $form.find("#" + opts.code),
            // 输入框宽度
            width = M.toNumber(opts.width),
            // 上传组件
            $select = $('\
                <i-select\
                    v-if="isEdit"\
                    v-model="formObj.'+opts.code+'"\
                    placeholder="'+opts.placeholder+'"\
                    not-found-text="'+opts.notFoundText+'"\
                    clearable filterable >\
                    <i-option v-for="item in config.'+opts.code+'.options" :value="item.code" :key="item.code">{{ item.name }}</i-option>\
                </i-select>\
            ');

        // 处理宽度
        width = M.isNumber(width) && width >= 0 ? width : 300;

        // 设置高度
        $select.css({
            width: width + opts.widthUnit,
        });

        // 设置新的组件
        $el.find("select").replaceWith($select);
        // console.log($el.get(0));
        // console.log($select.get(0));
        // console.log(JSON.parse(JSON.stringify(opts)))
    },
    // 文件上传
    file_upload($form, formObj, opts) {
        // 元数据ID
        let code = opts.code,
            // 获得元数据DOM对象
            $el = $form.find("#" + opts.code),
            // 上传组件
            $btn = $('\
                <dch-upload\
                    v-model="formObj.'+code+'"\
                    v-bind:placeholder="\''+opts.placeholder+'\'"\
                    v-bind:max="'+opts.max+'"\
                    v-bind:max-size="'+opts.maxSize+'"\
                    v-on:file-change="handleFileUploadChange" >\
                </dch-upload>\
            ');

        // 设置新的上传组件
        $el.html($btn);
        // console.log($el.get(0));
        // console.log($btn.get(0));
        // console.log(JSON.parse(JSON.stringify(opts)))
    },
    // 数字
    number($form, formObj, opts) {
        // 元数据ID
        let code = opts.code,
            // 获得元数据DOM对象
            $el = $form.find("#" + opts.code),
            // 输入框宽度
            width = M.toNumber(opts.width),
            // 输入框高度
            height = M.toNumber(opts.height),
            // 上传组件
            $ipt = $('\
                <input-number\
                    v-if="isEdit"\
                    v-model="formObj.'+opts.code+'"\
                    v-bind:max="'+opts.max+'"\
                    v-bind:min="'+opts.min+'" >\
                </input-number>\
            ');

        // 处理宽度
        width = M.isNumber(width) && width >= 0 ? width : 200;
        // 处理高度
        height = M.isNumber(height) && height >= 0 ? height : 30;

        // 设置高度
        $ipt.css({
            width: width + opts.widthUnit,
            height: height
        });
        // 设置新的上传组件
        $el.find("input").replaceWith($ipt);
        //console.log($el.get(0));
    },
    // Slider 滑块
    slider($form, formObj, opts) {
        // 元数据ID
        let code = opts.code,
            // 获得元数据DOM对象
            $el = $form.find("#" + opts.code),
            // 上传组件
            $slid = $('\
                <p style="width:'+opts.width+'px;"><slider\
                    v-model="formObj.'+opts.code+'"\
                    show-input>\
                </slider></p>\
            ');
        // 设置新的上传组件
        $el.html($slid);
        //console.log($el.get(0));
    },
    // 城市选择
    date($form, formObj, opts) {
        // 元数据ID
        let code = opts.code,
            // 获得元数据DOM对象
            $el = $form.find("#" + opts.code),
            // 日期类型
            type = opts.dateType || 'date',
            // 各种类型的格式化
            format = {
                date: "yyyy-MM-dd",
                daterange: "yyyy-MM-dd",
                datetime: "yyyy-MM-dd HH:mm:ss",
                datetimerange: "yyyy-MM-dd HH:mm:ss",
                year: "yyyy",
                month: "M"
            },
            // 提示信息
            placeholder = opts.placeholder || "选择日期",
            // 输入框宽度
            width = M.toNumber(opts.width),
            // 上传组件
            $ipt = $('\
                <date-picker \
                    v-if="isEdit"\
                    v-bind:value="formObj.'+opts.code+'"\
                    placeholder="'+placeholder+'"\
                    format="'+format[type]+'"\
                    v-on:on-change="formObj.'+opts.code+'=$event"\
                    type="'+type+'"/>\
            ');


        // 处理宽度
        width = M.isNumber(width) && width >= 0 ? width : 200;

        // 设置高度
        $ipt.css({ width: width + opts.widthUnit });
        // 设置新的上传组件
        $el.find("input").replaceWith($ipt);
        //console.log($el.get(0));
    },
    // 高级自增表格的
    table_diy_plus($form, formObj, opts) {
        // 元数据ID
        let code = opts.code,
            // 获得元数据DOM对象
            $el = $form.find("#" + opts.code),
            // 判断是否为二级高级自增
            isSubPlusTable = $el.attr('level') === 'level-2',
            // 自增内容
            $body = $el.find('> table > .diy-plus-body'),
            // 将子元素中 绑定formObj 改成 diyRow
            newHtml = ($body.html() || '').replace(/formObj/g, 'diyRow'),
            // 获得自增内容中的行数
            bodyRows = $body.find('tr').size() || 1,
            // 头部行数
            headRows = $el.find('.diy-plus-head tr').size() || 1,
            addText = opts.addText || "添加",
            removeText = opts.removeText || "删除",
            // 行数据增加和删除传入的参数
            params = isSubPlusTable ? 'config.'+code+', diyRow.'+code+', plusIndex' : 'config.'+code+', formObj.'+code+', plusIndex',
            // 操作按钮
            headSub = '<td v-if="isEdit" class="diy-plus-actions" rowspan="'+headRows+'">操作</td>',
            bodySub = '<td v-if="isEdit" class="diy-plus-actions" rowspan="'+bodyRows+'">\
                           <i-button v-on:click="tableDiyPlusAddRow('+params+')" type="info" size="small">'+addText+'</i-button>\
                           <i-button v-on:click="tableDiyPlusRemoveRow('+params+')" type="error" size="small">'+removeText+'</i-button>\
                       </td>';

        // 如果为二级高级自增
        if(isSubPlusTable) {
            // 将变量改成二级
            $body.attr('v-for', '(diyRow2, plusIndex) in diyRow.'+code+'');
            newHtml = newHtml.replace(/diyRow/g, 'diyRow2');
        }
        // 放入处理后的HTML
        $body.html(newHtml);
        // 放入操作按钮
        $body.find("tr").first().append(bodySub);
        $el.find('> table > .diy-plus-head tr').first().append(headSub);

        // 处理输入框的name名称 防止在单选 多选中出错
        $body.find('input[type="radio"]').each((i,item) => {
            let $item = $(item);
            // 处理选择框
            tableDiyPlusHandleCheck($item, code);
            // console.log(item)
        });
        $body.find('input[type="checkbox"]').each((i,item) => {
            let $item = $(item);
            // 处理选择框
            tableDiyPlusHandleCheck($item, code);
            // console.log(item)
        });
        // console.log($body.get(0));
        // console.log($el.get(0))
    }
}