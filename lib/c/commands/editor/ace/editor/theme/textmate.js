exports.isDark = false;
exports.cssClass = "ace-tm";
exports.cssText = require("./textmate.css");

var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);