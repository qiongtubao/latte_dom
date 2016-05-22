
	/**
		<img latte-image="i"></img>
		
		并不能动态的修改图片
	*/
	var LatteObject = require("../../m/data.js")
		, latte_lib = require("latte_lib");
	var Command = {};
	(function() {
			var getFileType = function(str) {
				var splices = str.split(".");
				return splices.length > 1 ? splices.splice(-1)[0]: "";
			} 
		this.after = function(data, dom, controller) {
			var imageName = dom.getAttribute("latte-image");
			var latteObject = LatteObject.create(data);
			if(imageName) {
				var change = function(image) {
					var nameIndex = image.indexOf("#");
					var name, imagePath;
					if(nameIndex != -1) {
						name = image.substring(nameIndex + 1);
						imagePath = image.substring(0, nameIndex);
					}else{
						imagePath = image;
					}
					var type = getFileType(imagePath);
					var Controller = require("../controller.js");
					switch(type) {
						case "png":
						case "jpg":
							var d = require("../../utils/images").getDom(imagePath, name, dom);
							Controller.removeChild(dom);
							dom.appendChild(d);
						break;
						case "svg":
							var d = require("../../utils/svg").getDom(imagePath, name, dom);
							Controller.removeChild(dom);
							dom.appendChild(d);
						break;
						case "canvas":

						break;

					}
				};
				change(data.get(imageName));
				controller.bind("data", imageName, change);

			}

		};
	}).call(Command);
	
	module.exports = Command;