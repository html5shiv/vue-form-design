/*
 * Mcake-core (Mcake框架核心代码)
 * @Author: 淡淡的月饼
 * @Create Time:   2016-09-12
 * @Update Time:   2017-6-20
 */
;(function(win,undefined){
    //重要变量声明
    var document = win.document,   // document对象
        location = win.location,   // 浏览器新窗口
        navigator = win.navigator, // 浏览器信息
        // 根目录 用于存放document对象
        rootMcake,
        // 匹配单一的HTML标签 比如匹配 <img /> <p></p>  不匹配 <img src=""/> <p>123</p>
        regSingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
        // 判断是否是一个简单的选择器 一个（字母、数组、下划线、-）
        regSimpleSelector = /^[\w-]*$/,
        // 闭合HTML单标签
        regTagExpander = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
        // 取出HTML字符串中的第一个标签
        regFirstTag = /^\s*<(\w+|!)[^>]*>/,
        // 处理URL字符串
        regUrl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,
        // 用于在将HTML字符串转成DOM时 创建临时容器
        table = document.createElement('table'),
        tableRow = document.createElement('tr'),
        // 指定特殊元素的 容器
        htmlWrap = {
          'tr': document.createElement('tbody'),
          'tbody': table,
          'thead': table,
          'tfoot': table,
          'td': tableRow,
          'th': tableRow,
          // 除了上面指定的，其他所有元素的容器都是 div
          '*': document.createElement('div')
        },
        // 当前版本
        version = "1.2.0",
        // 将内置对象的原型链缓存在局部变量, 方便快速调用
        ArrProto = Array.prototype,      // 数组的原型链
        ObjProto = Object.prototype,     // 对象的原型链
        FuncProto = Function.prototype,  // 函数的原型链
        // 空数组对象 用于获得一些数组的方法
        emptyArray = [],
        // 查找数组某个值方法
        arr_indexOf = emptyArray.indexOf,
        // 获得arr_push方法
        arr_push = emptyArray.push,
        // 数组迭代器
        arr_forEach = emptyArray.forEach,
        // 数组映射迭代器
        arr_map = emptyArray.map,
        // 遍历数组 筛选符合条件的元素
        arr_filter = emptyArray.filter,
        // 截取数组中的某些元素
        arr_slice = emptyArray.slice,
        // 删除数组中从索引开始的N项元素
        arr_splice = emptyArray.splice,
        // 查询某个值是否存在于数组
        arr_includes = emptyArray.includes,
        // 查询字符串中是否存在某个值
        str_includes = version.includes,
        str_indexOf = version.indexOf,
        // 储存常见类型的 typeof 的哈希表
        // Boolean Number String Function Array Date RegExp Object Error Symbol
        typeClass = {},
        obj_toString = typeClass.toString, //对象类型名称转字符串
        obj_has = typeClass.hasOwnProperty, //遍历对象上是否有某个属性 该属性不包括原型链上的属性
        obj_create = Object.create,     //用于创建一个对象
        obj_keys = Object.keys,         //获得对象key名称 返回数组
        Ctor = function(){}, //创建一个用于设置prototype的公共函数对象 在create中使用
        // 文件下载相关配置
        downloadConfig = {
            // 文件类型名称
            fileType: {
                "txt": "text/plain",
                "json": "application/json",
                "xml": "application/xml",
                "excel": "application/vnd.ms-excel",
                "xls": "application/vnd.ms-xls",
                "word": "application/vnd.ms-word",
                "doc": "application/vnd.ms-doc",
                "sql": "application/sql",
                "png": "image/png"
            }
        };


    //////////////////////////
    //-----内部私有函数-----//
    //////////////////////////

    //递归通用函数 将数组展开
    //第一个参数(arr)：操作的数组
    //第二个参数(shallow)：是否只展开一层 如果为true则是
    //第三个参数(strict)：是否采用严格方式展开 strict === true，通常和 shallow === true 配合使用
    //表示只展开一层，但是不保存非数组元素（即无法展开的基础类型）
    //_flat([[1, 2], 3, 4], true, true) => [1, 2]
    //_flat([[1, 2], 3, 4], false, true) = > []
    //第四个参数(startIndex)：从 数组的 的第几项开始展开
    var _flat = function(arr,shallow,strict,startIndex){
            //返回结果 和 返回结果的下标
            var ret = [],idx = 0;
            //遍历操作数组
            for(var i = startIndex || 0,length = Mcake.size(arr);i < length;i++){
                //获得当前遍历的内容
                var value = arr[i];

                //如果当前内容是数组
                if(Mcake.likeArray(value) && (Mcake.isArray(value) || Mcake.isArguments(value))){
                    //如果 shallow 不为true 则继续深度展开
                    if(!shallow)
                        value = _flat(value,shallow,strict);

                    // 递归展开到最后一层（没有嵌套的数组了） 或者 (shallow === true) => 只展开一层
                    // value 值肯定是一个数组
                    var j = 0, len = value.length;

                    // 将 value 数组的元素添加到 output 数组中
                    while (j < len) {
                        ret[idx++] = value[j++];
                    }
                }
                //当 strict 为false 内容又不是数组
                else if (!strict) {
                    ret[idx++] = value;
                }
            }
            return ret;
        },
        //创建 reduce 和 reduceRight 的私有方法
        _createReduce = function(isReverse){
            //迭代器函数
            function iterator(obj, callback, memo, keys, index, length) {
                //循环数组或对象
                for (; index >= 0 && index < length; index += isReverse) {
                    var currentKey = keys ? keys[index] : index;
                    // 迭代，返回值供下次迭代调用
                    memo = callback(memo, obj[currentKey], currentKey, obj);
                }
                // 每次迭代返回值，供下次迭代调用
                return memo;
            }
            //返回方法函数
            //obj：数组或者对象
            //callback：迭代方法函数
            //memo：初始值 如果有，则从 obj 第一个元素开始迭代 如果没有，则从 obj 第二个元素开始迭代，将第一个元素作为初始值
            //context：为迭代函数中的 this 指向
            return function(obj, callback, memo, context) {
                //处理回调函数
                callback = _optimizeCb(callback, context);
                //获得对象的键
                var keys = !Mcake.likeArray(obj) && Mcake.keys(obj),
                    //获得对象或数组的长度
                    length = (keys || obj).length,
                    //判断是否需要倒序处理
                    index = isReverse > 0 ? 0 : length - 1;

                // 如果传入的参数为3个 也就是没有指定初始值 则把第一个元素指定为初始值
                if (arguments.length < 3) {
                    memo = obj[keys ? keys[index] : index];
                    // 根据 isReverse 确定是向左还是向右遍历
                    index += isReverse;
                 }
                //返回方法
                return iterator(obj, callback, memo, keys, index, length);
            };
        },
        //数组排序算法
        //第一、二参数为比较对象
        //第三个参数(isReverse):是否倒序 当为true时进行倒序 默认为正序
        _sortAlgorithm = function(a,b,isReverse){
            // isReverse 排序规则(正序或反序) -1时为正序 1 时为倒序
            return (a === b ? 0 : a > b ? 1 : -1) * (isReverse === true ? -1 : 1);
        },
        //通用回调函数
        _optimizeCb = function(func, context) {
            if (context === void 0) return func;
            //返回回调函数
            return function() {
                return func.apply(context, arguments);
            };
        },
        /**
         * 检测两个值是否全等
         */
        //深度比较两个数据 主要是对数组和对象的比较
        _deepEqual = function(a, b, aStack, bStack){
            //下面则是原始数据类型判断的最后一步，根据[[Class]]值进行判断，这种判断能覆盖原始数据类型未被覆盖到的所有剩余情况，首先取得a的[[Class]]并和b的[[Class]]先比较一下：
            var className = Mcake.type(a);
            if (className !== Mcake.type(b)) return false;
            //然后通过一个switch (className)语句进行分类判断
            switch (className) {
                //字符串和正则 它们的判断方式一样，统一转换为字符串后进行严格相等的判断：
                case 'regexp':
                case 'string':
                    return '' + a === '' + b;
                //数字类型 先考虑特殊情况NaN，a和b都是NaN时它们会不等，但应该把它们看做相等的，因为NaN总是表现出一样的性质，解决办法是判断a和b是否分别为NaN。最后再判断一次相等性，同时剔除-0的情况，这和eq方法刚开始的逻辑似乎重复了，不知道是不是：
                case 'number':
                    if (+a !== +a) return +b !== +b;
                    return +a === 0 ? 1 / +a === 1 / b : +a === +b;
                //时间和布尔值 直接调用===
                case 'date':
                case 'boolean':
                    return +a === +b;
                //symbol类型 新增的基本数据类型
                case 'symbol':
                    return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
            }
            //判断是否为数组
            var areArrays = className === 'array';
            //如果不是数组
            if (!areArrays) {
                //先确定是否为对象 如果有一个不是 直接返回false
                if (typeof a != 'object' || typeof b != 'object') return false;
                //先要排除一种情况，那就是如果是对象的话，可以先比较它们的构造函数，构造函数不同的话，即使对象内的值相同，两个对象也是不同的
                var aCtor = a.constructor, bCtor = b.constructor;
                if (aCtor !== bCtor && !(Mcake.isFunction(aCtor) && aCtor instanceof aCtor &&
                Mcake.isFunction(bCtor) && bCtor instanceof bCtor) && ('constructor' in a && 'constructor' in b)) {
                    return false;
                }
            }
            //通过构造函数的比较后，即进入具体包含值的比较，后面紧跟的while循环在第一次遍历的时候是不会执行的。后面将a和b分别压入堆栈，堆栈的作用是按照顺序存放比较对象的元素值，并递归调用eq方法自身。对于a或者b来说，如果某个子元素仍然是对象或者数组，则会将这个子元素继续拆分，直到全部拆分为eq方法前半部分所写的，可以比较的“基本单元”为止，一旦有任何一个元素不相等，便会触发一连串的return false。至于数组和对象的区别并不是太重要
            aStack = aStack || [];
            bStack = bStack || [];
            var length = aStack.length;
            while (length--) {
                if (aStack[length] === a) return bStack[length] === b;
            }

            // 将第一个对象添加到遍历的对象的堆栈中。
            aStack.push(a);
            bStack.push(b);

            // 递归比较对象和数组
            if (areArrays) {
                // 比较数组的长度，以确定是否有必要进行比较深入的比较。
                length = a.length;
                if (length !== b.length) return false;
                // 深入比较的内容，忽略非数字属性。
                while (length--) {
                    if(!_equal(a[length], b[length], aStack, bStack)) return false;
                }
            }
            else {
                var keys = Mcake.keys(a), key;
                length = keys.length;
                //确保两个对象在比较深度相等之前都包含相同数量的属性。
                if (Mcake.keys(b).length !== length) return false;
                while (length--) {
                    key = keys[length];
                    if (!(Mcake.has(b, key) && _equal(a[key], b[key], aStack, bStack))) return false;
                }
            }
            aStack.pop();
            bStack.pop();
            return true;
        },
        //判断两个数据是否相等
        _equal = function(a,b,aStack,bStack){
            // 检查两个简单数据类型的值是否相等
            // 对于复合数据类型, 如果它们来自同一个引用, 则认为其相等
            // 如果被比较的值其中包含0, 则检查另一个值是否为-0, 因为 0 === -0 是成立的
            // 而 1 / 0 == 1 / -0 是不成立的(1 / 0值为Infinity, 1 / -0值为-Infinity, 而Infinity不等于-Infinity)
            if (a === b) return a !== 0 || 1 / a === 1 / b;
            //如果两个值中有一个为空 则返回false
            if (a == null || b == null) return false;
            //如果为NaN 和自身是不相等的
            if (a !== a) return b !== b;
            //如果a和b都不是对象 返回false
            var type = typeof a;
            if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
            //对 对象类型的数据进行深入的比较
            return _deepEqual(a, b, aStack, bStack);
        },
        /**
         * 对URL函数的一些内部函数
         */
        /**
         * 获得URL地址上所有的参数和值 包括URL本身
         * @param  {[String]} urlStr [可选参数，传入URL字符串]
         * @return {[Object]}        [返回一个JSON对象]
         */
        _getUrl = function(urlStr) {
            //返回结果/参数前的字段
            var ret = {};
            //获得URL全部内容 如果传入了url字符串 则以传入的url为内容 否则以当前页面URL为内容
            var context = urlStr || window.location.href,
                urlArr = context.split("?");
            //判读url中"?"符后的参数是否存在
            if(urlArr.length === 2){
                //将所有参数分割成数组
                var paramArr = urlArr[1].split("&");
                //获得所有参数的键/值
                Mcake.each(paramArr,function(val,i){
                    //获得每一个参数
                    var param = val.split("=");
                    //这里不用unescape() 因为中文参数会乱码
                    ret[param[0]]=decodeURI(param[1]);
                });
                //返回?前的路径
                ret.href = urlArr[0];
            }
            else{
                //返回全部URL
                ret.href = context;
            }
            ret.context = context;

            return ret;
        },
        //设置URL参数
        //第一个参数：之前的URL JSON对象
        //第二个参数：需要增删改的参数的JSON对象
        //第三个参数：是否创建为新的
        _setUrl = function(oldUrlJson,paramJson,isCreate){
            //新的结果
            var ret = {};
            //如果传入的JSON为空 直接返回原链接
            if(Mcake.size(paramJson) === 0){
                ret = oldUrlJson;
            }
            else{
                //如果为新建一个url路径
                if(isCreate == true){
                    //生成新的URL JSON
                    ret.href = oldUrlJson.href;
                    //合并所有的参数到结果中
                    Mcake.extend(ret,paramJson);
                }
                else{
                    //查找是否存在
                    Mcake.extend(ret,oldUrlJson,paramJson);
                }
            }
            return _urlToStr(ret);
        },
        //将url JSON对象转换成字符串
        //第一个参数：传入URL JSON对象  转成URL字符串
        _urlToStr = function(urlJson){
            var param = [];
            for(var i in urlJson){
                //获得所有不为空的参数
                if(i != "href" && i != "context" && urlJson[i]){
                    param.push(i+"="+urlJson[i]);
                }
            }
            return urlJson.href+"?"+param.join("&");
        },
        //公共创建对象的方法
        //第一二个参数：指定的原型对象
        _baseCreate = function(prototype){
            //如果传入的参数不是对象 直接返回一个空对象
            if (!Mcake.isObject(prototype)) return {};
            //如果支持原生的obj_create
            if (obj_create) return obj_create(prototype);
            //否则通过空的构造函数创建一个对象
            Ctor.prototype = prototype;
            var ret = new Ctor;
            Ctor.prototype = null;
            return ret;
        },
        /**
         * 对cookie的内部操作函数
         */
        //获得Cookie数据中全部属性的键值
        _getCookie = function(){
            //结果
            var ret = {},
                //获得所有记录的键值
                cookieArr = document.cookie.split("; ");
            //遍历所有的键值
            Mcake.each(cookieArr,function (item){
                //分割键值
                var itemArr = item.split("="),
                    //cookie记录名称
                    itemName = itemArr[0];
                //设置记录到结果中
                if(itemName) ret[itemName] = itemArr[1] || "";
            });
            //返回结果
            return ret;
        },
        //设置cookie数据
        //第一个参数：可以为对象或数组
        //第二个参数：有效时间 可以为天数 比如1 也可以为时间对象 当为-1或过去时间对象时 用于删除
        _setCookie = function(obj,time){
            var setTime,               //对有效时间
                nowDate = new Date(),  //当前时间
                isArray = Mcake.isArray(obj);//判断当前对象是否为数组
            //判断传入的有效时间参数 类型 如果为时间对象
            if(Mcake.isDate(time)){
                setTime = time;
            }
            else{
                //判断时间天数是否为空 如果为空 默认为1天
                time = Mcake.isNull(time) ? 1 : Mcake.toNumber(time);
                //根据当前时间 进行计算有效时间
                nowDate.setDate(nowDate.getDate() + time);
                //获得设置的有效时间
                setTime = nowDate;
            };
            //遍历所有的参数
            Mcake.each(obj,function (value,key){
                //获得要设置的key 如果是数组 则将数组的值 作为key 否则默认为JSON数据的KEY
                key = isArray ? value : key;
                //写入cookie
                document.cookie = key + '='+value+';expires=' + setTime;
            });
        },
        //用于创建一个类数组的Mcake对象
        _M = function(dom,selector,context){
            dom = dom || [];
            //设置返回内容和选择器
            // dom.context = context || document;
            dom.selector = selector || "";
            dom.__proto__ = Mcake.fn;
            return dom;
        },
        //查询DOM函数 返回一个数组
        _query = function(elem,selector){
            //返回结果
            var found,
                //检测是否可能是ID选择器
                maybeID = selector[0] === "#",
                //检测是否可能是class选择器
                maybeClass = !maybeID && selector[0] === ".",
                //获取选择器的名字 比如"#box" 则 返回"box"
                onlyName = (maybeID || maybeClass) ? selector.slice(1) : selector,
                //判断是否是简单的选择器 比如"#box" 则通过 而"#box p" 则不通过
                isSimple = regSimpleSelector.test(onlyName);
            //如果是简单的id选择器
            if(Mcake.isDocument(elem) && isSimple && maybeID){
                //如果找到了对应ID的DOM元素 则返回存放DOM元素的数组 否则返回空数组
                return (found = elem.getElementById(onlyName)) ? [found] : [];
            }
            //如果传入的 elem是 DOm元素或者document
            else if(Mcake.isElement(elem) || Mcake.isDocument(elem)){
                //获取集合中所有的元素
                return arr_slice.call(
                    //如果是简单的 却不是ID 则尝试用class、tagName获取
                    (isSimple && !maybeID) ?
                        (
                            //是否为class 如果是 则用calss查找否则 用标签名查找
                            maybeClass ?
                                elem.getElementsByClassName(onlyName) :
                                elem.getElementsByTagName(onlyName)
                        ) :
                        elem.querySelectorAll(selector)
                );
            }
            //如果都不符合条件 返回空数组
            return [];
        },
        //创建HTML DOM 元素
        _createHtml = function(html,name,attrs){
            // dom:最终生成的DOM wrap:用来存放DOM的临时容器
            var dom, nodes, wrap;
            //如果是单标签 直接创建这个标签 并再次放入初始化函数中
            if (regSingleTag.test(html)){
                dom = Mcake(document.createElement(RegExp.$1));
            }
            else{
                //修正单标签  比如 "<div><p/></div>" 转换成 "<div><p></p></div>"
                if(html.replace) html = html.replace(regTagExpander,"<$1></$2>");
                //如果没有传入容器名字 给name取元素名 获得HTML字符串中第一个标签的名字
                if (name === undefined) name = regFirstTag.test(html) && RegExp.$1;
                //如果这个标签名不在设定的特殊容器变量中 则 默认为div
                if(!(name in htmlWrap)) name = "*";
                //创建容器
                wrap = htmlWrap[name];
                //创建DOM 强制转换成字符串
                wrap.innerHTML = html + "";
                //获得所有创建好的元素
                dom = Mcake.each(arr_slice.call(wrap.childNodes),function(){
                    wrap.removeChild(this);
                });
            }
            return dom;
        },
        //闭包函数 用于获得对象上某个key对应的值
        _property = function(key){
            return function(obj){
                return obj == null ? void 0 : obj[key];
            };
        },
        /**
         * 用于文件下载的相关函数
         */
        /**
         * 下载文件
         * @param  {[String]} fileName     [文件名]
         * @param  {[String]} fileTypeText [文件类型全称]
         * @param  {[String]} data         [下载数据字符串]
         *
         */
        _downloadFile = function(fileName, fileTypeText, data) {
            // 获取URL 函数
            var _getURL = function() {
                    return window.URL || window.webkitURL || window;
                },
                // 触发一个点击事件
                _click = function(node) {
                    var event = new MouseEvent("click");
                    node.dispatchEvent(event);
                },
                // blob对象
                blob,
                // 当前浏览器版本
                device = Mcake.device();

            // console.log(fileName);
            // console.log(fileTypeText);
            console.log(data);

            // 创建Blob实例 用于IE10+ 和 谷歌等其他浏览器下载
            if(window.Blob) {
                blob = new Blob([data], {type: fileTypeText + ";charset=utf-8"});
            }
            // 如果当前浏览器为IE
            if(device.ie) {
                // 如果为IE10+
                if(navigator.msSaveOrOpenBlob && blob) {
                    return navigator.msSaveOrOpenBlob(blob, fileName);
                }
                // 包括IE 9 以下的IE浏览器
                else {
                    var saveFrame = document.createElement("iframe");
                    if (saveFrame) {
                        saveFrame.style.display = "none";
                        document.body.appendChild(saveFrame);
                        saveFrame.contentDocument.open("txt/html", "replace");
                        saveFrame.contentDocument.write(data);
                        saveFrame.contentDocument.close();
                        saveFrame.focus();
                        saveFrame.contentDocument.execCommand("SaveAs", true, fileName);
                        document.body.removeChild(saveFrame);
                    }
                }

            } else {
                // 创建用于保存的a链接
                var saveLink = document.createElement("a"),
                    //下载链接
                    downloadUrl;
                // 插入元素
                saveLink.style.display = "none";
                document.body.appendChild(saveLink);
                // 如果支持 Blob 对象
                if(blob) {
                    console.log(blob)
                    downloadUrl = _getURL().createObjectURL(blob);
                    saveLink.href = downloadUrl;
                    saveLink.download = fileName;
                    _click(saveLink);
                }
                // 移除a链接
                document.body.removeChild(saveLink);
            }
        },
        /**
         * 获得下载文件的文件名
         * @param  {[String]} name [文件名]
         * @param  {[String]} type [文件类型]
         * @return {[String]}      [带文件后缀的文件名]
         */
        _getDownloadFileName = function(name, type) {
            // 判断是否为word文档
            var isWord = (type == "word" || type == "doc"),
                // 是否为excel表格
                isExcel = (type == "excel" || type == "xls"),
                //文件后缀名
                fileExt = isWord ? "doc" : isExcel ? "xls" : type;

            // 返回文件名
            return name + "." + fileExt;
        },
        /**
         * 处理 Excel 数据
         * @param  {[String]} tableDom [Excel表格table DOM字符串]
         * @return {[String]}          [用于保存的数据字符串]
         */
        _getDownloadExcel = function(tableDom) {
            return M.isString(tableDom) ? '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>xlsWorksheetName</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>' + tableDom + '</body></html>' : '';
        },
        /**
         * 打印日志
         * @param  {[String]} msg  [打印字符串]
         * @param  {[String]} type [打印类型：默认(console)、弹出(alert)、错误(error)]
         */
        _log = function(msg, type) {
            // 判断处理类型
            switch(type) {
                // 弹出信息
                case "alert":
                    alert(msg);
                    break;
                // 打印错误
                case "error":
                    throw new Error(msg);
                    break;
                // 打印日志
                default:
                    console.log(msg);
            }
        };




    //主函数 用于暴露接口
    var Mcake = function(selector,context){
        //内部初始化实例
        return new Mcake.fn.init(selector,context,rootMcake);
    }
    //原型方法和属性 主要针对实例
    Mcake.fn = Mcake.prototype = {
        constructor: Mcake,
        //构造对象
        init:function(selector,context,rootMcake){
            //存放DOM的数组、context:主体内容、selector:选择器
            var dom = [],context,selector,match;
            //如果传入的选择器为空
            if(Mcake.isNull(selector)) return _M();
            //如果为字符串
            else if(Mcake.isString(selector)){
                //去除前后空格
                selector = Mcake.trim(selector);
                //获得字符串长度
                var len = selector.length;
                //如果是HTML代码
                if(selector[0] === "<" && selector[len - 1] === ">" && len >= 3){
                    //将HTML字符串转换成DOM元素 并放入数组中
                    dom = _createHtml(selector);
                }
                //如果是选择器
                else{
                    dom = _query(document,selector);
                }
            }
            //如果为DOM对象
            else if(Mcake.isElement(selector)){
                dom[0] = selector;
            }
            //如果已经是Mcake实例了 直接返回
            else if(Mcake.isMcake(selector)){
                return selector;
            }
            //如果是数组 去除空的元素
            else if(Mcake.isArray(selector)){
                dom = Mcake.compactArray(selector);
            }

            return _M(dom,selector);
        },
        //实例的循环
        //回调函数第一个参数(value)：当前遍历元素  第二个参数(i)：索引
        each:function(callback){
            return Mcake.each(this,callback);
        },
        //对当前实例中每一个元素进行处理 最终返回一个新的Mcake实例
        map:function(callback){
            //获得返回结果
            var ret = Mcake.map(this,callback);
            //对返回数组进行扁平化处理 如果数组中包含数组 里面的元素将会被取出
            return Mcake(Mcake.flat(ret));
        },
        //查找DOM数组中的某一个元素
        //第一个参数(index)：元素的索引值 当为负数时 从后查找
        eq:function(index){
            //当前对象的长度
            var len = this.length,
                //如果index小于0  则用长度加上index 也就是从后开始
                i = (index < 0 ? len : 0) + index;
            //返回一个指定索引元素
            return this.slice(i,i+1);
        },
        //功能跟eq一致  只是返回的不是Mcake对象 而是DOM元素
        get:function(index){
            //如果索引为空 则返回当前所有元素的数组
            return index == null ? this.array() : (index < 0 ? this[this.length + index] : this[index]);
        },
        //返回实例中第一个元素
        first:function(){
            return this.eq(0);
        },
        //返回实例中最后一个元素
        last:function(){
            return this.eq(-1);
        },
        //将Mcake数组对象 转成 原生的数组
        array:function(){
            return arr_slice.apply(this);
        },
        //截取开始索引到结束索引的所有元素
        //返回一个Mcake实例对象
        slice:function(){
            // 直接数组的slice方法，并将结果用 $ 封装返回
            return Mcake(arr_slice.apply(this,arguments));
        },
        //查找元素
        find:function(selector){
            //返回结果、当前对象
            var ret,self = this;
            //如果传入的参数不是字符串 直接返回空
            if(!Mcake.isString(selector)){
                ret = Mcake();
            }
            //如果长度只有一个
            else if(this.length == 1){
                ret = Mcake(_query(this[0],selector));
            }
            else{
                ret = this.map(function(){
                    return _query(this,selector);
                });
            }
            return ret;
        },
        //从后面插入一个元素
        push:arr_push,
        attr:function(){console.log("attr")},
        children:function(){},
        parent:function(){},
        parents:function(){}
    };

    // 设置初始化构造函数的原型指向 主函数的原型 确保所有通过这个方法生成的实例 this 所指向的 仍然是 Mcake.fn(Mcake.prototype)
    Mcake.fn.init.prototype = Mcake.prototype;


    //////////////////////////
    //------核心函数--------//
    //////////////////////////

    /**
     * 核心-合并对象的方法
     * 用法一：Mcake.extend({abc:"abc"})/Mcake.fn.extend({abc:"abc"}) 将名为abc的属性或方法合并到Mcake 或 Mcake实例对象上
     * 用法二：Mcake.extend({},obj1,obj2) 将obj1和obj2合并到第一个新的对象上
     * 用法三：Mcake.extend(true,obj1,obj2)将obj1后面的所有对象 深度拷贝到obj1
     */
    Mcake.extend = Mcake.fn.extend = function(){
        // options(需要合并的对象)
        var src, copyIsArray, copy, name, options, clone,
            //操作目标对象 也就是第一个对象
            target = arguments[0] || {},
            //遍历开始索引
            i = 1,
            //参数的长度
            length = arguments.length,
            //是否递归
            deep = false;

        // target 是传入的第一个参数
        // 如果第一个参数是布尔类型，则表示是否要深递归，
        if (typeof target === "boolean") {
            deep = target;
            //如果第一个参数是布尔值 则将第二个参数作为操作目标对象
            target = arguments[1] || {};
            // 如果传了类型为 boolean 的第一个参数，i 则从 2 开始
            i = 2;
        }

        // 如果传入的第一个参数是 字符串或者其他
        if (typeof target !== "object"  && typeof target !== "function") {
            target = {};
        }

        // 如果参数的长度为 1 ，表示是 Mcake 静态方法
        if (length === i) {
            target = this;
            --i; // 0
        }

        // 可以传入多个复制源 i 是从 1或2 开始的
        for (; i < length; i++) {
            // 将每个源的属性全部复制到 target 上
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    // src 是源（即本身）的值
                    // copy 是即将要复制过去的值
                    src = target[name];
                    copy = options[name];

                    // 防止有环，例如 extend(true, target, {'target':target});
                    if (target === copy) {
                        continue;
                    }

                    // 这里是递归调用，最终都会到下面的 else if 分支
                    // isJson 用于测试是否为纯粹的对象
                    // 纯粹的对象指的是 通过 "{}" 或者 "new Object" 创建的
                    // 如果是深复制
                    if (deep && copy && (Mcake.isJson(copy) || (copyIsArray = Mcake.isArray(copy)))) {
                        // 数组
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && Mcake.isArray(src) ? src : [];
                            // 对象
                        } else {
                            clone = src && Mcake.isJson(src) ? src : {};
                        }

                        // 递归
                        target[name] = Mcake.extend(deep, clone, copy);

                        // 最终都会到这条分支
                        // 简单的值覆盖
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        // Return the modified object
        // 返回新的 target
        // 如果 i < length ，是直接返回没经过处理的 target，也就是 arguments[0]
        // 也就是如果不传需要覆盖的源，调用 $.extend 其实是增加 Mcake 的静态方法
        return target;
    };


    //////////////////////////
    //------基础函数--------//
    //////////////////////////


    //方法集
    Mcake.extend({
        // 迭代器 遍历 obj 所有元素（数组、对象数组、对象），执行 callback 方法，最终还是返回 obj
        // 注意1：callback.call(obj[i],obj[i], i, obj) 函数执行的环境和参数  第一个obj[i] 影响this
        // 注意2：=== false) return obj 一旦有函数返回 false，即跳出循环，类似 break
        // 注意3：无论哪种情况，最终返回的还是 obj
        each:function(obj, callback){
            //声明变量
            var i, key;
            //判断传入的元素是否为数组或数组对象
            if (Mcake.likeArray(obj)) {
                for (i = 0; i < obj.length; i++)
                    if (callback.call(obj[i],obj[i], i, obj) === false) return obj;
            }
            else {
                for (key in obj)
                    if (callback.call(obj[i],obj[key], key, obj) === false) return obj;
            }
            //无论哪种情况，最终返回的还是 obj
            return obj;
        },
        // 迭代处理器, 与each方法的差异在于map会存储每次迭代的返回值, 并作为一个新的数组返回
        map:function(obj, callback){
            //返回结果
            var ret = [];
            //如果传入的参数为空
            if(Mcake.isNull(obj)) return ret;
            //如果不支持原生的map 则使用each循环遍历所有元素
            Mcake.each(obj,function(value, i, list){
                //将每次迭代处理的返回值存储到ret数组
                ret[ret.length] = callback.call(value,value,i,list);
            });

            return ret;
        },
        //遍历数组集合中的元素, 返回一个新的数组 包含所有能够通过处理器验证的元素
        filter:function(obj, callback, context){
            //返回结果
            var ret = [];
            //如果传入的参数为空
            if(Mcake.isNull(obj)) return ret;
            //如果支持原生的filter方法
            if(arr_filter && obj.filter === arr_filter){
                return obj.filter(callback,context);
            }
            // 迭代集合中的元素, 并将通过处理器验证的元素放到数组中并返回
            Mcake.each(obj, function(value, i, list) {
                if(callback.call(context, value, i, list))
                    ret[ret.length] = value;
            });
            return ret;
        },
        //筛选数组对象中符合条件的项目 最终生成一个新的数组
        where:function(obj,attrs){
            //如果传入的第一个参数不是数组 第二个参数不是JSON对象 直接返回空数组
            if(!Mcake.likeArray(obj) || !Mcake.isJson(attrs)) return [];
            //筛选所有的项目
            return Mcake.filter(obj,function(item){
                return Mcake.isInJson(item,attrs);
            });
        },
        //获得一个随机整数
        //第一个参数(min)：最小值
        //第二个参数(max)：最大值
        random:function(min,max){
            //如果没有传入最大值 将第一个参数作为最大值 0最为最小值
            if (Mcake.isNull(max)) {
                max = min;
                min = 0;
            }
            return min + Math.floor(Math.random() * (max - min + 1));
        },
        /**
         * 打印日志
         * 打印类型：默认(console)、弹出(alert)、错误(error)
         */
        log: function(msg, type) {
            // 调用私有方法
            _log(msg, type);
        },
        // 错误打印 为 JavaScript 的 "error" 事件绑定一个处理函数
        error: function(msg) {
            _log(msg, "error");
        },
        //返回一个对立的否定函数 比如传入的函数结果为true 则 返回false
        //第一个参数(predicate)：为断言函数 结果必须返回true/false
        negate:function(predicate){
            return function() {
              return !predicate.apply(this, arguments);
            };
        }
    });



    /**
     * 对各种数据类型进行检测(Basic Type)
     */
    //obj_toString.call(obj) = obj.toString();
    Mcake.extend({
        type:function(obj){
            if (Mcake.isNull(obj)) {
                return obj + "";
            }
            return typeof obj === "object" || typeof obj === "function" ?
                typeClass[obj_toString.call(obj)] || "object" : typeof obj;
        },
        // 是否为window对象 window的特点：window.window === window
        isWindow:function(obj){
            return !Mcake.isNull(obj) && obj == obj.window;
        },
        // 是否为document对象
        isDocument:function(obj){
            return obj != null && obj.nodeType == obj.DOCUMENT_NODE;
        },
        // 是否为XML对象
        isXML:function(obj) {
            // 判断是否为documentElement 对象
            var documentElement = obj && (obj.ownerDocument || obj).documentElement;
            return documentElement ? documentElement.nodeName !== "HTML" : false;
        },
        // 是否为DOM对象
        isElement:function(obj){
            return !!(obj && obj.nodeType == 1);
        },
        // 是否为函数 返回 true/false
        isFunction:function(obj){
            return Mcake.type(obj) === "function";
        },
        // 是否为对象 返回 true/false
        isObject:function(obj){
            return Mcake.type(obj) === "object";
        },
        // 是否为字符串 返回 true/false
        isString:function(obj){
            return Mcake.type(obj) === "string";
        },
        // 是否为数字 返回 true/false
        isNumber:function(obj){
            return Mcake.type(obj) === "number";
        },
        // 是否为数组 返回 true/false
        isArray:function(obj){
            return Mcake.type(obj) === "array";
        },
        // 是否为纯粹的对象 比如 {} 或 new Object(); 和jquery 的isPlainObject一样 返回 true/false
        isJson:function(obj){
            var key;

            if (!obj || Mcake.type(obj) !== "object" || obj.nodeType || Mcake.isWindow(obj)) {
                return false;
            }
            try {
                if (obj.constructor && !Mcake.has(obj,"constructor") && !Mcake.has(obj.constructor.prototype,"isPrototypeOf")){
                    return false;
                }
            } catch (e) {
                return false;
            }

            for (key in obj) {}

            return key === undefined || Mcake.has(obj,key);
        },
        // 是否为布尔值
        isBoolean:function(obj){
            return Mcake.type(obj) === "boolean";
        },
        // 是否为函数参数对象
        isArguments:function(obj){
            return Mcake.type(obj) === "arguments";
        },
        // 是否为时间对象 返回 true/false
        isDate:function(obj){
            return Mcake.type(obj) === "date";
        },
        // 是否为正则
        isRegExp: function(obj) {
            return Mcake.type(obj) === "regexp";
        },
        // 是否为NaN
        isNaN:function(obj){
            return Mcake.isNumber(obj) && isNaN(obj);
        },
        //是否为空 null undefined 空字符串
        isNull:function(obj){
            return obj == null || obj === "";
        },
        //是否为空对象
        isEmptyObject:function(obj){
            return Mcake.isObject(obj) && Mcake.keys(obj).length === 0;
        },
        //是否为空数组
        isEmptyArray:function(obj){
            return Mcake.likeArray(obj) && obj.length === 0;
        },
        //是否为空 null undefined 空数组 空对象 空的字符串
        isEmpty:function(obj){
            //是否为空 、undefined 、空数组 或 空对象
            return Mcake.isNull(obj) || Mcake.isEmptyArray(obj) || Mcake.isEmptyObject(obj);
        },
        //判断两个数据是否完全相等 支持所有原始数据类型和对象数据类型的比较
        isEqual:function(a,b){
            return _equal(a,b);
        },
        //判断是否为数组对象 也就是格式为:[{},{}]的数组
        isList:function(obj){
            //如果传入的目标不是数组 直接返回false
            if(!Mcake.isArray(obj)) return false;
            //返回结果 默认通过
            var ret = true;
            //遍历每一个元素 如果出现了某个元素不是对象 返回false
            Mcake.each(obj,function(item){
                //如果当前遍历的项目不是对象 返回false
                if(!Mcake.isObject(item)){
                    ret = false;
                    return false;
                }
            });
            return ret;
        },
        //判断是否为Mcake实例
        isMcake:function(obj){
            return obj instanceof Mcake;
        },
        //是否为数组或数组对象 返回 true/false
        likeArray:function(obj){
            //如果是window对象直接返回false
            if (Mcake.isWindow(obj) || Mcake.isNull(obj) || Mcake.isString(obj)) return false;
            //获得长度和类型
            var length = obj.length,
                type = Mcake.type(obj);
            //如果是数组 返回ture
            if (obj.nodeType === 1 && length) {
                return true;
            }
            return type === "array" || type !== "function" &&
                (length === 0 ||
                    typeof length === "number" && length > 0 && (length - 1) in obj);
        },
        //判断某个值是否存在于数组中 支持检查对象
        //第一个参数：操作数组
        //第二个参数：检查的值
        isInArray:function(arr,elem){
            return Mcake.inArray(arr,elem) !== -1;
        },
        //判断某个键和值 是否存在于JSON对象中
        //第一个参数：查找内容(必填) JSON对象
        //第二个参数：查找目标数组(必填) JSON对象
        isInJson:function(obj,attrs){
            //如果两个参数不是对象 直接返回false
            if(!Mcake.isObject(obj) || !Mcake.isObject(attrs)) return false;

            var keys = Mcake.keys(attrs), //获得要查找的内容所有key
                length = keys.length;     //JSON长度
            //遍历所有的key
            for(var i = 0; i < length; i++){
                //当前查找的键
                var key = keys[i];
                //如果当前查找的键不存在目标内容中 或者 所对应的值于目标对象中的值不一致 返回false
                if (!Mcake.isEqual(attrs[key],obj[key]) || !(key in obj)) return false;
            }
            return true;
        },
        // 判断是否为合法的http URL字符串
        isUrl:function(obj) {
            return M.isString(obj) && !M.isNull(regUrl.exec(obj));
        },
        //检查一个属性是否属于对象本身, 而非原型链中 返回 true/false
        has:function(obj,key){
            return !Mcake.isNull(obj) && obj_has.call(obj,key);
        },
        //对各种设备和浏览器进行检测 返回一个JSON对象
        //共5个参数：os(操作系统)、ie(IE版本号/false)、weixin(版本号/false)、ios(ios/false)、android(版本号/false)
        //如果想检测以上参数之外的设备或浏览器，可以通过传入keys的方式检测，格式为一个或多个(字符串或数组)
        //方式一：传入字符串 比如要检测谷歌和火狐浏览器
        //M.device("chrome","firefox");
        //方式二：传入数组
        //M.device(["chrome","firefox"]);
        //方式三：混合方式
        //M.device("chrome",["firefox"]);
        device:function(){
            //获得设备信息并转化成小写
            var agent = navigator.userAgent.toLowerCase(),
                keys = Mcake.flat(arguments);
            //获取版本号
            var getVersion = function(label){
                var exp = new RegExp(label + '/([^\\s\\_\\-]+)');
                label = (agent.match(exp)||[])[1];
                //console.log(agent.match(exp));
                return label || false;
            };
            //返回结果
            var result = {
                //底层操作系统
                os: function(){
                    if(/windows/.test(agent)){
                        return 'windows';
                    }
                    else if(/linux/.test(agent)){
                        return 'linux';
                    }
                    else if(/iphone|ipod|ipad|ios/.test(agent)){
                        return 'ios';
                    }
                }(),
                //ie版本
                ie: function(){
                    //由于ie11并没有msie的标识
                    return (!!win.ActiveXObject || "ActiveXObject" in win) ? ((agent.match(/msie\s(\d+)/) || [])[1] || '11') : false;
                }(),
                safari: function() {
                    return (/constructor/i.test(win.HTMLElement) || win.safari) || false;
                }(),
                //是否为微信
                weixin: getVersion('micromessenger')
            };

            //移动设备
            result.android = /android/.test(agent);
            result.ios = result.os === 'ios';

            //遍历所有的key 进行检测
            Mcake.each(keys,function (key){
                //如果传入的参数是字符串 同时没有在检测结果中 那么进行检测
                if(Mcake.isString(key) && Mcake.isNull(result[key])){
                    result[key] = getVersion(key);
                }
            });

            return result;
        }
    });
    /* 数据类型检测的底层支持 */
    //设置各种数据类型的查找名称到typeClass中 用于判断类型是查找
    Mcake.each("Boolean Number String Function Array Date RegExp Object Error Symbol Arguments".split(" "), function(name,i) {
        typeClass[ "[object "+name+"]" ] = name.toLowerCase();
    });


    //////////////////////////
    //------表单验证--------//
    //////////////////////////

    Mcake.extend({
        //检查一个字符串是否为合法的邮箱
        isEmail:function(str){
            //验证是否为合法的邮箱
            return /^([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/.test(str);
        },
        //检查一个字符串是否为合法的手机号码
        isPhoneNumber:function(str){
            //验证是否为合法的手机号码 第一个数字为1 第二个数字为3/4/5/8 11位数的数字
            return /^1[3,4,5,7,8]\d{9}$/.test(str);
        },
        //检查一个字符串是否为合法的电话号码
        isTelNumber:function(str){
            //以0开头的 3-4位数前缀  以"-"或"/"分割 电话号码为7或8位的数字
            //验证是否为合法的电话号码 格式：010-8788883 或 010/8788883
            return /^0[\d]{2,3}(-|\/)[\d]{7,8}$/.test(str);
        },
        /**
         * 检查一个字符串是否为合法的身份证号码
         * 传入一个字符串或数字
         * 返回一个对象，参数如下：msg(提示信息)、state(验证状态：true/false)、prov(所在省份)、birthday(出生日期：年/月/日)、sex(性别：男/女)、addressCode(地址代码：前六位)、input(当前检验的身份证号码)
         */
        isIdCard:function(card){
            //先将传入的身份证号码去空格并转成大写字符串
            card = Mcake.trim(card).toUpperCase();
            //变量声明
            var ret = {
                    state:false    //验证状态 默认为不通过
                },
                prov,              //省份
                birthday,          //出生日期
                sex,               //性别
                cardArr,           //用于存放处理后的身份证号码
                cardLength = card.length,  //身份证长度
                //身份证省份查询地图
                provMap = {11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江",31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外"},
                //性别查询地图
                sexMap = {0:"女",1:"男"},
                // 加权因子 用于计算18位省份证最后一位验证码所在位置
                wiArr = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2],
                // 身份证校验码查询地图
                checkCodeMap = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'],
                //身份证号码验证正则 15位数字或者17位数字+一位校验码
                reg_card = /(^\d{15}$)|(^\d{17}(\d|X)$)/,
                //切分15位和18位身份证的正则 结果反馈给cardArr
                reg_split_15 = /^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/,
                reg_split_18 = /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/;

            //检验身份证号码是否为空
            if(cardLength === 0){
                ret.msg = "身份证不能为空！";
            }
            //检验身份证号码位数和格式
            else if(!reg_card.test(card)){
                ret.msg = "身份证格式不对！";
            }
            //如果符合要求 进入严格检验
            else{
                //检验所在省份
                if(!checkProvince()){
                    ret.msg = "身份证所在地区非法！";
                }
                //检测身份证出生日期范围
                else if(!checkBrith()){
                    ret.msg = "身份证出生日期错误！";
                }
                //检测18位身份证最后一位验证码 只有18位身份证才需要检测
                else if(cardLength == 18 && !checkParity()){
                    ret.msg = "身份证校验码错误！";
                }
                //如果所有检验都通过了 返回成功的结果
                else{
                    //返回结果
                    ret = {
                        state:true,              //验证状态
                        msg:"通过验证！",        //提示信息
                        prov:prov,               //省份
                        birthday:birthday,       //出生日期
                        sex:getCardSex(),        //性别
                        addressCode:cardArr[1],  //城市代码
                        input:card               //当前检测身份证号码
                    }
                }
            }

            //检测省份
            function checkProvince(){
                var nowProv = provMap[card.substr(0,2)];
                //如果省份存在
                if(nowProv){
                    //储存当前身份证所在省份
                    prov = nowProv;
                    return true;
                }
                else{
                    return false;
                }
            }
            //检测出生日期
            function checkBrith(){
                //年、月、日
                var year,month,day;
                //身份证15位时，次序为省（2位）市（2位）县(2位) 年（2位）月（2位）日（2位）校验位（3位），皆为数字
                if(cardLength == 15){
                    //切分身份证号码
                    cardArr = card.match(reg_split_15);
                    //设置15位身份证号码的年份 因为1999年之前才是15位
                    year = '19'+cardArr[2];
                }
                //身份证18位时，次序为省（2位）市（2位）县(2位)年（4位）月（2位）日（2位）校验位（4位），校验位末尾可能为X
                else{
                    //切分身份证号码
                    cardArr = card.match(reg_split_18);
                    //设置年份
                    year = cardArr[2];
                }
                //获得月、日、生日时间对象
                month = cardArr[3];
                day = cardArr[4];
                birthday = year+'/'+month+'/'+day;

                console.log(birthday)

                //检验出生日期是否合法
                return verifyBrith(year,month,day,birthday);
            }
            //检验出生日期是否合法
            function verifyBrith(year,month,day,birthday){
                var now = new Date(), //当前时间
                    newBirth = new Date(birthday),//获得出生日期的时间对象
                    result = false;

                //年月日是否合理
                if(newBirth.getFullYear() == year && (newBirth.getMonth() + 1) == month && newBirth.getDate() == day){
                    //判断年份的范围（3岁到100岁之间)
                    var time = now.getFullYear() - year;
                    // 如果年龄在0-110岁之间
                    if(time >= 0 && time <= 110){
                        // 如果不满足年份等于0 且 月份大于当前月份 则设置为通过验证
                        if(!(time == 0 && newBirth.getMonth() > now.getMonth())) {
                            result =  true;
                        }
                    }
                }
                return result;
            }
            //获得当然身份证性别
            function getCardSex(){
                return sexMap[cardArr[5] % 2];
            }
            //检测18位身份证后面的验证码是否正确
            function checkParity(){
                // 声明加权求和变量
                var sum = 0,i,result = false;
                //计算权求和
                for (i = 0; i < 17; i++) {
                    sum += wiArr[i] * card.substr(i, 1);// 加权求和
                }
                //判断验证码是否正确
                if (card.substr(17, 1) == checkCodeMap[sum % 11]){
                    result =  true;
                }
                return result;
            }
            //返回结果
            return ret;
        }
    });

    //////////////////////////
    //----常用数据操作------//
    //////////////////////////

    Mcake.extend({
        //转换成字符串 支持JSON和数组数据的转换 带2空格缩进
        toString:function(val){
            //如果参数不存在  为空字符 如果为对象 则返回缩进2空格的字符串
            return Mcake.isNull(val) ? "" : typeof val === 'object' ? JSON.stringify(val) : String(val);
        },
        //转成成数字
        toNumber:function(val){
            var n = parseFloat(val, 10);
            return (n || n === 0) ? n : val;
        },
        /**
         * 将一个二维数组或者两个一维数组转成JSON数组对象
         * 使用方式一：M.object(["name", "sex", "age"], ["张三", "男", "20"]);
         * 使用方式二：M.object([["name", "sex", "age"], ["张三", "男", "20"]]);
         * @param  {[Array]} list   [数组，可以是包含key名称的数组或者是个二维数组，第一个元素为key数组，第二个元素为值数组]
         * @param  {[Array]} values [可选参数，为值数组]
         * @return {[Object]}       [返回对象]
         */
        toObject: function(list, values) {
            // 返回结果
            var ret = {};
            // 如果参数不是数组 直接返回空
            if(!M.isArray(list)) return ret;
            // 如果储存值的数组存在
            if(M.isArray(values)) {
                // 遍历所有key
                M.each(list, function(key, i) {
                    ret[key] = values[i] || "";
                });
            }
            // 如果不存在
            else {
                // 遍历所有key
                M.each(list[0], function(key, i){
                    ret[key] = list[1][i] || "";
                });
            }
            return ret;
        },
        /**
         * 将一个对象或者list数组对象 转化成 一个二维数组
         * @param  {[Object/List]} obj [操作对象/数组对象]
         * @return {[Array]}           [返回一个二维数组，第一个元素为key 第二个元素为值]
         */
        toArray: function(obj) {
            var ret = [],  // 返回结果
                keys;      // 存放所有字段名的数组

            // 如果传入的参数为对象
            if(M.isObject(obj)) {
                // 获得对象所有的key和值并返回
                ret[0] = M.keys(obj);
                ret[1] = M.values(obj);
            }
            // 如果为数组对象
            else if(M.isList(obj)) {
                // 设置字段名keys数组
                ret.push(keys = M.listKeys(obj));
                // 获得每一行的数据
                M.each(obj, function(item){
                    // 存放当前行数据
                    var itemArr = [];
                    // 遍历所有字段并获得值
                    M.each(keys, function(key){
                        itemArr.push(item[key] || "");
                    });
                    // 放入每一行数据
                    ret.push(itemArr);
                });
            }
            return ret;
        },
        /**
         * 将一个二维数组 转成 list数组对象
         * 使用方式：M.list([["name", "sex", "age"], ["张三", "男", "20"], ["李四", undefined, "33"]])
         * @param  {[Array]} arr [二维数组，第一个元素为key数组，第二个元素开始为值数组]
         * @return {[Array]}     [返回一个数组对象]
         */
        toList: function(arr) {
            var ret = [],    // 返回结果
                keys,        // 字段名
                item,        // 临时存放行数据对象
                itemValues;  // 存放值的临时数组

            // 如果不是二维数组 返回空数组
            if(!M.isArray(arr) || !M.isArray(keys = arr[0])) return ret;
            // 遍历所有的key
            for(var i = 1; i < arr.length; i++) {
                // 存放当前行数据的临时对象
                item = {};
                // 获得当前值
                itemValues = arr[i];
                // 遍历每一个key
                M.each(keys, function(key, j){
                    item[key] = itemValues[j] || "";
                });
                // 放入每一行数据
                ret.push(item);
            }
            return ret;
        },
        //清除字符串空格
        trim:function(str){
            //判断是否为空 如果为空返回空字符  如果不为空 先强制转换成字符串 然后去除空格
            //这里为了提高性能 使用了两次正则 分别去除前面和后面空格
            //更多方法可参考http://www.cnblogs.com/rubylouvre/archive/2009/09/18/1568794.html
            return str == null ? "" : (str + "").replace(/^\s*/, '').replace(/\s*$/, '');
        },
        //获得JSON对象、数组、数组对象(jQuery对象)的长度
        size:function(obj){
            //如果传入的值为空 返回0
            if (Mcake.isNull(obj)) return 0;
            //判断是否为数组/数组对象 如果是直接返回length 否则调用keys方法获得长度
            return Mcake.likeArray(obj) ? obj.length : Mcake.keys(obj).length;
        },
        /**
         * 拷贝数据(支持深度拷贝)
         * 可对布尔值、数字、字符串、正则、时间、数组、对象、数组对象等类型数据进行拷贝
         * @param  {[type]} obj [需要拷贝的数据]
         * @return {[type]}     [拷贝后的数据]
         */
        clone:function(obj){
            // 如果为空或者不是对象
            if (obj === null || typeof obj !== 'object') return obj;
            // 如果为布尔值
            if(M.isBoolean(obj)) return new Boolean(obj.valueOf());
            if(M.isNumber(obj)) return new Number(obj.valueOf());
            if(M.isString(obj)) return new String(obj.valueOf());
            if(M.isRegExp(obj)) return new RegExp(obj.valueOf());
            if(M.isDate(obj)) return new Date(obj.valueOf());

            // 如果为数组或对象
            var ret = M.isArray(obj) ? [] : {};
            // 遍历所有元素
            for (var key in obj) ret[key] = M.clone(obj[key]);
            // 返回最终结果
            return ret;
        },
        //将数组中的所有元素随机排列  如果传入的是对象 则将对象的值随机排列 返回一个数组
        //第一个参数(obj)：数组或对象
        shuffle:function(obj){
            //返回结果
            var ret = [];
            //如果为空
            if(Mcake.isNull(obj)) return ret;
            //如果目标不是数组 是对象 则获得所有的值
            obj = Mcake.likeArray(obj) ? obj : Mcake.values(obj);
            //遍历所有元素
            for (var i = 0, rand; i < obj.length; i++) {
                // 将当前所枚举位置的元素和 `i=rand` 位置的元素交换
                rand = Mcake.random(0, i);
                //只要当前随机数跟现在的索引不一样 则挪动位置
                if (rand !== i) ret[i] = ret[rand];
                //逐个插入元素
                ret[rand] = obj[i];
            }
            return ret;
        },
        //随机选取数组或对象中 一个或多个值 返回数组
        sample:function(obj, n){
            //如果目标为空 返回空
            if(Mcake.isNull(obj)) return null;
            // 如果没有传入n 则返回一个元素
            if (Mcake.isNull(n)){
                //判断目标是对象还是数组
                obj = Mcake.likeArray(obj) ? obj : Mcake.values(obj);
                //随机挑选出一个元素
                return obj[Mcake.random(obj.length - 1)];
            }
            // 随机返回 n 个 先随机排序数组 再截取元素
            return Mcake.shuffle(obj).slice(0, Math.max(0, n));
        },
        //将XML字符串转化成XML对象
        parseXML:function(str){
            var xmlDoc;
            // 判断是否为字符串
            if (Mcake.isString(str)) {
                //先将字符串去除前后空格
                str = Mcake.trim(str);
                // chrome...
                if (window.DOMParser) {
                    var tmp = new DOMParser();
                    xmlDoc = tmp.parseFromString(str, "text/xml");
                }
                // IE浏览器
                else if (window.ActiveXObject) {
                    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                    xmlDoc.async = false;
                    xmlDoc.loadXML(str);
                }
            }
            else {
                xmlDoc = str;
            }
            return xmlDoc;
        },
        //将时间字符串转换成Date对象
        //使用方式1: Mcake.parseDate("2016-11-30 12:27:55")
        //使用方式2: Mcake.parseDate("2016/11/30 12:27:55")
        //使用方式3: Mcake.parseDate("2016-11-30")
        parseDate:function(str){
            //如果传入的参数为字符串
            return Mcake.isString(str) ? new Date(Date.parse(str.replace(/-/g,"/"))) : null;
        },
        //将HTML一些特殊字符进行转义
        escapeHTML:function(str){
            return Mcake.isString(str) ? str
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;')
                    .replace(/`/g, '&#x60;') : str;
        },
        /**
         * 获得当前时间
         * 使用方式一： 传入一个时间对象
         * 使用方式二： 传入一个毫秒数 可以为数字或字符串
         * 使用方式三： 不传值 获得当前时间
         * 返回一个格式为：年-月-日 时:分:秒 的字符串
         * @param  {[String/Number/Null/Date]} obj [description]
         * @return {[String]}                      [返回一个时间字符串]
         */
        getDate:function(obj){
            var isNull = M.isNull(obj),  // 是否为空
                isDate = M.isDate(obj);  // 是否为时间对象
            //判断是否传入了参数 如果存入了参数且为时间对象 则用传入的参数 否则创建一个新的
            obj = isDate ? obj : isNull ? new Date() : new Date(M.toNumber(obj));
            //将一个小于10的数字前面加0  比如8 会转换成 08
            function plusZero(n){
                return n < 10 ? "0"+n : ""+n;
            }
            //返回结果
            return obj.getFullYear() + "-" + (obj.getMonth()+1) + "-" + obj.getDate()+" "+plusZero(obj.getHours())+':'+plusZero(obj.getMinutes())+':'+plusZero(obj.getSeconds());
        },
        //获得当前时间的 "时间戳"（单位 ms）
        now: Date.now || function(){return new Date().getTime();},
        // 本地储存 对HTML5中localStorage对象的封装 支持一次对多个字段进行增删改的操作
        // 使用场景1:创建一张表和数据
        // Mcake.localData("test_table",{key:"字段内容"});
        // 使用场景2:修改表字段数据
        // Mcake.localData("test_table",{key:"我是修改后的内容"});
        // 使用场景3:删除表字段数据 注意这里是null 不是 "null"字符串
        // Mcake.localData("test_table",{key:null});
        // Mcake.localData("testTable",{key:""});
        // 使用场景4：删除整张表
        // Mcake.localData("test_table",null);
        // 使用场景5:获得整张表的数据 如果不存在会返回一个空对象
        // var data = Mcake.localData("test_table");
        localData:function(table, settings){
            //如果没有传入表名 则创建名称为Mcake的表
            table = table || 'Mcake';
            //如果settings为null，则删除对应的表
            if(settings === null){
              return delete localStorage[table];
            }
            //判断是否已经存在表 没有就创建个新的
            try{
              var data = JSON.parse(localStorage[table]);
            } catch(e){
              var data = {};
            }
            //如果传入的参数为JSON 增删改操作
            if(Mcake.isJson(settings)){
                //合并所有字段
                Mcake.extend(data,settings);
                //去除内容为null和undefined的字段
                data = Mcake.compactJson(data);
            }

            //储存最终数据
            localStorage[table] = JSON.stringify(data);
            //如果没有传参数 最终返回表
            return Mcake.isString(settings) ? data[settings] : data;
        },
        // 对url参数的相关操作
        // 使用场景1：获得当前URL中所有的参数 返回一个JSON对象(有两个特殊参数:href、context)
        // var myUrl = M.url();
        // 使用场景2：获得某一个参数的内容 如果没找到 返回空字符
        // var param = M.url("参数名");
        // 使用场景3：修改、删除、添加某个参数的值 传入JSON {key:value} 当value=null时表示删除
        // var eidtUrl = M.url({key:value,key:null})   返回字符串
        // 使用场景4：抛弃所有的参数 重新创建一个URL路径  在JSON后面再添加一个参数为true
        // var newUrl = M.url({key:value},true)  返回字符串
        url:function(settings,isCreate){
            var result = null;
            //获得URL返回的JSON
            var urlJson = _getUrl();
            //判断是否有参数
            if(settings){
                //如果传入的是字符串 - 获取指定名称的参数
                if(M.isString(settings)){
                    // 如果为url字符串 返回该字符串所有参数
                    if(M.isUrl(settings)) {
                        // 直接返回该参数的值
                        result = _getUrl(settings);
                    }
                    // 获取参数值
                    else {
                        // 直接返回该参数的值
                        result = urlJson[settings] || "";
                    }
                }
                //如果是要更改或添加参数 {name:value}
                else if(M.isJson(settings)){
                    result = _setUrl(urlJson,settings,isCreate);
                }
            }
            else{
                //设置返回结果
                result = urlJson;
            }
            return result;
        },
        //cookie 设置与读取
        //第一参数(settings)：1，为空：获得所有数据 2，为JSON对象：用于某个或某组数据的增删改 3，为数组，一般用于删除  当然也可以用于创建值为空的的数据
        //第二个参数(time)：有效时间 可以为 天数  也可以为时间对象 当有效时间为-1 或者 过去时间时  用于删除
        cookie:function(settings, time){
            //获得所有储存的键值
            var ret = _getCookie();
            //如果传入成参数为空 则直接返回全部键值
            if(M.isNull(settings)) return ret;
            //如果是获取某个指定名称的值
            if(M.isString(settings)) return ret[settings];

            //如果传入的参数是一个对象 则表示要进行增删改的操作
            if(M.isObject(settings) || M.isArray(settings)){
                //设置所有的键值到cookie中
                _setCookie(settings,time);
            };
            //重新获得设置后的所有cookie数据
            return _getCookie();
        }
    });

    //////////////////////////
    //------数组操作--------//
    //////////////////////////

    Mcake.extend({
        //判断某个值是否在数组中   支持查找数组对象中的 对象 是否存在数组中
        //第一个参数：查找内容(必填)
        //第二个参数：查找目标数组(必填)
        //第三个参数：开始查找索引(选填)
        //成功返回查找内容所在索引 没有找到返回-1
        inArray:function(arr, elem, i){
            //如果查找内容和要查找的目标数组都存在
            if(Mcake.likeArray(arr) && !Mcake.isNull(elem)){
                //如果浏览器支持原生的数组查找方法 且查询的内容不是数组或对象
                if(arr_indexOf && !Mcake.isObject(elem) && !Mcake.isArray(elem)){
                    return arr_indexOf.call(arr, elem, i);
                }
                //获得数组的长度
                var len = arr.length;
                //开始查找的索引值 默认为从0开始 如果小于0则从总数加指定负数开始查找
                i = i ? i < 0 ? Math.max(0, len + i) : i : 0;

                for (; i < len; i++) {
                    // 这里的(i in arr)判断是为了跳过稀疏数组中的元素
                    // 例如 var arr = []; arr[1] = 1;
                    // 此时 arr == [undefined, 1]
                    // 结果是 => (0 in arr == false) (1 in arr == true)
                    // M.inArray(arr, undefined, 0)是返回 -1 的
                    if (i in arr && Mcake.isEqual(arr[i],elem)) {
                        return i;
                    }
                }
            }
            //如果没有传入参数或数组返回-1
            return -1;
        },
        /**
         * 判断某个值是否存在数组或字符串中
         * @param  {Array/String} obj  [传入数组或字符串]
         * @param  {[type]}       elem [检测内容]
         * @return {Boolean}           [返回true/false]
         */
        includes(obj, elem) {
            // 如果为数组
            if(M.isArray(obj)) {
                // 如果原生的方法存在
                if(arr_includes && !M.isObject(elem) && !M.isArray(elem)) {
                    return arr_includes.call(obj, elem);
                }
                else {
                    return M.inArray(obj, elem) !== -1;
                }
            }
            // 如果为字符串
            if(M.isString(obj) && M.isString(elem) && !M.isNull(elem)) {
                // 如果原生的方法存在
                if(str_includes) {
                    return str_includes.call(obj, elem);
                }
                else {
                    return str_indexOf.call(obj, elem) !== -1;
                }
            }
            return false;
        },
        //用一个key 给数组对象中的每个元素 设置一个索引 返回一个对象
        //第一个参数：数组对象
        //第二个参数：数组对象中对象包含的某个key
        indexBy:function(arr,key){
            //返回结果
            var ret = {};
            //如果传入的参数正确
            if(M.isArray(arr) && M.isString(key)){
                //遍历每一个元素
                M.each(arr,function(item){
                    //如果key存在于item中
                    if(key in item){
                       //获得当前元素指定key对应的值
                       var retKey = item[key];
                       //如果值存在
                       if(!M.isNull(retKey)){
                           //设置结果
                           ret[retKey] = item;
                       }
                    }
                });
            }
            //返回结果
            return ret;
        },
        //去除数组中的null undefined 空字符串 传入的参数只能为数组
        compactArray:function(arr){
            //如果传入的参数不是数组 不作处理
            if(!Mcake.isArray(arr)) return arr;
            //对传入的数组进行筛选 去除空值元素
            return Mcake.filter(arr,function (val){
                return !Mcake.isNull(val);
            });
        },
        //去除数组中重复项
        //第一个参数传入要处理的数组
        //第二个参数为布尔值(可选)：当等于true是 会对去重后的数组进行排序
        uniqueArray:function(arr,isSort){
            //如果传入的参数不是数组 不作处理
            if(!Mcake.isArray(arr)) return arr;
            //返回结果和用于储存查找后值的地图
            var ret = [],map = {};
            //遍历筛选
            Mcake.each(arr,function(val){
                //判断空json对象中是否存在当前这一项
                if(!Mcake.isNull(val) && !map[val]){
                    ret.push(val);
                    map[val] = 1;
                }
            });
            //如果传入的值为true 对数组进行排序
            if(isSort == true)
                ret = Mcake.sort(ret);
            //返回结果
            return ret;
        },
        //数组排序
        //第一个参数(arr):要操作的数组
        //第二个参数(isReverse):是否倒序 当为true时进行倒序 默认为正序
        sort:function(arr,isReverse){
            //如果传入的内容不是数组 直接返回一个空数组
            if(!Mcake.isArray(arr)) return arr;
            //对数组进行排序
            return arr.sort(function(a,b){
                //调用排序算法
                return _sortAlgorithm(a,b,isReverse);
            });
        },
        //对数组对象进行排序 传入某个字段 会根据这个字段进行排序
        //第一个参数(arr):操作的数组
        //第二个参数(sortKey):要根据排序的字段
        //第三个参数(isReverse):是否倒序
        sortList:function(arr,sortKey,isReverse){
            //如果传入的第一个参数不是数组 或者 第二个参数不存在 直接返回操作目标
            if(!Mcake.isArray(arr) || !Mcake.isString(sortKey)) return arr;
            //对数组进行排序
            return arr.sort(function(a,b){
                a = a[sortKey];
                b = b[sortKey];
                //调用排序算法
                return _sortAlgorithm(a,b,isReverse);
            });
        },
        //将数组中的每个元素放到迭代器 并计算结果
        reduce:_createReduce(1),
        //跟reduce功能一样 只不过遍历顺序是从右到左
        reduceRight:_createReduce(-1),
        //生成一个指定开始 结尾 间隔的数组集合 便于each 和 map循环
        //第一个参数(start)：开始值 如果第二个参数不存在 则为结束值 0为开始值
        //第二个参数(stop)： 结束值 当结束值小于开始值时 则为负增长
        //第三个参数(step)： 间隔值 比如从0-10 直接 间隔值为3 则返回 [0,3,6,9];
        range:function(start,stop,step){
            //如果结束值为空 将第一个参数作为结束值 0作为开始值
            if(Mcake.isNull(stop)){
                stop = start || 0;
                start = 0;
            }
            //间隔步伐 速度  默认为1
            step = step || 1;
            //如果结束值小于开始值 间隔值会为负数 也就是负增长
            if(start > stop && step > 0){
                step = -step;
            }

            //返回结果的长度
            var len = Math.max(Math.ceil((stop - start) / step), 0);

            // 返回的数组
            var ret = Array(len);
            //循环生成结果
            for (var i = 0; i < len; i++, start += step) {
              ret[i] = start;
            }

            return ret;
        },
        //将一个多层数组展开成只有一层的数组
        //第一个参数(arr)：操作的数组
        //第二个参数(isShallow)：是否只展开一层 true为是
        flat:function(arr,isShallow){
            //调用内部函数 进行解压数组
            return _flat(arr, isShallow, false);
        },
        //删除数组中指定索引开始的n个元素 如果没有指定n 则默认为1 该操作会直接对数组产生影响
        //也会返回操作过后的数组
        remove:function(arr,index,n){
            //如果传入的第一个参数不是数组 或者 开始索引为空 或者开始索引大于数组长度 直接返回传入内容
            if(!Mcake.isArray(arr) || Mcake.isNull(index) || index > Mcake.size(arr)) return arr;
            //获得删除长度 如果未空 则默认为删除一个
            n = Mcake.isNull(n) ? 1 : n;
            //进行删除操作
            arr_splice.call(arr,index,n);
            //返回当前结果
            return arr;
        },
        /**
         * 对于数组对象类型的操作 单纯只对于数组对象的操作方法前面都是list开头
         * 数组对象(List):[{name:"张三"},{name:"李四"}]
         */
        //获得数组对象中 所有的key名称 返回一个数组
        listKeys:function(arr){
            //如果传入的参数不是数组 直接返回空的数组
            if(!Mcake.isArray(arr)) return [];
            //用于存放key结果的临时对象 最终要转成数组
            var ret = {};
            //遍历所有元素
            Mcake.each(arr,function(item){
                if(Mcake.isObject(item)) Mcake.extend(ret, item);
            });
            return Mcake.keys(ret);
        },
        //遍历数组对象 获得某个key对应的所有值 返回一个数组
        //第一个参数：要操作的数组对象
        //第二个参数：指定的key值
        listPluck:function(arr, key){
            //如果传入的参数不符合要求 直接返回空数组
            if(!Mcake.isArray(arr) || Mcake.isNull(key)) return [];
            //遍历数组中的每一个对象 获得key对应的值 最终返回到一个数组中
            return Mcake.map(arr, Mcake.property(key));
        },
        //修复数组对象中每一项的字段
        //第一个参数：要修复的数组对象  返回一个数组
        //比如修复前 [{name:"张三"},{name:"李四",sex:"男"}]
        //修复后      [{name:"张三",sex:""},{name:"李四",sex:"男"}]
        listMend:function(arr){
            //如果传入的不是数组 返回空数组
            if(!Mcake.isArray(arr)) return [];
            //返回结果
            var ret = [],
                //操作数组对象中的所有key
                listKeys = Mcake.listKeys(arr);
            //遍历每一个对象 进行字段修复工作
            Mcake.each(arr,function(item){
                //对每一个对象进行字段补全 并 放入数组中
                ret.push(Mcake.mend(item,listKeys))
            });
            return ret;
        }

    });


    //////////////////////////
    //------对象操作--------//
    //////////////////////////

    Mcake.extend({
        //获得对象上所有的属性名称 传入一个对象
        //返回一个数组 包含对象自身所有的属性 原型链上继承的属性则会被忽略
        keys:function(obj){
            //存放结果的数组
            var keys = [];
            //如果传入的参数不是对象或长度为0 返回空数组
            if(!Mcake.isObject(obj)) return keys;
            //如果宿主支持原生的方法 直接调用
            if(obj_keys) return obj_keys(obj);
            //如果原生方法不存在 遍历元素
            for (var key in obj){
                //只返回属于这个对象本身的key 从原型继承的属性不会拷贝
                if(Mcake.has(obj, key)) keys.push(key);
            }
            return keys;
        },
        allKeys:function(obj){
            //存放结果的数组
            var keys = [];
            //如果传入的不是对象
            if(!Mcake.isObject(obj)) return keys;
            //循环所有的key值
            for (var key in obj) keys.push(key);
            //返回结果
            return keys;
        },
        //获得一个对象的所有值 返回一个数组
        values:function(obj){
            var keys = Mcake.keys(obj), //获得对象所有的key 返回数组
                length = keys.length,  //获得keys数组长度
                values = Array(length);//创建一个新的数组
            //循环所有的key 获得对应的value值
            for (var i = 0; i < length; i++){
                values[i] = obj[keys[i]];
            }
            return values;
        },
        //去除JSON对象中值为null、undefined、空字符串的项目
        compactJson:function(obj){
            var ret = {};
            //如果传入的参数是数组
            Mcake.each(obj,function(value,key){
                if(!Mcake.isNull(value))
                    ret[key]=value;
            });
            return ret;
        },
        //创建具有给定原型的新对象， 可选附加props 作为 own的属性。 基本上，和Object.create一样， 但是没有所有的属性描述符
        create:function(prototype,props){
            //创建一个对象 拥有传入的原型
            var ret = _baseCreate(prototype);
            //合并属性
            if (Mcake.isObject(props)) Mcake.extend(ret, props);
            return ret;
        },
        //创建一个地图 返回一个函数 用于查询是否存在这个键
        //参数一：传入一个以","分割的字符串 最终会根据这个字符串创建一个对象
        //参数二:是否转换成小写
        createMap:function(obj,isLowerCase){
            var map = {},  //创建一个空对象
                //判断传入的参数是否为数组 如果不是数组 则可能是字符串 则将字符串分割成数组
                list = Mcake.isArray(obj) ? obj : obj.split(",");
            //循环遍历数组
            Mcake.each(list,function(item){
                map[item] = true;
            });
            //根据第二个参数判断是否要区分大小写
            return isLowerCase
                ? function (val){return map[val.toLowerCase()]}
                : function (val){return map[val]};
        },
        //挑选出对象中符合指定的KEY的字段 组合成一个新的对象副本并返回
        //第一个参数：要操作的对象
        //第二个参数：筛选条件  可以是函数 也可以是
        pick:function(obj,oCallback,context){
            //返回结果(ret)、回调函数(callback)、键数组(keys)
            var ret = {},callback,keys;
            //如果传入的第一个参数不是对象 直接返回空结果
            if(!Mcake.isObject(obj)) return ret;
            //判断第二个参数是函数 还是key 得到对象的keys和回调函数
            if(Mcake.isFunction(oCallback)){
                //如果没有指定那些key 则获得所有key
                keys = Mcake.allKeys(obj);
                //回调函数
                callback = _optimizeCb(oCallback,context);
            }
            //如果不是函数 则是指定的key值 因为key值有可能是数组 所以进行解压展开
            else{
                //从第二个参数开始解压
                keys = _flat(arguments, false, false, 1);
                //因为第二个参数不是函数 所以也给他生成一个回调函数
                callback = function (value,key,obj){ return key in obj};
            }

            //循环处理所有的指定字段
            for(var i = 0;i < keys.length;i++){
                var key = keys[i],//当前key
                    value = obj[key];//key对应的值
                //如果指定的key存在操作目标上 则返回这一条数据
                if(callback(value,key,obj)) ret[key] = value;
            }

            return ret;
        },
        omit:function(obj,callback,context){
            //如果传入的第二个参数是函数 则将函数返回值 取反  也就是符合条件的 不挑选进结果中
            if(Mcake.isFunction(callback)){
                //断言函数 满足要求 则返回false
                callback = Mcake.negate(callback);
            }
            else{
                //获得传入的所有参数 同时将所有参数转成字符串
                var keys = Mcake.map(_flat(arguments, false, false, 1), String);
                //断言函数 如果当前遍历的key 在需要排除的字段数组中 则返回false
                callback = function(value,key){
                    return !Mcake.isInArray(keys,key);
                }
            }
            //调用挑选函数 进行筛选 只有不符合断言函数的字段 才会保留
            return Mcake.pick(obj,callback,context);
        },
        //获得一个对象上所有的函数名 返回一个数组
        functions:function(obj){
            // 返回的数组
            var ret = [];
            //遍历所有的键值
            for (var key in obj) {
                //如果当前值是函数
                if (Mcake.isFunction(obj[key])) ret.push(key);
            }
            // 返回排序后的数组
            return Mcake.sort(ret);
        },
        //闭包方法，获得对象上某个key对应的值
        property:_property,
        //修复一个对象的缺失字段
        //第一个参数(obj):需要补全的对象
        //第二个参数(keys):对照的字段名数组 全部字段
        mend:function(obj,keys){
            //如果传入的第一个参数不是对象 或者第二个参数不是数组 直接返回该该对象
            if(!Mcake.isObject(obj) || !Mcake.isArray(keys)) return obj;
            //返回结果(ret)
            var ret = {},
                //字段数组长度
                keysLen =  Mcake.size(keys),
                //补全对象的字段长度
                len = Mcake.size(obj);
            //如果大于
            if(keysLen > len){
                //进行字段修复 修复字段的结果都是空的字符串
                Mcake.each(keys,function(key){
                    //如果该字段存在 则使用已经存在的内容 不存在 则进行补全
                    ret[key] = obj[key] || "";
                });
            }
            //如果等于 则表示不需要补全 如果小于 则表示全部字段有问题 返回更多字段的对象
            else{
               ret = obj;
            }
            return ret;
        }
    });


    //////////////////////////
    //------事件处理--------//
    //////////////////////////

    Mcake.extend({
        //阻止事件冒泡
        stopEvent:function(e){
            //stopPropagation针对W3C标准主流浏览器 cancelBubble针对IE
            e = e || win.event;
            e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
        }

    });

    //////////////////////////
    //------杂七杂八--------//
    //////////////////////////

    Mcake.extend({
        // 创建一个随机识别ID
        uuid:function(length){
            // 获得控制个数的彼参数
            length = Math.pow(10, length || 4);
            // 返回随机码
            return (((1 + Math.random()) * parseInt(length, 16)) | 0).toString(16).substring(1);
        }
    });

    //////////////////////////
    //------文件下载--------//
    //////////////////////////
    Mcake.extend({
        /**
         * 对一个字符串进行下载 保存为
         * @param  {[object]} settings [导出配置]
         * settings.name：导出文件名
         * settings.data  导出数据 格式必须为字符串
         * settings.type：导出文件类型
         */
        download: function(settings) {
            // 如果传入的参数不是对象 不再继续操作
            if(!M.isObject(settings)) return;
            // 文件名
            var name = settings.name || "Mcake",
                // 保存文件类型
                type = settings.type || "txt",
                // 需要保存的数据 格式为字符串
                data = settings.data,
                // 获得所有支持文件类型名
                fileTypeNameArr = M.keys(downloadConfig.fileType),
                // 最终保存文件名 带文件格式后缀
                fileName = _getDownloadFileName(name, type),
                // 文件类型全称
                fileTypeText = downloadConfig["fileType"][type];
            // 如果传入的参数为空 或者不是字符串
            if(M.isNull(data) || !M.isString(data)) return;
            //如果为支持保存的文件类型
            if(M.isInArray(fileTypeNameArr, type)) {
                // 如果为导出excel
                if(type == "excel" || type == "xls") {
                    // 将传入的表格HTML字符串 处理成可以保存的字符串
                    data = _getDownloadExcel(data);
                }
                // 执行保存功能
                _downloadFile(fileName, fileTypeText, data);
            }
            else {
                M.error("Mcake暂不支持"+type+"类型的文件下载！")
            }

        }
    });

    //暴露接口
    win.Mcake = win.M = Mcake;
})(window);
