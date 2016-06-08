

(function() {
		var html = require("./ace.html");
		var doDom = function(dom) {
			dom.innerHTML = html + dom.innerHTML;
		}
		/**
			未完成contoller

		*/
		var EditorContoller = function(editor, data) {
			this.editor = editor;
			this.data = data;
		}
	this.create = function(data, dom, controller) {
		var Controller = require("../../../controller.js");
		//var dataName = dom.getAttribute("latte-editor-data");
		doDom(dom);
		var Editor = require("./editor");
		var editor = Editor.edit(dom.children[0].children[0]);
		//绑定数据  但是对于之后的数据解绑还未完成   因为基本没有需要释放editor对象的感觉
		editor.setValue(data.get("text")||"");
		editor.getSession().on('change', function(e) {
		    data._set("text", editor.getValue());
		});
		data.on("text", function(value, oldValue) {
			editor.setValue(value);
		});

		var themeName = dom.getAttribute("latte-editor-theme");
		if(themeName) {
			var changeTheme = function(value, oldValue) {
				editor.setTheme("./theme/"+value);
			};
			controller.on("data", themeName, changeTheme);
			data.get(themeName)  && changeTheme(data.get(themeName) );
		}
		

		var modeName = dom.getAttribute("latte-editor-mode");
		if(modeName) {
			console.log(modeName);
			var changeMode = function(value, oldValue) {
				editor.session.setMode("./mode/"+value);
			}
			controller.on("data", modeName, changeMode);
			data.get(modeName) && changeMode(data.get(modeName));
		}
		

	}
	require("latte_dom/utils/css.js").importCssString(require("./ace.css"), "latte_editor_ace_css");
}).call(module.exports);