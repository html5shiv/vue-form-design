///////////////////////////////
//////   表格操作   ///////////
///////////////////////////////
import Vue from 'vue'
/**
 * 编辑行数据
 * @param  {Array}  arr [操作数组]
 * @param  {Object} row [操作行对象]
 * @return {Array}      [操作数组]
 */
export const editArrayRow = function(arr, row) {
    return arr.map(function(item) {
        return (item.id === row.id) ? row : item;
    });
}

/**
 * 删除行数据
 * @param  {Array}  arr [操作数组]
 * @param  {Object} row [操作行对象]
 * @return {Array}      [操作数组]
 */
export const removeArrayRow = function(arr, row) {
    return arr.filter(function(item) {
        return item.id !== row.id
    });
}

// 编辑行数据 最终返回数组（专用于树形数组）
export const editArrayRowTree = function(arr, row) {
        function each(arr, obj) {
            M.each(arr, function(item) {
                if (item.id == obj.id) {
                    M.extend(item, obj)
                } else {
                    each(item.children, obj)
                }
            })
            return arr
        };
        return each(arr, row)
    }
    // 删除行数据 (专用于树形数组)
export const removeArrayRowTree = function(arr, row) {
        function each(arr, obj) {
            M.each(arr, function(item, index) {
                if (item.id == obj.id) {
                    arr.splice(index, 1)
                } else {
                    each(item.children, obj)
                }
            })
            return arr
        };
        return each(arr, row)
    }
    // 增加行数据 (专用于树形数组)
export const pushArrayRowTree = function(arr, row, parent) {
    if (row[parent] == "0" || !row[parent]) {
        row.children = []
        arr.push(row)
        return arr;
    }

    function each(arr, obj) {
        M.each(arr, function(item, index) {
            if (item.id == obj[parent]) {
                if (item.children) {
                    item.children.push(obj)
                } else {
                    Vue.set(item, "children", [obj]);
                }
            } else {
                each(item.children, obj, parent)
            }
        })
        return arr
    };
    return each(arr, row, parent);
}

/**
 * 将一个菜单数组按照父级ID分组
 * @param  {Array}  arr        [菜单列表]
 * @param  {String} parentId   [可选，例如你的数据里面叫：parentId]
 * @return {Object}            [返回一个对象，按照父ID分组]
 */
export const menuListToGroup = function(arr = [], parentId = "parentId") {
    // 分组地图
    let ret = {};
    // 遍历数组
    arr.forEach((item) => {
        // 获得当前菜单父ID
        let pId = item[parentId] || 0;
        // 判断是否存在分组 如果不存在 设置一个新的组
        if (!ret[pId]) {
            ret[pId] = [];
        }
        // 放入当前分组
        ret[pId].push(item);
    });
    // 返回一级菜单 及所有子菜单 子菜单会放在当前菜单children属性上
    return ret;
}

/**
 * 将一个菜单数组对象 转换成树形菜单
 * @param  {Array}  arr      [菜单数组对象 每一项必须包含id 和 parentId]
 * @param  {Number} startId  [可选，从那个菜单开始查询 默认从根节点开始]
 * @param  {String} pId      [可选，例如你的数据里面叫：parentId]
 * @return {Array}           [返回一个树形数组对象 所有子菜单会包含在父菜单的children属性中]
 */
export const menuListToTree = function(arr = [], startId = 0, pId) {
    // 分组地图
    let groupMap = menuListToGroup(arr, pId),
        // 获得子菜单函数 传入当前节点ID
        _getChildren = function(id) {
            // 获得子菜单集
            let childrens = groupMap[id] || [];
            // 遍历所有子集
            return childrens.map((item) => {
                // 当前菜单ID
                let itemId = item.id,
                    itemChildrens = groupMap[itemId];
                // 如果存在当前菜单的子集
                if (itemChildrens && itemChildrens.length > 0) {
                    // 获得子集菜单
                    item.children = _getChildren(itemId);
                } else {
                    item.children = []
                }
                return item;
            });
        };
    // 返回一级菜单 及所有子菜单 子菜单会放在当前菜单children属性上
    return _getChildren(startId)
}

/**
 * 将一个菜单数组进行排序
 * @param  {Array/Object}  obj      [菜单列表数组或者已经分好组的菜单对象]
 * @return {Array}                  [排好序的菜单列表]
 */
export const menuListSort = function(obj) {
    // 获得父子关系
    let groupMap = M.isObject(obj) ? obj : menuListToGroup(obj),
        // 返回结果
        ret = [],
        // 获得子菜单函数 传入当前节点ID
        _getChildren = function(id) {
            // 获得子菜单集
            let childrens = groupMap[id] || [];
            // 遍历所有子集
            childrens.forEach((item) => {
                // 当前菜单ID
                let itemId = item.id,
                    itemChildrens = groupMap[itemId];
                // 放入当前菜单
                ret.push(item);
                // 如果存在当前菜单的子集
                if (itemChildrens && itemChildrens.length > 0) {
                    // 获得子集菜单
                    _getChildren(itemId);
                }
            });
        };
    // 获得所有一级菜单
    _getChildren(0);

    return ret;
}

/**
 * 清除字符串中的HTML标签
 * @param  {String} str [字符串]
 * @return {String}     [清除标签后的字符串]
 */
export const clearHtmlTag = function(str) {
    return str ? str.replace(/<[^>]+>/g, "") : "";
}

/**
 * 保存文件
 * @param  {[type]} fileName [description]
 * @param  {[type]} data     [description]
 * @return {[type]}          [description]
 */
export const download = function(fileName, data) {
    var saveLink = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
    saveLink.href = data;
    saveLink.download = fileName;

    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    saveLink.dispatchEvent(event);
}
/**
 * 把对象参数添加到url上
 * @param  {[Object]} param [对象]
 * @return {[String]}       [需要拼到url上面的东西]
 */
export const appendParamToUrl = function(param) {
    let paramArr = [],
        url = "";
    if (M.isObject(param) && M.size(param) > 0) {
        // 遍历每一个参数
        M.each(param, function(value, key) {
            paramArr.push(key + "=" + value);
        });
        url += "?" + paramArr.join("&");
    }
    return url;
}

// 回到顶部
export const backTop = function() {
    document.documentElement.scrollTop = document.body.scrollTop = 0;
}

// 全局变量集
export const consts = {
    // 分页显示条数
    pageRow: 20
};
