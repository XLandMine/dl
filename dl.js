(function (window,undefined){

var arr = [],
	core_push = arr.push,
	core_slice = arr.slice,
	core_indexOf = arr.indexOf,
	core_concat = arr.concat,
	support;

//实现构造函数
var dl = function dl(selector){
	//返回init构造函数所创建的对象
	return new dl.prototype.init(selector);
}
//设置原型以及原型别名为fn
dl.fn = dl.prototype = {
	//添加核心方法
	constructor:dl,
	length:0,
	//初始化方法
	init:function ( selector , context ){
		var context = context || document;
		//判断传入的是否是 null '' undefined 0
		if (!selector) return;
		//判断selector是否是字符串
		if (dl.isString(selector)) {
			if (selector.charAt(0) === "<") {
				//当为html标签时将调用parseHTML方法获取dom数组
				//将获取到的数组调用pushArr方法添加到自身
				this.push( parseHTML(selector) );
			}else{
				//否则调用select方法获取dom数组
				//将获取到的数组调用pushArr方法添加到自身
				this.push( select(selector,context) );
			}
		//判断selector是否是dom节点
		} else if(dl.isDom(selector)) {
			//当传入的是dom元素时将dom元素添加到自身
			this.push( [selector] );
		//判断传入的是否是dom数组
		} else if(dl.isLikeArr(selector) && dl.isDom(selector[0]) ){
			this.push(selector);
		//判断传入的是否是dl对象
		} else if( dl.isDl(selector) ){
			return this;
		//当传入的是函数时，将函数添加到onload事件中
		} else if(dl.isFunc(selector)){
			//保存原有onload事件
			var oldFuc = window.onload;
			if (oldFuc) {
				// 如果原有onload事件存在，则将新事件添加到原有函数的后面执行
				// 并且用一个匿名函数包裹，如果多次传入函数能达到递归调用每一个函数的效果
				window.onload = function(){
					oldFuc();
					selector();
				}
			}else{
				//不存在则将新函数设置为onload
				window.onload = selector;
			}
		}
	},
	push:function (arr){
		return 	dl.push.apply(this,arr);
	},
	each:function(fn){
		return dl.each(this,fn);;
	}
}
//将init构造函数的原型对象设置为dl的原型对象，这样为dl原型对象添加属性时init实例化出的对象也能继承到
dl.fn.init.prototype = dl.fn;


//实现继承属性的方法
dl.fn.extend = dl.extend = function(obj){
	for(var k in obj){
		// 将obj所有属性赋值给this对象
		this[k] = obj[k];
	}
}

//工具类方法模块
dl.extend({
	//将arr数组对象添加到obj对象中，要求obj以及arr为数组或者伪数组对象
	push:core_push,
	//循环遍历方法
	each:function (arr,fn){
		for (var i = 0; i < arr.length; i++) {
			//函数返回值为false时停止循环
			if(fn.call(arr[i],i,arr[i]) === false){
				break;
			}
		}
		return arr;
	},
	trim: function(str){
		if ( String.prototype.trim ) {
			return str.trim();
		}else {
			return str.replace(/^\s+|\s+$/g,"");
		}
	}
});

//查询dom类工具
dl.extend({
	selectChild:function(dom,index){
		var i = 0, j = 0, childNodes = dom.childNodes,
			index = index || 0;
		for (var i = 0; i < childNodes.length; i++) {
			if ( childNodes[i].nodeType === 1 ) {
				if ( index == j++ ) {
					return childNodes[i];
				}
			}
		}
	},
	firstChild:function (dom){
		return dl.selectChild(dom,0);	
	}
});

//判断类型模块
dl.extend({
	//判断是否是数组或者伪数组
	isLikeArr:function(obj){
										//如果obj.length > 0 判断最后一位在不在obj内 否则判断length是否为0
		return !!(obj && obj.length && (obj.length > 0 ? obj.length - 1 in obj : obj.length == 0) );
	},
	isString:function(obj){
		return !!(typeof obj === "string");
	},
	isFunc:function(obj){
		return !!(typeof obj === "function");
	},
	//是否是dom对象
	isDom:function(obj){
		return !!(obj.nodeType);
	},
	//是否是jqc对象
	isDl:function(obj){
		if(obj.constructor.name){
			return !!(obj.constructor.name === "dl");
		}else{
			return !!(/function\s+(\w+)\s*\(/.exec(obj.constructor+"")[1] === "dl");
		}
	}
});


//dom操作方法
dl.fn.extend({
	//将this当子元素添加到传入对象上
	appendTo:function(selector){
		var i = 0,context = dl(selector),arr = [],
			cLen = context.length,
			tLen = this.length,
			j,node;
		for (; i < cLen; i++) {
			for ( j = 0; j < tLen; j++) {
				//如果外循环不是最后一次循环则将节点深克隆一份
				node = i < cLen - 1 ? this[j].cloneNode(true) : this[j];
				// 将节点保存在arr中
				arr.push( node );
				// 将节点当子元素添加到上下文节点中
				context[i].appendChild( node );
			}
		}
		//将所有子节点保存在数组中以jqc对象返回
		return dl(arr);
	},
	//将传入对象转换成jqc当子元素添加到this对象上
	append:function(selector){
		dl(selector).appendTo(this);
		return this;
	},
	prependTo:function (selector){
		var i = 0,
			context = dl(selector),
			cLen = context.length,
			tLen = this.length,
			arr = [],
			j,node;
		for (; i < cLen; i++) {
			for ( j = 0; j < tLen; j++) {
				//如果外循环不是最后一次循环则将节点深克隆一份
				node = i < cLen - 1 ? this[j].cloneNode(true) : this[j];
				// 将节点保存在arr中
				arr.push( node );
				// 将节点当子元素添加到上下文节点第一个元素之前
				context[i].insertBefore( node , dl.firstChild(context[i]) );
			}
		}
		//将所有子节点保存在数组中以jqc对象返回
		return dl(arr);
	},
	prepend:function(selector){
		dl(selector).prependTo(this);
		return this;
	},
	//删除当前jqc对象中的所有dom元素
	remove:function(){
		this.each(function(){
			arr.push( this.parentNode.removeChild( this ) );
		})
		//返回删除的jqc对象
		return this;
	}
})

//事件模块
dl.fn.extend({
	//为dl对象内的所有dom元素添加type事件，
	on:function(type,fn){
		this.each(function(){
			//判断是否是支持addEventListener
			if (support.addEventListener) {
				this.addEventListener(type,fn);
			} else {
				var that = this;
				dl.each(type.split(","),function(){
					that.attacheEvent("on"+this,fn);
				})
			}
		});
		return this;
	},
	// 鼠标移入移出事件
	hover:function(fn1,fn2){
		this.mouseover(fn1).mouseout( fn2 || fn1 );
		return this;
	},
	//参数要求为函数，循环执行参数列表中所有函数
	toggle:function(){
		//保存下参数列表
		var fns = arguments,i = 0;
		//调用click事件
		this.click(function(e){
			//使用上下文调用函数方式调用参数列表里的函数
			//判断当前该执行数组中第几个函数
			fns[i++ % fns.length].call(this,e);
		})
		return this;
	}
})

//利用on方法为dl原型对象添加各种事件
dl.each("click,mouseover,mouseout,mouseenter,mouseleave,mousemove,mousedown,mouseup,keydown,keyup".split(","),function(i,v){
	dl.fn[v] = function(fn){
		return this.on(v,fn);
	}
});

//能力检测模块
support = {};

//能力测试方法
support.assert = function(fn){
	// 创建测试用节点
	var div = document.createElement("div");
	try {
		// 转换fn的返回值为boolean值
		// fn(div) -- assert(function(div){}) 这里的 div 就是上面创建的测试节点
		return !!fn(div);
	} catch (e) {
		return false;
		// 结束时移除这个节点
	} finally {
		// Remove from its parent by default
		if (div.parentNode) {
			div.parentNode.removeChild(div);
		}
		// release memory in IE
		// 在 IE 里释放内存
		div = null;
	}
}
//测试方法是否拥有相应的能力，判断该方法是否被修改
support.getElementsByClassName = support.assert(function(div){
	div.innerHTML = "<div class='a'></div>";
	return div.getElementsByClassName("a")[0];
});
support.addEventListener = support.assert(function(div){
	var flag = false;
	div.addEventListener("click",function(){flag = true});
	div.click();
	return flag;
});


//html转换dom对象
var parseHTML = function(html){
	var i = 0,
		arr = [],
		div = document.createElement("div");
	div.innerHTML = html;
	for(; i < div.childNodes.length; i++ ){
		arr.push(div.childNodes[i]);
	}
	return arr;
}

//搜索引擎select,传入support能力检测对象
var select = (function(support){
	var rQuitCheck = /^(?:#(\w+)|\.(\w+)|(\w+)|(\*))$/;
	function select ( selector, context, results ){
		var results = results || [];
		//如果上下文对象不存在则初始化为document
		var context = context || document;
		//处理逗号
		var newSelector = selector.split(",");
		dl.each(newSelector , function(){
			var c = context;
			dl.each(this.split(" "),function (){
				if (this !== "") c = get(this,c);
			})
			results.push.apply(results,c);
		});
		return results;
	}

	//获取节点方法
	function get( selector, context, results ){
		var results = results || [];
		//如果上下文对象不存在则初始化为document
		var context = context || document;
		//匹配selector
		var m = rQuitCheck.exec(selector);
		if(!m) return;
		//如果context不是数组则变成成数组对象
		if(context.nodeType) context = [ context ];
		if(typeof context === "string") context = get(context);
		dl.each(context,function(i,v){
			if (m[1]) {
				//匹配到id则调用id方法获得对象数组
				results = getId(m[1], v,results);
			}else if(m[2]){
				//匹配到className
				results = getClassName(m[2], v,results);
			}else{
				//匹配到tag或者*
				results = getTagName( m[3] || m[4], v, results);
			}
		});
		return results;
	}
	//根据id获取节点
	function getId( id, context, results ){
		var results = results || [],
			node;
		node = document.getElementById(id);
		if ( node ) {
			//判断node是否为空，不为空才加入results数组
			results.push.call( results , node );
		}
		return results; 
	}
	//根据tag获取节点
	function getTagName( tagName, context, results ){
		var results = results || [];
		results.push.apply(results,document.getElementsByTagName(tagName));
		return results; 
	}
	//根据class获取节点
	function getClassName( className, context, results ){
		var results = results || [];
		if (support.getElementsByClassName) {
			//getElementsByClassName方法是能用则直接使用
			results.push.apply(results,document.getElementsByClassName(className));
		}else {
			//否则获取全部标签并判断className是否相同
			dl.each(context.getElementsByTagName("*"),function(){
				if ( (" "+ this.className +" ").indexOf(" "+ className +" ")  != -1 ) {
					//判断是否该标签是否存在className  存在则添加至results
					results.push(this);
				}
			});
		}
		return results;
	}
	//去除首位空格
	function trim (str){
		if ( String.prototype.trim ) {
			return str.trim();
		}else {
			return str.replace(/^\s+|\s+$/g,"");
		}
	}
	return select;
})(support);

window.dl = dl;
})(window);