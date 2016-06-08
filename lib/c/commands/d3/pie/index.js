var d3 = require("../d3.js");
(function() {
		//	保存2位数
		function toDecimal2(x) {    
	        var f = parseFloat(x);    
	        if (isNaN(f)) {    
	            return false;    
	        }    
	        var f = Math.round(x*100)/100;    
	        var s = f.toString();    
	        var rs = s.indexOf('.');    
	        if (rs < 0) {    
	            rs = s.length;    
	            s += '.';    
	        }    
	        while (s.length <= rs + 2) {    
	            s += '0';    
	        }    
	        return s;    
	    }    
	    /**
	    	1.title

	    */
	    this.create = function(data, dom) {
	    	var Controller = require("../../../controller.js")
	    		, dataName = dom.getAttribute("latte-data");
	    	if(dataName) {
	    		//var d = data.get(dataName);
	    		var d = data;
	    		var d3Root = d3.select(dom);
	    		var width = d.get("width");
				var height = d.get("height");
				var all = d.get("data.all");
				var dataset;
				switch(dom.getAttribute("latte-d3-type")) {
					case "percent":
						var num = 0;
					 	all.getKeys().forEach(function(key) {
					 		num += all.get(key);
						});
					 	dataset = all.getKeys().map(function(key) {
					 		return all.get(key) / num;
						});
					break;
					default:
						dataset = all.getKeys().map(function(key) {
							return all.get(key);
						});	
					break;
				}
	    		//定义画布
	    		var svg=d3Root
					.append("svg")
					.attr("width",width)
					.attr("height",height);
				svg.append("g")
				.append("rect")
				.attr("x",0)
				.attr("y",0)
				.attr("latte-width","width")
				.attr("latte-height","height")
				.style("fill","#FFF")
				.style("stroke-width",2)
				.style("stroke","#E7E7E7");	

				svg.append("g")
				.append("text")
				.text("abc")
				.attr({
					"class": "title",
					x: width/2,
					y: 40
				});
				
				var pie = d3.layout.pie();

				var piedata = pie(dataset);
				console.log(piedata);
				var arc = d3.svg.arc()	//弧生成器
							.innerRadius(0)	//设置内半径
							.outerRadius(150);	//设置外半径
			
				var color = d3.scale.category10();
			
				var arcs = svg.append("g").selectAll("g")
							  .data(piedata)
							  .enter()
							  .append("g")
							  .attr("transform","translate("+ (width/2) +","+ (width/2) +")");
							  
				arcs.append("path")
					.attr("fill",function(d,i){
						return color(i);
					})
					.attr("d",function(d){
						return arc(d);
					});
				
				arcs.append("text")
					.attr("transform",function(d){
						return "translate(" + arc.centroid(d) + ")";
					})
					.attr("text-anchor","middle")
					.text(function(d, index){
						return (all.getKeys()[index]+"("+toDecimal2(d.data)+")");
						//return d.data;
					});
		    	}
		    }
	    /**
	this.create = function(data, dom) {
		var Controller = require("../../../controller.js");
		var dataName = dom.getAttribute("latte-d3-data");
		if(dataName) {
			var d = data.get(dataName);
			var d3Root = d3.select(dom);

		
			var width = d.get("width");
			var height = d.get("height");
			var all = d.get("data.all");
			var dataset;
			switch(dom.getAttribute("latte-d3-type")) {
				case "percent":
					var num = 0;
				 	all.getKeys().forEach(function(key) {
				 		num += all.get(key);
					});
				 	dataset = all.getKeys().map(function(key) {
				 		return all.get(key) / num;
					});
				break;
				default:
					dataset = all.getKeys().map(function(key) {
						return all.get(key);
					});	
				break;
			}
			
			//var dataset = [ 30 , 10 , 43 , 55 , 13 ];
			console.log(dataset);
			var svg = d3Root
						.append("svg")
						.attr("width", width)
						.attr("height", height);
			
			var pie = d3.layout.pie();

			var piedata = pie(dataset);
			
			var outerRadius = 150;	//外半径
			var innerRadius = 0;	//内半径，为0则中间没有空白

			var arc = d3.svg.arc()	//弧生成器
						.innerRadius(innerRadius)	//设置内半径
						.outerRadius(outerRadius);	//设置外半径
			
			var color = d3.scale.category10();
			
			var arcs = svg.selectAll("g")
						  .data(piedata)
						  .enter()
						  .append("g")
						  .attr("transform","translate("+ (width/2) +","+ (width/2) +")");
						  
			arcs.append("path")
				.attr("fill",function(d,i){
					return color(i);
				})
				.attr("d",function(d){
					return arc(d);
				});
			
			arcs.append("text")
				.attr("transform",function(d){
					return "translate(" + arc.centroid(d) + ")";
				})
				.attr("text-anchor","middle")
				.text(function(d, index){
					return (all.getKeys()[index]+"("+toDecimal2(d.data)+")");
					//return d.data;
				});
			
			
			  
        
		}
		
	}*/
}).call(module.exports);