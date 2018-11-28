/*
 * @Author: jaxQin
 * @Date:   2017-07-28 10:21:32
 * @Last Modified by:   jaxQin
 * @Last Modified time: 2018-01-02 10:02:50
 */

// 基础公共图标
const basic = [
  {
    "value": "ionic"
  },
  {
    "value": "navicon-round"
  },
  {
    "value": "home"
  },
  {
    "value": "star"
  },
  {
    "value": "document-text"
  },
  {
    "value": "folder"
  },
  {
    "value": "person"
  },
  {
    "value": "image"
  },
  {
    "value": "ios-flower"
  },
  {
    "value": "ios-toggle"
  },
  {
    "value": "ios-pulse"
  },
  {
    "value": "erlenmeyer-flask"
  },
  {
    "value": "android-apps"
  },
  {
    "value": "android-options"
  },
  {
    "value": "calculator"
  },
  {
    "value": "ios-book"
  },
  {
    "value": "clipboard"
  },
  {
    "value": "ios-browsers"
  },
  {
    "value": "ios-pulse-strong"
  },
  {
    "value": "gear-a"
  },
  {
    "value": "settings"
  },
  {
    "value": "paper-airplane"
  },
];

// 数据库，工具专用图标
const tool = [{
    value: require("../images/index-icon/image.png"),
    name: "image",
    title: "影像资料数据库"
}, {
    value: require("../images/index-icon/export.png"),
    name: "export",
    title: "报告生成"
}, {
    value: require("../images/index-icon/file.png"),
    name: "file",
    title: "文件数据库"
}, {
    value: require("../images/index-icon/illness.png"),
    name: "illness",
    title: "疾病诊疗数据库"
}, {
    value: require("../images/index-icon/database.png"),
    name: "database",
    title: "科研数据数据库"
}, {
    value: require("../images/index-icon/medicine.png"),
    name: "medicine",
    title: "药物循证数据库"
}, {
    value: require("../images/index-icon/project.png"),
    name: "project",
    title: "科研项目库"
}, {
    value: require("../images/index-icon/slow.png"),
    name: "slow",
    title: "慢病管理数据库"
}, {
    value: require("../images/index-icon/term.png"),
    name: "term",
    title: "术语库"
}];


// 文件相关图标
const file = [{
    value: "folder",
    name: "文件夹"
}, {
    value: "pdf",
    name: "pdf"
}, {
    value: "ppt",
    name: "ppt"
}, {
    value: "excel",
    name: "excel"
}, {
    value: "gif",
    name: "gif"
}, {
    value: "jpg",
    name: "jpg"
}, {
    value: "txt",
    name: "txt"
}, {
    value: "zip",
    name: "zip"
}, {
    value: "rar",
    name: "rar"
}, {
    value: "word",
    name: "word"
}, ];

// 输出图标
export const icons = {
    basic,
    file,
    tool
}
