(function (window,undefined){

var arr = [],
	core_push = arr.push,
	core_indexOf = arr.indexOf,
	support;

//实现构造函数
var dl = function dl(selector){
	//返回init构造函数所创建的对象
	return new dl.prototype.init(selector);
}
//设置原型以及原型别名为fn，并设置核心属性
dl.fn = dl.prototype = {
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
			if ( dl.isFunc(oldFuc) ) {
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
	indexOf:core_indexOf,
	//循环遍历方法
	each:function (arr,fn){
		var i;
		if ( dl.isLikeArr(arr) ) {
			for (i = 0; i < arr.length; i++) {
				//函数返回值为false时停止循环
				if(fn.call(arr[i],i,arr[i]) === false){
					break;
				}
			}
		}else{
			for(i in arr){
				//函数返回值为false时停止循环
				if(fn.call(arr[i],i,arr[i]) === false){
					break;
				}
			}
		}
		
		return arr;
	},
	//消除前后空白字符
	trim: function(str){
		if ( support.trim ) {
			return str.trim();
		}else {
			return str.replace(/^\s+|\s+$/g,"");
		}
	},
});

//查询dom类工具
dl.extend({
	//查询第index个子dom元素
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
	//查询第index个兄弟dom元素
	selectSibling:function(dom,index){
		return selectChild(dom.parentNode,index);
	},
	//查询第一个子dom元素
	firstChild:function (dom){
		return dl.selectChild(dom,0);	
	},
	//查询下一个兄弟dom元素
	nextSibling:function(dom){
		return dom.nextElementSibling || dom.nextSibling;
	},
	//查询前一个兄弟dom元素
	previousSibling: function(dom){
		return dom.previousElementSibling || dom.previousSibling;
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

//工具类方法
dl.fn.extend({
	push:function (arr){
		var arr2 = [],i;
		for (i = 0; i < arr.length; i++) {
			//剔除重复的dom对象
			if (  arr[i].nodeType == 1 && this.indexOf(arr[i]) == -1 && arr2.indexOf(arr[i]) == -1) {
				arr2.push(arr[i]);
			}
		}
		return 	dl.push.apply(this,arr2);
	},
	each:function(fn){
		return dl.each(this,fn);;
	},
	indexOf:function(i){
		return dl.indexOf.call(this,i);
	}
})

//操作dom方法
dl.fn.extend({
	//添加节点
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
				context[i].insertBefore( node );
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
		var arr = [];
		this.each(function(){
			if ( this.nodeType == 1 && this.parentNode) {
				arr.push( this.parentNode.removeChild( this ) );
			}
		})
		//返回删除的jqc对象
		return dl(arr);
	}
})

//查询dom方法
dl.fn.extend({
	//获得当前节点下一个兄弟节点
	next:function(){
		var arr = [];
		this.each(function(){
			arr.push( dl.nextSibling(this) );
		});
		return dl(arr);
	},
	//获得当前节点下面所有兄弟节点
	nextAll:function(){
		var arr = [],node;
		this.each(function(){
			node = this;
			while( node = dl.nextSibling(node) ){
				arr.push(node);
			}
		});
		return dl(arr);
	},
	//获得前一个兄弟节点
	previous: function(){
		var arr = [];
		this.each(function(){
			arr.push( dl.previousSibling(this) );
		});
		return dl(arr);
	},
	//前所有兄弟节点
	previousAll: function(){
		var arr = [],node;
		this.each(function(){
			node = this;
			while( node = dl.previousSibling(node) ){
				arr.push(node);
			}
		});
		return dl(arr);
	}
})

//事件模块
dl.fn.extend({
	//为dl对象内的所有dom元素添加type事件，
	on:function(type,fn){
		this.each(function(){
			//判断是否是支持addEventListener
			if (support.addEventListener) {
				this.addEventListener(type,function( e ){
					fn.call( this, e || window.event );
				});
			} else {
				var that = this;
				dl.each(type.split(","),function(){
					//可能传入多种事件type，对每一个type绑定函数
					that.attacheEvent( "on" + dl.trim( this ), function( e ){
						fn.call( this, e || window.event );
					});
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
});

//利用on方法为dl原型对象添加各种事件
dl.each("click,mouseover,mouseout,mouseenter,mouseleave,mousemove,mousedown,mouseup,keydown,keyup".split(","),function(i,v){
	dl.fn[v] = function(fn){
		return this.on(v,fn);
	}
});

//css操作模块
dl.fn.extend({
	css: function (cName,cValue){
		if (typeof cName === "object") {
			//如果第一个参数时对象则将对象内所有属性赋值给this
			for(var k in cName){
				this.each(function(){
					this.style[k] = cName[k];
				})
			}
		}
		//判断参数个数
		else if (arguments.length === 1 ) {
			if (support.getComputedStyle) {
				// 大部分浏览器获取属性
				return window.getComputedStyle(this[0], null)[cName] ;
			}else {
				// ie浏览器获取属性
				return this[0].currentStyle[cName] ;
			}
		} else {
			return this.each(function(){
				this.style[cName] = cValue;
			});
		}
	},
	hasClass:function(cName){
		return (' '+this[0].className+' ').indexOf(' ' + dl.trim( cName ) + ' ') !== -1;
	},
	addClass: function(cName){
		return this.each(function(){
			//判断是否存在该类名
			if ( !dl(this).hasClass(cName) ) {
				this.className = this.className + " " + dl.trim( cName) ;
			}
		});		
	},
	removeClass: function(cName){
		return this.each(function(){
			//删除cName类名
			this.className = dl.trim( (' '+this.className+' ').replace(" "+dl.trim(cName)+" "," ") );
		});	
	},
	toggleClass: function(cName){
		return	this.hasClass(cName) ? this.removeClass(cName) : this.addClass(cName);
	}
});

//内容操作工具模块
dl.extend({
	getText: function(dom,results){
		results = results || [];
		//获取所有子节点
		dl.each(dom.childNodes,function(){
			if( this.nodeType === 3 ) {
				//将文本节点的值添加进数组
				results.push(this.nodeValue);
			}else if( this.nodeType === 1){
				//递归获取元素节点的文本节点
				dl.getText(this,results);
			}
		});
		//将获取到的文本节点的值转换成字符串返回
		return results.join("");
	},
	setText: function(dom,text){

		dom.innerHTML = "";
		dom.appendChild( document.createTextNode(text) )
	}
});

//属性操作模块
dl.fn.extend({
	//获取或者设置属性
	attr: function(aName,aValue){
		if (aValue == undefined) {
			//传一个参数时返回对象第一个dom元素的aName属性
			return this[0][aName];
		}else {
			//传两个参数时对所有dom对象设置属性
			return this.each(function(){
				this[aName] = aValue;
			});
		}
	},
	val:function(value){
		return this.attr("value",value);
	},
	html:function(value){
		return this.attr("innerHTML",value);
	},
	text: function(value){
		//浏览器能力检测
		if ("innerText" in this[0]) {
			return this.attr("innerText",value);
		}else{
			if (arguments.length == 1) {
				//传一个参数时设置所有dom的文本节点
				return this.each(function(){
					dl.setText(this,value)
				});
			}else {
				//传两个参数时获取第一个dom节点的文本节点
				return dl.getText(this[0]);
			}
			
		}
	}
});

//设置的属性对应style属性
var attrHook = {
	left:"offsetLeft",
	width:"offsetWidth",
	top:"offsetTop",
	height:"offsetHeight"
};

//动画帮助工具
dl.extend({
	ease:function(time, startLocations, target, dur, easingName ){
		return dl.easings[easingName]( time, startLocations, target, dur);
	},
	easings: {
		liner: function ( t, b, c, d ) { 
			return t * ( c - b ) / d;
		},
		minusspeed: function ( t, b, c, d ) {
			// 需要初始速度 和加速度
			var a = 2 * ( c - b ) / ( d * d ),
				v_0 = a * d;
			return v_0 * t - a * t * t / 2;
		}
	}
})
//动画模块
dl.fn.extend({
	animate: function(target,dur,easingName){
		//对第一个dom实现动画
		var dom = this[0],
			//记录当前时间
			startTime = +new Date, 
			//默认使用liner运动
			easingName = easingName || "liner",
			startLocations = {},
			step = 25,
			timerId,k;
		
		for(k in target){
			//获得当前属性的数值
			startLocations[k] = dom[attrHook[k]];
		}
		//运行一次方法让动画立即运动起来
		play();
		//循环
		this.timer = setInterval( play, step );
		function play(){
			//获得运动持续时间
			var time = +new Date - startTime, 
			tweens = {};
			if (time >= dur) {
				//此时运动持续时间大于总时间，应该停止动画
				for(k in target){
					//转换成number类型  去除"px"字符串
					tweens[k] = parseInt(target[k]) - dom;
					//停止动画
					this.stop();
				}
			}else {
				//此时调用运动算法获得当前时间对象的当前tween存入数组
				for(k in target){
					tweens[k] = dl.ease(time,startLocations[k],target[k],dur,easingName);
				}
			}
			//设置样式
			for(k in tweens){
				dom.style[k] = startLocations[k] + tweens[k] + "px";
			}
		};
	},
	stop:function(){
		clearInterval(this.timer);
		return this;
	}
})


//callback模块
// once 、 memory 、 unique 、stopOnFalse
// once -- 确保这个回调列表只执行（ .fire() ）一次(像一个递延 Deferred)
// memory -- 保持以前的值，将添加到这个列表的后面的最新的值立即执行调用任何回调 (像一个递延 Deferred)
// unique -- 确保一次只能添加一个回调(所以在列表中没有重复的回调)
// stop -- 当一个回调返回 false 时中断调用
dl.Callbacks = function (opt){
	var options = {},
		self,
		memoryArg = null,
		list = [];
	//分割opt
	if (opt) {
		opt = opt.split(" ");
		for( var k in opt ){
			if (opt[k]) {
				// 如果opt[k]非空字符串，为options添加一个键为opt[k]值为true的属性
				options[opt[k]] = true;
			}
		}
	}
	self = {
		fire:function(){
			//判断是否可以执行
			if (!list.onceFlag) {
				//如果存在once关键字，则将onceFlag置为true。阻止下次执行
				if (options.once) {
					list.onceFlag = true;
				}
				//如果存在memory关键字则保存arguments
				if (options.memory) {
					memoryArg = arguments;
				}
				// 循环执行list内的所有函数
				dl.each(list,function(){
					// 判断函数返回值以及是否有stop关键字
					if (this.apply(this,arguments) === false && options.stop) {
						//直接返回false停止遍历
						return false;
					}
				})
			}
		},
		add:function(fn){
			//判断fn是否为函数
			//并且如果存在unique关键字并且fn函数已经存在列表时，不添加该函数
			if ( dl.isFunc(fn) && !(options.unique && self.has(fn)) ) {
				list.push(fn);
				if (options.memory && memoryArg != null) {
					// 如果存在memory关键字则立即执行该函数
					fn.apply(this,memoryArg);
				}
			}
		},
		remove:function(fn){
			var index = list.indexOf(fn);
			if (index > -1) {
				list.splice(index,1);
			}
		},
		has:function(fn){
			return list.indexOf(fn) > -1;
		}
	};
	return self;
}

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

support.trim = function (){
	return !!String.prototype.trim;
}
//测试方法是否拥有相应的能力，判断该方法是否被修改
support.getElementsByClassName = support.assert( function(div){
	div.innerHTML = "<div class='a'></div>";
	return div.getElementsByClassName("a")[0];
});
//对addEventListener进行能力检测
support.addEventListener = support.assert( function(div){
	var flag = false;
	div.addEventListener("click",function(e){
		// support.event = !!(e);//检测event对象，感觉对性能提升没多大帮助,暂时注释
		flag = true
	});
	div.click();
	return flag;
});

support.getComputedStyle = support.assert( function(div){
	return window.getComputedStyle(div, null)["width"] !== undefined;
})

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