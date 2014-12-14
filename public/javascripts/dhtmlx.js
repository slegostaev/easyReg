/*
This software is allowed to use under GPL or you need to obtain Commercial or Enterise License
to use it in non-GPL project. Please contact sales@dhtmlx.com for details
*/

if (!window.dhtmlx) {
	dhtmlx = function(obj){
		for (var a in obj) dhtmlx[a]=obj[a];
		return dhtmlx; //simple singleton
	};
}
dhtmlx.extend_api=function(name,map,ext){
	var t = window[name];
	if (!t) return; //component not defined
	window[name]=function(obj){
		if (obj && typeof obj == "object" && !obj.tagName){
			var that = t.apply(this,(map._init?map._init(obj):arguments));
			//global settings
			for (var a in dhtmlx)
				if (map[a]) this[map[a]](dhtmlx[a]);
			//local settings
			for (var a in obj){
				if (map[a]) this[map[a]](obj[a]);
				else if (a.indexOf("on")==0){
					this.attachEvent(a,obj[a]);
				}
			}
		} else
			var that = t.apply(this,arguments);
		if (map._patch) map._patch(this);
		return that||this;
	};
	window[name].prototype=t.prototype;
	if (ext)
		dhtmlXHeir(window[name].prototype,ext);
};

dhtmlxAjax={
	get:function(url,callback){
		var t=new dtmlXMLLoaderObject(true);
		t.async=(arguments.length<3);
		t.waitCall=callback;
		t.loadXML(url)
		return t;
	},
	post:function(url,post,callback){
		var t=new dtmlXMLLoaderObject(true);
		t.async=(arguments.length<4);
		t.waitCall=callback;
		t.loadXML(url,true,post)
		return t;
	},
	getSync:function(url){
		return this.get(url,null,true)
	},
	postSync:function(url,post){
		return this.post(url,post,null,true);
	}
}

/**
 *     @desc: xmlLoader object
 *     @type: private
 *     @param: funcObject - xml parser function
 *     @param: object - jsControl object
 *     @param: async - sync/async mode (async by default)
 *     @param: rSeed - enable/disable random seed ( prevent IE caching)
 *     @topic: 0
 */
function dtmlXMLLoaderObject(funcObject, dhtmlObject, async, rSeed){
	this.xmlDoc="";

	if (typeof (async) != "undefined")
		this.async=async;
	else
		this.async=true;

	this.onloadAction=funcObject||null;
	this.mainObject=dhtmlObject||null;
	this.waitCall=null;
	this.rSeed=rSeed||false;
	return this;
};

dtmlXMLLoaderObject.count = 0;

/**
 *     @desc: xml loading handler
 *     @type: private
 *     @param: dtmlObject - xmlLoader object
 *     @topic: 0
 */
dtmlXMLLoaderObject.prototype.waitLoadFunction=function(dhtmlObject){
	var once = true;
	this.check=function (){
		if ((dhtmlObject)&&(dhtmlObject.onloadAction != null)){
			if ((!dhtmlObject.xmlDoc.readyState)||(dhtmlObject.xmlDoc.readyState == 4)){
				if (!once)
					return;

				once=false; //IE 5 fix
				dtmlXMLLoaderObject.count++;
				if (typeof dhtmlObject.onloadAction == "function")
					dhtmlObject.onloadAction(dhtmlObject.mainObject, null, null, null, dhtmlObject);

				if (dhtmlObject.waitCall){
					dhtmlObject.waitCall.call(this,dhtmlObject);
					dhtmlObject.waitCall=null;
				}
			}
		}
	};
	return this.check;
};

/**
 *     @desc: return XML top node
 *     @param: tagName - top XML node tag name (not used in IE, required for Safari and Mozilla)
 *     @type: private
 *     @returns: top XML node
 *     @topic: 0
 */
dtmlXMLLoaderObject.prototype.getXMLTopNode=function(tagName, oldObj){
	if (this.xmlDoc.responseXML){
		var temp = this.xmlDoc.responseXML.getElementsByTagName(tagName);
		if(temp.length==0 && tagName.indexOf(":")!=-1)
			var temp = this.xmlDoc.responseXML.getElementsByTagName((tagName.split(":"))[1]);
		var z = temp[0];
	} else
		var z = this.xmlDoc.documentElement;

	if (z){
		this._retry=false;
		return z;
	}

	if (!this._retry){
		this._retry=true;
		var oldObj = this.xmlDoc;
		this.loadXMLString(this.xmlDoc.responseText.replace(/^[\s]+/,""), true);
		return this.getXMLTopNode(tagName, oldObj);
	}

	dhtmlxError.throwError("LoadXML", "Incorrect XML", [
		(oldObj||this.xmlDoc),
		this.mainObject
	]);

	return document.createElement("DIV");
};

/**
 *     @desc: load XML from string
 *     @type: private
 *     @param: xmlString - xml string
 *     @topic: 0
 */
dtmlXMLLoaderObject.prototype.loadXMLString=function(xmlString, silent){

	if (!_isIE){
		var parser = new DOMParser();
		this.xmlDoc=parser.parseFromString(xmlString, "text/xml");
	} else {
		this.xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
		this.xmlDoc.async=this.async;
		this.xmlDoc.onreadystatechange = function(){};
		this.xmlDoc["loadXM"+"L"](xmlString);
	}

	if (silent)
		return;

	if (this.onloadAction)
		this.onloadAction(this.mainObject, null, null, null, this);

	if (this.waitCall){
		this.waitCall();
		this.waitCall=null;
	}
}
/**
 *     @desc: load XML
 *     @type: private
 *     @param: filePath - xml file path
 *     @param: postMode - send POST request
 *     @param: postVars - list of vars for post request
 *     @topic: 0
 */
dtmlXMLLoaderObject.prototype.loadXML=function(filePath, postMode, postVars, rpc){
	if (this.rSeed)
		filePath+=((filePath.indexOf("?") != -1) ? "&" : "?")+"a_dhx_rSeed="+(new Date()).valueOf();
	this.filePath=filePath;

	if ((!_isIE)&&(window.XMLHttpRequest))
		this.xmlDoc=new XMLHttpRequest();
	else {
		this.xmlDoc=new ActiveXObject("Microsoft.XMLHTTP");
	}

	if (this.async)
		this.xmlDoc.onreadystatechange=new this.waitLoadFunction(this);
	this.xmlDoc.open(postMode ? "POST" : "GET", filePath, this.async);

	if (rpc){
		this.xmlDoc.setRequestHeader("User-Agent", "dhtmlxRPC v0.1 ("+navigator.userAgent+")");
		this.xmlDoc.setRequestHeader("Content-type", "text/xml");
	}

	else if (postMode)
		this.xmlDoc.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

	this.xmlDoc.setRequestHeader("X-Requested-With","XMLHttpRequest");
	this.xmlDoc.send(null||postVars);

	if (!this.async)
		(new this.waitLoadFunction(this))();
};
/**
 *     @desc: destructor, cleans used memory
 *     @type: private
 *     @topic: 0
 */
dtmlXMLLoaderObject.prototype.destructor=function(){
	this._filterXPath = null;
	this._getAllNamedChilds = null;
	this._retry = null;
	this.async = null;
	this.rSeed = null;
	this.filePath = null;
	this.onloadAction = null;
	this.mainObject = null;
	this.xmlDoc = null;
	this.doXPath = null;
	this.doXPathOpera = null;
	this.doXSLTransToObject = null;
	this.doXSLTransToString = null;
	this.loadXML = null;
	this.loadXMLString = null;
	// this.waitLoadFunction = null;
	this.doSerialization = null;
	this.xmlNodeToJSON = null;
	this.getXMLTopNode = null;
	this.setXSLParamValue = null;
	return null;
}

dtmlXMLLoaderObject.prototype.xmlNodeToJSON = function(node){
	var t={};
	for (var i=0; i<node.attributes.length; i++)
		t[node.attributes[i].name]=node.attributes[i].value;
	t["_tagvalue"]=node.firstChild?node.firstChild.nodeValue:"";
	for (var i=0; i<node.childNodes.length; i++){
		var name=node.childNodes[i].tagName;
		if (name){
			if (!t[name]) t[name]=[];
			t[name].push(this.xmlNodeToJSON(node.childNodes[i]));
		}
	}
	return t;
}

/**
 *     @desc: Call wrapper
 *     @type: private
 *     @param: funcObject - action handler
 *     @param: dhtmlObject - user data
 *     @returns: function handler
 *     @topic: 0
 */
function callerFunction(funcObject, dhtmlObject){
	this.handler=function(e){
		if (!e)
			e=window.event;
		funcObject(e, dhtmlObject);
		return true;
	};
	return this.handler;
};

/**
 *     @desc: Calculate absolute position of html object
 *     @type: private
 *     @param: htmlObject - html object
 *     @topic: 0
 */
function getAbsoluteLeft(htmlObject){
	return getOffset(htmlObject).left;
}
/**
 *     @desc: Calculate absolute position of html object
 *     @type: private
 *     @param: htmlObject - html object
 *     @topic: 0
 */
function getAbsoluteTop(htmlObject){
	return getOffset(htmlObject).top;
}

function getOffsetSum(elem) {
	var top=0, left=0;
	while(elem) {
		top = top + parseInt(elem.offsetTop);
		left = left + parseInt(elem.offsetLeft);
		elem = elem.offsetParent;
	}
	return {top: top, left: left};
}
function getOffsetRect(elem) {
	var box = elem.getBoundingClientRect();
	var body = document.body;
	var docElem = document.documentElement;
	var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
	var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
	var clientTop = docElem.clientTop || body.clientTop || 0;
	var clientLeft = docElem.clientLeft || body.clientLeft || 0;
	var top  = box.top +  scrollTop - clientTop;
	var left = box.left + scrollLeft - clientLeft;
	return { top: Math.round(top), left: Math.round(left) };
}
function getOffset(elem) {
	if (elem.getBoundingClientRect) {
		return getOffsetRect(elem);
	} else {
		return getOffsetSum(elem);
	}
}

/**
 *     @desc: Convert string to it boolean representation
 *     @type: private
 *     @param: inputString - string for covertion
 *     @topic: 0
 */
function convertStringToBoolean(inputString){
	if (typeof (inputString) == "string")
		inputString=inputString.toLowerCase();

	switch (inputString){
		case "1":
		case "true":
		case "yes":
		case "y":
		case 1:
		case true:
			return true;
			break;

		default: return false;
	}
}

/**
 *     @desc: find out what symbol to use as url param delimiters in further params
 *     @type: private
 *     @param: str - current url string
 *     @topic: 0
 */
function getUrlSymbol(str){
	if (str.indexOf("?") != -1)
		return "&"
	else
		return "?"
}

function dhtmlDragAndDropObject(){
	if (window.dhtmlDragAndDrop)
		return window.dhtmlDragAndDrop;

	this.lastLanding=0;
	this.dragNode=0;
	this.dragStartNode=0;
	this.dragStartObject=0;
	this.tempDOMU=null;
	this.tempDOMM=null;
	this.waitDrag=0;
	window.dhtmlDragAndDrop=this;

	return this;
};

dhtmlDragAndDropObject.prototype.removeDraggableItem=function(htmlNode){
	htmlNode.onmousedown=null;
	htmlNode.dragStarter=null;
	htmlNode.dragLanding=null;
}
dhtmlDragAndDropObject.prototype.addDraggableItem=function(htmlNode, dhtmlObject){
	htmlNode.onmousedown=this.preCreateDragCopy;
	htmlNode.dragStarter=dhtmlObject;
	this.addDragLanding(htmlNode, dhtmlObject);
}
dhtmlDragAndDropObject.prototype.addDragLanding=function(htmlNode, dhtmlObject){
	htmlNode.dragLanding=dhtmlObject;
}
dhtmlDragAndDropObject.prototype.preCreateDragCopy=function(e){
	if ((e||window.event) && (e||event).button == 2)
		return;

	if (window.dhtmlDragAndDrop.waitDrag){
		window.dhtmlDragAndDrop.waitDrag=0;
		document.body.onmouseup=window.dhtmlDragAndDrop.tempDOMU;
		document.body.onmousemove=window.dhtmlDragAndDrop.tempDOMM;
		return false;
	}

	if (window.dhtmlDragAndDrop.dragNode)
		window.dhtmlDragAndDrop.stopDrag(e);

	window.dhtmlDragAndDrop.waitDrag=1;
	window.dhtmlDragAndDrop.tempDOMU=document.body.onmouseup;
	window.dhtmlDragAndDrop.tempDOMM=document.body.onmousemove;
	window.dhtmlDragAndDrop.dragStartNode=this;
	window.dhtmlDragAndDrop.dragStartObject=this.dragStarter;
	document.body.onmouseup=window.dhtmlDragAndDrop.preCreateDragCopy;
	document.body.onmousemove=window.dhtmlDragAndDrop.callDrag;
	window.dhtmlDragAndDrop.downtime = new Date().valueOf();


	if ((e)&&(e.preventDefault)){
		e.preventDefault();
		return false;
	}
	return false;
};
dhtmlDragAndDropObject.prototype.callDrag=function(e){
	if (!e)
		e=window.event;
	dragger=window.dhtmlDragAndDrop;
	if ((new Date()).valueOf()-dragger.downtime<100) return;

	//if ((e.button == 0)&&(_isIE))
	//	return dragger.stopDrag();

	if (!dragger.dragNode){
		if (dragger.waitDrag){
			dragger.dragNode=dragger.dragStartObject._createDragNode(dragger.dragStartNode, e);

			if (!dragger.dragNode)
				return dragger.stopDrag();

			dragger.dragNode.onselectstart=function(){return false;}
			dragger.gldragNode=dragger.dragNode;
			document.body.appendChild(dragger.dragNode);
			document.body.onmouseup=dragger.stopDrag;
			dragger.waitDrag=0;
			dragger.dragNode.pWindow=window;
			dragger.initFrameRoute();
		}
		else return dragger.stopDrag(e, true);
	}

	if (dragger.dragNode.parentNode != window.document.body && dragger.gldragNode){
		var grd = dragger.gldragNode;

		if (dragger.gldragNode.old)
			grd=dragger.gldragNode.old;

		//if (!document.all) dragger.calculateFramePosition();
		grd.parentNode.removeChild(grd);
		var oldBody = dragger.dragNode.pWindow;

		if (grd.pWindow &&	grd.pWindow.dhtmlDragAndDrop.lastLanding)
			grd.pWindow.dhtmlDragAndDrop.lastLanding.dragLanding._dragOut(grd.pWindow.dhtmlDragAndDrop.lastLanding);

		//		var oldp=dragger.dragNode.parentObject;
		if (_isIE){
			var div = document.createElement("Div");
			div.innerHTML=dragger.dragNode.outerHTML;
			dragger.dragNode=div.childNodes[0];
		} else
			dragger.dragNode=dragger.dragNode.cloneNode(true);

		dragger.dragNode.pWindow=window;
		//		dragger.dragNode.parentObject=oldp;

		dragger.gldragNode.old=dragger.dragNode;
		document.body.appendChild(dragger.dragNode);
		oldBody.dhtmlDragAndDrop.dragNode=dragger.dragNode;
	}

	dragger.dragNode.style.left=e.clientX+15+(dragger.fx
		? dragger.fx*(-1)
		: 0)
		+(document.body.scrollLeft||document.documentElement.scrollLeft)+"px";
	dragger.dragNode.style.top=e.clientY+3+(dragger.fy
		? dragger.fy*(-1)
		: 0)
		+(document.body.scrollTop||document.documentElement.scrollTop)+"px";

	if (!e.srcElement)
		var z = e.target;
	else
		z=e.srcElement;
	dragger.checkLanding(z, e);
}

dhtmlDragAndDropObject.prototype.calculateFramePosition=function(n){
	//this.fx = 0, this.fy = 0;
	if (window.name){
		var el = parent.frames[window.name].frameElement.offsetParent;
		var fx = 0;
		var fy = 0;

		while (el){
			fx+=el.offsetLeft;
			fy+=el.offsetTop;
			el=el.offsetParent;
		}

		if ((parent.dhtmlDragAndDrop)){
			var ls = parent.dhtmlDragAndDrop.calculateFramePosition(1);
			fx+=ls.split('_')[0]*1;
			fy+=ls.split('_')[1]*1;
		}

		if (n)
			return fx+"_"+fy;
		else
			this.fx=fx;
		this.fy=fy;
	}
	return "0_0";
}
dhtmlDragAndDropObject.prototype.checkLanding=function(htmlObject, e){
	if ((htmlObject)&&(htmlObject.dragLanding)){
		if (this.lastLanding)
			this.lastLanding.dragLanding._dragOut(this.lastLanding);
		this.lastLanding=htmlObject;
		this.lastLanding=this.lastLanding.dragLanding._dragIn(this.lastLanding, this.dragStartNode, e.clientX,
			e.clientY, e);
		this.lastLanding_scr=(_isIE ? e.srcElement : e.target);
	} else {
		if ((htmlObject)&&(htmlObject.tagName != "BODY"))
			this.checkLanding(htmlObject.parentNode, e);
		else {
			if (this.lastLanding)
				this.lastLanding.dragLanding._dragOut(this.lastLanding, e.clientX, e.clientY, e);
			this.lastLanding=0;

			if (this._onNotFound)
				this._onNotFound();
		}
	}
}
dhtmlDragAndDropObject.prototype.stopDrag=function(e, mode){
	dragger=window.dhtmlDragAndDrop;

	if (!mode){
		dragger.stopFrameRoute();
		var temp = dragger.lastLanding;
		dragger.lastLanding=null;

		if (temp)
			temp.dragLanding._drag(dragger.dragStartNode, dragger.dragStartObject, temp, (_isIE
				? event.srcElement
				: e.target));
	}
	dragger.lastLanding=null;

	if ((dragger.dragNode)&&(dragger.dragNode.parentNode == document.body))
		dragger.dragNode.parentNode.removeChild(dragger.dragNode);
	dragger.dragNode=0;
	dragger.gldragNode=0;
	dragger.fx=0;
	dragger.fy=0;
	dragger.dragStartNode=0;
	dragger.dragStartObject=0;
	document.body.onmouseup=dragger.tempDOMU;
	document.body.onmousemove=dragger.tempDOMM;
	dragger.tempDOMU=null;
	dragger.tempDOMM=null;
	dragger.waitDrag=0;
}

dhtmlDragAndDropObject.prototype.stopFrameRoute=function(win){
	if (win)
		window.dhtmlDragAndDrop.stopDrag(1, 1);

	for (var i = 0; i < window.frames.length; i++){
		try{
			if ((window.frames[i] != win)&&(window.frames[i].dhtmlDragAndDrop))
				window.frames[i].dhtmlDragAndDrop.stopFrameRoute(window);
		} catch(e){}
	}

	try{
		if ((parent.dhtmlDragAndDrop)&&(parent != window)&&(parent != win))
			parent.dhtmlDragAndDrop.stopFrameRoute(window);
	} catch(e){}
}
dhtmlDragAndDropObject.prototype.initFrameRoute=function(win, mode){
	if (win){
		window.dhtmlDragAndDrop.preCreateDragCopy();
		window.dhtmlDragAndDrop.dragStartNode=win.dhtmlDragAndDrop.dragStartNode;
		window.dhtmlDragAndDrop.dragStartObject=win.dhtmlDragAndDrop.dragStartObject;
		window.dhtmlDragAndDrop.dragNode=win.dhtmlDragAndDrop.dragNode;
		window.dhtmlDragAndDrop.gldragNode=win.dhtmlDragAndDrop.dragNode;
		window.document.body.onmouseup=window.dhtmlDragAndDrop.stopDrag;
		window.waitDrag=0;

		if (((!_isIE)&&(mode))&&((!_isFF)||(_FFrv < 1.8)))
			window.dhtmlDragAndDrop.calculateFramePosition();
	}
	try{
		if ((parent.dhtmlDragAndDrop)&&(parent != window)&&(parent != win))
			parent.dhtmlDragAndDrop.initFrameRoute(window);
	}catch(e){}

	for (var i = 0; i < window.frames.length; i++){
		try{
			if ((window.frames[i] != win)&&(window.frames[i].dhtmlDragAndDrop))
				window.frames[i].dhtmlDragAndDrop.initFrameRoute(window, ((!win||mode) ? 1 : 0));
		} catch(e){}
	}
}

_isFF = false;
_isIE = false;
_isOpera = false;
_isKHTML = false;
_isMacOS = false;
_isChrome = false;
_FFrv = false;
_KHTMLrv = false;
_OperaRv = false;

if (navigator.userAgent.indexOf('Macintosh') != -1)
	_isMacOS=true;


if (navigator.userAgent.toLowerCase().indexOf('chrome')>-1)
	_isChrome=true;

if ((navigator.userAgent.indexOf('Safari') != -1)||(navigator.userAgent.indexOf('Konqueror') != -1)){
	_KHTMLrv = parseFloat(navigator.userAgent.substr(navigator.userAgent.indexOf('Safari')+7, 5));

	if (_KHTMLrv > 525){ //mimic FF behavior for Safari 3.1+
		_isFF=true;
		_FFrv = 1.9;
	} else
		_isKHTML=true;
} else if (navigator.userAgent.indexOf('Opera') != -1){
	_isOpera=true;
	_OperaRv=parseFloat(navigator.userAgent.substr(navigator.userAgent.indexOf('Opera')+6, 3));
}


else if (navigator.appName.indexOf("Microsoft") != -1){
	_isIE=true;
	if ((navigator.appVersion.indexOf("MSIE 8.0")!= -1 || navigator.appVersion.indexOf("MSIE 9.0")!= -1 || navigator.appVersion.indexOf("MSIE 10.0")!= -1 ) && document.compatMode != "BackCompat"){
		_isIE=8;
	}
} else {
	_isFF=true;
	_FFrv = parseFloat(navigator.userAgent.split("rv:")[1])
}


//multibrowser Xpath processor
dtmlXMLLoaderObject.prototype.doXPath=function(xpathExp, docObj, namespace, result_type){
	if (_isKHTML || (!_isIE && !window.XPathResult))
		return this.doXPathOpera(xpathExp, docObj);

	if (_isIE){ //IE
		if (!docObj)
			if (!this.xmlDoc.nodeName)
				docObj=this.xmlDoc.responseXML
			else
				docObj=this.xmlDoc;

		if (!docObj)
			dhtmlxError.throwError("LoadXML", "Incorrect XML", [
				(docObj||this.xmlDoc),
				this.mainObject
			]);

		if (namespace != null)
			docObj.setProperty("SelectionNamespaces", "xmlns:xsl='"+namespace+"'"); //

		if (result_type == 'single'){
			return docObj.selectSingleNode(xpathExp);
		}
		else {
			return docObj.selectNodes(xpathExp)||new Array(0);
		}
	} else { //Mozilla
		var nodeObj = docObj;

		if (!docObj){
			if (!this.xmlDoc.nodeName){
				docObj=this.xmlDoc.responseXML
			}
			else {
				docObj=this.xmlDoc;
			}
		}

		if (!docObj)
			dhtmlxError.throwError("LoadXML", "Incorrect XML", [
				(docObj||this.xmlDoc),
				this.mainObject
			]);

		if (docObj.nodeName.indexOf("document") != -1){
			nodeObj=docObj;
		}
		else {
			nodeObj=docObj;
			docObj=docObj.ownerDocument;
		}
		var retType = XPathResult.ANY_TYPE;

		if (result_type == 'single')
			retType=XPathResult.FIRST_ORDERED_NODE_TYPE
		var rowsCol = new Array();
		var col = docObj.evaluate(xpathExp, nodeObj, function(pref){
			return namespace
		}, retType, null);

		if (retType == XPathResult.FIRST_ORDERED_NODE_TYPE){
			return col.singleNodeValue;
		}
		var thisColMemb = col.iterateNext();

		while (thisColMemb){
			rowsCol[rowsCol.length]=thisColMemb;
			thisColMemb=col.iterateNext();
		}
		return rowsCol;
	}
}

function _dhtmlxError(type, name, params){
	if (!this.catches)
		this.catches=new Array();

	return this;
}

_dhtmlxError.prototype.catchError=function(type, func_name){
	this.catches[type]=func_name;
}
_dhtmlxError.prototype.throwError=function(type, name, params){
	if (this.catches[type])
		return this.catches[type](type, name, params);

	if (this.catches["ALL"])
		return this.catches["ALL"](type, name, params);

	alert("Error type: "+arguments[0]+"\nDescription: "+arguments[1]);
	return null;
}

window.dhtmlxError=new _dhtmlxError();


//opera fake, while 9.0 not released
//multibrowser Xpath processor
dtmlXMLLoaderObject.prototype.doXPathOpera=function(xpathExp, docObj){
	//this is fake for Opera
	var z = xpathExp.replace(/[\/]+/gi, "/").split('/');
	var obj = null;
	var i = 1;

	if (!z.length)
		return [];

	if (z[0] == ".")
		obj=[docObj]; else if (z[0] == ""){
		obj=(this.xmlDoc.responseXML||this.xmlDoc).getElementsByTagName(z[i].replace(/\[[^\]]*\]/g, ""));
		i++;
	} else
		return [];

	for (i; i < z.length; i++)obj=this._getAllNamedChilds(obj, z[i]);

	if (z[i-1].indexOf("[") != -1)
		obj=this._filterXPath(obj, z[i-1]);
	return obj;
}

dtmlXMLLoaderObject.prototype._filterXPath=function(a, b){
	var c = new Array();
	var b = b.replace(/[^\[]*\[\@/g, "").replace(/[\[\]\@]*/g, "");

	for (var i = 0; i < a.length; i++)
		if (a[i].getAttribute(b))
			c[c.length]=a[i];

	return c;
}
dtmlXMLLoaderObject.prototype._getAllNamedChilds=function(a, b){
	var c = new Array();

	if (_isKHTML)
		b=b.toUpperCase();

	for (var i = 0; i < a.length; i++)for (var j = 0; j < a[i].childNodes.length; j++){
		if (_isKHTML){
			if (a[i].childNodes[j].tagName&&a[i].childNodes[j].tagName.toUpperCase() == b)
				c[c.length]=a[i].childNodes[j];
		}

		else if (a[i].childNodes[j].tagName == b)
			c[c.length]=a[i].childNodes[j];
	}

	return c;
}

function dhtmlXHeir(a, b){
	for (var c in b)
		if (typeof (b[c]) == "function")
			a[c]=b[c];
	return a;
}

function dhtmlxEvent(el, event, handler){
	if (el.addEventListener)
		el.addEventListener(event, handler, false);

	else if (el.attachEvent)
		el.attachEvent("on"+event, handler);
}

//============= XSL Extension ===================================

dtmlXMLLoaderObject.prototype.xslDoc=null;
dtmlXMLLoaderObject.prototype.setXSLParamValue=function(paramName, paramValue, xslDoc){
	if (!xslDoc)
		xslDoc=this.xslDoc

	if (xslDoc.responseXML)
		xslDoc=xslDoc.responseXML;
	var item =
		this.doXPath("/xsl:stylesheet/xsl:variable[@name='"+paramName+"']", xslDoc,
			"http:/\/www.w3.org/1999/XSL/Transform", "single");

	if (item != null)
		item.firstChild.nodeValue=paramValue
}
dtmlXMLLoaderObject.prototype.doXSLTransToObject=function(xslDoc, xmlDoc){
	if (!xslDoc)
		xslDoc=this.xslDoc;

	if (xslDoc.responseXML)
		xslDoc=xslDoc.responseXML

	if (!xmlDoc)
		xmlDoc=this.xmlDoc;

	if (xmlDoc.responseXML)
		xmlDoc=xmlDoc.responseXML

	//MOzilla
	if (!_isIE){
		if (!this.XSLProcessor){
			this.XSLProcessor=new XSLTProcessor();
			this.XSLProcessor.importStylesheet(xslDoc);
		}
		var result = this.XSLProcessor.transformToDocument(xmlDoc);
	} else {
		var result = new ActiveXObject("Msxml2.DOMDocument.3.0");
		try{
			xmlDoc.transformNodeToObject(xslDoc, result);
		}catch(e){
			result = xmlDoc.transformNode(xslDoc);
		}
	}
	return result;
}

dtmlXMLLoaderObject.prototype.doXSLTransToString=function(xslDoc, xmlDoc){
	var res = this.doXSLTransToObject(xslDoc, xmlDoc);
	if(typeof(res)=="string")
		return res;
	return this.doSerialization(res);
}

dtmlXMLLoaderObject.prototype.doSerialization=function(xmlDoc){
	if (!xmlDoc)
		xmlDoc=this.xmlDoc;
	if (xmlDoc.responseXML)
		xmlDoc=xmlDoc.responseXML
	if (!_isIE){
		var xmlSerializer = new XMLSerializer();
		return xmlSerializer.serializeToString(xmlDoc);
	} else
		return xmlDoc.xml;
}

/**
 *   @desc:
 *   @type: private
 */
dhtmlxEventable=function(obj){
	obj.attachEvent=function(name, catcher, callObj){
		name='ev_'+name.toLowerCase();
		if (!this[name])
			this[name]=new this.eventCatcher(callObj||this);

		return(name+':'+this[name].addEvent(catcher)); //return ID (event name & event ID)
	}
	obj.callEvent=function(name, arg0){
		name='ev_'+name.toLowerCase();
		if (this[name])
			return this[name].apply(this, arg0);
		return true;
	}
	obj.checkEvent=function(name){
		return (!!this['ev_'+name.toLowerCase()])
	}
	obj.eventCatcher=function(obj){
		var dhx_catch = [];
		var z = function(){
			var res = true;
			for (var i = 0; i < dhx_catch.length; i++){
				if (dhx_catch[i] != null){
					var zr = dhx_catch[i].apply(obj, arguments);
					res=res&&zr;
				}
			}
			return res;
		}
		z.addEvent=function(ev){
			if (typeof (ev) != "function")
				ev=eval(ev);
			if (ev)
				return dhx_catch.push(ev)-1;
			return false;
		}
		z.removeEvent=function(id){
			dhx_catch[id]=null;
		}
		return z;
	}
	obj.detachEvent=function(id){
		if (id != false){
			var list = id.split(':');           //get EventName and ID
			this[list[0]].removeEvent(list[1]); //remove event
		}
	}
	obj.detachAllEvents = function(){
		for (var name in this){
			if (name.indexOf("ev_")==0)
				delete this[name];
		}
	}
	obj = null;
};

if(!window.dhtmlx)
	window.dhtmlx = {};

(function(){
	var _dhx_msg_cfg = null;
	function callback(config, result){
			var usercall = config.callback;
			modality(false);
			config.box.parentNode.removeChild(config.box);
			_dhx_msg_cfg = config.box = null;
			if (usercall)
				usercall(result);
	}
	function modal_key(e){
		if (_dhx_msg_cfg){
			e = e||event;
			var code = e.which||event.keyCode;
			if (dhtmlx.message.keyboard){
				if (code == 13 || code == 32)
					callback(_dhx_msg_cfg, true);
				if (code == 27)
					callback(_dhx_msg_cfg, false);
			}
			if (e.preventDefault)
				e.preventDefault();
			return !(e.cancelBubble = true);
		}
	}
	if (document.attachEvent)
		document.attachEvent("onkeydown", modal_key);
	else
		document.addEventListener("keydown", modal_key, true);
		
	function modality(mode){
		if(!modality.cover){
			modality.cover = document.createElement("DIV");
			//necessary for IE only
			modality.cover.onkeydown = modal_key;
			modality.cover.className = "dhx_modal_cover";
			document.body.appendChild(modality.cover);
		}
		var height =  document.body.scrollHeight;
		modality.cover.style.display = mode?"inline-block":"none";
	}

	function button(text, result){
		var button_css = "dhtmlx_"+text.toLowerCase().replace(/ /g, "_")+"_button"; // dhtmlx_ok_button, dhtmlx_click_me_button
		return "<div class='dhtmlx_popup_button "+button_css+"' result='"+result+"' ><div>"+text+"</div></div>";
	}

	function info(text){
		if (!t.area){
			t.area = document.createElement("DIV");
			t.area.className = "dhtmlx_message_area";
			t.area.style[t.position]="5px";
			document.body.appendChild(t.area);
		}

		t.hide(text.id);
		var message = document.createElement("DIV");
		message.innerHTML = "<div>"+text.text+"</div>";
		message.className = "dhtmlx-info dhtmlx-" + text.type;
		message.onclick = function(){
			t.hide(text.id);
			text = null;
		};

		if (t.position == "bottom" && t.area.firstChild)
			t.area.insertBefore(message,t.area.firstChild);
		else
			t.area.appendChild(message);
		
		if (text.expire > 0)
			t.timers[text.id]=window.setTimeout(function(){
				t.hide(text.id);
			}, text.expire);

		t.pull[text.id] = message;
		message = null;

		return text.id;
	}
	function _boxStructure(config, ok, cancel){
		var box = document.createElement("DIV");
		box.className = " dhtmlx_modal_box dhtmlx-"+config.type;
		box.setAttribute("dhxbox", 1);
			
		var inner = '';

		if (config.width)
			box.style.width = config.width;
		if (config.height)
			box.style.height = config.height;
		if (config.title)
			inner+='<div class="dhtmlx_popup_title">'+config.title+'</div>';
		inner+='<div class="dhtmlx_popup_text"><span>'+(config.content?'':config.text)+'</span></div><div  class="dhtmlx_popup_controls">';
		if (ok)
			inner += button(config.ok || "OK", true);
		if (cancel)
			inner += button(config.cancel || "Cancel", false);
		if (config.buttons){
			for (var i=0; i<config.buttons.length; i++)
				inner += button(config.buttons[i],i);
		}
		inner += '</div>';
		box.innerHTML = inner;

		if (config.content){
			var node = config.content;
			if (typeof node == "string") 
				node = document.getElementById(node);
			if (node.style.display == 'none')
				node.style.display = "";
			box.childNodes[config.title?1:0].appendChild(node);
		}

		box.onclick = function(e){
			e = e ||event;
			var source = e.target || e.srcElement;
			if (!source.className) source = source.parentNode;
			if (source.className.split(" ")[0] == "dhtmlx_popup_button"){
				result = source.getAttribute("result");
				result = (result == "true")||(result == "false"?false:result);
				callback(config, result);
			}
		};
		config.box = box;
		if (ok||cancel)
			_dhx_msg_cfg = config;

		return box;
	}
	function _createBox(config, ok, cancel){
		var box = config.tagName ? config : _boxStructure(config, ok, cancel);
		
		if (!config.hidden)
			modality(true);
		document.body.appendChild(box);
		var x = Math.abs(Math.floor(((window.innerWidth||document.documentElement.offsetWidth) - box.offsetWidth)/2));
		var y = Math.abs(Math.floor(((window.innerHeight||document.documentElement.offsetHeight) - box.offsetHeight)/2));
		if (config.position == "top")
			box.style.top = "-3px";
		else
			box.style.top = y+'px';
		box.style.left = x+'px';
		//necessary for IE only
		box.onkeydown = modal_key;

		box.focus();
		if (config.hidden)
			dhtmlx.modalbox.hide(box);

		return box;
	}

	function alertPopup(config){
		return _createBox(config, true, false);
	}
	function confirmPopup(config){
		return _createBox(config, true, true);
	}
	function boxPopup(config){
		return _createBox(config);
	}
	function box_params(text, type, callback){
		if (typeof text != "object"){
			if (typeof type == "function"){
				callback = type;
				type = "";
			}
			text = {text:text, type:type, callback:callback };
		}
		return text;
	}
	function params(text, type, expire, id){
		if (typeof text != "object")
			text = {text:text, type:type, expire:expire, id:id};
		text.id = text.id||t.uid();
		text.expire = text.expire||t.expire;
		return text;
	}
	dhtmlx.alert = function(){
		text = box_params.apply(this, arguments);
		text.type = text.type || "confirm";
		return alertPopup(text);
	};
	dhtmlx.confirm = function(){
		text = box_params.apply(this, arguments);
		text.type = text.type || "alert";
		return confirmPopup(text);
	};
	dhtmlx.modalbox = function(){
		text = box_params.apply(this, arguments);
		text.type = text.type || "alert";
		return boxPopup(text);
	};
	dhtmlx.modalbox.hide = function(node){
		while (node && node.getAttribute && !node.getAttribute("dhxbox"))
			node = node.parentNode;
		if (node){
			node.parentNode.removeChild(node);
			modality(false);
		}
	};
	var t = dhtmlx.message = function(text, type, expire, id){
		text = params.apply(this, arguments);
		text.type = text.type||"info";

		var subtype = text.type.split("-")[0];
		switch (subtype){
			case "alert":
				return alertPopup(text);
			case "confirm":
				return confirmPopup(text);
			case "modalbox":
				return boxPopup(text);
			default:
				return info(text);
			break;
		}
	};

	t.seed = (new Date()).valueOf();
	t.uid = function(){return t.seed++;};
	t.expire = 4000;
	t.keyboard = true;
	t.position = "top";
	t.pull = {};
	t.timers = {};

	t.hideAll = function(){
		for (var key in t.pull)
			t.hide(key);
	};
	t.hide = function(id){
		var obj = t.pull[id];
		if (obj && obj.parentNode){
			window.setTimeout(function(){
				obj.parentNode.removeChild(obj);
				obj = null;
			},2000);
			obj.className+=" hidden";
			
			if(t.timers[id])
				window.clearTimeout(t.timers[id]);
			delete t.pull[id];
		}
	};
})();
/**
	* 	@desc: constructor, data processor object 
	*	@param: serverProcessorURL - url used for update
	*	@type: public
	*/
function dataProcessor(serverProcessorURL){
    this.serverProcessor = serverProcessorURL;
    this.action_param="!nativeeditor_status";
    
	this.object = null;
	this.updatedRows = []; //ids of updated rows
	
	this.autoUpdate = true;
	this.updateMode = "cell";
	this._tMode="GET"; 
	this.post_delim = "_";
	
    this._waitMode=0;
    this._in_progress={};//?
    this._invalid={};
    this.mandatoryFields=[];
    this.messages=[];
    
    this.styles={
    	updated:"font-weight:bold;",
    	inserted:"font-weight:bold;",
    	deleted:"text-decoration : line-through;",
    	invalid:"background-color:FFE0E0;",
    	invalid_cell:"border-bottom:2px solid red;",
    	error:"color:red;",
    	clear:"font-weight:normal;text-decoration:none;"
    };
    
    this.enableUTFencoding(true);
    dhtmlxEventable(this);

    return this;
    }

dataProcessor.prototype={
	/**
	* 	@desc: select GET or POST transaction model
	*	@param: mode - GET/POST
	*	@param: total - true/false - send records row by row or all at once (for grid only)
	*	@type: public
	*/
	setTransactionMode:function(mode,total){
        this._tMode=mode;
		this._tSend=total;
    },
    escape:function(data){
    	if (this._utf)
    		return encodeURIComponent(data);
    	else
        	return escape(data);
	},
    /**
	* 	@desc: allows to set escaping mode
	*	@param: true - utf based escaping, simple - use current page encoding
	*	@type: public
	*/	
	enableUTFencoding:function(mode){
        this._utf=convertStringToBoolean(mode);
    },
    /**
	* 	@desc: allows to define, which column may trigger update
	*	@param: val - array or list of true/false values
	*	@type: public
	*/
	setDataColumns:function(val){
		this._columns=(typeof val == "string")?val.split(","):val;
    },
    /**
	* 	@desc: get state of updating
	*	@returns:   true - all in sync with server, false - some items not updated yet.
	*	@type: public
	*/
	getSyncState:function(){
		return !this.updatedRows.length;
	},
	/**
	* 	@desc: enable/disable named field for data syncing, will use column ids for grid
	*	@param:   mode - true/false
	*	@type: public
	*/
	enableDataNames:function(mode){
		this._endnm=convertStringToBoolean(mode);
	},
	/**
	* 	@desc: enable/disable mode , when only changed fields and row id send to the server side, instead of all fields in default mode
	*	@param:   mode - true/false
	*	@type: public
	*/
	enablePartialDataSend:function(mode){
		this._changed=convertStringToBoolean(mode);
	},
	/**
	* 	@desc: set if rows should be send to server automaticaly
	*	@param: mode - "row" - based on row selection changed, "cell" - based on cell editing finished, "off" - manual data sending
	*	@type: public
	*/
	setUpdateMode:function(mode,dnd){
		this.autoUpdate = (mode=="cell");
		this.updateMode = mode;
		this.dnd=dnd;
	},
	ignore:function(code,master){
		this._silent_mode=true;
		code.call(master||window);
		this._silent_mode=false;
	},
	/**
	* 	@desc: mark row as updated/normal. check mandatory fields,initiate autoupdate (if turned on)
	*	@param: rowId - id of row to set update-status for
	*	@param: state - true for "updated", false for "not updated"
	*	@param: mode - update mode name
	*	@type: public
	*/
	setUpdated:function(rowId,state,mode){
		if (this._silent_mode) return;
		var ind=this.findRow(rowId);
		
		mode=mode||"updated";
		var existing = this.obj.getUserData(rowId,this.action_param);
		if (existing && mode == "updated") mode=existing;
		if (state){
			this.set_invalid(rowId,false); //clear previous error flag
			this.updatedRows[ind]=rowId;
			this.obj.setUserData(rowId,this.action_param,mode);
			if (this._in_progress[rowId]) 
				this._in_progress[rowId]="wait";
		} else{
			if (!this.is_invalid(rowId)){
				this.updatedRows.splice(ind,1);
				this.obj.setUserData(rowId,this.action_param,"");
			}
		}

		//clear changed flag
		if (!state)
			this._clearUpdateFlag(rowId);
     			
		this.markRow(rowId,state,mode);
		if (state && this.autoUpdate) this.sendData(rowId);
	},
	_clearUpdateFlag:function(id){},
	markRow:function(id,state,mode){ 
		var str="";
		var invalid=this.is_invalid(id);
		if (invalid){
        	str=this.styles[invalid];
        	state=true;
    	}
		if (this.callEvent("onRowMark",[id,state,mode,invalid])){
			//default logic
			str=this.styles[state?mode:"clear"]+str;
			
        	this.obj[this._methods[0]](id,str);

			if (invalid && invalid.details){
				str+=this.styles[invalid+"_cell"];
				for (var i=0; i < invalid.details.length; i++)
					if (invalid.details[i])
        				this.obj[this._methods[1]](id,i,str);
			}
		}
	},
	getState:function(id){
		return this.obj.getUserData(id,this.action_param);
	},
	is_invalid:function(id){
		return this._invalid[id];
	},
	set_invalid:function(id,mode,details){ 
		if (details) mode={value:mode, details:details, toString:function(){ return this.value.toString(); }};
		this._invalid[id]=mode;
	},
	/**
	* 	@desc: check mandatory fields and varify values of cells, initiate update (if specified)
	*	@param: rowId - id of row to set update-status for
	*	@type: public
	*/
	checkBeforeUpdate:function(rowId){ 
		return true;
	},
	/**
	* 	@desc: send row(s) values to server
	*	@param: rowId - id of row which data to send. If not specified, then all "updated" rows will be send
	*	@type: public
	*/
	sendData:function(rowId){
		if (this._waitMode && (this.obj.mytype=="tree" || this.obj._h2)) return;
		if (this.obj.editStop) this.obj.editStop();
	
		
		if(typeof rowId == "undefined" || this._tSend) return this.sendAllData();
		if (this._in_progress[rowId]) return false;
		
		this.messages=[];
		if (!this.checkBeforeUpdate(rowId) && this.callEvent("onValidatationError",[rowId,this.messages])) return false;
		this._beforeSendData(this._getRowData(rowId),rowId);
    },
    _beforeSendData:function(data,rowId){
    	if (!this.callEvent("onBeforeUpdate",[rowId,this.getState(rowId),data])) return false;	
		this._sendData(data,rowId);
    },
    serialize:function(data, id){
    	if (typeof data == "string")
    		return data;
    	if (typeof id != "undefined")
    		return this.serialize_one(data,"");
    	else{
    		var stack = [];
    		var keys = [];
    		for (var key in data)
    			if (data.hasOwnProperty(key)){
    				stack.push(this.serialize_one(data[key],key+this.post_delim));
    				keys.push(key);
				}
    		stack.push("ids="+this.escape(keys.join(",")));
    		if (dhtmlx.security_key)
				stack.push("dhx_security="+dhtmlx.security_key);
    		return stack.join("&");
    	}
    },
    serialize_one:function(data, pref){
    	if (typeof data == "string")
    		return data;
    	var stack = [];
    	for (var key in data)
    		if (data.hasOwnProperty(key))
    			stack.push(this.escape((pref||"")+key)+"="+this.escape(data[key]));
		return stack.join("&");
    },
    _sendData:function(a1,rowId){
    	if (!a1) return; //nothing to send
		if (!this.callEvent("onBeforeDataSending",rowId?[rowId,this.getState(rowId),a1]:[null, null, a1])) return false;				
		
    	if (rowId)
			this._in_progress[rowId]=(new Date()).valueOf();
		var a2=new dtmlXMLLoaderObject(this.afterUpdate,this,true);

		var a3 = this.serverProcessor+(this._user?(getUrlSymbol(this.serverProcessor)+["dhx_user="+this._user,"dhx_version="+this.obj.getUserData(0,"version")].join("&")):"");

		if (this._tMode!="POST")
        	a2.loadXML(a3+((a3.indexOf("?")!=-1)?"&":"?")+this.serialize(a1,rowId));
		else
        	a2.loadXML(a3,true,this.serialize(a1,rowId));

		this._waitMode++;
    },
	sendAllData:function(){
		if (!this.updatedRows.length) return;			

		this.messages=[]; var valid=true;
		for (var i=0; i<this.updatedRows.length; i++)
			valid&=this.checkBeforeUpdate(this.updatedRows[i]);
		if (!valid && !this.callEvent("onValidatationError",["",this.messages])) return false;
	
		if (this._tSend) 
			this._sendData(this._getAllData());
		else
			for (var i=0; i<this.updatedRows.length; i++)
				if (!this._in_progress[this.updatedRows[i]]){
					if (this.is_invalid(this.updatedRows[i])) continue;
					this._beforeSendData(this._getRowData(this.updatedRows[i]),this.updatedRows[i]);
					if (this._waitMode && (this.obj.mytype=="tree" || this.obj._h2)) return; //block send all for tree
				}
	},
    
	
	
	
	
	
	
	
	_getAllData:function(rowId){
		var out={};
		var has_one = false;
		for(var i=0;i<this.updatedRows.length;i++){
			var id=this.updatedRows[i];
			if (this._in_progress[id] || this.is_invalid(id)) continue;
			if (!this.callEvent("onBeforeUpdate",[id,this.getState(id)])) continue;	
			out[id]=this._getRowData(id,id+this.post_delim);
			has_one = true;
			this._in_progress[id]=(new Date()).valueOf();
		}
		return has_one?out:null;
	},
	
	
	/**
	* 	@desc: specify column which value should be varified before sending to server
	*	@param: ind - column index (0 based)
	*	@param: verifFunction - function (object) which should verify cell value (if not specified, then value will be compared to empty string). Two arguments will be passed into it: value and column name
	*	@type: public
	*/
	setVerificator:function(ind,verifFunction){
		this.mandatoryFields[ind] = verifFunction||(function(value){return (value!="");});
	},
	/**
	* 	@desc: remove column from list of those which should be verified
	*	@param: ind - column Index (0 based)
	*	@type: public
	*/
	clearVerificator:function(ind){
		this.mandatoryFields[ind] = false;
	},
	
	
	
	
	
	findRow:function(pattern){
		var i=0;
    	for(i=0;i<this.updatedRows.length;i++)
		    if(pattern==this.updatedRows[i]) break;
	    return i;
    },

   
	


    





	/**
	* 	@desc: define custom actions
	*	@param: name - name of action, same as value of action attribute
	*	@param: handler - custom function, which receives a XMl response content for action
	*	@type: private
	*/
	defineAction:function(name,handler){
        if (!this._uActions) this._uActions=[];
            this._uActions[name]=handler;
	},




	/**
*     @desc: used in combination with setOnBeforeUpdateHandler to create custom client-server transport system
*     @param: sid - id of item before update
*     @param: tid - id of item after up0ate
*     @param: action - action name
*     @type: public
*     @topic: 0
*/
	afterUpdateCallback:function(sid, tid, action, btag) {
		var marker = sid;
		var correct=(action!="error" && action!="invalid");
		if (!correct) this.set_invalid(sid,action);
		if ((this._uActions)&&(this._uActions[action])&&(!this._uActions[action](btag))) 
			return (delete this._in_progress[marker]);
			
		if (this._in_progress[marker]!="wait")
	    	this.setUpdated(sid, false);
	    	
	    var soid = sid;
	
	    switch (action) {
		case "update":
		case "updated":
	    case "inserted":
	    case "insert":
	        if (tid != sid) {
	            this.obj[this._methods[2]](sid, tid);
	            sid = tid;
	        }
	        break;
	    case "delete":
	    case "deleted":
	    	this.obj.setUserData(sid, this.action_param, "true_deleted");
	        this.obj[this._methods[3]](sid);
	        delete this._in_progress[marker];
	        return this.callEvent("onAfterUpdate", [sid, action, tid, btag]);
	        break;
	    }
	    
	    if (this._in_progress[marker]!="wait"){
	    	if (correct) this.obj.setUserData(sid, this.action_param,'');
	    	delete this._in_progress[marker];
    	} else {
    		delete this._in_progress[marker];
    		this.setUpdated(tid,true,this.obj.getUserData(sid,this.action_param));
		}
	    
	    this.callEvent("onAfterUpdate", [sid, action, tid, btag]);
	},

	/**
	* 	@desc: response from server
	*	@param: xml - XMLLoader object with response XML
	*	@type: private
	*/
	afterUpdate:function(that,b,c,d,xml){
		xml.getXMLTopNode("data"); //fix incorrect content type in IE
		if (!xml.xmlDoc.responseXML) return;
		var atag=xml.doXPath("//data/action");
		for (var i=0; i<atag.length; i++){
        	var btag=atag[i];
			var action = btag.getAttribute("type");
			var sid = btag.getAttribute("sid");
			var tid = btag.getAttribute("tid");
			
			that.afterUpdateCallback(sid,tid,action,btag);
		}
		that.finalizeUpdate();
	},
	finalizeUpdate:function(){
		if (this._waitMode) this._waitMode--;
		
		if ((this.obj.mytype=="tree" || this.obj._h2) && this.updatedRows.length) 
			this.sendData();
		this.callEvent("onAfterUpdateFinish",[]);
		if (!this.updatedRows.length)
			this.callEvent("onFullSync",[]);
	},




	
	/**
	* 	@desc: initializes data-processor
	*	@param: anObj - dhtmlxGrid object to attach this data-processor to
	*	@type: public
	*/
	init:function(anObj){
		this.obj = anObj;
		if (this.obj._dp_init) 
			this.obj._dp_init(this);
	},
	
	
	setOnAfterUpdate:function(ev){
		this.attachEvent("onAfterUpdate",ev);
	},
	enableDebug:function(mode){
	},
	setOnBeforeUpdateHandler:function(func){  
		this.attachEvent("onBeforeDataSending",func);
	},



	/*! starts autoupdate mode
		@param interval
			time interval for sending update requests
	*/
	setAutoUpdate: function(interval, user) {
		interval = interval || 2000;
		
		this._user = user || (new Date()).valueOf();
		this._need_update = false;
		this._loader = null;
		this._update_busy = false;
		
		this.attachEvent("onAfterUpdate",function(sid,action,tid,xml_node){
			this.afterAutoUpdate(sid, action, tid, xml_node);
		});
		this.attachEvent("onFullSync",function(){
			this.fullSync();
		});
		
		var self = this;
		window.setInterval(function(){
			self.loadUpdate();
		}, interval);
	},


	/*! process updating request answer
		if status == collision version is depricated
		set flag for autoupdating immidiatly
	*/
	afterAutoUpdate: function(sid, action, tid, xml_node) {
		if (action == 'collision') {
			this._need_update = true;
			return false;
		} else {
			return true;
		}
	},


	/*! callback function for onFillSync event
		call update function if it's need
	*/
	fullSync: function() {
		if (this._need_update == true) {
			this._need_update = false;
			this.loadUpdate();
		}
		return true;
	},


	/*! sends query to the server and call callback function
	*/
	getUpdates: function(url,callback){
		if (this._update_busy) 
			return false;
		else
			this._update_busy = true;
		
		this._loader = this._loader || new dtmlXMLLoaderObject(true);
		
		this._loader.async=true;
		this._loader.waitCall=callback;
		this._loader.loadXML(url);
	},


	/*! returns xml node value
		@param node
			xml node
	*/
	_v: function(node) {
		if (node.firstChild) return node.firstChild.nodeValue;
		return "";
	},


	/*! returns values array of xml nodes array
		@param arr
			array of xml nodes
	*/
	_a: function(arr) {
		var res = [];
		for (var i=0; i < arr.length; i++) {
			res[i]=this._v(arr[i]);
		};
		return res;
	},


	/*! loads updates and processes them
	*/
	loadUpdate: function(){
		var self = this;
		var version = this.obj.getUserData(0,"version");
		var url = this.serverProcessor+getUrlSymbol(this.serverProcessor)+["dhx_user="+this._user,"dhx_version="+version].join("&");
		url = url.replace("editing=true&","");
		this.getUpdates(url, function(){
			var vers = self._loader.doXPath("//userdata");
			self.obj.setUserData(0,"version",self._v(vers[0]));
			
			var upds = self._loader.doXPath("//update");
			if (upds.length){
				self._silent_mode = true;
				
				for (var i=0; i<upds.length; i++) {
					var status = upds[i].getAttribute('status');
					var id = upds[i].getAttribute('id');
					var parent = upds[i].getAttribute('parent');
					switch (status) {
						case 'inserted':
							self.callEvent("insertCallback",[upds[i], id, parent]);
							break;
						case 'updated':
							self.callEvent("updateCallback",[upds[i], id, parent]);
							break;
						case 'deleted':
							self.callEvent("deleteCallback",[upds[i], id, parent]);
							break;
					}
				}
				
				self._silent_mode = false;
			}
			
			self._update_busy = false;
			self = null;
		});
	}

};

//(c)dhtmlx ltd. www.dhtmlx.com
/*
	dhx_sort[index]=direction
	dhx_filter[index]=mask
*/
if (window.dhtmlXGridObject){
	dhtmlXGridObject.prototype._init_point_connector=dhtmlXGridObject.prototype._init_point;
	dhtmlXGridObject.prototype._init_point=function(){
		var clear_url=function(url){
			url=url.replace(/(\?|\&)connector[^\f]*/g,"");
			return url+(url.indexOf("?")!=-1?"&":"?")+"connector=true"+(this.hdr.rows.length > 0 ? "&dhx_no_header=1":"");
		};
		var combine_urls=function(url){
			return clear_url.call(this,url)+(this._connector_sorting||"")+(this._connector_filter||"");
		};
		var sorting_url=function(url,ind,dir){
			this._connector_sorting="&dhx_sort["+ind+"]="+dir;
			return combine_urls.call(this,url);
		};
		var filtering_url=function(url,inds,vals){
			for (var i=0; i<inds.length; i++)
				inds[i]="dhx_filter["+inds[i]+"]="+encodeURIComponent(vals[i]);
			this._connector_filter="&"+inds.join("&");
			return combine_urls.call(this,url);
		};
		this.attachEvent("onCollectValues",function(ind){
			if (this._con_f_used[ind]){
				if (typeof(this._con_f_used[ind]) == "object")
					return this._con_f_used[ind];
				else
					return false;
			}
			return true;
		});	
		this.attachEvent("onDynXLS",function(){
				this.xmlFileUrl=combine_urls.call(this,this.xmlFileUrl);
				return true;
		});				
		this.attachEvent("onBeforeSorting",function(ind,type,dir){
			if (type=="connector"){
				var self=this;
				this.clearAndLoad(sorting_url.call(this,this.xmlFileUrl,ind,dir),function(){
					self.setSortImgState(true,ind,dir);
				});
				return false;
			}
			return true;
		});
		this.attachEvent("onFilterStart",function(a,b){
			if (this._con_f_used.length){
				this.clearAndLoad(filtering_url.call(this,this.xmlFileUrl,a,b));
				return false;
			}
			return true;
		});
		this.attachEvent("onXLE",function(a,b,c,xml){
			if (!xml) return;
		});
		
		if (this._init_point_connector) this._init_point_connector();
	};
	dhtmlXGridObject.prototype._con_f_used=[];
	dhtmlXGridObject.prototype._in_header_connector_text_filter=function(t,i){
		if (!this._con_f_used[i])
			this._con_f_used[i]=1;
		return this._in_header_text_filter(t,i);
	};
	dhtmlXGridObject.prototype._in_header_connector_select_filter=function(t,i){
		if (!this._con_f_used[i])
			this._con_f_used[i]=2;
		return this._in_header_select_filter(t,i);
	};
	dhtmlXGridObject.prototype.load_connector=dhtmlXGridObject.prototype.load;
	dhtmlXGridObject.prototype.load=function(url, call, type){
		if (!this._colls_loaded && this.cellType){
			var ar=[];
			for (var i=0; i < this.cellType.length; i++)
				if (this.cellType[i].indexOf("co")==0 || this._con_f_used[i]==2) ar.push(i);
			if (ar.length)
				arguments[0]+=(arguments[0].indexOf("?")!=-1?"&":"?")+"connector=true&dhx_colls="+ar.join(",");
		}
		return this.load_connector.apply(this,arguments);
	};
	dhtmlXGridObject.prototype._parseHead_connector=dhtmlXGridObject.prototype._parseHead;
	dhtmlXGridObject.prototype._parseHead=function(url, call, type){
		this._parseHead_connector.apply(this,arguments);
		if (!this._colls_loaded){
			var cols = this.xmlLoader.doXPath("./coll_options", arguments[0]);
			for (var i=0; i < cols.length; i++){
				var f = cols[i].getAttribute("for");
				var v = [];
				var combo=null;
				if (this.cellType[f] == "combo")
					combo = this.getColumnCombo(f);
				if (this.cellType[f].indexOf("co")==0)
					combo=this.getCombo(f);
					
				var os = this.xmlLoader.doXPath("./item",cols[i]);
				for (var j=0; j<os.length; j++){
					var val=os[j].getAttribute("value");
					
					if (combo){
						var lab=os[j].getAttribute("label")||val;
						
						if (combo.addOption)
							combo.addOption([[val, lab]]);
						else
							combo.put(val,lab);
							
						v[v.length]=lab;
					} else
						v[v.length]=val;
				}
				if (this._con_f_used[f*1])
					this._con_f_used[f*1]=v;
			}
			this._colls_loaded=true;
		}
	};
}

if (window.dataProcessor){
	dataProcessor.prototype.init_original=dataProcessor.prototype.init;
	dataProcessor.prototype.init=function(obj){
		this.init_original(obj);
		obj._dataprocessor=this;
		
		this.setTransactionMode("POST",true);
		this.serverProcessor+=(this.serverProcessor.indexOf("?")!=-1?"&":"?")+"editing=true";
	};
}
dhtmlxError.catchError("LoadXML",function(a,b,c){
    if (c[0].status != 0) {
        alert(c[0].responseText);
    }
});

window.dhtmlXScheduler = window.scheduler = { version: "4.0.1" };
dhtmlxEventable(scheduler);

scheduler.init=function(id,date,mode){
	date=date||(scheduler._currentDate());
	mode=mode||"week";

	//hook for terrace skin
	if (this._skin_init)
		scheduler._skin_init();

	scheduler.date.init();

	this._obj=(typeof id == "string")?document.getElementById(id):id;
	this._els=[];
	this._scroll=true;
	this._quirks=(_isIE && document.compatMode == "BackCompat");
	this._quirks7=(_isIE && navigator.appVersion.indexOf("MSIE 8")==-1);
	
	this.get_elements();
	this.init_templates();
	this.set_actions();

	(function(){
		var oldSize = getWindowSize();
		dhtmlxEvent(window,"resize",function(){
			var newSize = getWindowSize();

			// ie7-8 triggers "resize" when window's elements are resized, it messes container-autoresize extension
			// check if it's actually resized
			if(!equals(oldSize, newSize)){
				window.clearTimeout(scheduler._resize_timer);
				scheduler._resize_timer=window.setTimeout(function(){
					if (scheduler.callEvent("onSchedulerResize",[]))  {
						scheduler.update_view();
						scheduler.callEvent("onAfterSchedulerResize", []);
					}
				}, 100);
			}
			oldSize = newSize;

		});
		function getWindowSize(){
			return {
				w : window.innerWidth || document.documentElement.clientWidth,
				h : window.innerHeight || document.documentElement.clientHeight
			};
		}
		function equals(a,b){
			return a.w == b.w && a.h == b.h;
		}
	})();
	this._init_touch_events();
	this.set_sizes();
	scheduler.callEvent('onSchedulerReady', []);
	this.setCurrentView(date,mode);
};

scheduler.xy={
	min_event_height:40,
	scale_width:50,
	scroll_width:18,
	scale_height:20,
	month_scale_height:20,
	menu_width:25,
	margin_top:0,
	margin_left:0,
	editor_width:140
};
scheduler.keys={
	edit_save:13,
	edit_cancel:27
};
scheduler.set_sizes=function(){
	var w = this._x = this._obj.clientWidth-this.xy.margin_left;
	var h = this._y = this._obj.clientHeight-this.xy.margin_top;
	
	//not-table mode always has scroll - need to be fixed in future
	var scale_x=this._table_view?0:(this.xy.scale_width+this.xy.scroll_width);
	var scale_s=this._table_view?-1:this.xy.scale_width;
	
	this.set_xy(this._els["dhx_cal_navline"][0],w,this.xy.nav_height,0,0);
	this.set_xy(this._els["dhx_cal_header"][0],w-scale_x,this.xy.scale_height,scale_s,this.xy.nav_height+(this._quirks?-1:1));
	//to support alter-skin, we need a way to alter height directly from css
	var actual_height = this._els["dhx_cal_navline"][0].offsetHeight;
	if (actual_height > 0) this.xy.nav_height = actual_height;
	
	var data_y=this.xy.scale_height+this.xy.nav_height+(this._quirks?-2:0);
	this.set_xy(this._els["dhx_cal_data"][0],w,h-(data_y+2),0,data_y+2);
};
scheduler.set_xy=function(node,w,h,x,y){
	node.style.width=Math.max(0,w)+"px";
	node.style.height=Math.max(0,h)+"px";
	if (arguments.length>3){
		node.style.left=x+"px";
		node.style.top=y+"px";	
	}
};
scheduler.get_elements=function(){
	//get all child elements as named hash
	var els=this._obj.getElementsByTagName("DIV");
	for (var i=0; i < els.length; i++){
		var name=els[i].className;
		if (name) name = name.split(" ")[0];
		if (!this._els[name]) this._els[name]=[];
		this._els[name].push(els[i]);
		
		//check if name need to be changed
		var t=scheduler.locale.labels[els[i].getAttribute("name")||name];
		if (t) els[i].innerHTML=t;
	}
};
scheduler.set_actions=function(){
	for (var a in this._els)
		if (this._click[a])
			for (var i=0; i < this._els[a].length; i++)
				this._els[a][i].onclick=scheduler._click[a];
	this._obj.onselectstart=function(e){ return false; };
	this._obj.onmousemove=function(e){
		if (!scheduler._temp_touch_block)
			scheduler._on_mouse_move(e||event);
	};
	this._obj.onmousedown=function(e){
		if (!scheduler._ignore_next_click)
			scheduler._on_mouse_down(e||event);
	};
	this._obj.onmouseup=function(e){
		if (!scheduler._ignore_next_click)
			scheduler._on_mouse_up(e||event);
	};
	this._obj.ondblclick=function(e){
		scheduler._on_dbl_click(e||event);
	};
	this._obj.oncontextmenu = function(e) {
		var ev = e||event;
		var src = ev.target||ev.srcElement;
		var returnValue = scheduler.callEvent("onContextMenu", [scheduler._locate_event(src), ev]);
		return returnValue;
	};
};
scheduler.select=function(id){
	if (this._select_id==id) return;
	this.editStop(false);
	this.unselect();
	this._select_id = id;
	this.updateEvent(id);
};
scheduler.unselect=function(id){
	if (id && id!=this._select_id) return;
	var t=this._select_id;
	this._select_id = null;
	if (t) this.updateEvent(t);
};
scheduler.getState=function(){
	return {
		mode: this._mode,
		date: this._date,
		min_date: this._min_date,
		max_date: this._max_date,
		editor_id: this._edit_id,
		lightbox_id: this._lightbox_id,
		new_event: this._new_event,
		select_id: this._select_id,
		expanded: this.expanded,
		drag_id: this._drag_id,
		drag_mode: this._drag_mode
	};
};
scheduler._click={
	dhx_cal_data:function(e){
		//in case of touch disable click processing
		if (scheduler._ignore_next_click){
			if (e.preventDefault)
				e.preventDefault();
			e.cancelBubble = true;
			return scheduler._ignore_next_click = false;
		}

		var trg = e?e.target:event.srcElement;
		var id = scheduler._locate_event(trg);
		
		e = e || event;

		if (!id) {
			scheduler.callEvent("onEmptyClick",[scheduler.getActionData(e).date, e]);
		} else {
			if ( !scheduler.callEvent("onClick",[id,e]) || scheduler.config.readonly ) return;
		}

		if (id && scheduler.config.select) {

			scheduler.select(id);
			var mask = trg.className;
			if (mask.indexOf("_icon")!=-1)
				scheduler._click.buttons[mask.split(" ")[1].replace("icon_","")](id);
		} else
			scheduler._close_not_saved();
	},
	dhx_cal_prev_button:function(){
		scheduler._click.dhx_cal_next_button(0,-1);
	},
	dhx_cal_next_button:function(dummy,step){
		scheduler.setCurrentView(scheduler.date.add( //next line changes scheduler._date , but seems it has not side-effects
			scheduler.date[scheduler._mode+"_start"](scheduler._date),(step||1),scheduler._mode));
	},
	dhx_cal_today_button:function(){
		if (scheduler.callEvent("onBeforeTodayDisplayed", [])) {
			scheduler.setCurrentView(scheduler._currentDate());
		}
	},
	dhx_cal_tab:function(){
		var name = this.getAttribute("name");
		var mode = name.substring(0, name.search("_tab"));
		scheduler.setCurrentView(scheduler._date,mode);
	},
	buttons:{
		"delete":function(id){
			var c = scheduler.locale.labels.confirm_deleting;
			scheduler._dhtmlx_confirm(c, scheduler.locale.labels.title_confirm_deleting, function(){ scheduler.deleteEvent(id) });
		},
		edit:function(id){ scheduler.edit(id); },
		save:function(id){ scheduler.editStop(true); },
		details:function(id){ scheduler.showLightbox(id); },
		cancel:function(id){ scheduler.editStop(false); }
	}
};
scheduler._dhtmlx_confirm = function(message, title, callback) {
	if (!message)
		return callback();
	var opts = { text: message };
	if (title)
		opts.title = title;
	if (callback) {
		opts.callback = function(result) {
			if (result)
				callback();
		};
	}
	dhtmlx.confirm(opts);
};
scheduler.addEventNow=function(start,end,e){
	var base = {};
	if (start && start.constructor.toString().match(/object/i) !== null){
		base = start;
		start = null;
	}
	
	var d = (this.config.event_duration||this.config.time_step)*60000;
	if (!start) start = base.start_date||Math.round((scheduler._currentDate()).valueOf()/d)*d;
	var start_date = new Date(start);
	if (!end){
		var start_hour = this.config.first_hour;
		if (start_hour > start_date.getHours()){
			start_date.setHours(start_hour);
			start = start_date.valueOf();
		}
		end = start.valueOf()+d;
	}
	var end_date = new Date(end);

	// scheduler.addEventNow(new Date(), new Date()) + collision though get_visible events defect (such event was not retrieved)
	if(start_date.valueOf() == end_date.valueOf())
		end_date.setTime(end_date.valueOf()+d);

	base.start_date = base.start_date||start_date;
	base.end_date =  base.end_date||end_date;
	base.text = base.text||this.locale.labels.new_event;
	base.id = this._drag_id = this.uid();
	this._drag_mode="new-size";

	this._loading=true;
	this.addEvent(base);
	this.callEvent("onEventCreated",[this._drag_id,e]);
	this._loading=false;
	
	this._drag_event={}; //dummy , to trigger correct event updating logic
	this._on_mouse_up(e);	
};
scheduler._on_dbl_click=function(e,src){
	src = src||(e.target||e.srcElement);
	if (this.config.readonly || !src.className) return;
	var name = src.className.split(" ")[0];
	switch(name){
		case "dhx_scale_holder":
		case "dhx_scale_holder_now":
		case "dhx_month_body":
		case "dhx_wa_day_data":
		case "dhx_marked_timespan":
			if (!scheduler.config.dblclick_create) break;
			this.addEventNow(this.getActionData(e).date,null,e);
			break;
		case "dhx_cal_event":
		case "dhx_wa_ev_body":
		case "dhx_agenda_line":
		case "dhx_grid_event":
		case "dhx_cal_event_line":
		case "dhx_cal_event_clear":
			var id = this._locate_event(src);
			if (!this.callEvent("onDblClick",[id,e])) return;
			if (this.config.details_on_dblclick || this._table_view || !this.getEvent(id)._timed || !this.config.select)
				this.showLightbox(id);
			else
				this.edit(id);
			break;
		case "dhx_time_block":
		case "dhx_cal_container":
			return;
			break;
		default:
			var t = this["dblclick_"+name];
			if (t) {
				t.call(this,e);
			}
			else {
				if (src.parentNode && src != this)
					return scheduler._on_dbl_click(e,src.parentNode);
			}
			break;
	}
};

scheduler._mouse_coords=function(ev){
	var pos;
	var b=document.body;
	var d = document.documentElement;
	if (!_isIE && (ev.pageX || ev.pageY))
	    pos={x:ev.pageX, y:ev.pageY};
	else pos={
	    x:ev.clientX + (b.scrollLeft||d.scrollLeft||0) - b.clientLeft,
	    y:ev.clientY + (b.scrollTop||d.scrollTop||0) - b.clientTop
	};

	//apply layout
	pos.x-=getAbsoluteLeft(this._obj)+(this._table_view?0:this.xy.scale_width);
	pos.y-=getAbsoluteTop(this._obj)+this.xy.nav_height+(this._dy_shift||0)+this.xy.scale_height-this._els["dhx_cal_data"][0].scrollTop;
	pos.ev = ev;

	var handler = this["mouse_"+this._mode];
	if (handler)
		return handler.call(this,pos);

	if (this._cols){
		var column = pos.x / this._cols[0];
		if (this._ignores)
			for (var i=0; i<=column; i++)
				if (this._ignores[i])
					column++;
	}

	//transform to date
	if (!this._table_view) {
		//"get position" can be invoked before columns are loaded into the units view(e.g. by onMouseMove handler in key_nav.js)
		if(!this._cols)  return pos;
		pos.x=Math.min(this._cols.length-1, Math.max(0,Math.ceil(column)-1));
		
		pos.y=Math.max(0,Math.ceil(pos.y*60/(this.config.time_step*this.config.hour_size_px))-1)+this.config.first_hour*(60/this.config.time_step);
	} else {
		if (!this._cols || !this._colsS) // agenda/map views
			return pos;
		var dy=0;
		for (dy=1; dy < this._colsS.heights.length; dy++)
			if (this._colsS.heights[dy]>pos.y) break;

		pos.y=Math.ceil( (Math.max(0, column)+Math.max(0,dy-1)*7)*24*60/this.config.time_step );

		if (scheduler._drag_mode || this._mode == "month")
			pos.y=(Math.max(0,Math.ceil(column)-1)+Math.max(0,dy-1)*7)*24*60/this.config.time_step;

		//we care about ignored days only during event moving in month view
		if (this._drag_mode == "move"){
			if (scheduler._ignores_detected && scheduler.config.preserve_length){
				pos._ignores = true;
				//get real lengtn of event
				if (!this._drag_event._event_length)
					this._drag_event._event_length = this._get_real_event_length(this._drag_event.start_date, this._drag_event.end_date, { x_step:1, x_unit:"day"});
			}
		}

		pos.x=0;
	}
	return pos;
};
scheduler._close_not_saved=function(){
	if (new Date().valueOf()-(scheduler._new_event||0) > 500 && scheduler._edit_id){
		var c=scheduler.locale.labels.confirm_closing;

		scheduler._dhtmlx_confirm(c, scheduler.locale.labels.title_confirm_closing, function() { scheduler.editStop(scheduler.config.positive_closing); });
	}
};
scheduler._correct_shift=function(start, back){
	return start-=((new Date(scheduler._min_date)).getTimezoneOffset()-(new Date(start)).getTimezoneOffset())*60000*(back?-1:1);	
};
scheduler._on_mouse_move=function(e){
	if (this._drag_mode){
		var pos=this._mouse_coords(e);
		if (!this._drag_pos || pos.force_redraw || this._drag_pos.x!=pos.x || this._drag_pos.y!=pos.y ){
			var start, end;
			if (this._edit_id!=this._drag_id)
				this._close_not_saved();
				
			this._drag_pos=pos;
			
			if (this._drag_mode=="create"){
				this._close_not_saved();
				this._loading=true; //will be ignored by dataprocessor
				
				start = this._get_date_from_pos(pos).valueOf();

				if (!this._drag_start) {
					var res = this.callEvent("onBeforeEventCreated", [e, this._drag_id]);
					if (!res)
						return;


					this._drag_start=start;
					return;
				}

				end = start;
				if (end == this._drag_start) {
				}

				var start_date = new Date(this._drag_start);
				var end_date = new Date(end);
				if ( (this._mode == "day" || this._mode == "week")
						&& (start_date.getHours() == end_date.getHours() && start_date.getMinutes() == end_date.getMinutes()) ) {
			   	    end_date = new Date(this._drag_start+1000);
				}

				
				this._drag_id=this.uid();
				this.addEvent(start_date, end_date, this.locale.labels.new_event, this._drag_id, pos.fields);
				
				this.callEvent("onEventCreated",[this._drag_id,e]);
				this._loading=false;
				this._drag_mode="new-size";
				
			} 

			var ev=this.getEvent(this._drag_id);

			if (this._drag_mode=="move"){
				start = this._min_date.valueOf()+(pos.y*this.config.time_step+pos.x*24*60 -(scheduler._move_pos_shift||0) )*60000;
				if (!pos.custom && this._table_view) start+=this.date.time_part(ev.start_date)*1000;
				start = this._correct_shift(start);

				if (pos._ignores && this.config.preserve_length && this._table_view){
					if (this.matrix) 
						var obj = this.matrix[this._mode];
					obj = obj  || { x_step:1, x_unit:"day" };
					end = start*1 + this._get_fictional_event_length(start, this._drag_event._event_length, obj);
				} else
					end = ev.end_date.valueOf()-(ev.start_date.valueOf()-start);
			} else { // resize
				start = ev.start_date.valueOf();
				end = ev.end_date.valueOf();
				if (this._table_view) {
					var resize_date = this._min_date.valueOf()+pos.y*this.config.time_step*60000 + (pos.custom?0:24*60*60000);
					if (this._mode == "month")
						resize_date = this._correct_shift(resize_date, false);

					if (pos.resize_from_start)
						start = resize_date;
					else
						end = resize_date;
				} else {
					end = this.date.date_part(new Date(ev.end_date)).valueOf()+pos.y*this.config.time_step*60000;
					this._els["dhx_cal_data"][0].style.cursor="s-resize";
					if (this._mode == "week" || this._mode == "day")
						end = this._correct_shift(end);
				}
				if (this._drag_mode == "new-size") {
					if (end <= this._drag_start){
						var shift = pos.shift||((this._table_view && !pos.custom)?24*60*60000:0);
						start = end-(pos.shift?0:shift);
						end = this._drag_start+(shift||(this.config.time_step*60000));
					} else {
						start = this._drag_start;
					}
				} else {
					if (end<=start)
						end=start+this.config.time_step*60000;
				}
			}
			var new_end = new Date(end-1);			
			var new_start = new Date(start);
			//prevent out-of-borders situation for day|week view
			if ( this._table_view || (new_end.getDate()==new_start.getDate() && new_end.getHours()<this.config.last_hour) || scheduler._allow_dnd ){
				ev.start_date=new_start;
				ev.end_date=new Date(end);
				if (this.config.update_render){
					//fix for repaint after dnd and scroll issue, #231
					var sx = scheduler._els["dhx_cal_data"][0].scrollTop;
					this.update_view();
					scheduler._els["dhx_cal_data"][0].scrollTop = sx;
				} else
					this.updateEvent(this._drag_id);
			}
			if (this._table_view) {
				this.for_rendered(this._drag_id,function(r){
					r.className+=" dhx_in_move";
				});
			}
		}
	}  else {
		if (scheduler.checkEvent("onMouseMove")){
			var id = this._locate_event(e.target||e.srcElement);
			this.callEvent("onMouseMove",[id,e]);
		}
	}
};
scheduler._on_mouse_down=function(e,src) {
	// on Mac we do not get onmouseup event when clicking right mouse button leaving us in dnd state
	// let's ignore right mouse button then
	if (e.button == 2)
		return;

	if (this.config.readonly || this._drag_mode) return;
	src = src||(e.target||e.srcElement);
	var classname = src.className && src.className.split(" ")[0];

	switch (classname) {
		case "dhx_cal_event_line":
		case "dhx_cal_event_clear":
			if (this._table_view)
				this._drag_mode="move"; //item in table mode
			break;
		case "dhx_event_move":
		case "dhx_wa_ev_body":
			this._drag_mode="move";
			break;
		case "dhx_event_resize":
			this._drag_mode="resize";
			break;
		case "dhx_scale_holder":
		case "dhx_scale_holder_now":
		case "dhx_month_body":
		case "dhx_matrix_cell":
		case "dhx_marked_timespan":
			this._drag_mode="create";
			this.unselect(this._select_id);
			break;
		case "":
			if (src.parentNode)
				return scheduler._on_mouse_down(e,src.parentNode);
		default:
			if (scheduler.checkEvent("onMouseDown") && scheduler.callEvent("onMouseDown", [classname])) {
				if (src.parentNode && src != this) {
					return scheduler._on_mouse_down(e,src.parentNode);
				}
			}
			this._drag_mode=null;
			this._drag_id=null;
			break;
	}
	if (this._drag_mode){
		var id = this._locate_event(src);
		if (!this.config["drag_"+this._drag_mode] || !this.callEvent("onBeforeDrag",[id, this._drag_mode, e]))
			this._drag_mode=this._drag_id=0;
		else {
			this._drag_id= id;
			this._drag_event = scheduler._lame_clone(this.getEvent(this._drag_id) || {});
		}
	}
	this._drag_start=null;
};
scheduler._on_mouse_up=function(e){
	if (e && e.button == 2 && scheduler.config.touch) return;
	if (this._drag_mode && this._drag_id){
		this._els["dhx_cal_data"][0].style.cursor="default";
		//drop
		var ev=this.getEvent(this._drag_id);
		if (this._drag_event._dhx_changed || !this._drag_event.start_date || ev.start_date.valueOf()!=this._drag_event.start_date.valueOf() || ev.end_date.valueOf()!=this._drag_event.end_date.valueOf()){
			var is_new=(this._drag_mode=="new-size");
			if (!this.callEvent("onBeforeEventChanged",[ev, e, is_new, this._drag_event])){
				if (is_new) 
					this.deleteEvent(ev.id, true);
				else {
					this._drag_event._dhx_changed = false;
					scheduler._lame_copy(ev, this._drag_event);
					this.updateEvent(ev.id);
				}
			} else {
				var drag_id = this._drag_id;
				this._drag_id = this._drag_mode = null;
				if (is_new && this.config.edit_on_create){
					this.unselect();
					this._new_event=new Date();//timestamp of creation
					//if selection disabled - force lightbox usage
					if (this._table_view || this.config.details_on_create || !this.config.select) {
						return this.showLightbox(drag_id);
					}
					this._drag_pos = true; //set flag to trigger full redraw
					this._select_id = this._edit_id = drag_id;
				} else {
					if (!this._new_event)
						this.callEvent(is_new?"onEventAdded":"onEventChanged",[drag_id,this.getEvent(drag_id)]);
				}
			}
		}
		if (this._drag_pos) this.render_view_data(); //redraw even if there is no real changes - necessary for correct positioning item after drag
	}
	this._drag_id = null;
	this._drag_mode=null;
	this._drag_pos=null;
};
scheduler.update_view=function(){
	this._reset_scale();
	if (this._load_mode && this._load()) return this._render_wait = true;
	this.render_view_data();
};

scheduler.isViewExists = function(mode){
	return !!(scheduler[mode+ "_view"] ||
		(scheduler.date[mode+ "_start"] && scheduler.templates[mode+ "_date"] && scheduler.templates[mode+ "_scale_date"]));
};

scheduler.updateView = function(date, mode) {
	date = date || this._date;
	mode = mode || this._mode;
	var dhx_cal_data = 'dhx_cal_data';

	if (!this._mode)
		this._obj.className += " dhx_scheduler_" + mode; else {
		this._obj.className = this._obj.className.replace("dhx_scheduler_" + this._mode, "dhx_scheduler_" + mode);
	}

	var prev_scroll = (this._mode == mode && this.config.preserve_scroll) ? this._els[dhx_cal_data][0].scrollTop : false; // saving current scroll

	//hide old custom view
	if (this[this._mode + "_view"] && mode && this._mode != mode)
		this[this._mode + "_view"](false);

	this._close_not_saved();

	var dhx_multi_day = 'dhx_multi_day';
	if (this._els[dhx_multi_day]) {
		this._els[dhx_multi_day][0].parentNode.removeChild(this._els[dhx_multi_day][0]);
		this._els[dhx_multi_day] = null;
	}

	this._mode = mode;
	this._date = date;
	this._table_view = (this._mode == "month");

	var tabs = this._els["dhx_cal_tab"];
	if(tabs){//calendar can work without view tabs
		for (var i = 0; i < tabs.length; i++) {
			var name = tabs[i].className;
			name = name.replace(/ active/g, "");
			if (tabs[i].getAttribute("name") == this._mode + "_tab")
				name = name + " active";
			tabs[i].className = name;
		}
	}
	//show new view
	var view = this[this._mode + "_view"];
	view ? view(true) : this.update_view();

	if (typeof prev_scroll == "number") // if we are updating or working with the same view scrollTop should be saved
		this._els[dhx_cal_data][0].scrollTop = prev_scroll; // restoring original scroll
};
scheduler.setCurrentView = function(date, mode) {
	if (!this.callEvent("onBeforeViewChange", [this._mode, this._date, mode || this._mode, date || this._date])) return;
	this.updateView(date, mode);
	this.callEvent("onViewChange", [this._mode, this._date]);
};
scheduler._render_x_header = function(i,left,d,h){
	//header scale	
	var head=document.createElement("DIV");
	head.className = "dhx_scale_bar";

	if(this.templates[this._mode+"_scalex_class"]){
		//'_scalex_class' - timeline already have similar template, use the same name
		head.className += ' ' + this.templates[this._mode+"_scalex_class"](d);
	}

	var width = this._cols[i]-1;

	if (this._mode == "month" && i === 0 && this.config.left_border) {
		head.className += " dhx_scale_bar_border";
		left = left+1;
	}
	this.set_xy(head, width, this.xy.scale_height-2, left, 0);//-1 for border
	head.innerHTML=this.templates[this._mode+"_scale_date"](d,this._mode); //TODO - move in separate method
	h.appendChild(head);
};
scheduler._reset_scale=function(){
	//current mode doesn't support scales
	//we mustn't call reset_scale for such modes, so it just to be sure
	if (!this.templates[this._mode + "_date"]) return;

	var h = this._els["dhx_cal_header"][0];
	var b = this._els["dhx_cal_data"][0];
	var c = this.config;

	h.innerHTML = "";
	b.scrollTop = 0; //fix flickering in FF
	b.innerHTML = "";

	var str = ((c.readonly || (!c.drag_resize)) ? " dhx_resize_denied" : "") + ((c.readonly || (!c.drag_move)) ? " dhx_move_denied" : "");
	if (str) b.className = "dhx_cal_data" + str;

	this._scales = {};
	this._cols = [];	//store for data section
	this._colsS = {height: 0};
	this._dy_shift = 0;

	this.set_sizes();
	var summ=parseInt(h.style.width,10); //border delta
	var left=0;

	var d,dd,sd,today;
	dd=this.date[this._mode+"_start"](new Date(this._date.valueOf()));
	d=sd=this._table_view?scheduler.date.week_start(dd):dd;
	today=this.date.date_part( scheduler._currentDate());

	//reset date in header
	var ed=scheduler.date.add(dd,1,this._mode);
	var count = 7;
	
	if (!this._table_view){
		var count_n = this.date["get_"+this._mode+"_end"];
		if (count_n) ed = count_n(dd);
		count = Math.round((ed.valueOf()-dd.valueOf())/(1000*60*60*24));
	}
	
	this._min_date=d;
	this._els["dhx_cal_date"][0].innerHTML=this.templates[this._mode+"_date"](dd,ed,this._mode);


	this._process_ignores(sd, count, "day", 1);
	var realcount = count - this._ignores_detected;

	for (var i=0; i<count; i++){ 
		if (this._ignores[i]){
			this._cols[i] = 0;
			realcount++;
		} else {
			this._cols[i]=Math.floor(summ/(realcount-i));
			this._render_x_header(i,left,d,h);
		}
		if (!this._table_view){
			var scales=document.createElement("DIV");
			var cls = "dhx_scale_holder";
			if (d.valueOf()==today.valueOf()) cls = "dhx_scale_holder_now";
			scales.className=cls+" "+this.templates.week_date_class(d,today);
			this.set_xy(scales,this._cols[i]-1,c.hour_size_px*(c.last_hour-c.first_hour),left+this.xy.scale_width+1,0);//-1 for border
			b.appendChild(scales);
			this.callEvent("onScaleAdd",[scales, d]);
		}
		
		d=this.date.add(d,1,"day");
		summ-=this._cols[i];
		left+=this._cols[i];
		this._colsS[i]=(this._cols[i-1]||0)+(this._colsS[i-1]||(this._table_view?0:this.xy.scale_width+2));
		this._colsS['col_length'] = count+1;
	}

	this._max_date=d;
	this._colsS[count]=this._cols[count-1]+this._colsS[count-1];

	if (this._table_view) // month view
		this._reset_month_scale(b,dd,sd);
	else{
		this._reset_hours_scale(b,dd,sd);
		if (c.multi_day) {
			var dhx_multi_day = 'dhx_multi_day';

			if(this._els[dhx_multi_day]) {
				this._els[dhx_multi_day][0].parentNode.removeChild(this._els[dhx_multi_day][0]);
				this._els[dhx_multi_day] = null;
			}
			
			var navline = this._els["dhx_cal_navline"][0];
			var top = navline.offsetHeight + this._els["dhx_cal_header"][0].offsetHeight+1;
			
			var c1 = document.createElement("DIV");
			c1.className = dhx_multi_day;
			c1.style.visibility="hidden";
			this.set_xy(c1, this._colsS[this._colsS.col_length-1]+this.xy.scroll_width, 0, 0, top); // 2 extra borders, dhx_header has -1 bottom margin
			b.parentNode.insertBefore(c1,b);
			
			var c2 = c1.cloneNode(true);
			c2.className = dhx_multi_day+"_icon";
			c2.style.visibility="hidden";
			this.set_xy(c2, this.xy.scale_width, 0, 0, top); // dhx_header has -1 bottom margin
			
			c1.appendChild(c2);
			this._els[dhx_multi_day]=[c1,c2];
			this._els[dhx_multi_day][0].onclick = this._click.dhx_cal_data;
		}
	}
};
scheduler._reset_hours_scale=function(b,dd,sd){
	var c=document.createElement("DIV");
	c.className="dhx_scale_holder";
	
	var date = new Date(1980,1,1,this.config.first_hour,0,0);
	for (var i=this.config.first_hour*1; i < this.config.last_hour; i++) {
		var cc=document.createElement("DIV");
		cc.className="dhx_scale_hour";
		cc.style.height=this.config.hour_size_px-(this._quirks?0:1)+"px";
		var width = this.xy.scale_width;
		if (this.config.left_border) {
			width = width - 1;
			cc.className += " dhx_scale_hour_border";
		}
		cc.style.width = width + "px";
		cc.innerHTML=scheduler.templates.hour_scale(date);
		
		c.appendChild(cc);
		date=this.date.add(date,1,"hour");
	}
	b.appendChild(c);
	if (this.config.scroll_hour)
		b.scrollTop = this.config.hour_size_px*(this.config.scroll_hour-this.config.first_hour);
};

scheduler._currentDate = function(){
	if(scheduler.config.now_date){
		return new Date(scheduler.config.now_date);
	}
	return new Date();
};

scheduler._process_ignores = function(sd, n, mode, step, preserve){
	this._ignores=[];
	this._ignores_detected = 0;
	var ignore = scheduler["ignore_"+this._mode];

	if (ignore){
		var ign_date = new Date(sd);
		for (var i=0; i<n; i++){
			if (ignore(ign_date)){
				this._ignores_detected += 1;
				this._ignores[i] = true;
				if (preserve)
					n++;
			}
			ign_date = scheduler.date.add(ign_date, step, mode);
		}
	}
};

scheduler._reset_month_scale=function(b,dd,sd){
	var ed=scheduler.date.add(dd,1,"month");
	
	//trim time part for comparation reasons
	var cd = scheduler._currentDate();
	this.date.date_part(cd);
	this.date.date_part(sd);

	var rows=Math.ceil(Math.round((ed.valueOf()-sd.valueOf()) / (60*60*24*1000) ) / 7);
	var tdcss=[];
	var height=(Math.floor(b.clientHeight/rows)-22);
	
	this._colsS.height=height+22;



	var h = this._colsS.heights = [];
	for (var i=0; i<=7; i++) {
		var cell_width = ((this._cols[i]||0)-1);
		if (i === 0 && this.config.left_border) {
			cell_width = cell_width - 1;
		}
		tdcss[i]=" style='height:"+height+"px; width:"+cell_width+"px;' ";
	}


	
	var cellheight = 0;
	this._min_date=sd;
	var html="<table cellpadding='0' cellspacing='0'>";
	var rendered_dates = [];
	for (var i=0; i<rows; i++){
		html+="<tr>";

		for (var j=0; j<7; j++) {
			html+="<td";

			var cls = "";
			if (sd<dd)
				cls='dhx_before';
			else if (sd>=ed)
				cls='dhx_after';
			else if (sd.valueOf()==cd.valueOf())
				cls='dhx_now';
			html+=" class='"+cls+" "+this.templates.month_date_class(sd,cd)+"' >";
			var body_class = "dhx_month_body";
			var head_class = "dhx_month_head";
			if (j === 0 && this.config.left_border) {
				body_class += " dhx_month_body_border";
				head_class += " dhx_month_head_border";
			}
			if (!this._ignores_detected || !this._ignores[j]){
				html+="<div class='"+head_class+"'>"+this.templates.month_day(sd)+"</div>";
				html+="<div class='"+body_class+"' "+tdcss[j]+"></div></td>";
			} else {
				html+="<div></div><div></div>";
			}
			rendered_dates.push(sd);
			sd=this.date.add(sd,1,"day");
		}
		html+="</tr>";
		h[i] = cellheight;
		cellheight+=this._colsS.height;
	}
	html+="</table>";
	this._max_date=sd;
	
	b.innerHTML=html;

	this._scales = {};
	var divs = b.getElementsByTagName('div');
	for (var i=0; i<rendered_dates.length; i++) { // [header, body, header, body, ...]
		var div = divs[(i*2)+1];
		var date = rendered_dates[i];
		this._scales[+date] = div;
	}
	for (var i=0; i<rendered_dates.length; i++) {
		var date = rendered_dates[i];
		this.callEvent("onScaleAdd", [this._scales[+date], date]);
	}

	return sd;
};
scheduler.getLabel = function(property, key) {
	var sections = this.config.lightbox.sections;
	for (var i=0; i<sections.length; i++) {
		if(sections[i].map_to == property) {
			var options = sections[i].options;
			for (var j=0; j<options.length; j++) {
				if(options[j].key == key) {
					return options[j].label;
				}
			}
		}
	}
	return "";
};
scheduler.updateCollection = function(list_name, collection) {
	var list = scheduler.serverList(list_name);
	if (!list) return false;
	list.splice(0, list.length);
	list.push.apply(list, collection || []);
	scheduler.callEvent("onOptionsLoad", []);
	scheduler.resetLightbox();
	return true;
};
scheduler._lame_clone = function(object, cache) {
	var i, t, result; // iterator, types array, result

	cache = cache || [];

	for (i=0; i<cache.length; i+=2)
		if(object === cache[i])
			return cache[i+1];

	if (object && typeof object == "object") {
		result = {};
		t = [Array,Date,Number,String,Boolean];
		for (i=0; i<t.length; i++) {
			if (object instanceof t[i])
				result = i ? new t[i](object) : new t[i](); // first one is array
		}
		cache.push(object, result);
		for (i in object) {
			if (Object.prototype.hasOwnProperty.apply(object, [i]))
				result[i] = scheduler._lame_clone(object[i], cache)
		}
	}
	return result || object;
};
scheduler._lame_copy = function(target, source) {
	for (var key in source) {
		if (source.hasOwnProperty(key)) {
			target[key] = source[key];
		}
	}
	return target;
};
scheduler._get_date_from_pos = function(pos) {
	var start=this._min_date.valueOf()+(pos.y*this.config.time_step+(this._table_view?0:pos.x)*24*60)*60000;
	return new Date(this._correct_shift(start));
};
// n_ev - native event
scheduler.getActionData = function(n_ev) {
	var pos = this._mouse_coords(n_ev);
	return {
		date:this._get_date_from_pos(pos),
		section:pos.section
	};
};
scheduler._focus = function(node, select){
	if (node && node.focus){
		if (this.config.touch){
			window.setTimeout(function(){ 
				node.focus();
			},100);
		} else {
			if (select && node.select) node.select();
			node.focus();
		}
	}
}

//non-linear scales
scheduler._get_real_event_length=function(sd, fd, obj){
	var ev_length = fd -sd;
	var hours = (obj._start_correction + obj._end_correction)||0;
	var ignore = this["ignore_"+this._mode];

	var start_slot = 0;
	if (obj.render){
		start_slot = this._get_date_index(obj, sd);
		var end_slot = this._get_date_index(obj, fd);
	} else{
		var end_slot = Math.round(ev_length/60/60/1000/24);
	}

	while (start_slot < end_slot){
		var check = scheduler.date.add(fd, -obj.x_step, obj.x_unit);
		if (ignore && ignore(fd))
			ev_length -= (fd-check);
		else
			ev_length -= hours;

		fd = check;
		end_slot--;
	}
	return ev_length;
};
scheduler._get_fictional_event_length=function(end_date, ev_length, obj, back){
	var sd = new Date(end_date);
	var dir = back ? -1 : 1;

	//get difference caused by first|last hour
	if (obj._start_correction || obj._end_correction){
		if (back)
			var today = (sd.getHours()*60+sd.getMinutes()) - (obj.first_hour||0)*60;
		else
			var today = (obj.last_hour||0)*60 - (sd.getHours()*60+sd.getMinutes());
		var per_day = (obj.last_hour - obj.first_hour)*60;
		var days = Math.ceil( (ev_length / (60*1000) - today ) / per_day);
		ev_length += days * (24*60 - per_day) * 60 * 1000;
	}

	var fd = new Date(end_date*1+ev_length*dir);
	var ignore = this["ignore_"+this._mode];

	var start_slot = 0;
	if (obj.render){
		start_slot = this._get_date_index(obj, sd);
		var end_slot = this._get_date_index(obj, fd);
	} else{
		var end_slot = Math.round(ev_length/60/60/1000/24);
	}

	while (start_slot*dir <= end_slot*dir){
		var check = scheduler.date.add(sd, obj.x_step*dir, obj.x_unit);
		if (ignore && ignore(sd)){
			ev_length += (check-sd)*dir;
			end_slot += dir;
		}

		sd = check;
		start_slot+=dir;
	}
	
	return ev_length;
};

scheduler.date={
	init:function(){
		var s = scheduler.locale.date.month_short;
		var t = scheduler.locale.date.month_short_hash = {};
		for (var i = 0; i < s.length; i++)
			t[s[i]]=i;

		var s = scheduler.locale.date.month_full;
		var t = scheduler.locale.date.month_full_hash = {};
		for (var i = 0; i < s.length; i++)
			t[s[i]]=i;
	},
	date_part:function(date){
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		if (date.getHours() != 0)
			date.setTime(date.getTime() + 60 * 60 * 1000 * (24 - date.getHours()));
		return date;
	},
	time_part:function(date){
		return (date.valueOf()/1000 - date.getTimezoneOffset()*60)%86400;
	},
	week_start:function(date){
		var shift=date.getDay();
		if (scheduler.config.start_on_monday){
			if (shift===0) shift=6;
			else shift--;
		}
		return this.date_part(this.add(date,-1*shift,"day"));
	},
	month_start:function(date){
		date.setDate(1);
		return this.date_part(date);
	},
	year_start:function(date){
		date.setMonth(0);
		return this.month_start(date);
	},
	day_start:function(date){
		return this.date_part(date);
	},
	add:function(date,inc,mode){
		var ndate=new Date(date.valueOf());
		switch(mode){
			case "week":
				inc *= 7;
			case "day":
				ndate.setDate(ndate.getDate() + inc);
				if (!date.getHours() && ndate.getHours()) //shift to yesterday
					ndate.setTime(ndate.getTime() + 60 * 60 * 1000 * (24 - ndate.getHours()));
				break;
			case "month": ndate.setMonth(ndate.getMonth()+inc); break;
			case "year": ndate.setYear(ndate.getFullYear()+inc); break;
			case "hour": ndate.setHours(ndate.getHours()+inc); break;
			case "minute": ndate.setMinutes(ndate.getMinutes()+inc); break;
			default:
				return scheduler.date["add_"+mode](date,inc,mode);
		}
		return ndate;
	},
	to_fixed:function(num){
		if (num<10)	return "0"+num;
		return num;
	},
	copy:function(date){
		return new Date(date.valueOf());
	},
	date_to_str:function(format,utc){
		format=format.replace(/%[a-zA-Z]/g,function(a){
			switch(a){
				case "%d": return "\"+scheduler.date.to_fixed(date.getDate())+\"";
				case "%m": return "\"+scheduler.date.to_fixed((date.getMonth()+1))+\"";
				case "%j": return "\"+date.getDate()+\"";
				case "%n": return "\"+(date.getMonth()+1)+\"";
				case "%y": return "\"+scheduler.date.to_fixed(date.getFullYear()%100)+\""; 
				case "%Y": return "\"+date.getFullYear()+\"";
				case "%D": return "\"+scheduler.locale.date.day_short[date.getDay()]+\"";
				case "%l": return "\"+scheduler.locale.date.day_full[date.getDay()]+\"";
				case "%M": return "\"+scheduler.locale.date.month_short[date.getMonth()]+\"";
				case "%F": return "\"+scheduler.locale.date.month_full[date.getMonth()]+\"";
				case "%h": return "\"+scheduler.date.to_fixed((date.getHours()+11)%12+1)+\"";
				case "%g": return "\"+((date.getHours()+11)%12+1)+\"";
				case "%G": return "\"+date.getHours()+\"";
				case "%H": return "\"+scheduler.date.to_fixed(date.getHours())+\"";
				case "%i": return "\"+scheduler.date.to_fixed(date.getMinutes())+\"";
				case "%a": return "\"+(date.getHours()>11?\"pm\":\"am\")+\"";
				case "%A": return "\"+(date.getHours()>11?\"PM\":\"AM\")+\"";
				case "%s": return "\"+scheduler.date.to_fixed(date.getSeconds())+\"";
				case "%W": return "\"+scheduler.date.to_fixed(scheduler.date.getISOWeek(date))+\"";
				default: return a;
			}
		});
		if (utc) format=format.replace(/date\.get/g,"date.getUTC");
		return new Function("date","return \""+format+"\";");
	},
	str_to_date:function(format,utc){
		var splt="var temp=date.match(/[a-zA-Z]+|[0-9]+/g);";
		var mask=format.match(/%[a-zA-Z]/g);
		for (var i=0; i<mask.length; i++){
			switch(mask[i]){
				case "%j":
				case "%d": splt+="set[2]=temp["+i+"]||1;";
					break;
				case "%n":
				case "%m": splt+="set[1]=(temp["+i+"]||1)-1;";
					break;
				case "%y": splt+="set[0]=temp["+i+"]*1+(temp["+i+"]>50?1900:2000);";
					break;
				case "%g":
				case "%G":
				case "%h": 
				case "%H":
							splt+="set[3]=temp["+i+"]||0;";
					break;
				case "%i":
							splt+="set[4]=temp["+i+"]||0;";
					break;
				case "%Y": splt+="set[0]=temp["+i+"]||0;";
					break;
				case "%a":					
				case "%A": splt+="set[3]=set[3]%12+((temp["+i+"]||'').toLowerCase()=='am'?0:12);";
					break;					
				case "%s": splt+="set[5]=temp["+i+"]||0;";
					break;
				case "%M": splt+="set[1]=scheduler.locale.date.month_short_hash[temp["+i+"]]||0;";
					break;
				case "%F": splt+="set[1]=scheduler.locale.date.month_full_hash[temp["+i+"]]||0;";
					break;
				default:
					break;
			}
		}
		var code ="set[0],set[1],set[2],set[3],set[4],set[5]";
		if (utc) code =" Date.UTC("+code+")";
		return new Function("date","var set=[0,0,1,0,0,0]; "+splt+" return new Date("+code+");");
	},
	getISOWeek: function(ndate) {
		if(!ndate) return false;
		var nday = ndate.getDay();
		if (nday === 0) {
			nday = 7;
		}
		var first_thursday = new Date(ndate.valueOf());
		first_thursday.setDate(ndate.getDate() + (4 - nday));
		var year_number = first_thursday.getFullYear(); // year of the first Thursday
		var ordinal_date = Math.round( (first_thursday.getTime() - new Date(year_number, 0, 1).getTime()) / 86400000); //ordinal date of the first Thursday - 1 (so not really ordinal date)
		var week_number = 1 + Math.floor( ordinal_date / 7);
		return week_number;
	},
	getUTCISOWeek: function(ndate){
		return this.getISOWeek(this.convert_to_utc(ndate));
	},
	convert_to_utc: function(date) {
		return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
	}
};
scheduler.locale = {
	date:{
		month_full:["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		month_short:["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
		day_full:["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
		day_short:["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
	},
	labels:{
		dhx_cal_today_button:"Today",
		day_tab:"Day",
		week_tab:"Week",
		month_tab:"Month",
		new_event:"New event",
		icon_save:"Save",
		icon_cancel:"Cancel",
		icon_details:"Details",
		icon_edit:"Edit",
		icon_delete:"Delete",
		confirm_closing:"",//Your changes will be lost, are your sure ?
		confirm_deleting:"Event will be deleted permanently, are you sure?",
		section_description:"Description",
		section_time:"Time period",
		full_day:"Full day",

		/*recurring events*/
		confirm_recurring:"Do you want to edit the whole set of repeated events?",
		section_recurring:"Repeat event",
		button_recurring:"Disabled",
		button_recurring_open:"Enabled",
		button_edit_series: "Edit series",
		button_edit_occurrence: "Edit occurrence",

		/*agenda view extension*/
		agenda_tab:"Agenda",
		date:"Date",
		description:"Description",

		/*year view extension*/
		year_tab:"Year",

		/* week agenda extension */
		week_agenda_tab: "Agenda",

		/*grid view extension*/
		grid_tab: "Grid",
		drag_to_create:"Drag to create",
		drag_to_move:"Drag to move"
	}
};


/*
%e	Day of the month without leading zeros (01..31)
%d	Day of the month, 2 digits with leading zeros (01..31)
%j	Day of the year, 3 digits with leading zeros (001..366)
%a	A textual representation of a day, two letters
%W	A full textual representation of the day of the week

%c	Numeric representation of a month, without leading zeros (0..12)
%m	Numeric representation of a month, with leading zeros (00..12)
%b	A short textual representation of a month, three letters (Jan..Dec)
%M	A full textual representation of a month, such as January or March (January..December)

%y	A two digit representation of a year (93..03)
%Y	A full numeric representation of a year, 4 digits (1993..03)
*/

scheduler.config={
	default_date: "%j %M %Y",
	month_date: "%F %Y",
	load_date: "%Y-%m-%d",
	week_date: "%l",
	day_date: "%D, %F %j",
	hour_date: "%H:%i",
	month_day: "%d",
	xml_date: "%m/%d/%Y %H:%i",
	api_date: "%d-%m-%Y %H:%i",
	preserve_length:true,
	time_step: 5,

	start_on_monday: 1,
	first_hour: 0,
	last_hour: 24,
	readonly: false,
	drag_resize: 1,
	drag_move: 1,
	drag_create: 1,
	dblclick_create: 1,
	edit_on_create: 1,
	details_on_create: 0,

	cascade_event_display: false,
	cascade_event_count: 4,
	cascade_event_margin: 30,

	multi_day:true,
	multi_day_height_limit: 0,

	drag_lightbox: true,
	preserve_scroll: true,
	select: true,

	server_utc: false,
	touch:true,
	touch_tip:true,
	touch_drag:500,
	quick_info_detached:true,

	positive_closing: false,

	icons_edit: ["icon_save", "icon_cancel"],
	icons_select: ["icon_details", "icon_edit", "icon_delete"],
	buttons_left: ["dhx_save_btn", "dhx_cancel_btn"],
	buttons_right: ["dhx_delete_btn"],
	lightbox: {
		sections: [
			{name: "description", height: 200, map_to: "text", type: "textarea", focus: true},
			{name: "time", height: 72, type: "time", map_to: "auto"}
		]
	},
	highlight_displayed_event: true,
	left_border: false
};
scheduler.templates={};
scheduler.init_templates=function(){
	var labels = scheduler.locale.labels;
	labels.dhx_save_btn 	= labels.icon_save;
	labels.dhx_cancel_btn 	= labels.icon_cancel;
	labels.dhx_delete_btn 	= labels.icon_delete;


	var d=scheduler.date.date_to_str;
	var c=scheduler.config;
	var f = function(a,b){
		for (var c in b)
			if (!a[c]) a[c]=b[c];
	};
	f(scheduler.templates,{
		day_date:d(c.default_date),
		month_date:d(c.month_date),
		week_date:function(d1,d2){
			return scheduler.templates.day_date(d1)+" &ndash; "+scheduler.templates.day_date(scheduler.date.add(d2,-1,"day"));
		},
		day_scale_date:d(c.default_date),
		month_scale_date:d(c.week_date),
		week_scale_date:d(c.day_date),
		hour_scale:d(c.hour_date),
		time_picker:d(c.hour_date),
		event_date:d(c.hour_date),
		month_day:d(c.month_day),
		xml_date:scheduler.date.str_to_date(c.xml_date,c.server_utc),
		load_format:d(c.load_date,c.server_utc),
		xml_format:d(c.xml_date,c.server_utc),
		api_date:scheduler.date.str_to_date(c.api_date),
		event_header:function(start,end,ev){
			return scheduler.templates.event_date(start)+" - "+scheduler.templates.event_date(end);
		},
		event_text:function(start,end,ev){
			return ev.text;
		},
		event_class:function(start,end,ev){
			return "";
		},
		month_date_class:function(d){
			return "";
		},
		week_date_class:function(d){
			return "";
		},
		event_bar_date:function(start,end,ev){
			return scheduler.templates.event_date(start)+" ";
		},
		event_bar_text:function(start,end,ev){
			return ev.text;
		},
		month_events_link : function(date, count){
			return "<a>View more("+count+" events)</a>";
		}
	});
	this.callEvent("onTemplatesReady",[]);
};



scheduler.uid = function() {
	if (!this._seed) this._seed = (new Date).valueOf();
	return this._seed++;
};
scheduler._events = {};
scheduler.clearAll = function() {
	this._events = {};
	this._loaded = {};
	this.clear_view();
	this.callEvent("onClearAll", []);
};
scheduler.addEvent = function(start_date, end_date, text, id, extra_data) {
	if (!arguments.length)
		return this.addEventNow();
	var ev = start_date;
	if (arguments.length != 1) {
		ev = extra_data || {};
		ev.start_date = start_date;
		ev.end_date = end_date;
		ev.text = text;
		ev.id = id;
	}
	ev.id = ev.id || scheduler.uid();
	ev.text = ev.text || "";

	if (typeof ev.start_date == "string")  ev.start_date = this.templates.api_date(ev.start_date);
	if (typeof ev.end_date == "string")  ev.end_date = this.templates.api_date(ev.end_date);

	var d = (this.config.event_duration || this.config.time_step) * 60000;
	if (ev.start_date.valueOf() == ev.end_date.valueOf())
		ev.end_date.setTime(ev.end_date.valueOf() + d);

	ev._timed = this.isOneDayEvent(ev);

	var is_new = !this._events[ev.id];
	this._events[ev.id] = ev;
	this.event_updated(ev);
	if (!this._loading)
		this.callEvent(is_new ? "onEventAdded" : "onEventChanged", [ev.id, ev]);
	return ev.id;
};
scheduler.deleteEvent = function(id, silent) {
	var ev = this._events[id];
	if (!silent && (!this.callEvent("onBeforeEventDelete", [id, ev]) || !this.callEvent("onConfirmedBeforeEventDelete", [id, ev])))
		return;
	if (ev) {
		delete this._events[id];
		this.unselect(id);
		this.event_updated(ev);
	}

	this.callEvent("onEventDeleted", [id, ev]);
};
scheduler.getEvent = function(id) {
	return this._events[id];
};
scheduler.setEvent = function(id, hash) {
	if(!hash.id)
		hash.id = id;

	this._events[id] = hash;
};
scheduler.for_rendered = function(id, method) {
	for (var i = this._rendered.length - 1; i >= 0; i--)
		if (this._rendered[i].getAttribute("event_id") == id)
			method(this._rendered[i], i);
};
scheduler.changeEventId = function(id, new_id) {
	if (id == new_id) return;
	var ev = this._events[id];
	if (ev) {
		ev.id = new_id;
		this._events[new_id] = ev;
		delete this._events[id];
	}
	this.for_rendered(id, function(r) {
		r.setAttribute("event_id", new_id);
	});
	if (this._select_id == id) this._select_id = new_id;
	if (this._edit_id == id) this._edit_id = new_id;
	//if (this._drag_id==id) this._drag_id=new_id;
	this.callEvent("onEventIdChange", [id, new_id]);
};

(function() {
	var attrs = ["text", "Text", "start_date", "StartDate", "end_date", "EndDate"];
	var create_getter = function(name) {
		return function(id) { return (scheduler.getEvent(id))[name]; };
	};
	var create_setter = function(name) {
		return function(id, value) {
			var ev = scheduler.getEvent(id);
			ev[name] = value;
			ev._changed = true;
			ev._timed = this.isOneDayEvent(ev);
			scheduler.event_updated(ev, true);
		};
	};
	for (var i = 0; i < attrs.length; i += 2) {
		scheduler["getEvent" + attrs[i + 1]] = create_getter(attrs[i]);
		scheduler["setEvent" + attrs[i + 1]] = create_setter(attrs[i]);
	}
})();

scheduler.event_updated = function(ev, force) {
	if (this.is_visible_events(ev))
		this.render_view_data();
	else
		this.clear_event(ev.id);
};
scheduler.is_visible_events = function(ev) {
	return (ev.start_date < this._max_date && this._min_date < ev.end_date);
};
scheduler.isOneDayEvent = function(ev) {
	var delta = ev.end_date.getDate() - ev.start_date.getDate();

	if (!delta)
		return ev.start_date.getMonth() == ev.end_date.getMonth() && ev.start_date.getFullYear() == ev.end_date.getFullYear();
	else {
		if (delta < 0)  delta = Math.ceil((ev.end_date.valueOf() - ev.start_date.valueOf()) / (24 * 60 * 60 * 1000));
		return (delta == 1 && !ev.end_date.getHours() && !ev.end_date.getMinutes() && (ev.start_date.getHours() || ev.start_date.getMinutes() ));
	}

};
scheduler.get_visible_events = function(only_timed) {
	//not the best strategy for sure
	var stack = [];

	for (var id in this._events)
		if (this.is_visible_events(this._events[id]))
			if (!only_timed || this._events[id]._timed)
				if (this.filter_event(id, this._events[id]))
					stack.push(this._events[id]);

	return stack;
};
scheduler.filter_event = function(id, ev) {
	var filter = this["filter_" + this._mode];
	return (filter) ? filter(id, ev) : true;
};
scheduler._is_main_area_event = function(ev){
	return !!ev._timed;
};
scheduler.render_view_data = function(evs, hold) {
	if (!evs) {
		if (this._not_render) {
			this._render_wait = true;
			return;
		}
		this._render_wait = false;

		this.clear_view();
		evs = this.get_visible_events(!(this._table_view || this.config.multi_day));
	}
	for(var i= 0, len = evs.length; i < len; i++){
		this._recalculate_timed(evs[i]);
	}

	if (this.config.multi_day && !this._table_view) {

		var tvs = [];
		var tvd = [];
		for (var i = 0; i < evs.length; i++) {
			if (this._is_main_area_event(evs[i]))
				tvs.push(evs[i]); 
			else
				tvd.push(evs[i]);
		}

		// multiday events
		this._rendered_location = this._els['dhx_multi_day'][0];
		this._table_view = true;
		this.render_data(tvd, hold);
		this._table_view = false;

		// normal events
		this._rendered_location = this._els['dhx_cal_data'][0];
		this._table_view = false;
		this.render_data(tvs, hold);

	} else {
		this._rendered_location = this._els['dhx_cal_data'][0];
		this.render_data(evs, hold);
	}
};


scheduler._view_month_day = function(e){
	var date = scheduler.getActionData(e).date;
	if(!scheduler.callEvent("onViewMoreClick", [date]))
		return;
	scheduler.setCurrentView(date, "day");
};

scheduler._render_month_link = function(ev){
	var parent = this._rendered_location;
	var toRender = this._lame_clone(ev);

	//render links in each cell of multiday events
	for(var d = ev._sday; d < ev._eday; d++){

		toRender._sday = d;
		toRender._eday = d+1;

		var date = scheduler.date;
		var curr = scheduler._min_date;
		curr = date.add(curr, toRender._sweek, "week");
		curr = date.add(curr, toRender._sday, "day");
		var count = scheduler.getEvents(curr, date.add(curr, 1, "day")).length;

		var pos = this._get_event_bar_pos(toRender);
		var widt = (pos.x2 - pos.x);

		var el = document.createElement("div");
		el.onclick = function(e){scheduler._view_month_day(e||event);};
		el.className = "dhx_month_link";
		el.style.top = pos.y + "px";
		el.style.left = pos.x + "px";
		el.style.width = widt + "px";
		el.innerHTML = scheduler.templates.month_events_link(curr, count);
		this._rendered.push(el);

		parent.appendChild(el);
	}
};

scheduler._recalculate_timed = function(id){
	if(!id) return;
	if(typeof(id) != "object")
		var ev = this._events[id];
	else
		var ev = id;
	if(!ev) return;
	ev._timed = scheduler.isOneDayEvent(ev);
};
scheduler.attachEvent("onEventChanged", scheduler._recalculate_timed);
scheduler.attachEvent("onEventAdded", scheduler._recalculate_timed);

scheduler.render_data = function(evs, hold) {
	evs = this._pre_render_events(evs, hold);

	for (var i = 0; i < evs.length; i++)
		if (this._table_view){
			if(scheduler._mode != 'month'){
				this.render_event_bar(evs[i]);//may be multiday section on other views
			}else{

				var max_evs = scheduler.config.max_month_events;
				if(max_evs !== max_evs*1 || evs[i]._sorder < max_evs){
					//of max number events per month cell is set and event can be rendered
					this.render_event_bar(evs[i]);
				}else if(max_evs !== undefined && evs[i]._sorder == max_evs){
					//render 'view more' links
					scheduler._render_month_link(evs[i]);
				}else{
					//do not render events with ordinal number > maximum events per cell
				}
			}



		}else
			this.render_event(evs[i]);
};
scheduler._pre_render_events = function(evs, hold) {
	var hb = this.xy.bar_height;
	var h_old = this._colsS.heights;
	var h = this._colsS.heights = [0, 0, 0, 0, 0, 0, 0];
	var data = this._els["dhx_cal_data"][0];

	if (!this._table_view)
		evs = this._pre_render_events_line(evs, hold); //ignore long events for now
	else
		evs = this._pre_render_events_table(evs, hold);

	if (this._table_view) {
		if (hold)
			this._colsS.heights = h_old;
		else {
			var evl = data.firstChild;
			if (evl.rows) {
				for (var i = 0; i < evl.rows.length; i++) {
					h[i]++;
					if ((h[i]) * hb > this._colsS.height - 22) { // 22 - height of cell's header
						//we have overflow, update heights
						var cells = evl.rows[i].cells;

						var cHeight = this._colsS.height - 22;
						if(this.config.max_month_events*1 !== this.config.max_month_events || h[i] <= this.config.max_month_events){
							cHeight = h[i] * hb;
						}else if( (this.config.max_month_events + 1) * hb > this._colsS.height - 22){
							cHeight = (this.config.max_month_events + 1) * hb;
						}

						for (var j = 0; j < cells.length; j++) {
							cells[j].childNodes[1].style.height = cHeight + "px";
						}
						h[i] = (h[i - 1] || 0) + cells[0].offsetHeight;
					}
					h[i] = (h[i - 1] || 0) + evl.rows[i].cells[0].offsetHeight;
				}
				h.unshift(0);
				if (evl.parentNode.offsetHeight < evl.parentNode.scrollHeight && !evl._h_fix && scheduler.xy.scroll_width) {
					//we have v-scroll, decrease last day cell
					for (var i = 0; i < evl.rows.length; i++) {
						//get last visible cell
						var last = 6; while (this._ignores[last]) last--;

						var cell = evl.rows[i].cells[last].childNodes[0];
						var w = cell.offsetWidth - scheduler.xy.scroll_width + "px";
						cell.style.width = w;
						cell.nextSibling.style.width = w;
					}
					evl._h_fix = true;
				}
			} else {
				if (!evs.length && this._els["dhx_multi_day"][0].style.visibility == "visible")
					h[0] = -1;
				if (evs.length || h[0] == -1) {
					//shift days to have space for multiday events
					var childs = evl.parentNode.childNodes;

					// +1 so multiday events would have 2px from top and 2px from bottom by default
					var full_multi_day_height = (h[0] + 1) * hb + 1;

					var used_multi_day_height = full_multi_day_height;
					var used_multi_day_height_css = full_multi_day_height + "px";
					if (this.config.multi_day_height_limit) {
						used_multi_day_height = Math.min(full_multi_day_height, this.config.multi_day_height_limit) ;
						used_multi_day_height_css = used_multi_day_height + "px";
					}

					data.style.top = (this._els["dhx_cal_navline"][0].offsetHeight + this._els["dhx_cal_header"][0].offsetHeight + used_multi_day_height ) + 'px';
					data.style.height = (this._obj.offsetHeight - parseInt(data.style.top, 10) - (this.xy.margin_top || 0)) + 'px';

					var multi_day_section = this._els["dhx_multi_day"][0];
					multi_day_section.style.height = used_multi_day_height_css;
					multi_day_section.style.visibility = (h[0] == -1 ? "hidden" : "visible");

					// icon
					var multi_day_icon = this._els["dhx_multi_day"][1];
					multi_day_icon.style.height = used_multi_day_height_css;
					multi_day_icon.style.visibility = (h[0] == -1 ? "hidden" : "visible");
					multi_day_icon.className = h[0] ? "dhx_multi_day_icon" : "dhx_multi_day_icon_small";
					this._dy_shift = (h[0] + 1) * hb;
					h[0] = 0;

					if (used_multi_day_height != full_multi_day_height) {
						data.style.top = (parseInt(data.style.top) + 2) + "px";

						multi_day_section.style.overflowY = "auto";
						multi_day_section.style.width = (parseInt(multi_day_section.style.width) - 2) + "px";

						multi_day_icon.style.position = "fixed";
						multi_day_icon.style.top = "";
						multi_day_icon.style.left = "";
					}
				}
			}
		}
	}

	return evs;
};
scheduler._get_event_sday = function(ev) {
	return Math.floor((ev.start_date.valueOf() - this._min_date.valueOf()) / (24 * 60 * 60 * 1000));
};
scheduler._get_event_mapped_end_date = function(ev) {
	var end_date = ev.end_date;
	if (this.config.separate_short_events) {
		var ev_duration = (ev.end_date - ev.start_date) / 60000; // minutes
		if (ev_duration < this._min_mapped_duration) {
			end_date = this.date.add(end_date, this._min_mapped_duration - ev_duration, "minute");
		}
	}
	return end_date;
};
scheduler._pre_render_events_line = function(evs, hold){
	evs.sort(function(a, b) {
		if (a.start_date.valueOf() == b.start_date.valueOf())
			return a.id > b.id ? 1 : -1;
		return a.start_date > b.start_date ? 1 : -1;
	});
	var days = []; //events by weeks
	var evs_originals = [];

	this._min_mapped_duration = Math.ceil(this.xy.min_event_height * 60 / this.config.hour_size_px);  // values could change along the way

	for (var i = 0; i < evs.length; i++) {
		var ev = evs[i];

		//check date overflow
		var sd = ev.start_date;
		var ed = ev.end_date;
		//check scale overflow
		var sh = sd.getHours();
		var eh = ed.getHours();

		ev._sday = this._get_event_sday(ev); // sday based on event start_date
		if (this._ignores[ev._sday]){
			//ignore event
			evs.splice(i,1);
			i--;
			continue;
		}

		if (!days[ev._sday]) days[ev._sday] = [];

		if (!hold) {
			ev._inner = false;

			var stack = days[ev._sday];

			while (stack.length) {
				var t_ev = stack[stack.length - 1];
				var t_end_date = this._get_event_mapped_end_date(t_ev);
				if (t_end_date.valueOf() <= ev.start_date.valueOf()) {
					stack.splice(stack.length - 1, 1);
				} else {
					break;
				}
			}

			var sorderSet = false;
			for (var j = 0; j < stack.length; j++) {
				var t_ev = stack[j];
				var t_end_date = this._get_event_mapped_end_date(t_ev);
				if (t_end_date.valueOf() <= ev.start_date.valueOf()) {
					sorderSet = true;
					ev._sorder = t_ev._sorder;
					stack.splice(j, 1);
					ev._inner = true;
					break;
				}
			}

			if (stack.length)
				stack[stack.length - 1]._inner = true;

			if (!sorderSet) {
				if (stack.length) {
					if (stack.length <= stack[stack.length - 1]._sorder) {
						if (!stack[stack.length - 1]._sorder)
							ev._sorder = 0;
						else
							for (j = 0; j < stack.length; j++) {
								var _is_sorder = false;
								for (var k = 0; k < stack.length; k++) {
									if (stack[k]._sorder == j) {
										_is_sorder = true;
										break;
									}
								}
								if (!_is_sorder) {
									ev._sorder = j;
									break;
								}
							}
						ev._inner = true;
					} else {
						var _max_sorder = stack[0]._sorder;
						for (j = 1; j < stack.length; j++) {
							if (stack[j]._sorder > _max_sorder)
								_max_sorder = stack[j]._sorder;
						}
						ev._sorder = _max_sorder + 1;
						ev._inner = false;
					}

				} else
					ev._sorder = 0;
			}

			stack.push(ev);

			if (stack.length > (stack.max_count || 0)) {
				stack.max_count = stack.length;
				ev._count = stack.length;
			} else {
				ev._count = (ev._count) ? ev._count : 1;
			}
		}

		if (sh < this.config.first_hour || eh >= this.config.last_hour) {
			// Need to create copy of event as we will be changing it's start/end date
			// e.g. first_hour = 11 and event.start_date hours = 9. Need to preserve that info
			evs_originals.push(ev);
			evs[i] = ev = this._copy_event(ev);

			if (sh < this.config.first_hour) {
				ev.start_date.setHours(this.config.first_hour);
				ev.start_date.setMinutes(0);
			}
			if (eh >= this.config.last_hour) {
				ev.end_date.setMinutes(0);
				ev.end_date.setHours(this.config.last_hour);
			}

			if (ev.start_date > ev.end_date || sh == this.config.last_hour) {
				evs.splice(i, 1);
				i--;
				continue;
			}
		}
	}
	if (!hold) {
		for (var i = 0; i < evs.length; i++) {
			evs[i]._count = days[evs[i]._sday].max_count;
		}
		for (var i = 0; i < evs_originals.length; i++)
			evs_originals[i]._count = days[evs_originals[i]._sday].max_count;
	}

	return evs;
};
scheduler._time_order = function(evs) {
	evs.sort(function(a, b) {
		if (a.start_date.valueOf() == b.start_date.valueOf()) {
			if (a._timed && !b._timed) return 1;
			if (!a._timed && b._timed) return -1;
			return a.id > b.id ? 1 : -1;
		}
		return a.start_date > b.start_date ? 1 : -1;
	});
};
scheduler._pre_render_events_table = function(evs, hold) { // max - max height of week slot
	this._time_order(evs);
	var out = [];
	var weeks = [
		[],
		[],
		[],
		[],
		[],
		[],
		[]
	]; //events by weeks
	var max = this._colsS.heights;
	var start_date;
	var cols = this._cols.length;
	var chunks_info = {};

	for (var i = 0; i < evs.length; i++) {
		var ev = evs[i];
		var id = ev.id;
		if (!chunks_info[id]) {
			chunks_info[id] = {
				first_chunk: true,
				last_chunk: true
			};
		}
		var chunk_info = chunks_info[id];
		var sd = (start_date || ev.start_date);
		var ed = ev.end_date;
		//trim events which are crossing through current view
		if (sd < this._min_date) {
			chunk_info.first_chunk = false;
			sd = this._min_date;
		}
		if (ed > this._max_date) {
			chunk_info.last_chunk = false;
			ed = this._max_date;
		}

		var locate_s = this.locate_holder_day(sd, false, ev);
		ev._sday = locate_s % cols;

		//skip single day events for ignored dates
		if (this._ignores[ev._sday] && ev._timed) continue;

		var locate_e = this.locate_holder_day(ed, true, ev) || cols;
		ev._eday = (locate_e % cols) || cols; //cols used to fill full week, when event end on monday
		ev._length = locate_e - locate_s;

		//3600000 - compensate 1 hour during winter|summer time shift
		ev._sweek = Math.floor((this._correct_shift(sd.valueOf(), 1) - this._min_date.valueOf()) / (60 * 60 * 1000 * 24 * cols));

		//current slot
		var stack = weeks[ev._sweek];
		//check order position
		var stack_line;

		for (stack_line = 0; stack_line < stack.length; stack_line++)
			if (stack[stack_line]._eday <= ev._sday)
				break;

		if (!ev._sorder || !hold) {
			ev._sorder = stack_line;
		}

		if (ev._sday + ev._length <= cols) {
			start_date = null;
			out.push(ev);
			stack[stack_line] = ev;
			//get max height of slot
			max[ev._sweek] = stack.length - 1;
			ev._first_chunk = chunk_info.first_chunk;
			ev._last_chunk = chunk_info.last_chunk;
		} else { // split long event in chunks
			var copy = this._copy_event(ev);
			copy.id = ev.id;
			copy._length = cols - ev._sday;
			copy._eday = cols;
			copy._sday = ev._sday;
			copy._sweek = ev._sweek;
			copy._sorder = ev._sorder;
			copy.end_date = this.date.add(sd, copy._length, "day");
			copy._first_chunk = chunk_info.first_chunk;
			if (chunk_info.first_chunk) {
				chunk_info.first_chunk = false;
			}

			out.push(copy);
			stack[stack_line] = copy;
			start_date = copy.end_date;
			//get max height of slot
			max[ev._sweek] = stack.length - 1;
			i--;
			continue;  //repeat same step
		}
	}
	return out;
};
scheduler._copy_dummy = function() {
	var a = new Date(this.start_date);
	var b = new Date(this.end_date);
	this.start_date = a;
	this.end_date = b;
};
scheduler._copy_event = function(ev) {
	this._copy_dummy.prototype = ev;
	return new this._copy_dummy();
	//return {start_date:ev.start_date, end_date:ev.end_date, text:ev.text, id:ev.id}
};
scheduler._rendered = [];
scheduler.clear_view = function() {
	for (var i = 0; i < this._rendered.length; i++) {
		var obj = this._rendered[i];
		if (obj.parentNode) obj.parentNode.removeChild(obj);
	}
	this._rendered = [];
};
scheduler.updateEvent = function(id) {
	var ev = this.getEvent(id);
	this.clear_event(id);

	if (ev && this.is_visible_events(ev) && this.filter_event(id, ev) && (this._table_view || this.config.multi_day || ev._timed)) {
		if (this.config.update_render)
			this.render_view_data(); 
		else
			this.render_view_data([ev], true);
	}
};
scheduler.clear_event = function(id) {
	this.for_rendered(id, function(node, i) {
		if (node.parentNode)
			node.parentNode.removeChild(node);
		scheduler._rendered.splice(i, 1);
	});
};
scheduler.render_event = function(ev) {
	var menu = scheduler.xy.menu_width;
	var menu_offset = (this.config.use_select_menu_space) ? 0 : menu;
	if (ev._sday < 0) return; //can occur in case of recurring event during time shift

	var parent = scheduler.locate_holder(ev._sday);	
	if (!parent) return; //attempt to render non-visible event

	var sm = ev.start_date.getHours() * 60 + ev.start_date.getMinutes();
	var em = (ev.end_date.getHours() * 60 + ev.end_date.getMinutes()) || (scheduler.config.last_hour * 60);
	var ev_count = ev._count || 1;
	var ev_sorder = ev._sorder || 0;
	var top = (Math.round((sm * 60 * 1000 - this.config.first_hour * 60 * 60 * 1000) * this.config.hour_size_px / (60 * 60 * 1000))) % (this.config.hour_size_px * 24); //42px/hour
	var height = Math.max(scheduler.xy.min_event_height, (em - sm) * this.config.hour_size_px / 60); //42px/hour
	var width = Math.floor((parent.clientWidth - menu_offset) / ev_count);
	var left = ev_sorder * width + 1;
	if (!ev._inner) width = width * (ev_count - ev_sorder);
	if (this.config.cascade_event_display) {
		var limit = this.config.cascade_event_count;
		var margin = this.config.cascade_event_margin;
		left = ev_sorder % limit * margin;
		var right = (ev._inner) ? (ev_count - ev_sorder - 1) % limit * margin / 2 : 0;
		width = Math.floor(parent.clientWidth - menu_offset - left - right);
	}

	var d = this._render_v_bar(ev.id, menu_offset + left, top, width, height, ev._text_style, scheduler.templates.event_header(ev.start_date, ev.end_date, ev), scheduler.templates.event_text(ev.start_date, ev.end_date, ev));

	this._rendered.push(d);
	parent.appendChild(d);

	left = left + parseInt(parent.style.left, 10) + menu_offset;

	if (this._edit_id == ev.id) {

		d.style.zIndex = 1; //fix overlapping issue
		width = Math.max(width - 4, scheduler.xy.editor_width);
		d = document.createElement("DIV");
		d.setAttribute("event_id", ev.id);
		this.set_xy(d, width, height - 20, left, top + 14);
		d.className = "dhx_cal_editor";

		var d2 = document.createElement("DIV");
		this.set_xy(d2, width - 6, height - 26);
		d2.style.cssText += ";margin:2px 2px 2px 2px;overflow:hidden;";

		d.appendChild(d2);
		this._els["dhx_cal_data"][0].appendChild(d);
		this._rendered.push(d);

		d2.innerHTML = "<textarea class='dhx_cal_editor'>" + ev.text + "</textarea>";
		if (this._quirks7) d2.firstChild.style.height = height - 12 + "px"; //IEFIX
		this._editor = d2.firstChild;
		this._editor.onkeydown = function(e) {
			if ((e || event).shiftKey) return true;
			var code = (e || event).keyCode;
			if (code == scheduler.keys.edit_save) scheduler.editStop(true);
			if (code == scheduler.keys.edit_cancel) scheduler.editStop(false);
		};
		this._editor.onselectstart = function (e) {
			return (e || event).cancelBubble = true;
		};
		scheduler._focus(d2.firstChild, true);
		//IE and opera can add x-scroll during focusing
		this._els["dhx_cal_data"][0].scrollLeft = 0;
	}
	if (this.xy.menu_width !== 0 && this._select_id == ev.id) {
		if (this.config.cascade_event_display && this._drag_mode)
			d.style.zIndex = 1; //fix overlapping issue for cascade view in case of dnd of selected event
		var icons = this.config["icons_" + ((this._edit_id == ev.id) ? "edit" : "select")];
		var icons_str = "";
		var bg_color = (ev.color ? ("background-color: " + ev.color + ";") : "");
		var color = (ev.textColor ? ("color: " + ev.textColor + ";") : "");
		for (var i = 0; i < icons.length; i++)
			icons_str += "<div class='dhx_menu_icon " + icons[i] + "' style='" + bg_color + "" + color + "' title='" + this.locale.labels[icons[i]] + "'></div>";
		var obj = this._render_v_bar(ev.id, left - menu + 1, top, menu, icons.length * 20 + 26 - 2, "", "<div style='" + bg_color + "" + color + "' class='dhx_menu_head'></div>", icons_str, true);
		obj.style.left = left - menu + 1;
		this._els["dhx_cal_data"][0].appendChild(obj);
		this._rendered.push(obj);
	}
};
scheduler._render_v_bar = function (id, x, y, w, h, style, contentA, contentB, bottom) {
	var d = document.createElement("DIV");
	var ev = this.getEvent(id);

	var cs = (bottom) ? "dhx_cal_event dhx_cal_select_menu" : "dhx_cal_event";

	var cse = scheduler.templates.event_class(ev.start_date, ev.end_date, ev);
	if (cse) cs = cs + " " + cse;

	var bg_color = (ev.color ? ("background:" + ev.color + ";") : "");
	var color = (ev.textColor ? ("color:" + ev.textColor + ";") : "");

	var html = '<div event_id="' + id + '" class="' + cs + '" style="position:absolute; top:' + y + 'px; left:' + x + 'px; width:' + (w - 4) + 'px; height:' + h + 'px;' + (style || "") + '"></div>';
	d.innerHTML = html;

	var container = d.cloneNode(true).firstChild;

	if (!bottom && scheduler.renderEvent(container, ev)) {
		return container;
	} else {
		container = d.firstChild;

		var inner_html = '<div class="dhx_event_move dhx_header" style=" width:' + (w - 6) + 'px;' + bg_color + '" >&nbsp;</div>';
		inner_html += '<div class="dhx_event_move dhx_title" style="' + bg_color + '' + color + '">' + contentA + '</div>';
		inner_html += '<div class="dhx_body" style=" width:' + (w - (this._quirks ? 4 : 14)) + 'px; height:' + (h - (this._quirks ? 20 : 30) + 1) + 'px;' + bg_color + '' + color + '">' + contentB + '</div>'; // +2 css specific, moved from render_event

		var footer_class = "dhx_event_resize dhx_footer";
		if (bottom)
			footer_class = "dhx_resize_denied " + footer_class;

		inner_html += '<div class="' + footer_class + '" style=" width:' + (w - 8) + 'px;' + (bottom ? ' margin-top:-1px;' : '') + '' + bg_color + '' + color + '" ></div>';

		container.innerHTML = inner_html;
	}

	return container;
};
scheduler.renderEvent = function(){
	return false;
},
scheduler.locate_holder = function(day) {
	if (this._mode == "day") return this._els["dhx_cal_data"][0].firstChild; //dirty
	return this._els["dhx_cal_data"][0].childNodes[day];
};
scheduler.locate_holder_day = function(date, past) {
	var day = Math.floor((this._correct_shift(date, 1) - this._min_date) / (60 * 60 * 24 * 1000));
	//when locating end data of event , we need to use next day if time part was defined
	if (past && this.date.time_part(date)) day++;
	return day;
};



scheduler._get_dnd_order = function(order, ev_height, max_height){
	if(!this._drag_event)
		return order;
	if(!this._drag_event._orig_sorder)
		this._drag_event._orig_sorder = order;
	else
		order = this._drag_event._orig_sorder;

	var evTop = ev_height * order;
	while((evTop + ev_height) > max_height){
		order--;
		evTop -= ev_height;
	}
	return order;
};
//scheduler._get_event_bar_pos = function(sday, eday, week, drag){
scheduler._get_event_bar_pos = function(ev){
	var x = this._colsS[ev._sday];
	var x2 = this._colsS[ev._eday];
	if (x2 == x) x2 = this._colsS[ev._eday + 1];
	var hb = this.xy.bar_height;

	var order = ev._sorder;
	if(ev.id == this._drag_id){
		var cellHeight = this._colsS.heights[ev._sweek + 1] - this._colsS.heights[ev._sweek]- 22;//22 for month head height
		order = scheduler._get_dnd_order(order, hb, cellHeight);
	}
	var y_event_offset =  order * hb;
	var y = this._colsS.heights[ev._sweek] + (this._colsS.height ? (this.xy.month_scale_height + 2) : 2 ) + y_event_offset;
	return {x:x, x2:x2, y:y};
};

scheduler.render_event_bar = function (ev) {
	var parent = this._rendered_location;
	var pos = this._get_event_bar_pos(ev);

	var y = pos.y;
	var x = pos.x;
	var x2 = pos.x2;

	//events in ignored dates

	if (!x2) return;


	var d = document.createElement("DIV");
	var cs = "dhx_cal_event_clear";
	if (!ev._timed) {
		cs = "dhx_cal_event_line";
		if (ev.hasOwnProperty("_first_chunk") && ev._first_chunk)
			cs += " dhx_cal_event_line_start";
		if (ev.hasOwnProperty("_last_chunk") && ev._last_chunk)
			cs += " dhx_cal_event_line_end";
	}

	var cse = scheduler.templates.event_class(ev.start_date, ev.end_date, ev);
	if (cse) cs = cs + " " + cse;

	var bg_color = (ev.color ? ("background:" + ev.color + ";") : "");
	var color = (ev.textColor ? ("color:" + ev.textColor + ";") : "");

	var html = '<div event_id="' + ev.id + '" class="' + cs + '" style="position:absolute; top:' + y + 'px; left:' + x + 'px; width:' + (x2 - x - 15) + 'px;' + color + '' + bg_color + '' + (ev._text_style || "") + '">';

	ev = scheduler.getEvent(ev.id); // ev at this point could be a part of a larged event
	if (ev._timed)
		html += scheduler.templates.event_bar_date(ev.start_date, ev.end_date, ev);
	html += scheduler.templates.event_bar_text(ev.start_date, ev.end_date, ev) + '</div>';
	html += '</div>';

	d.innerHTML = html;

	this._rendered.push(d.firstChild);
	parent.appendChild(d.firstChild);
};

scheduler._locate_event = function(node) {
	var id = null;
	while (node && !id && node.getAttribute) {
		id = node.getAttribute("event_id");
		node = node.parentNode;
	}
	return id;
};

scheduler.edit = function(id) {
	if (this._edit_id == id) return;
	this.editStop(false, id);
	this._edit_id = id;
	this.updateEvent(id);
};
scheduler.editStop = function(mode, id) {
	if (id && this._edit_id == id) return;
	var ev = this.getEvent(this._edit_id);
	if (ev) {
		if (mode) ev.text = this._editor.value;
		this._edit_id = null;
		this._editor = null;
		this.updateEvent(ev.id);
		this._edit_stop_event(ev, mode);
	}
};
scheduler._edit_stop_event = function(ev, mode) {
	if (this._new_event) {
		if (!mode) {
			if (ev) // in case of custom lightbox user can already delete event
				this.deleteEvent(ev.id, true);
		} else {
			this.callEvent("onEventAdded", [ev.id, ev]);
		}
		this._new_event = null;
	} else {
		if (mode){
			this.callEvent("onEventChanged", [ev.id, ev]);
		}
	}
};

scheduler.getEvents = function(from, to) {
	var result = [];
	for (var a in this._events) {
		var ev = this._events[a];
		if (ev && ( (!from && !to) || (ev.start_date < to && ev.end_date > from) ))
			result.push(ev);
	}
	return result;
};
scheduler.getRenderedEvent = function(id) {
	if (!id)
		return;
	var rendered_events = scheduler._rendered;
	for (var i=0; i<rendered_events.length; i++) {
		var rendered_event = rendered_events[i];
		if (rendered_event.getAttribute("event_id") == id) {
			return rendered_event;
		}
	}
	return null;
};
scheduler.showEvent = function(id, mode) {
	var ev = (typeof id == "number" || typeof id == "string") ? scheduler.getEvent(id) : id;
	mode = mode||scheduler._mode;

	if (!ev || (this.checkEvent("onBeforeEventDisplay") && !this.callEvent("onBeforeEventDisplay", [ev, mode])))
		return;

	var scroll_hour = scheduler.config.scroll_hour;
	scheduler.config.scroll_hour = ev.start_date.getHours();
	var preserve_scroll = scheduler.config.preserve_scroll;
	scheduler.config.preserve_scroll = false;

	var original_color = ev.color;
	var original_text_color = ev.textColor;
	if (scheduler.config.highlight_displayed_event) {
		ev.color = scheduler.config.displayed_event_color;
		ev.textColor = scheduler.config.displayed_event_text_color;
	}

	scheduler.setCurrentView(new Date(ev.start_date), mode);

	ev.color = original_color;
	ev.textColor = original_text_color;
	scheduler.config.scroll_hour = scroll_hour;
	scheduler.config.preserve_scroll = preserve_scroll;

	if (scheduler.matrix && scheduler.matrix[mode]) {
		scheduler._els.dhx_cal_data[0].scrollTop = getAbsoluteTop(scheduler.getRenderedEvent(ev.id)) - getAbsoluteTop(scheduler._els.dhx_cal_data[0]) - 20;
	}

	scheduler.callEvent("onAfterEventDisplay", [ev, mode]);
};

scheduler._loaded = {};
scheduler._load = function(url, from) {
	url = url || this._load_url;

	if(!url){
		//if scheduler.setLoadMode is called before scheduler.init, initial rendering will invoke data loading while url is undefined
		return;
	}

	url += (url.indexOf("?") == -1 ? "?" : "&") + "timeshift=" + (new Date()).getTimezoneOffset();
	if (this.config.prevent_cache)    url += "&uid=" + this.uid();
	var to;
	from = from || this._date;

	if (this._load_mode) {
		var lf = this.templates.load_format;

		from = this.date[this._load_mode + "_start"](new Date(from.valueOf()));
		while (from > this._min_date) from = this.date.add(from, -1, this._load_mode);
		to = from;

		var cache_line = true;
		while (to < this._max_date) {
			to = this.date.add(to, 1, this._load_mode);
			if (this._loaded[lf(from)] && cache_line)
				from = this.date.add(from, 1, this._load_mode); else cache_line = false;
		}

		var temp_to = to;
		do {
			to = temp_to;
			temp_to = this.date.add(to, -1, this._load_mode);
		} while (temp_to > from && this._loaded[lf(temp_to)]);

		if (to <= from)
			return false; //already loaded
		dhtmlxAjax.get(url + "&from=" + lf(from) + "&to=" + lf(to), function(l) {scheduler.on_load(l);});
		while (from < to) {
			this._loaded[lf(from)] = true;
			from = this.date.add(from, 1, this._load_mode);
		}
	} else
		dhtmlxAjax.get(url, function(l) {scheduler.on_load(l);});
	this.callEvent("onXLS", []);
	return true;
};
scheduler.on_load = function(loader) {
	var evs;
	if (this._process && this._process != "xml") {
		evs = this[this._process].parse(loader.xmlDoc.responseText);
	} else {
		evs = this._magic_parser(loader);
	}

	scheduler._process_loading(evs);

	this.callEvent("onXLE", []);
};
scheduler._process_loading = function(evs) {
	this._loading = true;
	this._not_render = true;
	for (var i = 0; i < evs.length; i++) {
		if (!this.callEvent("onEventLoading", [evs[i]])) continue;
		this.addEvent(evs[i]);
	}
	this._not_render = false;
	if (this._render_wait) this.render_view_data();

	this._loading = false;
	if (this._after_call) this._after_call();
	this._after_call = null;
};
scheduler._init_event = function(event) {
	event.text = (event.text || event._tagvalue) || "";
	event.start_date = scheduler._init_date(event.start_date);
	event.end_date = scheduler._init_date(event.end_date);
};

scheduler._init_date = function(date){
	if(!date)
		return null;
	if(typeof date == "string")
		return scheduler.templates.xml_date(date);
	else return new Date(date);
};

scheduler.json = {};
scheduler.json.parse = function(data) {
	if (typeof data == "string") {
		scheduler._temp = eval("(" + data + ")");
		data = (scheduler._temp) ? scheduler._temp.data || scheduler._temp.d || scheduler._temp : [];
	}

	if (data.dhx_security)
		dhtmlx.security_key = data.dhx_security;

	var collections = (scheduler._temp && scheduler._temp.collections) ? scheduler._temp.collections : {};
	var collections_loaded = false;
	for (var key in collections) {
		if (collections.hasOwnProperty(key)) {
			collections_loaded = true;
			var collection = collections[key];
			var arr = scheduler.serverList[key];
			if (!arr) continue;
			arr.splice(0, arr.length); //clear old options
			for (var j = 0; j < collection.length; j++) {
				var option = collection[j];
				var obj = { key: option.value, label: option.label }; // resulting option object
				for (var option_key in option) {
					if (option.hasOwnProperty(option_key)) {
						if (option_key == "value" || option_key == "label")
							continue;
						obj[option_key] = option[option_key]; // obj['value'] = option['value']
					}
				}
				arr.push(obj);
			}
		}
	}
	if (collections_loaded)
		scheduler.callEvent("onOptionsLoad", []);

	var evs = [];
	for (var i = 0; i < data.length; i++) {
		var event = data[i];
		scheduler._init_event(event);
		evs.push(event);
	}
	return evs;
};
scheduler.parse = function(data, type) {
	this._process = type;
	this.on_load({xmlDoc: {responseText: data}});
};
scheduler.load = function(url, call) {
	if (typeof call == "string") {
		this._process = call;
		call = arguments[2];
	}

	this._load_url = url;
	this._after_call = call;
	this._load(url, this._date);
};
//possible values - day,week,month,year,all
scheduler.setLoadMode = function(mode) {
	if (mode == "all") mode = "";
	this._load_mode = mode;
};

scheduler.serverList = function(name, array) {
	if (array) {
		return this.serverList[name] = array.slice(0);
	}
	return this.serverList[name] = (this.serverList[name] || []);
};
scheduler._userdata = {};
scheduler._magic_parser = function(loader) {
	var xml;
	if (!loader.getXMLTopNode) { //from a string
		var xml_string = loader.xmlDoc.responseText;
		loader = new dtmlXMLLoaderObject(function() {});
		loader.loadXMLString(xml_string);
	}

	xml = loader.getXMLTopNode("data");
	if (xml.tagName != "data") return [];//not an xml
	var skey = xml.getAttribute("dhx_security");
	if (skey)
		dhtmlx.security_key = skey;

	var opts = loader.doXPath("//coll_options");
	for (var i = 0; i < opts.length; i++) {
		var bind = opts[i].getAttribute("for");
		var arr = this.serverList[bind];
		if (!arr) continue;
		arr.splice(0, arr.length);	//clear old options
		var itms = loader.doXPath(".//item", opts[i]);
		for (var j = 0; j < itms.length; j++) {
			var itm = itms[j];
			var attrs = itm.attributes;
			var obj = { key: itms[j].getAttribute("value"), label: itms[j].getAttribute("label")};
			for (var k = 0; k < attrs.length; k++) {
				var attr = attrs[k];
				if (attr.nodeName == "value" || attr.nodeName == "label")
					continue;
				obj[attr.nodeName] = attr.nodeValue;
			}
			arr.push(obj);
		}
	}
	if (opts.length)
		scheduler.callEvent("onOptionsLoad", []);

	var ud = loader.doXPath("//userdata");
	for (var i = 0; i < ud.length; i++) {
		var udx = this._xmlNodeToJSON(ud[i]);
		this._userdata[udx.name] = udx.text;
	}

	var evs = [];
	xml = loader.doXPath("//event");

	for (var i = 0; i < xml.length; i++) {
		var ev = evs[i] = this._xmlNodeToJSON(xml[i]);
		scheduler._init_event(ev);
	}
	return evs;
};
scheduler._xmlNodeToJSON = function(node) {
	var t = {};
	for (var i = 0; i < node.attributes.length; i++)
		t[node.attributes[i].name] = node.attributes[i].value;

	for (var i = 0; i < node.childNodes.length; i++) {
		var child = node.childNodes[i];
		if (child.nodeType == 1)
			t[child.tagName] = child.firstChild ? child.firstChild.nodeValue : "";
	}

	if (!t.text) t.text = node.firstChild ? node.firstChild.nodeValue : "";

	return t;
};
scheduler.attachEvent("onXLS", function() {
	if (this.config.show_loading === true) {
		var t;
		t = this.config.show_loading = document.createElement("DIV");
		t.className = 'dhx_loading';
		t.style.left = Math.round((this._x - 128) / 2) + "px";
		t.style.top = Math.round((this._y - 15) / 2) + "px";
		this._obj.appendChild(t);
	}
});
scheduler.attachEvent("onXLE", function() {
	var t = this.config.show_loading;
	if (t && typeof t == "object") {
			this._obj.removeChild(t);
			this.config.show_loading = true;
		}
});

/*
This software is allowed to use under GPL or you need to obtain Commercial or Enterise License
to use it in not GPL project. Please contact sales@dhtmlx.com for details
*/
scheduler.ical={
	parse:function(str){
		var data = str.match(RegExp(this.c_start+"[^\f]*"+this.c_end,""));
		if (!data.length) return;
		
		//unfolding 
		data[0]=data[0].replace(/[\r\n]+(?=[a-z \t])/g," ");
		//drop property
		data[0]=data[0].replace(/\;[^:\r\n]*:/g,":");
		
		
		var incoming=[];
		var match;
		var event_r = RegExp("(?:"+this.e_start+")([^\f]*?)(?:"+this.e_end+")","g");
		while (match=event_r.exec(data)){
			var e={};
			var param;
			var param_r = /[^\r\n]+[\r\n]+/g;
			while (param=param_r.exec(match[1]))
				this.parse_param(param.toString(),e);
			if (e.uid && !e.id) e.id = e.uid; //fallback to UID, when ID is not defined
			incoming.push(e);	
		}
		return incoming;
	},
	parse_param:function(str,obj){
		var d = str.indexOf(":"); 
			if (d==-1) return;
		
		var name = str.substr(0,d).toLowerCase();
		var value = str.substr(d+1).replace(/\\\,/g,",").replace(/[\r\n]+$/,"");
		if (name=="summary")
			name="text";
		else if (name=="dtstart"){
			name = "start_date";
			value = this.parse_date(value,0,0);
		}
		else if (name=="dtend"){
			name = "end_date";
			value = this.parse_date(value,0,0);
		}
		obj[name]=value;
	},
	parse_date:function(value,dh,dm){
		var t = value.split("T");	
		if (t[1]){
			dh=t[1].substr(0,2);
			dm=t[1].substr(2,2);
		}
		var dy = t[0].substr(0,4);
		var dn = parseInt(t[0].substr(4,2),10)-1;
		var dd = t[0].substr(6,2);
		if (scheduler.config.server_utc && !t[1]) { // if no hours/minutes were specified == full day event
			return new Date(Date.UTC(dy,dn,dd,dh,dm)) ;
		}
		return new Date(dy,dn,dd,dh,dm);
	},
	c_start:"BEGIN:VCALENDAR",
	e_start:"BEGIN:VEVENT",
	e_end:"END:VEVENT",
	c_end:"END:VCALENDAR"	
};
scheduler._lightbox_controls = {};
scheduler.formSection = function(name){
	var config = this.config.lightbox.sections;
	var i =0;
	for (i; i < config.length; i++)
		if (config[i].name == name)
			break;
	var section = config[i];
	if (!scheduler._lightbox)
		scheduler.getLightbox();
	var header = document.getElementById(section.id);
	var node = header.nextSibling;

	var result = {
		section: section,
		header: header,
		node: node,
		getValue:function(ev){
			return scheduler.form_blocks[section.type].get_value(node, (ev||{}), section);
		},
		setValue:function(value, ev){
			return scheduler.form_blocks[section.type].set_value(node, value, (ev||{}), section);
		}
	};

	var handler = scheduler._lightbox_controls["get_"+section.type+"_control"];
	return handler?handler(result):result;
};
scheduler._lightbox_controls.get_template_control = function(result) {
	result.control = result.node;
	return result;
};
scheduler._lightbox_controls.get_select_control = function(result) {
	result.control = result.node.getElementsByTagName('select')[0];
	return result;
};
scheduler._lightbox_controls.get_textarea_control = function(result) {
	result.control = result.node.getElementsByTagName('textarea')[0];
	return result;
};
scheduler._lightbox_controls.get_time_control = function(result) {
	result.control = result.node.getElementsByTagName('select'); // array
	return result;
};
scheduler.form_blocks={
	template:{
			render: function(sns){
			var height=(sns.height||"30")+"px";
			return "<div class='dhx_cal_ltext dhx_cal_template' style='height:"+height+";'></div>";
		},
		set_value:function(node,value,ev,config){
			node.innerHTML = value||"";
		},
		get_value:function(node,ev,config){
			return node.innerHTML||"";
		},
		focus: function(node){
		}
	},
	textarea:{
		render:function(sns){
			var height=(sns.height||"130")+"px";
			return "<div class='dhx_cal_ltext' style='height:"+height+";'><textarea></textarea></div>";
		},
		set_value:function(node,value,ev){
			node.firstChild.value=value||"";
		},
		get_value:function(node,ev){
			return node.firstChild.value;
		},
		focus:function(node){
			var a=node.firstChild; scheduler._focus(a, true) 
		}
	},
	select:{
		render:function(sns){
			var height=(sns.height||"23")+"px";
			var html="<div class='dhx_cal_ltext' style='height:"+height+";'><select style='width:100%;'>";
			for (var i=0; i < sns.options.length; i++)
				html+="<option value='"+sns.options[i].key+"'>"+sns.options[i].label+"</option>";
			html+="</select></div>";
			return html;
		},
		set_value:function(node,value,ev,sns){
			var select = node.firstChild;
			if (!select._dhx_onchange && sns.onchange) {
				select.onchange = sns.onchange;
				select._dhx_onchange = true;
			}
			if (typeof value == "undefined")
				value = (select.options[0]||{}).value;
			select.value=value||"";
		},
		get_value:function(node,ev){
			return node.firstChild.value;
		},
		focus:function(node){
			var a=node.firstChild; scheduler._focus(a, true); 
		}
	},
	time:{
		render:function(sns) {
			if (!sns.time_format) {
				// default order
				sns.time_format = ["%H:%i", "%d", "%m", "%Y"];
			}
			// map: default order => real one
			sns._time_format_order = {};
			var time_format = sns.time_format;

			var cfg = scheduler.config;
			var dt = this.date.date_part(scheduler._currentDate());
			var last = 24*60, first = 0;
			if(scheduler.config.limit_time_select){
				last = 60*cfg.last_hour+1;
				first = 60*cfg.first_hour;
				dt.setHours(cfg.first_hour);
			}
			var html = "";

			for (var p = 0; p < time_format.length; p++) {
				var time_option = time_format[p];

				// adding spaces between selects
				if (p > 0) {
					html += " ";
				}

				switch (time_option) {
					case "%Y":
						sns._time_format_order[3] = p;
						//year
						html+="<select>";
						var year = dt.getFullYear()-5; //maybe take from config?
						for (var i=0; i < 10; i++)
							html+="<option value='"+(year+i)+"'>"+(year+i)+"</option>";
						html+="</select> ";
						break;
					case "%m":
						sns._time_format_order[2] = p;
						//month
						html+="<select>";
						for (var i=0; i < 12; i++)
							html+="<option value='"+i+"'>"+this.locale.date.month_full[i]+"</option>";
						html += "</select>";
						break;
					case "%d":
						sns._time_format_order[1] = p;
						//days
						html+="<select>";
						for (var i=1; i < 32; i++)
							html+="<option value='"+i+"'>"+i+"</option>";
						html += "</select>";
						break;
					case "%H:%i":
						sns._time_format_order[0] = p;
						//hours
						html += "<select>";
						var i = first;
						var tdate = dt.getDate();
						sns._time_values = [];

						while(i<last){
							var time=this.templates.time_picker(dt);
							html+="<option value='"+i+"'>"+time+"</option>";
							sns._time_values.push(i);
							dt.setTime(dt.valueOf()+this.config.time_step*60*1000);
							var diff = (dt.getDate()!=tdate)?1:0; // moved or not to the next day
							i=diff*24*60+dt.getHours()*60+dt.getMinutes();
						}
						html += "</select>";
						break;
				}
			}

			return "<div style='height:30px;padding-top:0px;font-size:inherit;' class='dhx_section_time'>"+html+"<span style='font-weight:normal; font-size:10pt;'> &nbsp;&ndash;&nbsp; </span>"+html+"</div>";
		},
		set_value:function(node,value,ev,config){
			var cfg = scheduler.config;
			var s=node.getElementsByTagName("select");
			var map = config._time_format_order;

			if(cfg.full_day) {
				if (!node._full_day){
					var html = "<label class='dhx_fullday'><input type='checkbox' name='full_day' value='true'> "+scheduler.locale.labels.full_day+"&nbsp;</label></input>";
					if (!scheduler.config.wide_form)
						html = node.previousSibling.innerHTML+html;
					node.previousSibling.innerHTML=html;
					node._full_day=true;
				}
				var input=node.previousSibling.getElementsByTagName("input")[0];
				input.checked = (scheduler.date.time_part(ev.start_date)===0 && scheduler.date.time_part(ev.end_date)===0);

				s[map[0]].disabled=input.checked;
				s[ map[0] + s.length/2 ].disabled=input.checked;

				input.onclick = function(){ 
					if(input.checked) {
						var obj = {};
						scheduler.form_blocks.time.get_value(node,obj,config);

						var start_date = scheduler.date.date_part(obj.start_date);
						var end_date = scheduler.date.date_part(obj.end_date);

						if (+end_date == +start_date || (+end_date >= +start_date && (ev.end_date.getHours() != 0 || ev.end_date.getMinutes() != 0)))
							end_date = scheduler.date.add(end_date, 1, "day");
					}

					s[map[0]].disabled=input.checked;
					s[ map[0] + s.length/2 ].disabled=input.checked;
					
					_fill_lightbox_select(s,0,start_date||ev.start_date);
					_fill_lightbox_select(s,config.time_format.length+1,end_date||ev.end_date);
				};
			}
			
			if(cfg.auto_end_date && cfg.event_duration) {
				function _update_lightbox_select() {
					var curren_date = scheduler.getState().date;
					var start_date;
					switch (map.length) {
						case 4:
							start_date = new Date(s[map[3]].value,s[map[2]].value,s[map[1]].value,0,s[map[0]].value);
							break;
						case 3:
							start_date = new Date(curren_date.getFullYear(),s[map[2]].value,s[map[1]].value,0,s[map[0]].value);
							break;
						case 2:
							start_date = new Date(curren_date.getFullYear(),curren_date.getMonth(),s[map[1]].value,0,s[map[0]].value);
						default:
							start_date = new Date(curren_date.getFullYear(),curren_date.getMonth(),curren_date.getDate(),0,s[map[0]].value);
					}
					//var start_date = new Date(s[map[3]].value,s[map[2]].value,s[map[1]].value,0,s[map[0]].value);
					var end_date = new Date(start_date.getTime() + (scheduler.config.event_duration * 60 * 1000));
					_fill_lightbox_select(s, config.time_format.length, end_date);
				}
				for(var i=0,len=s.length; i<len; i++) {
					s[i].onchange = _update_lightbox_select;
				}
			}
			
			function _fill_lightbox_select(s,i,d) {
				var time_values = config._time_values;
				var direct_value = d.getHours()*60+d.getMinutes();
				var fixed_value = direct_value;
				var value_found = false;
				for (var k=0; k<time_values.length; k++) {
					var t_v = time_values[k];
					if (t_v === direct_value) {
						value_found = true;
						break;
					}
					if (t_v < direct_value)
						fixed_value = t_v;
				}

				s[i+map[0]].value=(value_found)?direct_value:fixed_value;
				if(!(value_found || fixed_value)){
					s[i+map[0]].selectedIndex = -1;//show empty select in FF
				}
				if (map[1] !== undefined) s[i+map[1]].value=d.getDate();
				if (map[2] !== undefined) s[i+map[2]].value=d.getMonth();
				if (map[3] !== undefined) s[i+map[3]].value=d.getFullYear();
			}

			_fill_lightbox_select(s,0,ev.start_date);
			_fill_lightbox_select(s,config.time_format.length,ev.end_date);
		},
		get_value:function(node, ev, config) {
			s=node.getElementsByTagName("select");
			var map = config._time_format_order;
			
			var curren_date = scheduler.getState().date;
			var start_date;
			switch (map.length) {
				case 4:
					ev.start_date = new Date(s[map[3]].value,s[map[2]].value,s[map[1]].value,0,s[map[0]].value);
					ev.end_date = new Date(s[map[3]+4].value,s[map[2]+4].value,s[map[1]+4].value,0,s[map[0]+4].value);
					break;
				case 3:
					ev.start_date = new Date(curren_date.getFullYear(),s[map[2]].value,s[map[1]].value,0,s[map[0]].value);
					ev.end_date = new Date(curren_date.getFullYear(),s[map[2]+3].value,s[map[1]+3].value,0,s[map[0]+3].value);
					break;
				case 2:
					ev.start_date = new Date(curren_date.getFullYear(),curren_date.getMonth(),s[map[1]].value,0,s[map[0]].value);
					ev.end_date = new Date(curren_date.getFullYear(),curren_date.getMonth(),s[map[1]+2].value,0,s[map[0]+2].value);
					break;
				default:
					ev.start_date = new Date(curren_date.getFullYear(),curren_date.getMonth(),curren_date.getDate(),0,s[map[0]].value);
					ev.end_date = new Date(curren_date.getFullYear(),curren_date.getMonth(),curren_date.getDate(),0,s[map[0]+1].value);
			}
			
			//ev.start_date=new Date(s[map[3]].value,s[map[2]].value,s[map[1]].value,0,s[map[0]].value);
			//ev.end_date=new Date(s[map[3]+4].value,s[map[2]+4].value,s[map[1]+4].value,0,s[map[0]+4].value);

			if (ev.end_date<=ev.start_date) 
				ev.end_date=scheduler.date.add(ev.start_date,scheduler.config.time_step,"minute");
			return {
				start_date: new Date(ev.start_date),
				end_date: new Date(ev.end_date)
			};
		},
		focus:function(node){
			scheduler._focus(node.getElementsByTagName("select")[0]); 
		}
	}
};
scheduler.showCover=function(box){
	if (box){
		box.style.display="block";

		var scroll_top = window.pageYOffset||document.body.scrollTop||document.documentElement.scrollTop;
		var scroll_left = window.pageXOffset||document.body.scrollLeft||document.documentElement.scrollLeft;

		var view_height = window.innerHeight||document.documentElement.clientHeight;

		if(scroll_top) // if vertical scroll on window
			box.style.top=Math.round(scroll_top+Math.max((view_height-box.offsetHeight)/2, 0))+"px";
		else // vertical scroll on body
			box.style.top=Math.round(Math.max(((view_height-box.offsetHeight)/2), 0) + 9)+"px"; // +9 for compatibility with auto tests

		// not quite accurate but used for compatibility reasons
		if(document.documentElement.scrollWidth > document.body.offsetWidth) // if horizontal scroll on the window
			box.style.left=Math.round(scroll_left+(document.body.offsetWidth-box.offsetWidth)/2)+"px";
		else // horizontal scroll on the body
			box.style.left=Math.round((document.body.offsetWidth-box.offsetWidth)/2)+"px";
	}
    this.show_cover();
};
scheduler.showLightbox=function(id){
	if (!id) return;
	if (!this.callEvent("onBeforeLightbox",[id])) {
		if (this._new_event)
			this._new_event = null;
		return;
	}
	var box = this.getLightbox();
	this.showCover(box);
	this._fill_lightbox(id,box);
	this.callEvent("onLightbox",[id]);
};
scheduler._fill_lightbox = function(id, box) {
	var ev = this.getEvent(id);
	var s = box.getElementsByTagName("span");
	if (scheduler.templates.lightbox_header) {
		s[1].innerHTML = "";
		s[2].innerHTML = scheduler.templates.lightbox_header(ev.start_date, ev.end_date, ev);
	} else {
		s[1].innerHTML = this.templates.event_header(ev.start_date, ev.end_date, ev);
		s[2].innerHTML = (this.templates.event_bar_text(ev.start_date, ev.end_date, ev) || "").substr(0, 70); //IE6 fix
	}

	var sns = this.config.lightbox.sections;
	for (var i = 0; i < sns.length; i++) {
		var current_sns = sns[i];
		var node = document.getElementById(current_sns.id).nextSibling;
		var block = this.form_blocks[current_sns.type];
		var value = (ev[current_sns.map_to] !== undefined) ? ev[current_sns.map_to] : current_sns.default_value;
		block.set_value.call(this, node, value, ev, current_sns);
		if (sns[i].focus)
			block.focus.call(this, node);
	}

	scheduler._lightbox_id = id;
};
scheduler._lightbox_out=function(ev){
	var sns = this.config.lightbox.sections;
	for (var i=0; i < sns.length; i++) {
		var node = document.getElementById(sns[i].id);
		node=(node?node.nextSibling:node);
		var block=this.form_blocks[sns[i].type];
		var res=block.get_value.call(this,node,ev, sns[i]);
		if (sns[i].map_to!="auto")
			ev[sns[i].map_to]=res;
	}
	return ev;
};
scheduler._empty_lightbox=function(data){
	var id=scheduler._lightbox_id;
	var ev=this.getEvent(id);
	var box=this.getLightbox();

	this._lame_copy(ev, data);

	this.setEvent(ev.id,ev);
	this._edit_stop_event(ev,true);
	this.render_view_data();
};
scheduler.hide_lightbox=function(id){
	this.hideCover(this.getLightbox());
	this._lightbox_id=null;
	this.callEvent("onAfterLightbox",[]);
};
scheduler.hideCover=function(box){
	if (box) box.style.display="none";
	this.hide_cover();
};
scheduler.hide_cover=function(){
	if (this._cover) 
		this._cover.parentNode.removeChild(this._cover);
	this._cover=null;
};
scheduler.show_cover=function(){
	this._cover=document.createElement("DIV");
	this._cover.className="dhx_cal_cover";
	var _document_height = ((document.height !== undefined) ? document.height : document.body.offsetHeight);
	var _scroll_height = ((document.documentElement) ? document.documentElement.scrollHeight : 0);
	this._cover.style.height = Math.max(_document_height, _scroll_height) + 'px';
	document.body.appendChild(this._cover);
};
scheduler.save_lightbox=function(){
	var data = this._lightbox_out({}, this._lame_copy(this.getEvent(this._lightbox_id)));
	if (this.checkEvent("onEventSave") && !this.callEvent("onEventSave",[this._lightbox_id, data, this._new_event]))
		return;
	this._empty_lightbox(data);
	this.hide_lightbox();
};
scheduler.startLightbox = function(id, box){
	this._lightbox_id = id;
	this._custom_lightbox = true;

	this._temp_lightbox = this._lightbox;
	this._lightbox = box;
	this.showCover(box);
};
scheduler.endLightbox = function(mode, box){
	this._edit_stop_event(scheduler.getEvent(this._lightbox_id),mode);
	if (mode)
		scheduler.render_view_data();
	this.hideCover(box);

	if (this._custom_lightbox){
		this._lightbox = this._temp_lightbox;
		this._custom_lightbox = false;
	}
	this._temp_lightbox = this._lightbox_id = null; // in case of custom lightbox user only calls endLightbox so we need to reset _lightbox_id
};
scheduler.resetLightbox = function(){
	if (scheduler._lightbox && !scheduler._custom_lightbox)
		scheduler._lightbox.parentNode.removeChild(scheduler._lightbox);
	scheduler._lightbox = null;
};
scheduler.cancel_lightbox=function(){
	this.callEvent("onEventCancel",[this._lightbox_id, this._new_event]);
	this.endLightbox(false);
	this.hide_lightbox();
};
scheduler._init_lightbox_events=function(){
	this.getLightbox().onclick=function(e){
		var src=e?e.target:event.srcElement;
		if (!src.className) src=src.previousSibling;
		if (src && src.className)
			switch(src.className){
				case "dhx_save_btn":
					scheduler.save_lightbox();
					break;
				case "dhx_delete_btn":
					var c=scheduler.locale.labels.confirm_deleting;

					scheduler._dhtmlx_confirm(c, scheduler.locale.labels.title_confirm_deleting, function(){
						scheduler.deleteEvent(scheduler._lightbox_id);
						scheduler._new_event = null; //clear flag, if it was unsaved event
						scheduler.hide_lightbox();
					});

					break;
				case "dhx_cancel_btn":
					scheduler.cancel_lightbox();
					break;

				default:
					if (src.getAttribute("dhx_button")) {
						scheduler.callEvent("onLightboxButton", [src.className, src, e]);
					} else {
						var index, block, sec;
						if (src.className.indexOf("dhx_custom_button") != -1) {
							if (src.className.indexOf("dhx_custom_button_") != -1) {
								index = src.parentNode.getAttribute("index");
								sec = src.parentNode.parentNode;
							} else {
								index = src.getAttribute("index");
								sec = src.parentNode;
								src = src.firstChild;
							}
						}
						if (index) {
							block = scheduler.form_blocks[scheduler.config.lightbox.sections[index].type];
							block.button_click(index, src, sec, sec.nextSibling);
						}
					}
					break;
			}
	};
	this.getLightbox().onkeydown=function(e){
		switch((e||event).keyCode){
			case scheduler.keys.edit_save:
				if ((e||event).shiftKey) return;
				scheduler.save_lightbox();
				break;
			case scheduler.keys.edit_cancel:
				scheduler.cancel_lightbox();
				break;
			default:
				break;
		}
	};
};
scheduler.setLightboxSize=function(){
	var d = this._lightbox;
	if (!d) return;

	var con = d.childNodes[1];
	con.style.height="0px";
	con.style.height=con.scrollHeight+"px";
	d.style.height=con.scrollHeight+scheduler.xy.lightbox_additional_height+"px";
	con.style.height=con.scrollHeight+"px"; //it is incredible , how ugly IE can be
};

scheduler._init_dnd_events = function(){
	dhtmlxEvent(document.body, "mousemove", scheduler._move_while_dnd);
	dhtmlxEvent(document.body, "mouseup", scheduler._finish_dnd);
	scheduler._init_dnd_events = function(){};
};
scheduler._move_while_dnd = function(e){
	if (scheduler._dnd_start_lb){
		if (!document.dhx_unselectable){
			document.body.className += " dhx_unselectable";
			document.dhx_unselectable = true;
		}
		var lb = scheduler.getLightbox();
		var now = (e&&e.target)?[e.pageX, e.pageY]:[event.clientX, event.clientY];
		lb.style.top = scheduler._lb_start[1]+now[1]-scheduler._dnd_start_lb[1]+"px";
		lb.style.left = scheduler._lb_start[0]+now[0]-scheduler._dnd_start_lb[0]+"px";
	}
};
scheduler._ready_to_dnd = function(e){
	var lb = scheduler.getLightbox();
	scheduler._lb_start = [parseInt(lb.style.left,10), parseInt(lb.style.top,10)];
	scheduler._dnd_start_lb = (e&&e.target)?[e.pageX, e.pageY]:[event.clientX, event.clientY];
};
scheduler._finish_dnd = function(){
	if (scheduler._lb_start){
		scheduler._lb_start = scheduler._dnd_start_lb = false;
		document.body.className = document.body.className.replace(" dhx_unselectable","");
		document.dhx_unselectable = false;
	}
};
scheduler.getLightbox=function(){ //scheduler.config.wide_form=true;
	if (!this._lightbox){
		var d=document.createElement("DIV");
		d.className="dhx_cal_light";
		if (scheduler.config.wide_form)
			d.className+=" dhx_cal_light_wide";
		if (scheduler.form_blocks.recurring)
			d.className+=" dhx_cal_light_rec";
			
		if (/msie|MSIE 6/.test(navigator.userAgent))
			d.className+=" dhx_ie6";
		d.style.visibility="hidden";
		var html = this._lightbox_template;

		var buttons = this.config.buttons_left;
		for (var i = 0; i < buttons.length; i++)
			html+="<div class='dhx_btn_set dhx_left_btn_set "+buttons[i]+"_set'><div dhx_button='1' class='"+buttons[i]+"'></div><div>"+scheduler.locale.labels[buttons[i]]+"</div></div>";

		buttons = this.config.buttons_right;
		for (var i = 0; i < buttons.length; i++)
			html+="<div class='dhx_btn_set dhx_right_btn_set "+buttons[i]+"_set' style='float:right;'><div dhx_button='1' class='"+buttons[i]+"'></div><div>"+scheduler.locale.labels[buttons[i]]+"</div></div>";

		html+="</div>";
		d.innerHTML=html;
		if (scheduler.config.drag_lightbox){
			d.firstChild.onmousedown = scheduler._ready_to_dnd;
			d.firstChild.onselectstart = function(){ return false; };
			d.firstChild.style.cursor = "pointer";
			scheduler._init_dnd_events();

		}
		document.body.insertBefore(d,document.body.firstChild);
		this._lightbox=d;
		
		var sns=this.config.lightbox.sections;
		html="";
		for (var i=0; i < sns.length; i++) {
			var block=this.form_blocks[sns[i].type];
			if (!block) continue; //ignore incorrect blocks
			sns[i].id="area_"+this.uid();
			var button = "";
			if (sns[i].button){
			 	button = "<div class='dhx_custom_button' index='"+i+"'><div class='dhx_custom_button_"+sns[i].button+"'></div><div>"+this.locale.labels["button_"+sns[i].button]+"</div></div>";
			 }
			
			if (this.config.wide_form){
				html+="<div class='dhx_wrap_section'>";
			}
			html+="<div id='"+sns[i].id+"' class='dhx_cal_lsection'>"+button+this.locale.labels["section_"+sns[i].name]+"</div>"+block.render.call(this,sns[i]);
			html+="</div>"
		}

		var ds=d.getElementsByTagName("div");
		for (var i=0; i<ds.length; i++) {
			var t_ds = ds[i];
			if (t_ds.className == "dhx_cal_larea") {
				t_ds.innerHTML = html;
				break;
			}
		}

		//sizes
		this.setLightboxSize();

		this._init_lightbox_events(this);
		d.style.display="none";
		d.style.visibility="visible";
	}
	return this._lightbox;
};
scheduler._lightbox_template="<div class='dhx_cal_ltitle'><span class='dhx_mark'>&nbsp;</span><span class='dhx_time'></span><span class='dhx_title'></span></div><div class='dhx_cal_larea'></div>";

scheduler._init_touch_events = function(){
	if (this.config.touch != "force")
		this.config.touch = this.config.touch 
			&& (   (navigator.userAgent.indexOf("Mobile")!=-1)
				|| (navigator.userAgent.indexOf("iPad")!=-1)
				|| (navigator.userAgent.indexOf("Android")!=-1)
				|| (navigator.userAgent.indexOf("Touch")!=-1));

	if (this.config.touch){
		this.xy.scroll_width = 0;
		if (window.navigator.msPointerEnabled){
			this._touch_events(["MSPointerMove", "MSPointerDown", "MSPointerUp"], function(ev){
				if (ev.pointerType == ev.MSPOINTER_TYPE_MOUSE ) return null;
				return ev;
			}, function(ev){
				return (!ev || ev.pointerType == ev.MSPOINTER_TYPE_MOUSE);
			});
		} else
			this._touch_events(["touchmove", "touchstart", "touchend"], function(ev){
				if (ev.touches && ev.touches.length > 1) return null;
				if (ev.touches[0])
					return { target:ev.target, pageX:ev.touches[0].pageX, pageY:ev.touches[0].pageY };
				else 
					return ev;
			}, function(){ return false; });
	}
};

scheduler._touch_events = function(names, accessor, ignore){
	//webkit on android need to be handled separately
	var a_webkit = (navigator.userAgent.indexOf("Android")!=-1) && (navigator.userAgent.indexOf("WebKit")!=-1);
	var source, tracker, timer, drag_mode, scroll_mode, action_mode;
	var dblclicktime = 0;

	function check_direction_swipe(s_ev, e_ev, step){
		if (!s_ev || !e_ev) return;

		var dy = Math.abs(s_ev.pageY - e_ev.pageY);
		var dx = Math.abs(s_ev.pageX - e_ev.pageX);
		if (dx>step && (!dy || (dx/dy > 3))){
			if (s_ev.pageX > e_ev.pageX)
				scheduler._click.dhx_cal_next_button();
			else
				scheduler._click.dhx_cal_prev_button();
		}
	};
	dhtmlxEvent(document.body, names[0], function(e){
		if (ignore(e)) return;

		if (drag_mode){
			scheduler._on_mouse_move(accessor(e));
			scheduler._update_global_tip();
			if (e.preventDefault)	
				e.preventDefault();
			e.cancelBubble = true;
			return false;
		}

		if (tracker && a_webkit){
			check_direction_swipe(tracker, accessor(e), 0);
		}

		tracker = accessor(e);
		//ignore common and scrolling moves
		if (!action_mode) return;

		//multitouch		
		if (!tracker){
			scroll_mode = true;
			return;
		}

		//target changed - probably in scroll mode

		if (source.target != tracker.target || (Math.abs(source.pageX - tracker.pageX) > 5) || (Math.abs(source.pageY - tracker.pageY) > 5)){
			scroll_mode = true;
			clearTimeout(timer);
		}

	});

	dhtmlxEvent(this._els["dhx_cal_data"][0], "scroll", drag_cancel);
	dhtmlxEvent(this._els["dhx_cal_data"][0], "touchcancel", drag_cancel);
	dhtmlxEvent(this._els["dhx_cal_data"][0], "contextmenu", function(e){
		if (action_mode){
			if (e && e.preventDefault)
				e.preventDefault();
			(e||event).cancelBubble = true;
			return false;
		}
	});
	dhtmlxEvent(this._els["dhx_cal_data"][0], names[1], function(e){
		if (ignore(e)) return;

		drag_mode = scroll_mode = tracker = false;
		action_mode = true;
		scheduler._temp_touch_block = true;

		var fake_event = tracker = accessor(e);
		if (!fake_event){
			scroll_mode = true;
			return;
		}

		//dbl click
		var now = new Date();

		if (!scroll_mode && !drag_mode && now - dblclicktime < 250){
			scheduler._click.dhx_cal_data(fake_event);
			window.setTimeout(function(){
				scheduler._on_dbl_click(fake_event);
			}, 50);
			
			if (e.preventDefault)
				e.preventDefault();
			e.cancelBubble = true;
			scheduler._block_next_stop = true;
			return false;
		}
		dblclicktime = now;

		//drag
		
		if (scroll_mode || drag_mode || !scheduler.config.touch_drag)
			return;
		
		//there is no target
		timer = setTimeout(function(){
			
			drag_mode = true;
			var target = source.target;
			if (target && target.className && target.className.indexOf("dhx_body") != -1)
				target = target.previousSibling;

			scheduler._on_mouse_down(source, target);
			if (scheduler._drag_mode && scheduler._drag_mode != "create"){
				var pos = -1;
				scheduler.for_rendered(scheduler._drag_id, function(node, i) {
					pos = node.getBoundingClientRect().top;
					node.style.display='none';
					scheduler._rendered.splice(i, 1);
				});
				if (pos>=0){
					var step = scheduler.config.time_step;
					scheduler._move_pos_shift = step* Math.round((fake_event.pageY - pos)*60/(scheduler.config.hour_size_px*step));
				}
			}

			if (scheduler.config.touch_tip)
				scheduler._show_global_tip();
			scheduler._on_mouse_move(source);
		},scheduler.config.touch_drag);

		source = fake_event;
	});
	function drag_cancel(e){
		scheduler._hide_global_tip();
		if (drag_mode){
			scheduler._on_mouse_up( accessor(e||event) );
			scheduler._temp_touch_block = false;
		}
		scheduler._drag_id = null;
		scheduler._drag_mode=null;
		scheduler._drag_pos=null;
		
		clearTimeout(timer);
		drag_mode = action_mode = false;
		scroll_mode = true;
	}
	dhtmlxEvent(this._els["dhx_cal_data"][0], names[2], function(e){
		if (ignore(e)) return;

		if (!drag_mode)
			check_direction_swipe(source, tracker, 200);
		
		if (drag_mode)
			scheduler._ignore_next_click = true;

		drag_cancel(e);
		if (scheduler._block_next_stop){
			scheduler._block_next_stop = false;
			if (e.preventDefault)
				e.preventDefault();
			e.cancelBubble = true;
			return false;	
		}
	});	

	dhtmlxEvent(document.body, names[2], drag_cancel);
};

scheduler._show_global_tip = function(){
	scheduler._hide_global_tip();

	var toptip = scheduler._global_tip = document.createElement("DIV");
	toptip.className='dhx_global_tip';

	scheduler._update_global_tip(1);

	document.body.appendChild(toptip);
};
scheduler._update_global_tip = function(init){
	var toptip = scheduler._global_tip;
	if (toptip){
		var time = "";
		if (scheduler._drag_id && !init){
			var ev = scheduler.getEvent(scheduler._drag_id);
			if (ev)
				time = "<div>" + (ev._timed ? scheduler.templates.event_header(ev.start_date, ev.end_date, ev):scheduler.templates.day_date(ev.start_date, ev.end_date, ev)) + "</div>";
		}

		if (scheduler._drag_mode == "create" || scheduler._drag_mode == "new-size")
			toptip.innerHTML = (scheduler.locale.drag_to_create || "Drag to create")+time;
		else
			toptip.innerHTML = (scheduler.locale.drag_to_move || "Drag to move")+time;
	}
};
scheduler._hide_global_tip = function(){
	var toptip = scheduler._global_tip;
	if (toptip && toptip.parentNode){
		toptip.parentNode.removeChild(toptip);
		scheduler._global_tip = 0;
	}
};

scheduler._dp_init=function(dp){
	dp._methods=["_set_event_text_style","","changeEventId","deleteEvent"];
	
	this.attachEvent("onEventAdded",function(id){
		if (!this._loading && this._validId(id))
			dp.setUpdated(id,true,"inserted");
	});
	this.attachEvent("onConfirmedBeforeEventDelete", function(id){
		if (!this._validId(id)) return;
		var z=dp.getState(id);
        
		if (z=="inserted" || this._new_event) {  dp.setUpdated(id,false);		return true; }
		if (z=="deleted")  return false;
    	if (z=="true_deleted")  return true;
    	
		dp.setUpdated(id,true,"deleted");
      	return false;
	});
	this.attachEvent("onEventChanged",function(id){
		if (!this._loading && this._validId(id))
			dp.setUpdated(id,true,"updated");
	});
	
	dp._getRowData=function(id,pref){
		var ev=this.obj.getEvent(id);
		var data = {};
		
		for (var a in ev){
			if (a.indexOf("_")==0) continue;
			if (ev[a] && ev[a].getUTCFullYear) //not very good, but will work
				data[a] = this.obj.templates.xml_format(ev[a]);
			else
				data[a] = ev[a];
		}
		
		return data;
	};
	dp._clearUpdateFlag=function(){};
	
	dp.attachEvent("insertCallback", scheduler._update_callback);
	dp.attachEvent("updateCallback", scheduler._update_callback);
	dp.attachEvent("deleteCallback", function(upd, id) {
		this.obj.setUserData(id, this.action_param, "true_deleted");
		this.obj.deleteEvent(id);
	});
		
};

scheduler._validId=function(id){
	return true;
};

scheduler.setUserData=function(id,name,value){
	if (id)
		this.getEvent(id)[name]=value;
	else
		this._userdata[name]=value;
};
scheduler.getUserData=function(id,name){
	return id?this.getEvent(id)[name]:this._userdata[name];
};
scheduler._set_event_text_style=function(id,style){
	this.for_rendered(id,function(r){
		r.style.cssText+=";"+style;
	});
	var ev = this.getEvent(id);
	ev["_text_style"]=style;
	this.event_updated(ev);
};

scheduler._update_callback = function(upd,id){
	var data		=	scheduler._xmlNodeToJSON(upd.firstChild);
	data.text		=	data.text||data._tagvalue;
	data.start_date	=	scheduler.templates.xml_date(data.start_date);
	data.end_date	=	scheduler.templates.xml_date(data.end_date);
	
	scheduler.addEvent(data);
};
scheduler._skin_settings = {
	fix_tab_position: [1,0],
	use_select_menu_space: [1,0],
	wide_form: [1,0],

	hour_size_px: [44,42],
	displayed_event_color: ["#ff4a4a", "ffc5ab"],
	displayed_event_text_color: ["#ffef80", "7e2727"]
};

scheduler._skin_xy = {
	lightbox_additional_height: [90,50],
	nav_height: [59,22],
	bar_height: [24,20]
};

scheduler._configure = function(col, data, skin){
	for (var key in data)
		if (typeof col[key] == "undefined")
			col[key] = data[key][skin];
};
scheduler._skin_init = function(){
	if (!scheduler.skin){
		var links = document.getElementsByTagName("link");
		for (var i = 0; i < links.length; i++) {
			var res = links[i].href.match("dhtmlxscheduler_([a-z]+).css");
			if (res){
				scheduler.skin = res[1];
				break;
			}
		}
	}

	
	
	var set = 0;
	if (scheduler.skin && scheduler.skin != "terrace") set = 1;

	//apply skin related settings
	this._configure(scheduler.config, scheduler._skin_settings, set);
	this._configure(scheduler.xy, scheduler._skin_xy, set);

	//classic skin need not any further customization
	if (set) return;
	
	
	var minic = scheduler.config.minicalendar;
	if (minic) minic.padding = 14;

	scheduler.templates.event_bar_date = function(start,end,ev) {
		return "• <b>"+scheduler.templates.event_date(start)+"</b> ";
	};

	//scheduler._lightbox_template="<div class='dhx_cal_ltitle'><span class='dhx_mark'>&nbsp;</span><span class='dhx_time'></span><span class='dhx_title'></span><div class='dhx_close_icon'></div></div><div class='dhx_cal_larea'></div>";
	scheduler.attachEvent("onTemplatesReady", function() {

		var date_to_str = scheduler.date.date_to_str("%d");
		var old_month_day = scheduler.templates.month_day;
		scheduler.templates.month_day = function(date) {
			if (this._mode == "month") {
				var label = date_to_str(date);
				if (date.getDate() == 1) {
					label = scheduler.locale.date.month_full[date.getMonth()] + " " + label;
				}
				if (+date == +scheduler.date.date_part(new Date)) {
					label = scheduler.locale.labels.dhx_cal_today_button + " " + label;
				}
				return label;
			} else {
				return old_month_day.call(this, date);
			}
		};

		if (scheduler.config.fix_tab_position){
			var navline_divs = scheduler._els["dhx_cal_navline"][0].getElementsByTagName('div');
			var tabs = [];
			var last = 211;
			for (var i=0; i<navline_divs.length; i++) {
				var div = navline_divs[i];
				var name = div.getAttribute("name");
				if (name) { // mode tab
					div.style.right = "auto";
					switch (name) {
						case "day_tab":
							div.style.left = "14px";
							div.className += " dhx_cal_tab_first";
							break;
						case "week_tab":
							div.style.left = "75px";
							break;
						case "month_tab":
							div.style.left = "136px";
							div.className += " dhx_cal_tab_last";
							break;
						default:
							div.style.left = last+"px";
							div.className += " dhx_cal_tab_standalone";
							last = last + 14 + div.offsetWidth;
							break;
					}
				}

			}
		}
	});
	scheduler._skin_init = function(){};
};


if (window.jQuery){

(function( $ ){

	var methods = [];
	$.fn.dhx_scheduler = function(config){
		if (typeof(config) === 'string') {
			if (methods[config] ) {
				return methods[config].apply(this, []);
			}else {
				$.error('Method ' +  config + ' does not exist on jQuery.dhx_scheduler');
			}
		} else {
			var views = [];
			this.each(function() {
				if (this && this.getAttribute){
					if (!this.getAttribute("dhxscheduler")){
						for (var key in config)
							if (key!="data")
								scheduler.config[key] = config[key];

						if (!this.getElementsByTagName("div").length){
							this.innerHTML = '<div class="dhx_cal_navline"><div class="dhx_cal_prev_button">&nbsp;</div><div class="dhx_cal_next_button">&nbsp;</div><div class="dhx_cal_today_button"></div><div class="dhx_cal_date"></div><div class="dhx_cal_tab" name="day_tab" style="right:204px;"></div><div class="dhx_cal_tab" name="week_tab" style="right:140px;"></div><div class="dhx_cal_tab" name="month_tab" style="right:76px;"></div></div><div class="dhx_cal_header"></div><div class="dhx_cal_data"></div>';
							this.className += " dhx_cal_container";
						}
						scheduler.init(this, scheduler.config.date, scheduler.config.mode);
						if (config.data)
							scheduler.parse(config.data);

						views.push(scheduler);
					}
				}
			});

			if (views.length === 1) return views[0];
			return views;
		}
	};
	

	

})(jQuery);

}
/*
This software is allowed to use under GPL or you need to obtain Commercial or Enterise License
to use it in non-GPL project. Please contact sales@dhtmlx.com for details
*/
(function(){

var temp_section;
var before;

scheduler.config.collision_limit = 1;	

function _setTempSection(event_id) { // for custom views (matrix, timeline, units)
	var pr = scheduler._props?scheduler._props[scheduler._mode]:null;
	var matrix = scheduler.matrix?scheduler.matrix[scheduler._mode]:null;
	var checked_mode = pr||matrix; // units or matrix mode
	if(pr)
		var map_to = checked_mode.map_to;
	if(matrix)
		var map_to = checked_mode.y_property;
	if ((checked_mode) && event_id){
		temp_section = scheduler.getEvent(event_id)[map_to];
	}	
}

scheduler.attachEvent("onBeforeDrag",function(id){
	_setTempSection(id); 
	return true;
});
scheduler.attachEvent("onBeforeLightbox",function(id){
	var ev = scheduler.getEvent(id);
	before = [ev.start_date, ev.end_date];
	_setTempSection(id);
	return true;
});
scheduler.attachEvent("onEventChanged",function(id){
	if (!id) return true;
	var ev = scheduler.getEvent(id);
	if (!scheduler.checkCollision(ev)){
		if (!before) return false;
		ev.start_date = before[0];
		ev.end_date = before[1];
		ev._timed=this.isOneDayEvent(ev);
	}
	return true;
});
scheduler.attachEvent("onBeforeEventChanged",function(ev,e,is_new){
	return scheduler.checkCollision(ev);
});
scheduler.attachEvent("onEventAdded",function(id,ev) {
	var result = scheduler.checkCollision(ev);
	if (!result)
		scheduler.deleteEvent(id);
});
scheduler.attachEvent("onEventSave",function(id, edited_ev, is_new){
	edited_ev = scheduler._lame_clone(edited_ev);
	edited_ev.id = id;

	//lightbox may not have 'time' section
	if(!(edited_ev.start_date && edited_ev.end_date)){
		var ev = scheduler.getEvent(id);
		edited_ev.start_date = new Date(ev.start_date);
		edited_ev.end_date = new Date(ev.end_date);
	}

	if(edited_ev.rec_type){
		scheduler._roll_back_dates(edited_ev);
	}
	return scheduler.checkCollision(edited_ev); // in case user creates event on one date but then edited it another
});

scheduler.checkCollision = function(ev) {
	var evs = [];
	var collision_limit = scheduler.config.collision_limit;
	if (ev.rec_type) {
		var evs_dates = scheduler.getRecDates(ev);
		for(var k=0; k<evs_dates.length; k++) {
			var tevs = scheduler.getEvents(evs_dates[k].start_date, evs_dates[k].end_date);
			for(var j=0; j<tevs.length; j++) { 
				if ((tevs[j].event_pid || tevs[j].id) != ev.id )
					evs.push(tevs[j]);
			}
		}
	} else {
		evs = scheduler.getEvents(ev.start_date, ev.end_date);
		for (var i=0; i<evs.length; i++) {
			if (evs[i].id == ev.id) {
				evs.splice(i,1);
				break;
			}
		}
	}
	
	var pr = scheduler._props?scheduler._props[scheduler._mode]:null;
	var matrix = scheduler.matrix?scheduler.matrix[scheduler._mode]:null;
	
	var checked_mode = pr||matrix;
	if(pr)
		var map_to = checked_mode.map_to;
	if(matrix)
		var map_to = checked_mode.y_property;
	
	var single = true;
	if (checked_mode) { // custom view
		var count = 0;

		for (var i = 0; i < evs.length; i++)

			if (evs[i][map_to] == ev[map_to] && evs[i].id != ev.id)
				count++;
				
		if (count >= collision_limit) {

			single = false;
		}
	}
	else {
		if ( evs.length >= collision_limit )
			single = false;
	}
	if (!single) {
		var res = !scheduler.callEvent("onEventCollision",[ev,evs]);
		if (!res) {
			ev[map_to] = temp_section||ev[map_to]; // from _setTempSection for custom views
		}
		return res;
	}
	return single;
	
}

})();

/*
This software is allowed to use under GPL or you need to obtain Commercial or Enterise License
to use it in non-GPL project. Please contact sales@dhtmlx.com for details
*/
scheduler.form_blocks['combo']={
	render:function(sns) {
		if (!sns.cached_options)
			sns.cached_options = {};
		var res = '';
		res += "<div class='"+sns.type+"' style='height:"+(sns.height||20)+"px;' ></div>";
		return res;
	},
	set_value:function(node,value,ev,config){
		(function(){
			resetCombo();
			var id = scheduler.attachEvent("onAfterLightbox",function(){
				// otherwise destructor will never be called after form reset(e.g. in readonly event mode)
				resetCombo();
				scheduler.detachEvent(id);
			});
			function resetCombo(){
				if(node._combo && node._combo.DOMParent) {
					node._combo.destructor();
				}
			}
		})();
		window.dhx_globalImgPath = config.image_path||'/';
		node._combo = new dhtmlXCombo(node, config.name, node.offsetWidth-8);
		if (config.onchange)
			node._combo.attachEvent("onChange", config.onchange);

		if (config.options_height)
			node._combo.setOptionHeight(config.options_height);
		var combo = node._combo;
		combo.enableFilteringMode(config.filtering, config.script_path||null, !!config.cache);
		
		if (!config.script_path) { // script-side filtration is used
			var all_options = [];
			for (var i = 0; i < config.options.length; i++) {
				var option = config.options[i];
				var single_option = [
					option.key,
					option.label,
					option.css
				];
				all_options.push(single_option);
			}
			combo.addOption(all_options);
			if (ev[config.map_to]) {
				var index = combo.getIndexByValue(ev[config.map_to]);
				combo.selectOption(index);
			}
		} else { // server-side filtration is used
			var selected_id = ev[config.map_to];
			if (selected_id) {
				if (config.cached_options[selected_id]) {
					combo.addOption(selected_id, config.cached_options[selected_id]);
					combo.disable(1);
					combo.selectOption(0);
					combo.disable(0);
				} else {
					dhtmlxAjax.get(config.script_path+"?id="+selected_id+"&uid="+scheduler.uid(), function(result){
						var option = result.doXPath("//option")[0];
						var label = option.childNodes[0].nodeValue;
						config.cached_options[selected_id] = label;
						combo.addOption(selected_id, label);
						combo.disable(1);
						combo.selectOption(0);
						combo.disable(0);
					});
				}
			} else {
				combo.setComboValue("");
			}
		}
	},
	get_value:function(node,ev,config) {
		var selected_id = node._combo.getSelectedValue(); // value = key
		if (config.script_path) {
			config.cached_options[selected_id] = node._combo.getSelectedText();
		}
		return selected_id;
	},
	focus:function(node){
	}
};

scheduler.form_blocks['radio']={
	render:function(sns) {
		var res = '';
		res += "<div class='dhx_cal_ltext dhx_cal_radio' style='height:"+sns.height+"px;' >";
		for (var i=0; i<sns.options.length; i++) {
			var id = scheduler.uid();
			res += "<input id='"+id+"' type='radio' name='"+sns.name+"' value='"+sns.options[i].key+"'><label for='"+id+"'>"+" "+sns.options[i].label+"</label>";
			if(sns.vertical)
				res += "<br/>";
		}
		res += "</div>";
		
		return res;
	},
	set_value:function(node,value,ev,config){
		var radiobuttons = node.getElementsByTagName('input');
		for (var i = 0; i < radiobuttons.length; i++) {
			radiobuttons[i].checked = false;
			var checked_value = ev[config.map_to]||value;
			if (radiobuttons[i].value == checked_value) {
				radiobuttons[i].checked = true;
			}
		}
	},
	get_value:function(node,ev,config){
		var radiobuttons = node.getElementsByTagName('input');
		for(var i=0; i<radiobuttons.length; i++) {
			if(radiobuttons[i].checked) {
				return radiobuttons[i].value;
			}
		}
	},
	focus:function(node){
	}
};

scheduler.form_blocks['checkbox']={
	render:function(sns) {
		if (scheduler.config.wide_form)
			return '<div class="dhx_cal_wide_checkbox" '+(sns.height?("style='height:"+sns.height+"px;'"):"")+'></div>';
		else
			return '';
	},
	set_value:function(node,value,ev,config){
		node=document.getElementById(config.id);
		var id = scheduler.uid();
		var isChecked = (typeof config.checked_value != "undefined") ? ev[config.map_to] == config.checked_value : !!value;
		node.className += " dhx_cal_checkbox";
		var check_html = "<input id='"+id+"' type='checkbox' value='true' name='"+config.name+"'"+((isChecked)?"checked='true'":'')+"'>"; 
		var label_html = "<label for='"+id+"'>"+(scheduler.locale.labels["section_"+config.name]||config.name)+"</label>";
		if (scheduler.config.wide_form){
			node.innerHTML = label_html;
			node.nextSibling.innerHTML=check_html;
		} else 
			node.innerHTML=check_html+label_html;

		if (config.handler) {
			var checkbox = node.getElementsByTagName('input')[0];
			checkbox.onclick = config.handler;
		}
	},
	get_value:function(node,ev,config){
		node=document.getElementById(config.id);
		var checkbox = node.getElementsByTagName('input')[0]; // moved to the header
		if (!checkbox)
			checkbox = node.nextSibling.getElementsByTagName('input')[0];
		return (checkbox.checked)?(config.checked_value||true):(config.unchecked_value||false);
	},
	focus:function(node){
	}
};

/*
This software is allowed to use under GPL or you need to obtain Commercial or Enterise License
to use it in non-GPL project. Please contact sales@dhtmlx.com for details
*/
scheduler.config.limit_start = null;
scheduler.config.limit_end   = null;
scheduler.config.limit_view  = false;
scheduler.config.check_limits = true;
scheduler.config.mark_now = true;
scheduler.config.display_marked_timespans = true;

(scheduler._temp_limit_scope = function(){
	var before = null;
	var dhx_time_block = "dhx_time_block";
	var default_timespan_type = "default";
	var fix_options = function(options, days, zones) {
		if (days instanceof Date && zones instanceof Date) {
			options.start_date = days;
			options.end_date = zones
		} else {
			options.days = days;
			options.zones = zones;
		}	
		return options;
	};
	var get_resulting_options = function(days, zones, sections) {
		var options = (typeof days == "object") ? days : { days: days };
		options.type = dhx_time_block;
		options.css = "";
		if (zones) {
			if (sections)
				options.sections = sections;
			options = fix_options(options, days, zones);
		}
		return options;
	};
	scheduler.blockTime = function(days, zones, sections){
		var options = get_resulting_options(days, zones, sections);
		return scheduler.addMarkedTimespan(options);
	};
	scheduler.unblockTime = function(days, zones, sections) {
		zones = zones || "fullday";
		var options = get_resulting_options(days, zones, sections);
		return scheduler.deleteMarkedTimespan(options);
	};
	scheduler.attachEvent("onBeforeViewChange",function(om,od,nm,nd){
		nd = nd||od; nm = nm||om;
		if (scheduler.config.limit_view){
			if (nd.valueOf()>scheduler.config.limit_end.valueOf() || this.date.add(nd,1,nm)<=scheduler.config.limit_start.valueOf()){
				setTimeout(function(){
					scheduler.setCurrentView(scheduler._date, nm);
				},1);
				return false;
			}
		}
		return true;
	});
	scheduler.checkInMarkedTimespan = function(ev, timespan_type, on_overlap){
		timespan_type = timespan_type || default_timespan_type;

		var res = true;
		var temp_start_date = new Date(ev.start_date.valueOf());
		var temp_end_date = scheduler.date.add(temp_start_date, 1, "day");
		var timespans = scheduler._marked_timespans;
		for (; temp_start_date < ev.end_date; temp_start_date = scheduler.date.date_part(temp_end_date), temp_end_date = scheduler.date.add(temp_start_date, 1, "day") ) {
			var day_value = +scheduler.date.date_part( new Date(temp_start_date) ); // the first part of event not necessarily contains only date part
			var day_index = temp_start_date.getDay();

			var zones = getZones(ev, timespans, day_index, day_value, timespan_type);
			if (zones){
				for (var i = 0; i < zones.length; i+=2) {

					// they may change for new event if it passes limit zone
					var sm = scheduler._get_zone_minutes(temp_start_date);
					var em = ( ev.end_date>temp_end_date || ev.end_date.getDate() != temp_start_date.getDate() ) ? 1440 : scheduler._get_zone_minutes(ev.end_date);

					var sz = zones[i];
					var ez = zones[i+1];
					if (sz<em && ez>sm) {
						if(on_overlap == "function"){
							//handler allows to cancel overlapping
							//actually needed only to keep default behavior of limits
							res = on_overlap(ev, sm, em, sz, ez);//event object, event start/end minutes in 'zones' format, zone start/end minutes
						}else{
							res = false;
						}
						if(!res)
							break;
					}
				}
			}
		}
		return !res;
	};
	var blocker = scheduler.checkLimitViolation = function(event){
		if(!event)
			return true;
		if (!scheduler.config.check_limits)
			return true;
		var s = scheduler;
		var c = s.config;
		var evs = [];
		if (event.rec_type) {
			evs = scheduler.getRecDates(event);
		} else {
			evs = [event];
		}

		var complete_res = true;
		for (var p=0; p<evs.length; p++) {
			var res = true;
			var ev = evs[p];
			// Event could have old _timed property (e.g. we are creating event with DND on timeline view and crossed day)
			ev._timed = scheduler.isOneDayEvent(ev);

			res = (c.limit_start && c.limit_end) ? (ev.start_date.valueOf() >= c.limit_start.valueOf() && ev.end_date.valueOf() <= c.limit_end.valueOf()) : true;
			if (res){
				res = !scheduler.checkInMarkedTimespan(ev, dhx_time_block, function(ev, sm, em, sz, ez){
					//try crop event to allow placing
					var allow = true;
					if (sm<=ez && sm >=sz){
						if (ez == 24*60 || em<ez){
							allow = false;
						}
						if(ev._timed && s._drag_id && s._drag_mode == "new-size"){
							ev.start_date.setHours(0);
							ev.start_date.setMinutes(ez);
						}
						else {
							allow = false;
						}
					}
					if ((em>=sz && em<ez) || (sm < sz && em > ez)){
						if(ev._timed && s._drag_id && s._drag_mode == "new-size"){
							ev.end_date.setHours(0);
							ev.end_date.setMinutes(sz);
						}
						else {
							allow = false;
						}
					}
					return allow;
				});
			}
			if (!res) {
				s._drag_id = null;
				s._drag_mode = null;
				res = (s.checkEvent("onLimitViolation")) ? s.callEvent("onLimitViolation",[ev.id, ev]) : res;
			}
			complete_res = complete_res && res;
		}
		return complete_res;


	};

	function getZones(ev, timespans, day_index, day_value, timespan_type){
		var s = scheduler;
		//containers for 'unit' and 'timeline' views, and related 'section_id' properties
		var zones = [];
		var containers = {
			'_props':'map_to',
			'matrix':'y_property'};
		//check blocked sections in all units and timelines
		for(var container in containers){
			var property = containers[container];
			if(s[container]){
				for(var view in s[container]){
					var view_config = s[container][view];
					var linker = view_config[property];
					if(!ev[linker]) continue;
					zones =  s._add_timespan_zones(zones,
						getBlockedZones(timespans[view], ev[linker], day_index, day_value));
				}
			}
		}
		// now need to add day blocks
		zones = s._add_timespan_zones(zones, getBlockedZones(timespans, 'global', day_index, day_value));
		return zones;

		function getBlockedZones(timespans, property, day_index, day_value){
			var zones =[];
			if (timespans && timespans[property]) {
				var timeline_zones = timespans[property];
				var blocked_timeline_zones = get_relevant_blocked_zones(day_index, day_value, timeline_zones);
				for (var i=0; i<blocked_timeline_zones.length; i++) {
					zones = s._add_timespan_zones(zones, blocked_timeline_zones[i].zones);
				}
			}
			return zones;
		}
		function get_relevant_blocked_zones(day_index, day_value, zones) {
			var relevant_zones = (zones[day_value] && zones[day_value][timespan_type]) ? zones[day_value][timespan_type] :
				(zones[day_index] && zones[day_index][timespan_type]) ? zones[day_index][timespan_type] : [];
			return relevant_zones;
		};
	}

	scheduler.attachEvent("onMouseDown", function(classname) {
		return !(classname = dhx_time_block);
	});
	scheduler.attachEvent("onBeforeDrag",function(id){
		if (!id) return true;
		return blocker(scheduler.getEvent(id));
	});
	scheduler.attachEvent("onClick", function (event_id, native_event_object){
		return blocker(scheduler.getEvent(event_id));
    });
	scheduler.attachEvent("onBeforeLightbox",function(id){

		var ev = scheduler.getEvent(id);
		before = [ev.start_date, ev.end_date];
		return blocker(ev);
	});
	scheduler.attachEvent("onEventSave", function(id, data, is_new_event) {

		//lightbox may not have 'time' section
		if(!(data.start_date && data.end_date)){
			var ev = scheduler.getEvent(id);
			data.start_date = new Date(ev.start_date);
			data.end_date = new Date(ev.end_date);
		}

		if(data.rec_type){
			//_roll_back_dates modifies start_date of recurring event, need to check limits after modification
			// use a copy to keep original event unchanged
			var data_copy = scheduler._lame_clone(data);
			scheduler._roll_back_dates(data_copy);
			return blocker(data_copy);
		}
		return blocker(data);
	});
	scheduler.attachEvent("onEventAdded",function(id){
		if (!id) return true;
		var ev = scheduler.getEvent(id);
		if (!blocker(ev) && scheduler.config.limit_start && scheduler.config.limit_end) {
			//if newly created event is outside of limited time - crop it, leaving only allowed time
			if (ev.start_date < scheduler.config.limit_start) {
				ev.start_date = new Date(scheduler.config.limit_start);
			}
			if (ev.start_date.valueOf() >= scheduler.config.limit_end.valueOf()) {
				ev.start_date = this.date.add(scheduler.config.limit_end, -1, "day");
			}
			if (ev.end_date < scheduler.config.limit_start) {
				ev.end_date = new Date(scheduler.config.limit_start);
			}
			if (ev.end_date.valueOf() >= scheduler.config.limit_end.valueOf()) {
				ev.end_date = this.date.add(scheduler.config.limit_end, -1, "day");
			}
			if (ev.start_date.valueOf() >= ev.end_date.valueOf()) {
				ev.end_date = this.date.add(ev.start_date, (this.config.event_duration||this.config.time_step), "minute");
			}
			ev._timed=this.isOneDayEvent(ev);
		}
		return true;
	});
	scheduler.attachEvent("onEventChanged",function(id){
		if (!id) return true;
		var ev = scheduler.getEvent(id);
		if (!blocker(ev)){
			if (!before) return false;
			ev.start_date = before[0];
			ev.end_date = before[1];
			ev._timed=this.isOneDayEvent(ev);
		}
		return true;
	});
	scheduler.attachEvent("onBeforeEventChanged",function(ev, native_object, is_new){
		return blocker(ev);
	});
	scheduler.attachEvent("onBeforeEventCreated", function(ev) { // native event
		var start_date = scheduler.getActionData(ev).date;
		var event = {
			_timed: true,
			start_date: start_date,
			end_date: scheduler.date.add(start_date, scheduler.config.time_step, "minute")
		};
		return blocker(event);
	});

	scheduler.attachEvent("onViewChange", function(){
		scheduler._mark_now();
	});
	scheduler.attachEvent("onSchedulerResize", function(){
		window.setTimeout(function(){ scheduler._mark_now(); }, 1);
		return true;
	});
	scheduler.attachEvent("onTemplatesReady", function() {
		scheduler._mark_now_timer = window.setInterval(function() {
			scheduler._mark_now();
		}, 60000);
	});
	scheduler._mark_now = function(hide) {
		// day, week, units views
		var dhx_now_time = 'dhx_now_time';
		if (!this._els[dhx_now_time]) {
			this._els[dhx_now_time] = [];
		}
		var now = scheduler._currentDate();
		var cfg = this.config;
		scheduler._remove_mark_now(); // delete previous marks if they exist
		if (!hide && cfg.mark_now && now < this._max_date && now > this._min_date && now.getHours() >= cfg.first_hour && now.getHours()<cfg.last_hour) {
			var day_index = this.locate_holder_day(now);
			this._els[dhx_now_time] = scheduler._append_mark_now(day_index, now);
		}
	};
	scheduler._append_mark_now = function(day_index, now) {
		var dhx_now_time = 'dhx_now_time';
		var zone_start= scheduler._get_zone_minutes(now);
		var options = {
			zones: [zone_start, zone_start+1],
			css: dhx_now_time,
			type: dhx_now_time
		};
		if (!this._table_view) {
			if (this._props && this._props[this._mode]) { // units view
				var day_divs = this._els["dhx_cal_data"][0].childNodes;
				var r_divs = [];

				for (var i=0; i<day_divs.length-1; i++) {
					var t_day = day_index+i; // as each unit is actually considered +1 day
					options.days = t_day;
					var t_div = scheduler._render_marked_timespan(options, null, t_day)[0];
					r_divs.push(t_div)
				}
				return r_divs;
			} else {  // day/week views
				options.days = day_index;
				return scheduler._render_marked_timespan(options, null, day_index);
			}
		} else {
			if (this._mode == "month") {
				options.days = +scheduler.date.date_part(now);
				return scheduler._render_marked_timespan(options, null, null);
			}
		}
	};
	scheduler._remove_mark_now = function() {
		var dhx_now_time = 'dhx_now_time';
		var els = this._els[dhx_now_time];
		for (var i=0; i<els.length; i++) {
			var div = els[i];
			var parent = div.parentNode;
			if (parent) {
				parent.removeChild(div);
			}
		}
		this._els[dhx_now_time] = [];
	};

	/*
	scheduler._marked_timespans = {
		"global": {
			"0": {
				"default": [
					{  // sunday
						zones: [0, 100, 500, 600],
						css: "yellow_box",
						type: "default",
						view: "global",
						day: 0
					}
				]
			}
			"112121312": {
				"my_special_type": [
					{
						zones: [600, 900],
						type: "block",
						css: "some_class",
						view: "global",
						day: 112121312
					},
					{}
				]
			}
		},
		"units": {
			"5_id": {
				"3": {
					"special_type": [ {}, {}, {} ],
					"another_type": [ {} ]
				}
			},
			"6_id": {
				"11212127": {
					...
				}
			}
		}
	}
	*/
	scheduler._marked_timespans = { global: {} };

	scheduler._get_zone_minutes = function(date) {
		return date.getHours()*60 + date.getMinutes();
	};
	scheduler._prepare_timespan_options = function(config) { // receives 1 option, returns array of options
		var r_configs = []; // resulting configs
		var temp_configs = [];

		if (config.days == "fullweek")
			config.days = [0,1,2,3,4,5,6];

		if (config.days instanceof Array) {
			var t_days = config.days.slice();
			for (var i=0; i<t_days.length; i++) {
				var cloned_config = scheduler._lame_clone(config);
				cloned_config.days = t_days[i];
				r_configs.push.apply(r_configs, scheduler._prepare_timespan_options(cloned_config));
			}
			return r_configs;
		}

		if ( !config || !((config.start_date && config.end_date && config.end_date > config.start_date) || (config.days !== undefined && config.zones)) )
			return r_configs;  // incorrect config was provided

		var min = 0;
		var max = 24*60;
		if (config.zones == "fullday")
			config.zones = [min, max];
		if (config.zones && config.invert_zones) {
			config.zones = scheduler.invertZones(config.zones);
		}

		config.id = scheduler.uid();
		config.css = config.css||"";
		config.type = config.type||default_timespan_type;

		var sections = config.sections;
		if (sections) {
			for (var view_key in sections) {
				if (sections.hasOwnProperty(view_key)) {
					var ids = sections[view_key];
					if (!(ids instanceof Array))
						ids = [ids];
					for (var i=0; i<ids.length; i++) {
						var t_config = scheduler._lame_copy({}, config);
						t_config.sections = {};
						t_config.sections[view_key] = ids[i];
						temp_configs.push(t_config);
					}
				}
			}	
		} else {
			temp_configs.push(config);
		}

		for (var k=0; k<temp_configs.length; k++) {
			var c_config = temp_configs[k]; // config to be checked

			var start_date = c_config.start_date;
			var end_date = c_config.end_date;

			if (start_date && end_date) {
				var t_sd = scheduler.date.date_part(new Date(start_date)); // e.g. 05 october
				var t_ed= scheduler.date.add(t_sd, 1, "day");  // 06 october, will both be incremented in the loop

				while (t_sd < end_date) {
					var t_config = scheduler._lame_copy({}, c_config);
					delete t_config.start_date;
					delete t_config.end_date;
					t_config.days = t_sd.valueOf();
					var zone_start = (start_date > t_sd) ? scheduler._get_zone_minutes(start_date) : min; 
					var zone_end = ( end_date>t_ed || end_date.getDate() != t_sd.getDate() ) ? max : scheduler._get_zone_minutes(end_date);
					t_config.zones = [zone_start, zone_end];
					r_configs.push(t_config);

					t_sd = t_ed;
					t_ed = scheduler.date.add(t_ed, 1, "day");
				}
			} else {
				if (c_config.days instanceof Date)
					c_config.days = (scheduler.date.date_part(c_config.days)).valueOf();
				c_config.zones = config.zones.slice();
				r_configs.push(c_config);
			}
		}
		return r_configs;
	};
	scheduler._get_dates_by_index = function(index, start, end) {
		var dates = [];
		start = scheduler.date.date_part(new Date(start||scheduler._min_date));
		end = new Date(end||scheduler._max_date);
		var start_day = start.getDay();
		var delta = (index-start_day >= 0) ? (index-start_day) : (7-start.getDay()+index);
		var t_date = scheduler.date.add(start, delta, "day");
		for (; t_date < end; t_date = scheduler.date.add(t_date, 1, "week")) {
			dates.push(t_date);
		}
		return dates;
	};
	scheduler._get_css_classes_by_config = function(config) {
		var css_classes = [];
		if (config.type == dhx_time_block) {
			css_classes.push(dhx_time_block);
			if (config.css)
				css_classes.push(dhx_time_block+"_reset");
		}
		css_classes.push("dhx_marked_timespan", config.css);
		return css_classes.join(" ");
	};
	scheduler._get_block_by_config = function(config) {
		var block  = document.createElement("DIV");
		if (config.html) {
			if (typeof config.html == "string")
				block.innerHTML = config.html;
			else
				block.appendChild(config.html);
		}
		return block;
	};
	scheduler._render_marked_timespan = function(options, area, day) {
		var blocks = []; // resulting block which will be rendered and returned
		var c = scheduler.config;
		var min_date = this._min_date;
		var max_date = this._max_date;
		var day_value = false; // if timespan for specific date should be displayed

		if (!c.display_marked_timespans)
			return blocks;

		// in case of markTimespan
		if (!day && day !== 0) {
			if (options.days < 7)
				day = options.days;
			else {
				var date_to_display = new Date(options.days);
				day_value = +date_to_display;

				// in case of markTimespan date could be not in the viewing range, need to return
				if ( !(+max_date >= +date_to_display && +min_date <= +date_to_display) )
					return blocks;

				day = date_to_display.getDay();
			}

			// convert day default index (Sun - 0, Sat - 6) to index of hourscales (depends on week_start and config.start_on_monday)
			var min_day = min_date.getDay();
			if (min_day > day) {
				day = 7 - (min_day-day);
			} else {
				day = day - min_day;
			}
		}
		var zones = options.zones;
		var css_classes = scheduler._get_css_classes_by_config(options);

		if (scheduler._table_view && scheduler._mode == "month") {
			var areas = [];
			var days = [];


			if (!area) {
				days = (day_value) ? [day_value] : scheduler._get_dates_by_index(day);
				for (var i=0; i < days.length; i++) {
					areas.push( this._scales[days[i]] );
				}
			} else {
				areas.push(area);
				days.push(day);
			}

			for (var i=0; i < areas.length; i++) {
				area = areas[i];
				day = days[i];

				for (var k=0; k < zones.length; k+=2) {
					var start = zones[i];
					var end = zones[i+1];
					if (end <= start)
						return [];

					var block = scheduler._get_block_by_config(options);
					block.className = css_classes;

					var height = area.offsetHeight - 1; // 1 for bottom border
					var width = area.offsetWidth - 1; // 1 for left border

					var sweek = Math.floor((this._correct_shift(day,1)-min_date.valueOf())/(60*60*1000*24*this._cols.length));
					var sday = this.locate_holder_day(day, false) % this._cols.length;

					var left = this._colsS[sday];
					var top = this._colsS.heights[sweek]+(this._colsS.height?(this.xy.month_scale_height+2):2)-1;

					block.style.top = top + "px";
					block.style.lineHeight = block.style.height = height + "px";

					block.style.left = (left + Math.round( (start)/(24*60) * width)) + "px";
					block.style.width = Math.round( (end-start)/(24*60) * width) + "px";

					area.appendChild(block);
					blocks.push(block);
				}
			}
		} else {
			var index = day;
			if (this._props && this._props[this._mode] && options.sections && options.sections[this._mode]) {
				var view = this._props[this._mode];
				index = view.order[options.sections[this._mode]];
				if (view.size && (index > view.position+view.size)) {
					index = 0;
				}
			}
			area = area ? area : scheduler.locate_holder(index);

			for (var i = 0; i < zones.length; i+=2){
				var start = Math.max(zones[i], c.first_hour*60);
				var end = Math.min(zones[i+1], c.last_hour*60);
				if (end <= start) {
					if (i+2 < zones.length)
						continue;
					else
						return [];
				}

				var block = scheduler._get_block_by_config(options);
				block.className = css_classes;

				// +1 for working with section which really takes up whole height (as % would be == 0)
				var all_hours_height = this.config.hour_size_px*24 + 1;
				var hour_ms = 60*60*1000;
				block.style.top = (Math.round((start*60*1000-this.config.first_hour*hour_ms)*this.config.hour_size_px/hour_ms) % all_hours_height) + "px";
				block.style.lineHeight = block.style.height = Math.max((Math.round(((end-start)*60*1000)*this.config.hour_size_px/hour_ms)) % all_hours_height, 1)+"px";

				area.appendChild(block);
				blocks.push(block);
			}
		}

		return blocks;
	};
	// just marks timespan, will be cleaned after refresh
	scheduler.markTimespan = function(configuration) {
		var configs = scheduler._prepare_timespan_options(configuration);
		if (!configs.length)
			return;
		var divs = [];
		for (var i=0; i<configs.length; i++) {
			var config = configs[i];
			var blocks = scheduler._render_marked_timespan(config, null, null);
			if(blocks.length)
				divs.push.apply(divs, blocks);
		}
		return divs;
	};
	scheduler.unmarkTimespan = function(divs) {
		if (!divs)
			return;
		for (var i=0; i<divs.length; i++) {
			var div = divs[i];
			// parent may no longer be present if we switched views, navigated
			if (div.parentNode) {
				div.parentNode.removeChild(div);
			}
		}
	};

	scheduler._marked_timespans_ids = {};
	// adds marked timespan to collections, persistent
	scheduler.addMarkedTimespan = function(configuration) {
		var configs = scheduler._prepare_timespan_options(configuration);
		var global = "global";

		if (!configs.length)
			return; // options are incorrect, nothing to mark

		var id = configs[0].id;
		var timespans = scheduler._marked_timespans;
		var ids = scheduler._marked_timespans_ids;
		if (!ids[id])
			ids[id] = [];

		for (var i=0; i<configs.length; i++) {
			var config = configs[i];
			var day = config.days;
			var zones = config.zones;
			var css = config.css;
			var sections = config.sections;
			var type = config.type; // default or specified
			config.id = id;

			if (sections) {
				for (var view_key in sections) {
					if (sections.hasOwnProperty(view_key)) {
						if (!timespans[view_key])
							timespans[view_key] = {};
						var unit_id = sections[view_key];
						var timespans_view = timespans[view_key];
						if (!timespans_view[unit_id])
							timespans_view[unit_id] = {};
						if (!timespans_view[unit_id][day])
							timespans_view[unit_id][day] = {};
						if (!timespans_view[unit_id][day][type]){
							timespans_view[unit_id][day][type] = [];
							if(!scheduler._marked_timespans_types)
								scheduler._marked_timespans_types = {}
							if(!scheduler._marked_timespans_types[type])
								scheduler._marked_timespans_types[type] = true;
						}
						var day_configs = timespans_view[unit_id][day][type];
						config._array = day_configs;
						day_configs.push(config);
						ids[id].push(config);
					}
				}
			} else {
				if (!timespans[global][day])
					timespans[global][day] = {};
				if (!timespans[global][day][type])
					timespans[global][day][type] = [];

				if(!scheduler._marked_timespans_types)
					scheduler._marked_timespans_types = {}
				if(!scheduler._marked_timespans_types[type])
					scheduler._marked_timespans_types[type] = true;


				var day_configs = timespans[global][day][type];
				config._array = day_configs;
				day_configs.push(config);
				ids[id].push(config);
			}
		}
		return id;
	};
	// not used for now
	scheduler._add_timespan_zones = function(current_zones, zones) {
		var resulting_zones = current_zones.slice();
		zones = zones.slice();

		if (!resulting_zones.length)
			return zones;

		for (var i=0; i<resulting_zones.length; i+=2) {
			var c_zone_start = resulting_zones[i];
			var c_zone_end = resulting_zones[i+1];
			var isLast = (i+2 == resulting_zones.length);

			for (var k=0; k<zones.length; k+=2) {
				var zone_start = zones[k];
				var zone_end = zones[k+1];
				if ((zone_end > c_zone_end && zone_start <= c_zone_end) || (zone_start < c_zone_start && zone_end >= c_zone_start)) {
					resulting_zones[i] = Math.min(c_zone_start, zone_start);
					resulting_zones[i+1] = Math.max(c_zone_end, zone_end);
					i -= 2;
				} else {
					if (!isLast) // do nothing, maybe next current zone will match or will be last
						continue;

					var offset = (c_zone_start > zone_start)?0:2;
					resulting_zones.splice(i+offset, 0, zone_start, zone_end); // last current zone, need to add another
				}
				zones.splice(k--,2); // zone was merged or added, need to exclude it
				break;
			}
		}
		return resulting_zones;
	};
	scheduler._subtract_timespan_zones = function(current_zones, zones) {
		var resulting_zones = current_zones.slice();
		for (var i=0; i<resulting_zones.length; i+=2 ) {
			var c_zone_start = resulting_zones[i];// current_zone_start
			var c_zone_end = resulting_zones[i+1];
			for (var k=0; k<zones.length; k+=2) {
				var zone_start = zones[k];
				var zone_end = zones[k+1];
				if (zone_end > c_zone_start && zone_start < c_zone_end) {
					var is_modified = false;
					if (c_zone_start >= zone_start && c_zone_end <= zone_end) {
						resulting_zones.splice(i, 2);
					}				
					if (c_zone_start < zone_start) {
						resulting_zones.splice(i, 2, c_zone_start, zone_start);
						is_modified = true;
					}
					if (c_zone_end > zone_end) {
						resulting_zones.splice( (is_modified)?(i+2):i, (is_modified)?0:2, zone_end, c_zone_end);
					}
					i -= 2;
					break;
				} else {
					continue;
				}
			}
		}
		return resulting_zones;
	};
	scheduler.invertZones = function(zones) {
		return scheduler._subtract_timespan_zones([0, 1440], zones.slice());
	};
	scheduler._delete_marked_timespan_by_id = function(id) {
		var configs = scheduler._marked_timespans_ids[id];
		if (configs) {
			for (var i=0; i<configs.length; i++) {
				var config = configs[i];
				var parent_array = config._array;
				for (var k=0; k<parent_array.length; k++) {
					if (parent_array[k] == config) {
						parent_array.splice(k, 1);
						break;
					}
				}
			}
		}
	};
	scheduler._delete_marked_timespan_by_config = function(config) {
		var timespans = scheduler._marked_timespans;
		var sections = config.sections;
		var day = config.days;
		var type = config.type||default_timespan_type;
		var day_timespans = []; // array of timespans to subtract our config
		if (sections) {
			for (var view_key in sections) {
				if (sections.hasOwnProperty(view_key) && timespans[view_key]) {
					var unit_id = sections[view_key];
					if (timespans[view_key][unit_id] && timespans[view_key][unit_id][day] && timespans[view_key][unit_id][day][type])
						day_timespans = timespans[view_key][unit_id][day][type];
				}
			}
		} else {
			if (timespans.global[day] && timespans.global[day][type])
				day_timespans = timespans.global[day][type];
		}
		for (var i=0; i<day_timespans.length; i++) {
			var d_t = day_timespans[i];
			var zones = scheduler._subtract_timespan_zones(d_t.zones, config.zones);
			if (zones.length)
				d_t.zones = zones;
			else {
				day_timespans.splice(i,1);
				i--;
				// need to update ids collection
				var related_zones = scheduler._marked_timespans_ids[d_t.id];
				for (var k=0; k<related_zones.length; k++) {
					if (related_zones[k] == d_t) {
						related_zones.splice(k, 1);
						break;
					}
				}
			}
		}
	};
	scheduler.deleteMarkedTimespan = function(configuration) {
		// delete everything
		if (!arguments.length) {
			scheduler._marked_timespans = { global: {} };
			scheduler._marked_timespans_ids = {};
			scheduler._marked_timespans_types = {};
		}

		if (typeof configuration != "object") { // id was passed
			scheduler._delete_marked_timespan_by_id(configuration);
		} else { // normal configuration was passed

			if(!(configuration.start_date && configuration.end_date)){
				if(!configuration.days)
					configuration.days = "fullweek";
				if(!configuration.zones)
					configuration.zones = "fullday";
			}

			var types = [];
			if(!configuration.type){
				//if type not specified - delete timespans of all types
				for(var type in scheduler._marked_timespans_types){
					types.push(type);
				}
			}else{
				types.push(configuration.type);
			}


			var configs = scheduler._prepare_timespan_options(configuration);

			for (var i=0; i<configs.length; i++) {

				var config = configs[i];
				for( var t=0; t < types.length; t++){
					var typedConfig = scheduler._lame_clone(config);
					typedConfig.type = types[t];
					scheduler._delete_marked_timespan_by_config(typedConfig);
				}
			}

		}
	};
	scheduler._get_types_to_render = function(common, specific) {
		var types_to_render = (common) ? common : {};
		for (var type in specific||{} ) {
			if (specific.hasOwnProperty(type)) {
				types_to_render[type] = specific[type];
			}
		}
		return types_to_render;
	};
	scheduler._get_configs_to_render = function(types) {
		var configs = [];
		for (var type in types) {
			if (types.hasOwnProperty(type)) {
				configs.push.apply(configs, types[type]);
			}
		}
		return configs;
	};
	scheduler.attachEvent("onScaleAdd", function(area, day) {
		if (scheduler._table_view && scheduler._mode != "month")
			return;

		var day_index = day.getDay();
		var day_value = day.valueOf();
		var mode = this._mode;
		var timespans = scheduler._marked_timespans;
		var r_configs = [];

		if (this._props && this._props[mode]) { // we are in the units view and need to draw it's sections as well
			var view = this._props[mode]; // units view object
			var units = view.options;
			var index = scheduler._get_unit_index(view, day);
			var unit = units[index]; // key, label
			day = scheduler.date.date_part(new Date(this._date)); // for units view actually only 1 day is displayed yet the day variable will change, need to use this._date for all calls
			day_index = day.getDay();
			day_value = day.valueOf();

			if (timespans[mode] && timespans[mode][unit.key]) {
				var unit_zones = timespans[mode][unit.key];
				var unit_types = scheduler._get_types_to_render(unit_zones[day_index], unit_zones[day_value]);
				r_configs.push.apply(r_configs, scheduler._get_configs_to_render(unit_types));
			}
		}

		var global_data = timespans["global"];
		var day_types = global_data[day_value]||global_data[day_index];
		r_configs.push.apply(r_configs, scheduler._get_configs_to_render(day_types));

		for (var i=0; i<r_configs.length; i++) {
			scheduler._render_marked_timespan(r_configs[i], area, day);
		}
	});	

})();

/*
This software is allowed to use under GPL or you need to obtain Commercial or Enterise License
to use it in non-GPL project. Please contact sales@dhtmlx.com for details
*/
scheduler.templates.calendar_month=scheduler.date.date_to_str("%F %Y");scheduler.templates.calendar_scale_date=scheduler.date.date_to_str("%D");scheduler.templates.calendar_date=scheduler.date.date_to_str("%d");scheduler.config.minicalendar={mark_events:!0};scheduler._synced_minicalendars=[];
scheduler.renderCalendar=function(a,b,c){var d=null,f=a.date||scheduler._currentDate();typeof f=="string"&&(f=this.templates.api_date(f));if(b)d=this._render_calendar(b.parentNode,f,a,b),scheduler.unmarkCalendar(d);else{var e=a.container,h=a.position;typeof e=="string"&&(e=document.getElementById(e));typeof h=="string"&&(h=document.getElementById(h));if(h&&typeof h.left=="undefined")var k=getOffset(h),h={top:k.top+h.offsetHeight,left:k.left};e||(e=scheduler._get_def_cont(h));d=this._render_calendar(e,
f,a);d.onclick=function(a){var a=a||event,b=a.target||a.srcElement;if(b.className.indexOf("dhx_month_head")!=-1){var c=b.parentNode.className;if(c.indexOf("dhx_after")==-1&&c.indexOf("dhx_before")==-1){var d=scheduler.templates.xml_date(this.getAttribute("date"));d.setDate(parseInt(b.innerHTML,10));scheduler.unmarkCalendar(this);scheduler.markCalendar(this,d,"dhx_calendar_click");this._last_date=d;this.conf.handler&&this.conf.handler.call(scheduler,d,this)}}}}if(scheduler.config.minicalendar.mark_events)for(var j=
scheduler.date.month_start(f),n=scheduler.date.add(j,1,"month"),l=this.getEvents(j,n),s=this["filter_"+this._mode],p=0;p<l.length;p++){var g=l[p];if(!s||s(g.id,g)){var i=g.start_date;i.valueOf()<j.valueOf()&&(i=j);for(i=scheduler.date.date_part(new Date(i.valueOf()));i<g.end_date;)if(this.markCalendar(d,i,"dhx_year_event"),i=this.date.add(i,1,"day"),i.valueOf()>=n.valueOf())break}}this._markCalendarCurrentDate(d);d.conf=a;a.sync&&!c&&this._synced_minicalendars.push(d);return d};
scheduler._get_def_cont=function(a){if(!this._def_count)this._def_count=document.createElement("DIV"),this._def_count.className="dhx_minical_popup",this._def_count.onclick=function(a){(a||event).cancelBubble=!0},document.body.appendChild(this._def_count);this._def_count.style.left=a.left+"px";this._def_count.style.top=a.top+"px";this._def_count._created=new Date;return this._def_count};
scheduler._locateCalendar=function(a,b){typeof b=="string"&&(b=scheduler.templates.api_date(b));if(+b>+a._max_date||+b<+a._min_date)return null;for(var c=a.childNodes[2].childNodes[0],d=0,f=new Date(a._min_date);+this.date.add(f,1,"week")<=+b;)f=this.date.add(f,1,"week"),d++;var e=scheduler.config.start_on_monday,h=(b.getDay()||(e?7:0))-(e?1:0);return c.rows[d].cells[h].firstChild};scheduler.markCalendar=function(a,b,c){var d=this._locateCalendar(a,b);d&&(d.className+=" "+c)};
scheduler.unmarkCalendar=function(a,b,c){b=b||a._last_date;c=c||"dhx_calendar_click";if(b){var d=this._locateCalendar(a,b);if(d)d.className=(d.className||"").replace(RegExp(c,"g"))}};
scheduler._week_template=function(a){for(var b=a||250,c=0,d=document.createElement("div"),f=this.date.week_start(scheduler._currentDate()),e=0;e<7;e++)this._cols[e]=Math.floor(b/(7-e)),this._render_x_header(e,c,f,d),f=this.date.add(f,1,"day"),b-=this._cols[e],c+=this._cols[e];d.lastChild.className+=" dhx_scale_bar_last";return d};scheduler.updateCalendar=function(a,b){a.conf.date=b;this.renderCalendar(a.conf,a,!0)};scheduler._mini_cal_arrows=["&nbsp","&nbsp"];
scheduler._render_calendar=function(a,b,c,d){var f=scheduler.templates,e=this._cols;this._cols=[];var h=this._mode;this._mode="calendar";var k=this._colsS;this._colsS={height:0};var j=new Date(this._min_date),n=new Date(this._max_date),l=new Date(scheduler._date),s=f.month_day;f.month_day=f.calendar_date;var b=this.date.month_start(b),p=this._week_template(a.offsetWidth-1-this.config.minicalendar.padding),g;d?g=d:(g=document.createElement("DIV"),g.className="dhx_cal_container dhx_mini_calendar");
g.setAttribute("date",this.templates.xml_format(b));g.innerHTML="<div class='dhx_year_month'></div><div class='dhx_year_week'>"+p.innerHTML+"</div><div class='dhx_year_body'></div>";g.childNodes[0].innerHTML=this.templates.calendar_month(b);if(c.navigation)for(var i=function(a,b){var c=scheduler.date.add(a._date,b,"month");scheduler.updateCalendar(a,c);scheduler._date.getMonth()==a._date.getMonth()&&scheduler._date.getFullYear()==a._date.getFullYear()&&scheduler._markCalendarCurrentDate(a)},w=["dhx_cal_prev_button",
"dhx_cal_next_button"],x=["left:1px;top:2px;position:absolute;","left:auto; right:1px;top:2px;position:absolute;"],y=[-1,1],z=function(a){return function(){if(c.sync)for(var b=scheduler._synced_minicalendars,d=0;d<b.length;d++)i(b[d],a);else i(g,a)}},o=0;o<2;o++){var q=document.createElement("DIV");q.className=w[o];q.style.cssText=x[o];q.innerHTML=this._mini_cal_arrows[o];g.firstChild.appendChild(q);q.onclick=z(y[o])}g._date=new Date(b);g.week_start=(b.getDay()-(this.config.start_on_monday?1:0)+7)%
7;var A=g._min_date=this.date.week_start(b);g._max_date=this.date.add(g._min_date,6,"week");this._reset_month_scale(g.childNodes[2],b,A);for(var m=g.childNodes[2].firstChild.rows,r=m.length;r<6;r++){var v=m[m.length-1];m[0].parentNode.appendChild(v.cloneNode(!0));for(var t=parseInt(v.childNodes[v.childNodes.length-1].childNodes[0].innerHTML),t=t<10?t:0,u=0;u<m[r].childNodes.length;u++)m[r].childNodes[u].className="dhx_after",m[r].childNodes[u].childNodes[0].innerHTML=scheduler.date.to_fixed(++t)}d||
a.appendChild(g);g.childNodes[1].style.height=g.childNodes[1].childNodes[0].offsetHeight-1+"px";this._cols=e;this._mode=h;this._colsS=k;this._min_date=j;this._max_date=n;scheduler._date=l;f.month_day=s;return g};
scheduler.destroyCalendar=function(a,b){if(!a&&this._def_count&&this._def_count.firstChild&&(b||(new Date).valueOf()-this._def_count._created.valueOf()>500))a=this._def_count.firstChild;if(a&&(a.onclick=null,a.innerHTML="",a.parentNode&&a.parentNode.removeChild(a),this._def_count))this._def_count.style.top="-1000px"};scheduler.isCalendarVisible=function(){return this._def_count&&parseInt(this._def_count.style.top,10)>0?this._def_count:!1};
scheduler.attachEvent("onTemplatesReady",function(){dhtmlxEvent(document.body,"click",function(){scheduler.destroyCalendar()})});scheduler.templates.calendar_time=scheduler.date.date_to_str("%d-%m-%Y");
scheduler.form_blocks.calendar_time={render:function(){var a="<input class='dhx_readonly' type='text' readonly='true'>",b=scheduler.config,c=this.date.date_part(scheduler._currentDate()),d=1440,f=0;b.limit_time_select&&(f=60*b.first_hour,d=60*b.last_hour+1);c.setHours(f/60);a+=" <select>";for(var e=f;e<d;e+=this.config.time_step*1){var h=this.templates.time_picker(c);a+="<option value='"+e+"'>"+h+"</option>";c=this.date.add(c,this.config.time_step,"minute")}a+="</select>";var k=scheduler.config.full_day;
return"<div style='height:30px;padding-top:0; font-size:inherit;' class='dhx_section_time'>"+a+"<span style='font-weight:normal; font-size:10pt;'> &nbsp;&ndash;&nbsp; </span>"+a+"</div>"},set_value:function(a,b,c){function d(a,b,d){h(a,b,d);a.value=scheduler.templates.calendar_time(b);a._date=scheduler.date.date_part(new Date(b))}var f=a.getElementsByTagName("input"),e=a.getElementsByTagName("select"),h=function(a,b,d){a.onclick=function(){scheduler.destroyCalendar(null,!0);scheduler.renderCalendar({position:a,
date:new Date(this._date),navigation:!0,handler:function(b){a.value=scheduler.templates.calendar_time(b);a._date=new Date(b);scheduler.destroyCalendar();scheduler.config.event_duration&&scheduler.config.auto_end_date&&d==0&&l()}})}};if(scheduler.config.full_day){if(!a._full_day){var k="<label class='dhx_fullday'><input type='checkbox' name='full_day' value='true'> "+scheduler.locale.labels.full_day+"&nbsp;</label></input>";scheduler.config.wide_form||(k=a.previousSibling.innerHTML+k);a.previousSibling.innerHTML=
k;a._full_day=!0}var j=a.previousSibling.getElementsByTagName("input")[0],n=scheduler.date.time_part(c.start_date)==0&&scheduler.date.time_part(c.end_date)==0;j.checked=n;e[0].disabled=j.checked;e[1].disabled=j.checked;j.onclick=function(){if(j.checked==!0){var b={};scheduler.form_blocks.calendar_time.get_value(a,b);var h=scheduler.date.date_part(b.start_date),g=scheduler.date.date_part(b.end_date);if(+g==+h||+g>=+h&&(c.end_date.getHours()!=0||c.end_date.getMinutes()!=0))g=scheduler.date.add(g,1,
"day")}var i=h||c.start_date,k=g||c.end_date;d(f[0],i);d(f[1],k);e[0].value=i.getHours()*60+i.getMinutes();e[1].value=k.getHours()*60+k.getMinutes();e[0].disabled=j.checked;e[1].disabled=j.checked}}if(scheduler.config.event_duration&&scheduler.config.auto_end_date){var l=function(){start_date=scheduler.date.add(f[0]._date,e[0].value,"minute");end_date=new Date(start_date.getTime()+scheduler.config.event_duration*6E4);f[1].value=scheduler.templates.calendar_time(end_date);f[1]._date=scheduler.date.date_part(new Date(end_date));
e[1].value=end_date.getHours()*60+end_date.getMinutes()};e[0].onchange=l}d(f[0],c.start_date,0);d(f[1],c.end_date,1);h=function(){};e[0].value=c.start_date.getHours()*60+c.start_date.getMinutes();e[1].value=c.end_date.getHours()*60+c.end_date.getMinutes()},get_value:function(a,b){var c=a.getElementsByTagName("input"),d=a.getElementsByTagName("select");b.start_date=scheduler.date.add(c[0]._date,d[0].value,"minute");b.end_date=scheduler.date.add(c[1]._date,d[1].value,"minute");if(b.end_date<=b.start_date)b.end_date=
scheduler.date.add(b.start_date,scheduler.config.time_step,"minute")},focus:function(){}};scheduler.linkCalendar=function(a,b){var c=function(){var d=scheduler._date,c=new Date(d.valueOf());b&&(c=b(c));c.setDate(1);scheduler.updateCalendar(a,c);return!0};scheduler.attachEvent("onViewChange",c);scheduler.attachEvent("onXLE",c);scheduler.attachEvent("onEventAdded",c);scheduler.attachEvent("onEventChanged",c);scheduler.attachEvent("onAfterEventDelete",c);c()};
scheduler._markCalendarCurrentDate=function(a){var b=scheduler._date,c=scheduler._mode,d=scheduler.date.month_start(new Date(a._date)),f=scheduler.date.add(d,1,"month");if(c=="day"||this._props&&this._props[c])d.valueOf()<=b.valueOf()&&f>b&&scheduler.markCalendar(a,b,"dhx_calendar_click");else if(c=="week")for(var e=scheduler.date.week_start(new Date(b.valueOf())),h=0;h<7;h++)d.valueOf()<=e.valueOf()&&f>e&&scheduler.markCalendar(a,e,"dhx_calendar_click"),e=scheduler.date.add(e,1,"day")};
scheduler.attachEvent("onEventCancel",function(){scheduler.destroyCalendar(null,!0)});

/*
This software is allowed to use under GPL or you need to obtain Commercial or Enterise License
to use it in non-GPL project. Please contact sales@dhtmlx.com for details
*/
(scheduler._temp_matrix_scope=function(){function H(){for(var a=scheduler.get_visible_events(),c=[],b=0;b<this.y_unit.length;b++)c[b]=[];c[d]||(c[d]=[]);for(b=0;b<a.length;b++){for(var d=this.order[a[b][this.y_property]],h=0;this._trace_x[h+1]&&a[b].start_date>=this._trace_x[h+1];)h++;for(;this._trace_x[h]&&a[b].end_date>this._trace_x[h];)c[d][h]||(c[d][h]=[]),c[d][h].push(a[b]),h++}return c}function w(a,c,b){var d=0,h=b._step,e=b.round_position,l=0,f=c?a.end_date:a.start_date;if(f.valueOf()>scheduler._max_date.valueOf())f=
scheduler._max_date;var k=f-scheduler._min_date_timeline;if(k>0){var m=scheduler._get_date_index(b,f);scheduler._ignores[m]&&(e=!0);for(var i=0;i<m;i++)d+=scheduler._cols[i];var p=scheduler.date.add(scheduler._min_date_timeline,scheduler.matrix[scheduler._mode].x_step*m,scheduler.matrix[scheduler._mode].x_unit);e?+f>+p&&c&&(l=scheduler._cols[m]):(k=f-p,b.first_hour||b.last_hour?(k-=b._start_correction,k<0&&(k=0),l=Math.round(k/h),l>scheduler._cols[m]&&(l=scheduler._cols[m])):l=Math.round(k/h))}d+=
c?k!=0&&!e?l-12:l-14:l+1;return d}function t(a,c){var b=scheduler._get_date_index(this,a),d=this._trace_x[b];c&&+a!=+this._trace_x[b]&&(d=this._trace_x[b+1]?this._trace_x[b+1]:scheduler.date.add(this._trace_x[b],this.x_step,this.x_unit));return new Date(d)}function I(a){var c="";if(a&&this.render!="cell"){a.sort(this.sort||function(a,b){return a.start_date.valueOf()==b.start_date.valueOf()?a.id>b.id?1:-1:a.start_date>b.start_date?1:-1});for(var b=[],d=a.length,h=0;h<d;h++){var e=a[h];e._inner=!1;
for(var l=this.round_position?t.apply(this,[e.start_date,!1]):e.start_date,f=this.round_position?t.apply(this,[e.end_date,!0]):e.end_date;b.length;){var k=b[b.length-1];if(k.end_date.valueOf()<=l.valueOf())b.splice(b.length-1,1);else break}for(var m=!1,i=0;i<b.length;i++){var p=b[i];if(p.end_date.valueOf()<=l.valueOf()){m=!0;e._sorder=p._sorder;b.splice(i,1);e._inner=!0;break}}if(b.length)b[b.length-1]._inner=!0;if(!m)if(b.length)if(b.length<=b[b.length-1]._sorder){if(b[b.length-1]._sorder)for(var g=
0;g<b.length;g++){for(var q=!1,n=0;n<b.length;n++)if(b[n]._sorder==g){q=!0;break}if(!q){e._sorder=g;break}}else e._sorder=0;e._inner=!0}else{for(var q=b[0]._sorder,o=1;o<b.length;o++)if(b[o]._sorder>q)q=b[o]._sorder;e._sorder=q+1;e._inner=!1}else e._sorder=0;b.push(e);b.length>(b.max_count||0)?(b.max_count=b.length,e._count=b.length):e._count=e._count?e._count:1}for(var j=0;j<a.length;j++)a[j]._count=b.max_count;for(var r=0;r<d;r++)c+=scheduler.render_timeline_event.call(this,a[r],!1)}return c}function J(a){var c=
"<table style='table-layout:fixed;' cellspacing='0' cellpadding='0'>",b=[];scheduler._load_mode&&scheduler._load();if(this.render=="cell")b=H.call(this);else for(var d=scheduler.get_visible_events(),h=this.order,e=0;e<d.length;e++){var l=d[e],f=l[this.y_property],k=this.order[f];if(this.show_unassigned&&!f)for(var m in h){if(h.hasOwnProperty(m)){k=h[m];b[k]||(b[k]=[]);var i=scheduler._lame_copy({},l);i[this.y_property]=m;b[k].push(i)}}else b[k]||(b[k]=[]),b[k].push(l)}for(var p=0,g=0;g<scheduler._cols.length;g++)p+=
scheduler._cols[g];var q=new Date,n=scheduler._cols.length-scheduler._ignores_detected;this._step=q=(scheduler.date.add(q,this.x_step*n,this.x_unit)-q-(this._start_correction+this._end_correction)*n)/p;this._summ=p;var o=scheduler._colsS.heights=[];this._events_height={};this._section_height={};for(g=0;g<this.y_unit.length;g++){var j=this._logic(this.render,this.y_unit[g],this);scheduler._merge(j,{height:this.dy});if(this.section_autoheight){if(this.y_unit.length*j.height<a.offsetHeight)j.height=
Math.max(j.height,Math.floor((a.offsetHeight-1)/this.y_unit.length));this._section_height[this.y_unit[g].key]=j.height}scheduler._merge(j,{tr_className:"",style_height:"height:"+j.height+"px;",style_width:"width:"+(this.dx-1)+"px;",td_className:"dhx_matrix_scell"+(scheduler.templates[this.name+"_scaley_class"](this.y_unit[g].key,this.y_unit[g].label,this.y_unit[g])?" "+scheduler.templates[this.name+"_scaley_class"](this.y_unit[g].key,this.y_unit[g].label,this.y_unit[g]):""),td_content:scheduler.templates[this.name+
"_scale_label"](this.y_unit[g].key,this.y_unit[g].label,this.y_unit[g]),summ_width:"width:"+p+"px;",table_className:""});var r=I.call(this,b[g]);if(this.fit_events){var s=this._events_height[this.y_unit[g].key]||0;j.height=s>j.height?s:j.height;j.style_height="height:"+j.height+"px;";this._section_height[this.y_unit[g].key]=j.height}c+="<tr class='"+j.tr_className+"' style='"+j.style_height+"'><td class='"+j.td_className+"' style='"+j.style_width+" height:"+(j.height-1)+"px;'>"+j.td_content+"</td>";
if(this.render=="cell")for(e=0;e<scheduler._cols.length;e++)c+=scheduler._ignores[e]?"<td></td>":"<td class='dhx_matrix_cell "+scheduler.templates[this.name+"_cell_class"](b[g][e],this._trace_x[e],this.y_unit[g])+"' style='width:"+(scheduler._cols[e]-1)+"px'><div style='width:"+(scheduler._cols[e]-1)+"px'>"+scheduler.templates[this.name+"_cell_value"](b[g][e])+"</div></td>";else{c+="<td><div style='"+j.summ_width+" "+j.style_height+" position:relative;' class='dhx_matrix_line'>";c+=r;c+="<table class='"+
j.table_className+"' cellpadding='0' cellspacing='0' style='"+j.summ_width+" "+j.style_height+"' >";for(e=0;e<scheduler._cols.length;e++)c+=scheduler._ignores[e]?"<td></td>":"<td class='dhx_matrix_cell "+scheduler.templates[this.name+"_cell_class"](b[g],this._trace_x[e],this.y_unit[g])+"' style='width:"+(scheduler._cols[e]-1)+"px'><div style='width:"+(scheduler._cols[e]-1)+"px'></div></td>";c+="</table>";c+="</div></td>"}c+="</tr>"}c+="</table>";this._matrix=b;a.innerHTML=c;scheduler._rendered=[];
for(var B=scheduler._obj.getElementsByTagName("DIV"),g=0;g<B.length;g++)B[g].getAttribute("event_id")&&scheduler._rendered.push(B[g]);this._scales={};for(g=0;g<a.firstChild.rows.length;g++){o.push(a.firstChild.rows[g].offsetHeight);var x=this.y_unit[g].key,z=this._scales[x]=scheduler._isRender("cell")?a.firstChild.rows[g]:a.firstChild.rows[g].childNodes[1].getElementsByTagName("div")[0];scheduler.callEvent("onScaleAdd",[z,x])}}function K(a){var c=scheduler.xy.scale_height,b=this._header_resized||
scheduler.xy.scale_height;scheduler._cols=[];scheduler._colsS={height:0};this._trace_x=[];var d=scheduler._x-this.dx-scheduler.xy.scroll_width,h=[this.dx],e=scheduler._els.dhx_cal_header[0];e.style.width=h[0]+d+"px";scheduler._min_date_timeline=scheduler._min_date;var l=scheduler.config.preserve_scale_length,f=scheduler._min_date;scheduler._process_ignores(f,this.x_size,this.x_unit,this.x_step,l);var k=this.x_size+(l?scheduler._ignores_detected:0);if(k!=this.x_size)scheduler._max_date=scheduler.date.add(scheduler._min_date,
k*this.x_step,this.x_unit);for(var m=k-scheduler._ignores_detected,i=0;i<k;i++)this._trace_x[i]=new Date(f),f=scheduler.date.add(f,this.x_step,this.x_unit),scheduler._ignores[i]?(scheduler._cols[i]=0,m++):scheduler._cols[i]=Math.floor(d/(m-i)),d-=scheduler._cols[i],h[i+1]=h[i]+scheduler._cols[i];a.innerHTML="<div></div>";if(this.second_scale){for(var p=this.second_scale.x_unit,g=[this._trace_x[0]],q=[],n=[this.dx,this.dx],o=0,j=0;j<this._trace_x.length;j++){var r=this._trace_x[j],s=E(p,r,g[o]);s&&
(++o,g[o]=r,n[o+1]=n[o]);var B=o+1;q[o]=scheduler._cols[j]+(q[o]||0);n[B]+=scheduler._cols[j]}a.innerHTML="<div></div><div></div>";var x=a.firstChild;x.style.height=b+"px";var z=a.lastChild;z.style.position="relative";for(var u=0;u<g.length;u++){var y=g[u],C=scheduler.templates[this.name+"_second_scalex_class"](y),A=document.createElement("DIV");A.className="dhx_scale_bar dhx_second_scale_bar"+(C?" "+C:"");scheduler.set_xy(A,q[u]-1,b-3,n[u],0);A.innerHTML=scheduler.templates[this.name+"_second_scale_date"](y);
x.appendChild(A)}}scheduler.xy.scale_height=b;for(var a=a.lastChild,v=0;v<this._trace_x.length;v++)if(!scheduler._ignores[v]){f=this._trace_x[v];scheduler._render_x_header(v,h[v],f,a);var w=scheduler.templates[this.name+"_scalex_class"](f);w&&(a.lastChild.className+=" "+w)}scheduler.xy.scale_height=c;var t=this._trace_x;a.onclick=function(a){var b=F(a);b&&scheduler.callEvent("onXScaleClick",[b.x,t[b.x],a||event])};a.ondblclick=function(a){var b=F(a);b&&scheduler.callEvent("onXScaleDblClick",[b.x,
t[b.x],a||event])}}function E(a,c,b){switch(a){case "hour":return c.getHours()!=b.getHours()||E("day",c,b);case "day":return!(c.getDate()==b.getDate()&&c.getMonth()==b.getMonth()&&c.getFullYear()==b.getFullYear());case "week":return!(scheduler.date.getISOWeek(c)==scheduler.date.getISOWeek(b)&&c.getFullYear()==b.getFullYear());case "month":return!(c.getMonth()==b.getMonth()&&c.getFullYear()==b.getFullYear());case "year":return c.getFullYear()!=b.getFullYear();default:return!1}}function L(a){if(a){scheduler.set_sizes();
G();var c=scheduler._min_date;K.call(this,scheduler._els.dhx_cal_header[0]);J.call(this,scheduler._els.dhx_cal_data[0]);scheduler._min_date=c;scheduler._els.dhx_cal_date[0].innerHTML=scheduler.templates[this.name+"_date"](scheduler._min_date,scheduler._max_date);scheduler._mark_now&&scheduler._mark_now()}D()}function D(){if(scheduler._tooltip)scheduler._tooltip.style.display="none",scheduler._tooltip.date=""}function M(a,c,b){if(a.render=="cell"){var d=c.x+"_"+c.y,h=a._matrix[c.y][c.x];if(!h)return D();
h.sort(function(a,b){return a.start_date>b.start_date?1:-1});if(scheduler._tooltip){if(scheduler._tooltip.date==d)return;scheduler._tooltip.innerHTML=""}else{var e=scheduler._tooltip=document.createElement("DIV");e.className="dhx_year_tooltip";document.body.appendChild(e);e.onclick=scheduler._click.dhx_cal_data}for(var l="",f=0;f<h.length;f++){var k=h[f].color?"background-color:"+h[f].color+";":"",m=h[f].textColor?"color:"+h[f].textColor+";":"";l+="<div class='dhx_tooltip_line' event_id='"+h[f].id+
"' style='"+k+""+m+"'>";l+="<div class='dhx_tooltip_date'>"+(h[f]._timed?scheduler.templates.event_date(h[f].start_date):"")+"</div>";l+="<div class='dhx_event_icon icon_details'>&nbsp;</div>";l+=scheduler.templates[a.name+"_tooltip"](h[f].start_date,h[f].end_date,h[f])+"</div>"}scheduler._tooltip.style.display="";scheduler._tooltip.style.top="0px";scheduler._tooltip.style.left=document.body.offsetWidth-b.left-scheduler._tooltip.offsetWidth<0?b.left-scheduler._tooltip.offsetWidth+"px":b.left+c.src.offsetWidth+
"px";scheduler._tooltip.date=d;scheduler._tooltip.innerHTML=l;scheduler._tooltip.style.top=document.body.offsetHeight-b.top-scheduler._tooltip.offsetHeight<0?b.top-scheduler._tooltip.offsetHeight+c.src.offsetHeight+"px":b.top+"px"}}function G(){dhtmlxEvent(scheduler._els.dhx_cal_data[0],"mouseover",function(a){var c=scheduler.matrix[scheduler._mode];if(c&&c.render=="cell"){if(c){var b=scheduler._locate_cell_timeline(a),a=a||event,d=a.target||a.srcElement;if(b)return M(c,b,getOffset(b.src))}D()}});
G=function(){}}function N(a){for(var c=a.parentNode.childNodes,b=0;b<c.length;b++)if(c[b]==a)return b;return-1}function F(a){for(var a=a||event,c=a.target?a.target:a.srcElement;c&&c.tagName!="DIV";)c=c.parentNode;if(c&&c.tagName=="DIV"){var b=c.className.split(" ")[0];if(b=="dhx_scale_bar")return{x:N(c),y:-1,src:c,scale:!0}}}scheduler.matrix={};scheduler._merge=function(a,c){for(var b in c)typeof a[b]=="undefined"&&(a[b]=c[b])};scheduler.createTimelineView=function(a){scheduler._skin_init();scheduler._merge(a,
{section_autoheight:!0,name:"matrix",x:"time",y:"time",x_step:1,x_unit:"hour",y_unit:"day",y_step:1,x_start:0,x_size:24,y_start:0,y_size:7,render:"cell",dx:200,dy:50,event_dy:scheduler.xy.bar_height-5,event_min_dy:scheduler.xy.bar_height-5,resize_events:!0,fit_events:!0,show_unassigned:!1,second_scale:!1,round_position:!1,_logic:function(a,b,c){var f={};scheduler.checkEvent("onBeforeSectionRender")&&(f=scheduler.callEvent("onBeforeSectionRender",[a,b,c]));return f}});a._original_x_start=a.x_start;
if(a.x_unit!="day")a.first_hour=a.last_hour=0;a._start_correction=a.first_hour?a.first_hour*36E5:0;a._end_correction=a.last_hour?(24-a.last_hour)*36E5:0;scheduler.checkEvent("onTimelineCreated")&&scheduler.callEvent("onTimelineCreated",[a]);var c=scheduler.render_data;scheduler.render_data=function(b,e){if(this._mode==a.name)if(e&&!a.show_unassigned&&a.render!="cell")for(var d=0;d<b.length;d++)this.clear_event(b[d]),this.render_timeline_event.call(this.matrix[this._mode],b[d],!0);else scheduler._renderMatrix.call(a,
!0,!0);else return c.apply(this,arguments)};scheduler.matrix[a.name]=a;scheduler.templates[a.name+"_cell_value"]=function(a){return a?a.length:""};scheduler.templates[a.name+"_cell_class"]=function(){return""};scheduler.templates[a.name+"_scalex_class"]=function(){return""};scheduler.templates[a.name+"_second_scalex_class"]=function(){return""};scheduler.templates[a.name+"_scaley_class"]=function(){return""};scheduler.templates[a.name+"_scale_label"]=function(a,b){return b};scheduler.templates[a.name+
"_tooltip"]=function(a,b,c){return c.text};scheduler.templates[a.name+"_date"]=function(a,b){return a.getDay()==b.getDay()&&b-a<864E5||+a==+scheduler.date.date_part(new Date(b))||+scheduler.date.add(a,1,"day")==+b&&b.getHours()==0&&b.getMinutes()==0?scheduler.templates.day_date(a):a.getDay()!=b.getDay()&&b-a<864E5?scheduler.templates.day_date(a)+" &ndash; "+scheduler.templates.day_date(b):scheduler.templates.week_date(a,b)};scheduler.templates[a.name+"_scale_date"]=scheduler.date.date_to_str(a.x_date||
scheduler.config.hour_date);scheduler.templates[a.name+"_second_scale_date"]=scheduler.date.date_to_str(a.second_scale&&a.second_scale.x_date?a.second_scale.x_date:scheduler.config.hour_date);scheduler.date["add_"+a.name]=function(b,c){var d=scheduler.date.add(b,(a.x_length||a.x_size)*c*a.x_step,a.x_unit);if(a.x_unit=="minute"||a.x_unit=="hour"){var f=a.x_length||a.x_size;if(+scheduler.date.date_part(new Date(b))==+scheduler.date.date_part(new Date(d)))a.x_start+=c*f;else{var k=a.x_unit=="hour"?a.x_step*
60:a.x_step,m=1440/(f*k)-1,i=Math.round(m*f);c>0?a.x_start-=i:a.x_start=i+a.x_start}}return d};scheduler.attachEvent("onBeforeTodayDisplayed",function(){a.x_start=a._original_x_start;return!0});scheduler.date[a.name+"_start"]=function(b){var c=scheduler.date[a.x_unit+"_start"]||scheduler.date.day_start,d=c.call(scheduler.date,b);return d=scheduler.date.add(d,a.x_step*a.x_start,a.x_unit)};scheduler.attachEvent("onSchedulerResize",function(){return this._mode==a.name?(scheduler._renderMatrix.call(a,
!0,!0),!1):!0});scheduler.attachEvent("onOptionsLoad",function(){a.order={};scheduler.callEvent("onOptionsLoadStart",[]);for(var b=0;b<a.y_unit.length;b++)a.order[a.y_unit[b].key]=b;scheduler.callEvent("onOptionsLoadFinal",[]);scheduler._date&&a.name==scheduler._mode&&scheduler.setCurrentView(scheduler._date,scheduler._mode)});scheduler.callEvent("onOptionsLoad",[a]);scheduler[a.name+"_view"]=function(){scheduler._renderMatrix.apply(a,arguments)};var b=new Date,d=scheduler.date.add(b,a.x_step,a.x_unit).valueOf()-
b.valueOf();scheduler["mouse_"+a.name]=function(b){var c=this._drag_event;if(this._drag_id)c=this.getEvent(this._drag_id),this._drag_event._dhx_changed=!0;b.x-=a.dx;for(var d=0,f=0,k=0;f<=this._cols.length-1;f++){var m=this._cols[f];d+=m;if(d>b.x){var i=(b.x-(d-m))/m,i=i<0?0:i;break}}if(f==0&&this._ignores[0]){f=1;for(i=0;this._ignores[f];)f++}else if(f==this._cols.length&&this._ignores[f-1]){f=this._cols.length-1;for(i=0;this._ignores[f];)f--;f++}for(d=0;k<this._colsS.heights.length;k++)if(d+=this._colsS.heights[k],
d>b.y)break;b.fields={};a.y_unit[k]||(k=a.y_unit.length-1);if(k>=0&&a.y_unit[k]&&(b.section=b.fields[a.y_property]=a.y_unit[k].key,c)){if(c[a.y_property]!=b.section){var p=scheduler._get_timeline_event_height(c,a);c._sorder=scheduler._get_dnd_order(c._sorder,p,a._section_height[b.section])}c[a.y_property]=b.section}b.x=0;b.force_redraw=!0;b.custom=!0;var g;if(f>=a._trace_x.length)g=scheduler.date.add(a._trace_x[a._trace_x.length-1],a.x_step,a.x_unit),a._end_correction&&(g=new Date(g-a._end_correction));
else{var q=i*m*a._step+a._start_correction;g=new Date(+a._trace_x[f]+q)}if(this._drag_mode=="move"&&this._drag_id&&this._drag_event){var c=this.getEvent(this._drag_id),n=this._drag_event;b._ignores=this._ignores_detected||a._start_correction||a._end_correction;if(!n._move_delta&&(n._move_delta=(c.start_date-g)/6E4,this.config.preserve_length&&b._ignores))n._move_delta=this._get_real_event_length(c.start_date,g,a),n._event_length=this._get_real_event_length(c.start_date,c.end_date,a);if(this.config.preserve_length&&
b._ignores){var o=n._event_length,j=this._get_fictional_event_length(g,n._move_delta,a,!0);g=new Date(g-j)}else g=scheduler.date.add(g,n._move_delta,"minute")}if(this._drag_mode=="resize"&&c){var r=!!(Math.abs(c.start_date-g)<Math.abs(c.end_date-g));if(a._start_correction||a._end_correction){var s=!this._drag_event||this._drag_event._resize_from_start==void 0;s||Math.abs(c.end_date-c.start_date)<=6E4*this.config.time_step?this._drag_event._resize_from_start=b.resize_from_start=r:b.resize_from_start=
this._drag_event._resize_from_start}else b.resize_from_start=r}if(a.round_position)switch(this._drag_mode){case "move":if(!this.config.preserve_length&&(g=t.call(a,g,!1),a.x_unit=="day"))b.custom=!1;break;case "resize":if(this._drag_event){if(this._drag_event._resize_from_start==null)this._drag_event._resize_from_start=b.resize_from_start;b.resize_from_start=this._drag_event._resize_from_start;g=t.call(a,g,!this._drag_event._resize_from_start)}}b.y=Math.round((g-this._min_date)/(6E4*this.config.time_step));
b.shift=this.config.time_step;return b}};scheduler._get_timeline_event_height=function(a,c){var b=a[c.y_property],d=c.event_dy;c.event_dy=="full"&&(d=c.section_autoheight?c._section_height[b]-6:c.dy-3);c.resize_events&&(d=Math.max(Math.floor(d/a._count),c.event_min_dy));return d};scheduler._get_timeline_event_y=function(a,c){var b=a,d=2+b*c+(b?b*2:0);scheduler.config.cascade_event_display&&(d=2+b*scheduler.config.cascade_event_margin+(b?b*2:0));return d};scheduler.render_timeline_event=function(a,
c){var b=a[this.y_property];if(!b)return"";var d=a._sorder,h=w(a,!1,this),e=w(a,!0,this),l=scheduler._get_timeline_event_height(a,this),f=l-2;!a._inner&&this.event_dy=="full"&&(f=(f+2)*(a._count-d)-2);var k=scheduler._get_timeline_event_y(a._sorder,l),m=l+k+2;if(!this._events_height[b]||this._events_height[b]<m)this._events_height[b]=m;var i=scheduler.templates.event_class(a.start_date,a.end_date,a),i="dhx_cal_event_line "+(i||""),p=a.color?"background:"+a.color+";":"",g=a.textColor?"color:"+a.textColor+
";":"",q=scheduler.templates.event_bar_text(a.start_date,a.end_date,a),n='<div event_id="'+a.id+'" class="'+i+'" style="'+p+""+g+"position:absolute; top:"+k+"px; height: "+f+"px; left:"+h+"px; width:"+Math.max(0,e-h)+"px;"+(a._text_style||"")+'">';if(scheduler.config.drag_resize&&!scheduler.config.readonly){var o="dhx_event_resize";n+="<div class='"+o+" "+o+"_start' style='height: "+f+"px;'></div><div class='"+o+" "+o+"_end' style='height: "+f+"px;'></div>"}n+=q+"</div>";if(c){var j=document.createElement("DIV");
j.innerHTML=n;var r=this.order[b],s=scheduler._els.dhx_cal_data[0].firstChild.rows[r].cells[1].firstChild;scheduler._rendered.push(j.firstChild);s.appendChild(j.firstChild)}else return n};scheduler._renderMatrix=function(a,c){if(!c)scheduler._els.dhx_cal_data[0].scrollTop=0;scheduler._min_date=scheduler.date[this.name+"_start"](scheduler._date);scheduler._max_date=scheduler.date.add(scheduler._min_date,this.x_size*this.x_step,this.x_unit);scheduler._table_view=!0;if(this.second_scale){if(a&&!this._header_resized)this._header_resized=
scheduler.xy.scale_height,scheduler.xy.scale_height*=2,scheduler._els.dhx_cal_header[0].className+=" dhx_second_cal_header";if(!a&&this._header_resized){scheduler.xy.scale_height/=2;this._header_resized=!1;var b=scheduler._els.dhx_cal_header[0];b.className=b.className.replace(/ dhx_second_cal_header/gi,"")}}L.call(this,a)};scheduler._locate_cell_timeline=function(a){for(var a=a||event,c=a.target?a.target:a.srcElement,b={},d=scheduler.matrix[scheduler._mode],h=scheduler.getActionData(a),e=0;e<d._trace_x.length-
1;e++)if(+h.date<d._trace_x[e+1])break;b.x=e;b.y=d.order[h.section];var l=scheduler._isRender("cell")?1:0;b.src=d._scales[h.section]?d._scales[h.section].getElementsByTagName("td")[e+l]:null;for(var f=!1;b.x==0&&c.className!="dhx_cal_data"&&c.parentNode;)if(c.className.split(" ")[0]=="dhx_matrix_scell"){f=!0;break}else c=c.parentNode;if(f)b.x=-1,b.src=c,b.scale=!0;return b};var O=scheduler._click.dhx_cal_data;scheduler._click.dhx_marked_timespan=scheduler._click.dhx_cal_data=function(a){var c=O.apply(this,
arguments),b=scheduler.matrix[scheduler._mode];if(b){var d=scheduler._locate_cell_timeline(a);d&&(d.scale?scheduler.callEvent("onYScaleClick",[d.y,b.y_unit[d.y],a||event]):scheduler.callEvent("onCellClick",[d.x,d.y,b._trace_x[d.x],(b._matrix[d.y]||{})[d.x]||[],a||event]))}return c};scheduler.dblclick_dhx_marked_timespan=scheduler.dblclick_dhx_matrix_cell=function(a){var c=scheduler.matrix[scheduler._mode];if(c){var b=scheduler._locate_cell_timeline(a);b&&(b.scale?scheduler.callEvent("onYScaleDblClick",
[b.y,c.y_unit[b.y],a||event]):scheduler.callEvent("onCellDblClick",[b.x,b.y,c._trace_x[b.x],(c._matrix[b.y]||{})[b.x]||[],a||event]))}};scheduler.dblclick_dhx_matrix_scell=function(a){return scheduler.dblclick_dhx_matrix_cell(a)};scheduler._isRender=function(a){return scheduler.matrix[scheduler._mode]&&scheduler.matrix[scheduler._mode].render==a};scheduler.attachEvent("onCellDblClick",function(a,c,b,d,h){if(!(this.config.readonly||h.type=="dblclick"&&!this.config.dblclick_create)){var e=scheduler.matrix[scheduler._mode],
l={};l.start_date=e._trace_x[a];l.end_date=e._trace_x[a+1]?e._trace_x[a+1]:scheduler.date.add(e._trace_x[a],e.x_step,e.x_unit);if(e._start_correction)l.start_date=new Date(l.start_date*1+e._start_correction);if(e._end_correction)l.end_date=new Date(l.end_date-e._end_correction);l[e.y_property]=e.y_unit[c].key;scheduler.addEventNow(l,null,h)}});scheduler.attachEvent("onBeforeDrag",function(){return!scheduler._isRender("cell")});scheduler.attachEvent("onEventChanged",function(a,c){c._timed=this.isOneDayEvent(c)});
var P=scheduler._render_marked_timespan;scheduler._render_marked_timespan=function(a,c,b,d,h){if(!scheduler.config.display_marked_timespans)return[];if(scheduler.matrix&&scheduler.matrix[scheduler._mode]){if(!scheduler._isRender("cell")){var e=scheduler._lame_copy({},scheduler.matrix[scheduler._mode]);e.round_position=!1;var l=[],f=[],k=[];if(b)k=[c],f=[b];else{var m=e.order,i;for(i in m)m.hasOwnProperty(i)&&(f.push(i),k.push(e._scales[i]))}var d=d?new Date(d):scheduler._min_date,h=h?new Date(h):
scheduler._max_date,p=[];if(a.days>6){var g=new Date(a.days);scheduler.date.date_part(new Date(d))<=+g&&+h>=+g&&p.push(g)}else p.push.apply(p,scheduler._get_dates_by_index(a.days));for(var q=a.zones,n=scheduler._get_css_classes_by_config(a),o=0;o<f.length;o++)for(var c=k[o],b=f[o],j=0;j<p.length;j++)for(var r=p[j],s=0;s<q.length;s+=2){var t=q[s],x=q[s+1],z=new Date(+r+t*6E4),u=new Date(+r+x*6E4);if(d<u&&h>z){var y=scheduler._get_block_by_config(a);y.className=n;var C=w({start_date:z},!1,e)-1,A=w({start_date:u},
!1,e)-1,v=Math.max(1,A-C-1),D=e._section_height[b]-1;y.style.cssText="height: "+D+"px; left: "+C+"px; width: "+v+"px; top: 0;";c.insertBefore(y,c.firstChild);l.push(y)}}return l}}else return P.apply(scheduler,[a,c,b])};var Q=scheduler._append_mark_now;scheduler._append_mark_now=function(a,c){if(scheduler.matrix&&scheduler.matrix[scheduler._mode]){var b=scheduler._currentDate(),d=scheduler._get_zone_minutes(b),h={days:+scheduler.date.date_part(b),zones:[d,d+1],css:"dhx_matrix_now_time",type:"dhx_now_time"};
return scheduler._render_marked_timespan(h)}else return Q.apply(scheduler,[a,c])};scheduler.attachEvent("onScaleAdd",function(a,c){var b=scheduler._marked_timespans;if(b&&scheduler.matrix&&scheduler.matrix[scheduler._mode])for(var d=scheduler._mode,h=scheduler._min_date,e=scheduler._max_date,l=b.global,f=scheduler.date.date_part(new Date(h));f<e;f=scheduler.date.add(f,1,"day")){var k=+f,m=f.getDay(),i=[],p=l[k]||l[m];i.push.apply(i,scheduler._get_configs_to_render(p));if(b[d]&&b[d][c]){var g=[],q=
scheduler._get_types_to_render(b[d][c][m],b[d][c][k]);g.push.apply(g,scheduler._get_configs_to_render(q));g.length&&(i=g)}for(var n=0;n<i.length;n++){var o=i[n],j=o.days;j<7?(j=k,scheduler._render_marked_timespan(o,a,c,f,scheduler.date.add(f,1,"day")),j=m):scheduler._render_marked_timespan(o,a,c,f,scheduler.date.add(f,1,"day"))}}});scheduler._get_date_index=function(a,c){for(var b=0,d=a._trace_x;b<d.length-1&&+c>=+d[b+1];)b++;return b}})();

/*
This software is allowed to use under GPL or you need to obtain Commercial or Enterise License
to use it in non-GPL project. Please contact sales@dhtmlx.com for details
*/
window.dhtmlXTooltip=scheduler.dhtmlXTooltip=window.dhtmlxTooltip={};dhtmlXTooltip.config={className:"dhtmlXTooltip tooltip",timeout_to_display:50,timeout_to_hide:50,delta_x:15,delta_y:-20};dhtmlXTooltip.tooltip=document.createElement("div");dhtmlXTooltip.tooltip.className=dhtmlXTooltip.config.className;
dhtmlXTooltip.show=function(b,d){if(!scheduler.config.touch||scheduler.config.touch_tooltip){var c=dhtmlXTooltip,g=this.tooltip,a=g.style;c.tooltip.className=c.config.className;var h=this.position(b),i=b.target||b.srcElement;if(!this.isTooltip(i)){var e=h.x+(c.config.delta_x||0),f=h.y-(c.config.delta_y||0);a.visibility="hidden";a.removeAttribute?(a.removeAttribute("right"),a.removeAttribute("bottom")):(a.removeProperty("right"),a.removeProperty("bottom"));a.left="0";a.top="0";this.tooltip.innerHTML=
d;document.body.appendChild(this.tooltip);var j=this.tooltip.offsetWidth,k=this.tooltip.offsetHeight;document.body.offsetWidth-e-j<0?(a.removeAttribute?a.removeAttribute("left"):a.removeProperty("left"),a.right=document.body.offsetWidth-e+2*(c.config.delta_x||0)+"px"):a.left=e<0?h.x+Math.abs(c.config.delta_x||0)+"px":e+"px";document.body.offsetHeight-f-k<0?(a.removeAttribute?a.removeAttribute("top"):a.removeProperty("top"),a.bottom=document.body.offsetHeight-f-2*(c.config.delta_y||0)+"px"):a.top=
f<0?h.y+Math.abs(c.config.delta_y||0)+"px":f+"px";a.visibility="visible";scheduler.callEvent("onTooltipDisplayed",[this.tooltip,this.tooltip.event_id])}}};dhtmlXTooltip._clearTimeout=function(){this.tooltip._timeout_id&&window.clearTimeout(this.tooltip._timeout_id)};dhtmlXTooltip.hide=function(){if(this.tooltip.parentNode){var b=this.tooltip.event_id;this.tooltip.event_id=null;this.tooltip.parentNode.removeChild(this.tooltip);scheduler.callEvent("onAfterTooltip",[b])}this._clearTimeout()};
dhtmlXTooltip.delay=function(b,d,c,g){this._clearTimeout();this.tooltip._timeout_id=setTimeout(function(){var a=b.apply(d,c);b=d=c=null;return a},g||this.config.timeout_to_display)};dhtmlXTooltip.isTooltip=function(b){var d=!1;for(b.className.split(" ");b&&!d;)d=b.className==this.tooltip.className,b=b.parentNode;return d};
dhtmlXTooltip.position=function(b){b=b||window.event;if(b.pageX||b.pageY)return{x:b.pageX,y:b.pageY};var d=window._isIE&&document.compatMode!="BackCompat"?document.documentElement:document.body;return{x:b.clientX+d.scrollLeft-d.clientLeft,y:b.clientY+d.scrollTop-d.clientTop}};
scheduler.attachEvent("onMouseMove",function(b,d){var c=window.event||d,g=c.target||c.srcElement,a=dhtmlXTooltip,h=a.isTooltip(g),i=a.isTooltipTarget&&a.isTooltipTarget(g);if(b||h||i){var e;if(b||a.tooltip.event_id){var f=scheduler.getEvent(b)||scheduler.getEvent(a.tooltip.event_id);if(!f)return;a.tooltip.event_id=f.id;e=scheduler.templates.tooltip_text(f.start_date,f.end_date,f);if(!e)return a.hide()}i&&(e="");var j=void 0;_isIE&&(j=document.createEventObject(c));scheduler.callEvent("onBeforeTooltip",
[b])&&e&&a.delay(a.show,a,[j||c,e])}else a.delay(a.hide,a,[],a.config.timeout_to_hide)});scheduler.attachEvent("onBeforeDrag",function(){dhtmlXTooltip.hide();return!0});scheduler.attachEvent("onEventDeleted",function(){dhtmlXTooltip.hide();return!0});scheduler.templates.tooltip_date_format=scheduler.date.date_to_str("%Y-%m-%d %H:%i");
scheduler.templates.tooltip_text=function(b,d,c){return"<b>Event:</b> "+c.text+"<br/><b>Start date:</b> "+scheduler.templates.tooltip_date_format(b)+"<br/><b>End date:</b> "+scheduler.templates.tooltip_date_format(d)};

/*
This software is allowed to use under GPL or you need to obtain Commercial or Enterise License
to use it in non-GPL project. Please contact sales@dhtmlx.com for details
*/
scheduler._props = {};
scheduler.createUnitsView=function(name,property,list,size,step,skip_incorrect){
	if (typeof name == "object"){
		list = name.list;
		property = name.property;
		size = name.size||0;
		step = name.step||1;
		skip_incorrect = name.skip_incorrect;
		name = name.name;		
	}

	scheduler._props[name]={map_to:property, options:list, step:step, position:0 };
    if(size>scheduler._props[name].options.length){
        scheduler._props[name]._original_size = size;
        size = 0;
    }
    scheduler._props[name].size = size;
	scheduler._props[name].skip_incorrect = skip_incorrect||false;
	
	scheduler.date[name+"_start"]= scheduler.date.day_start;
	scheduler.templates[name+"_date"] = function(date){
		return scheduler.templates.day_date(date);
	};

	scheduler._get_unit_index = function(unit_view, date) {
		var original_position = unit_view.position || 0;
		var date_position = Math.floor((scheduler._correct_shift(+date, 1) - +scheduler._min_date) / (60 * 60 * 24 * 1000));
		return original_position + date_position;
	};
	scheduler.templates[name + "_scale_text"] = function(id, label, option) {
		if (option.css) {
			return "<span class='" + option.css + "'>" + label + "</span>";
		} else {
			return label;
		}
	};
	scheduler.templates[name+"_scale_date"] = function(date) {
		var unit_view = scheduler._props[name];
		var list = unit_view.options;
		if (!list.length) return "";
		var index = scheduler._get_unit_index(unit_view, date);
		var option = list[index];
		return scheduler.templates[name + "_scale_text"](option.key, option.label, option);
	};

	scheduler.date["add_"+name]=function(date,inc){ return scheduler.date.add(date,inc,"day"); };
	scheduler.date["get_"+name+"_end"]=function(date){
		return scheduler.date.add(date,scheduler._props[name].size||scheduler._props[name].options.length,"day");
	};
	
	scheduler.attachEvent("onOptionsLoad",function(){
        var pr = scheduler._props[name];
		var order = pr.order = {};
		var list = pr.options;
		for(var i=0; i<list.length;i++)
			order[list[i].key]=i;
        if(pr._original_size && pr.size==0){
            pr.size = pr._original_size;
            delete pr.original_size;
        }
		if(pr.size > list.length) {
            pr._original_size = pr.size;
            pr.size = 0;
        }
        else
            pr.size = pr._original_size||pr.size;
		if (scheduler._date && scheduler._mode == name) 
			scheduler.setCurrentView(scheduler._date, scheduler._mode);
	});
	scheduler.callEvent("onOptionsLoad",[]);
};
scheduler.scrollUnit=function(step){
	var pr = scheduler._props[this._mode];
	if (pr){
		pr.position=Math.min(Math.max(0,pr.position+step),pr.options.length-pr.size);
		this.update_view();		
	}
};
(function(){
	var _removeIncorrectEvents = function(evs) {
		var pr = scheduler._props[scheduler._mode];
		if(pr && pr.order && pr.skip_incorrect) {
            var correct_events = [];
			for(var i=0; i<evs.length; i++) {
				if(typeof pr.order[evs[i][pr.map_to]] != "undefined") {
                    correct_events.push(evs[i]);
				}
			}
            evs.splice(0,evs.length);
			evs.push.apply(evs,correct_events);
		}
		return evs;
	};
	var old_pre_render_events_table = scheduler._pre_render_events_table;
	scheduler._pre_render_events_table=function(evs,hold) {
		evs = _removeIncorrectEvents(evs);
		return old_pre_render_events_table.apply(this, [evs, hold]);
	};
	var old_pre_render_events_line = scheduler._pre_render_events_line;
	scheduler._pre_render_events_line = function(evs,hold){ 
		evs = _removeIncorrectEvents(evs);
		return old_pre_render_events_line.apply(this, [evs, hold]);
	};
	var fix_und=function(pr,ev){
		if (pr && typeof pr.order[ev[pr.map_to]] == "undefined"){
			var s = scheduler;
			var dx = 24*60*60*1000;
			var ind = Math.floor((ev.end_date - s._min_date)/dx);
			//ev.end_date = new Date(s.date.time_part(ev.end_date)*1000+s._min_date.valueOf());
			//ev.start_date = new Date(s.date.time_part(ev.start_date)*1000+s._min_date.valueOf());
			ev[pr.map_to] = pr.options[Math.min(ind+pr.position,pr.options.length-1)].key;
			return true;
		}
	};
	var t = scheduler._reset_scale;
    
	var oldive = scheduler.is_visible_events;
	scheduler.is_visible_events = function(e){
		var res = oldive.apply(this,arguments);
		if (res){
			var pr = scheduler._props[this._mode];
			if (pr && pr.size){
				var val = pr.order[e[pr.map_to]];
				if (val < pr.position || val >= pr.size+pr.position )
					return false;
			}
		}
		return res;
	};
	scheduler._reset_scale = function(){
		var pr = scheduler._props[this._mode];
		var ret = t.apply(this,arguments);
		if (pr){
			this._max_date=this.date.add(this._min_date,1,"day");
				
				var d = this._els["dhx_cal_data"][0].childNodes;
				for (var i=0; i < d.length; i++)
					d[i].className = d[i].className.replace("_now",""); //clear now class
				
			if (pr.size && pr.size < pr.options.length){
				
				var h = this._els["dhx_cal_header"][0];
				var arrow = document.createElement("DIV");				
				if (pr.position){
					arrow.className = "dhx_cal_prev_button";
					arrow.style.cssText="left:1px;top:2px;position:absolute;"
					arrow.innerHTML = "&nbsp;"				
					h.firstChild.appendChild(arrow);
					arrow.onclick=function(){
						scheduler.scrollUnit(pr.step*-1);
					}
				}
				if (pr.position+pr.size<pr.options.length){
					arrow = document.createElement("DIV");
					arrow.className = "dhx_cal_next_button";
					arrow.style.cssText="left:auto; right:0px;top:2px;position:absolute;"
					arrow.innerHTML = "&nbsp;"		
					h.lastChild.appendChild(arrow);
					arrow.onclick=function(){
						scheduler.scrollUnit(pr.step);
					}
				}
			}
		}
		return ret;
		
	};
	var r = scheduler._get_event_sday;
	scheduler._get_event_sday=function(ev){
		var pr = scheduler._props[this._mode];
		if (pr){
			fix_und(pr,ev);
			return pr.order[ev[pr.map_to]]-pr.position;	
		}
		return r.call(this,ev);
	};
	var l = scheduler.locate_holder_day;
	scheduler.locate_holder_day=function(a,b,ev){
		var pr = scheduler._props[this._mode];
		if (pr && ev) {
			fix_und(pr,ev);
			return pr.order[ev[pr.map_to]]*1+(b?1:0)-pr.position;	
		}
		return l.apply(this,arguments);
	};
	var p = scheduler._mouse_coords;
	scheduler._mouse_coords=function(){
		var pr = scheduler._props[this._mode];
		var pos=p.apply(this,arguments);
		if (pr){
			if(!this._drag_event) this._drag_event = {};
			var ev = this._drag_event;
			if (this._drag_id && this._drag_mode){
				ev = this.getEvent(this._drag_id);
				this._drag_event._dhx_changed = true;
			}
			var unit_ind = Math.min(pos.x+pr.position,pr.options.length-1);
			var key = pr.map_to;
			pos.section = ev[key]=(pr.options[unit_ind]||{}).key;
			pos.x = 0;
		}
		pos.force_redraw = true;
		return pos;
	};
	var o = scheduler._time_order;
	scheduler._time_order = function(evs){
		var pr = scheduler._props[this._mode];
		if (pr){
			evs.sort(function(a,b){
				return pr.order[a[pr.map_to]]>pr.order[b[pr.map_to]]?1:-1;
			});
		} else
			o.apply(this,arguments);
	};
	scheduler.attachEvent("onEventAdded",function(id,ev){
		if (this._loading) return true;
		for (var a in scheduler._props){
			var pr = scheduler._props[a];
			if (typeof ev[pr.map_to] == "undefined")
				ev[pr.map_to] = pr.options[0].key;
		}
		return true;
	});
	scheduler.attachEvent("onEventCreated",function(id,n_ev){
		var pr = scheduler._props[this._mode];
		if (pr && n_ev){
			var ev = this.getEvent(id);
			this._mouse_coords(n_ev);
			fix_und(pr,ev);
			this.event_updated(ev);
		}
		return true;
	})		
})();

scheduler.locale = {
	date: {
		month_full: ["Январь", "Февраль", "Март", "Апрель", "Maй", "Июнь", "Июль", "Август", "Сентябрь", "Oктябрь", "Ноябрь", "Декабрь"],
		month_short: ["Янв", "Фев", "Maр", "Aпр", "Maй", "Июн", "Июл", "Aвг", "Сен", "Окт", "Ноя", "Дек"],
		day_full: [ "Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
		day_short: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]
	},
	labels: {
		dhx_cal_today_button: "Сегодня",
		day_tab: "День",
		week_tab: "Неделя",
		month_tab: "Месяц",
		new_event: "Новое событие",
		icon_save: "Сохранить",
		icon_cancel: "Отменить",
		icon_details: "Детали",
		icon_edit: "Изменить",
		icon_delete: "Удалить",
		confirm_closing: "", //Ваши изменения будут потеряны, продолжить?
		confirm_deleting: "Событие будет удалено безвозвратно, продолжить?",
		section_description: "Описание",
		section_time: "Период времени",
		full_day: "Весь день",

		confirm_recurring: "Вы хотите изменить всю серию повторяющихся событий?",
		section_recurring: "Повторение",
		button_recurring: "Отключено",
		button_recurring_open: "Включено",
		button_edit_series: "Редактировать серию",
		button_edit_occurrence: "Редактировать экземпляр",

		/*agenda view extension*/
		agenda_tab: "Список",
		date: "Дата",
		description: "Описание",

		/*year view extension*/
		year_tab: "Год",

		/*week agenda view extension*/
		week_agenda_tab: "Список",

		/*grid view extension*/
		grid_tab: "Таблица"
	}
}

//v.3.0 build 110707

/*
Copyright DHTMLX LTD. http://www.dhtmlx.com
You allowed to use this component or parts of it under GPL terms
To use it on other terms or get Professional edition of the component please contact us at sales@dhtmlx.com
*/
function dhtmlXComboFromSelect(a,b){typeof a=="string"&&(a=document.getElementById(a));b=b||a.getAttribute("width")||(window.getComputedStyle?window.getComputedStyle(a,null).width:a.currentStyle?a.currentStyle.width:0);if(!b||b=="auto")b=a.offsetWidth||100;var c=document.createElement("SPAN");a.parentNode.insertBefore(c,a);a.style.display="none";for(var e=a.getAttribute("opt_type"),d=new dhtmlXCombo(c,a.name,b,e,a.tabIndex),f=[],h=-1,g=0;g<a.options.length;g++){a.options[g].selected&&(h=g);var j=
a.options[g].innerHTML,i=a.options[g].getAttribute("value");if(typeof i=="undefined"||i===null)i=j;f[g]={value:i,text:j,img_src:a.options[g].getAttribute("img_src")}}f.length&&d.addOption(f);a.parentNode.removeChild(a);h>=0&&d.selectOption(h,null,!0);a.onchange&&d.attachEvent("onChange",a.onchange);a.style.direction=="rtl"&&d.setRTL&&d.setRTL(!0);return d}var dhtmlXCombo_optionTypes=[];
function dhtmlXCombo(a,b,c,e,d){typeof a=="string"&&(a=document.getElementById(a));this.dhx_Event();this.optionType=e!=window.undefined&&dhtmlXCombo_optionTypes[e]?e:"default";this._optionObject=dhtmlXCombo_optionTypes[this.optionType];this._disabled=!1;if(!window.dhx_glbSelectAr)window.dhx_glbSelectAr=[],window.dhx_openedSelect=null,window.dhx_SelectId=1,dhtmlxEvent(document.body,"click",this.closeAll),dhtmlxEvent(document.body,"keydown",function(a){try{(a||event).keyCode==9&&window.dhx_glbSelectAr[0].closeAll()}catch(b){}return!0});
if(a.tagName=="SELECT")return dhtmlXComboFromSelect(a);else this._createSelf(a,b,c,d);dhx_glbSelectAr.push(this)}dhtmlXCombo.prototype.setSize=function(a){this.DOMlist.style.width=a+"px";if(this.DOMlistF)this.DOMlistF.style.width=a+"px";this.DOMelem.style.width=a+"px";this.DOMelem_input.style.width=Math.max(0,a-19)+"px"};
dhtmlXCombo.prototype.enableFilteringMode=function(a,b,c,e){this._filter=convertStringToBoolean(a);if(b)this._xml=b,this._autoxml=convertStringToBoolean(e);if(convertStringToBoolean(c))this._xmlCache=[]};dhtmlXCombo.prototype.setFilteringParam=function(a,b){if(!this._prs)this._prs=[];this._prs.push([a,b])};dhtmlXCombo.prototype.disable=function(a){var b=convertStringToBoolean(a);if(this._disabled!=b)this._disabled=this.DOMelem_input.disabled=b};
dhtmlXCombo.prototype.readonly=function(a,b){this.DOMelem_input.readOnly=a?!0:!1;if(b===!1||a===!1)this.DOMelem.onkeyup=function(){};else{var c=this;this.DOMelem.onkeyup=function(a){a=a||window.event;if(a.keyCode!=9)a.cancelBubble=!0;if(a.keyCode>=48&&a.keyCode<=57||a.keyCode>=65&&a.keyCode<=90){for(var b=0;b<c.optionsArr.length;b++){var f=c.optionsArr[b].text;if(f.toString().toUpperCase().indexOf(String.fromCharCode(a.keyCode))==0){c.selectOption(b);break}}a.cancelBubble=!0}}}};
dhtmlXCombo.prototype.getOption=function(a){for(var b=0;b<this.optionsArr.length;b++)if(this.optionsArr[b].value==a)return this.optionsArr[b];return null};dhtmlXCombo.prototype.getOptionByLabel=function(a){for(var b=0;b<this.optionsArr.length;b++)if(this.optionsArr[b].text==a||this.optionsArr[b]._ctext==a)return this.optionsArr[b];return null};dhtmlXCombo.prototype.getOptionByIndex=function(a){return this.optionsArr[a]};
dhtmlXCombo.prototype.clearAll=function(a){a&&this.setComboText("");this.optionsArr=[];this.redrawOptions();a&&this._confirmSelection()};dhtmlXCombo.prototype.deleteOption=function(a){var b=this.getIndexByValue(a);if(!(b<0)){if(this.optionsArr[b]==this._selOption)this._selOption=null;this.optionsArr.splice(b,1);this.redrawOptions()}};dhtmlXCombo.prototype.render=function(a){this._skiprender=!convertStringToBoolean(a);this.redrawOptions()};
dhtmlXCombo.prototype.updateOption=function(a,b,c,e){var d=this.getOption(a);typeof b!="object"&&(b={text:c,value:b,css:e});d.setValue(b);this.redrawOptions()};dhtmlXCombo.prototype.addOption=function(a){args=!arguments[0].length||typeof arguments[0]!="object"?[arguments]:a;this.render(!1);for(var b=0;b<args.length;b++){var c=args[b];if(c.length)c.value=c[0]||"",c.text=c[1]||"",c.css=c[2]||"";this._addOption(c)}this.render(!0)};
dhtmlXCombo.prototype._addOption=function(a){dOpt=new this._optionObject;this.optionsArr.push(dOpt);dOpt.setValue.apply(dOpt,[a]);this.redrawOptions()};dhtmlXCombo.prototype.getIndexByValue=function(a){for(var b=0;b<this.optionsArr.length;b++)if(this.optionsArr[b].value==a)return b;return-1};dhtmlXCombo.prototype.getSelectedValue=function(){return this._selOption?this._selOption.value:null};dhtmlXCombo.prototype.getComboText=function(){return this.DOMelem_input.value};
dhtmlXCombo.prototype.setComboText=function(a){this.DOMelem_input.value=a};dhtmlXCombo.prototype.setComboValue=function(a){this.setComboText(a);for(var b=0;b<this.optionsArr.length;b++)if(this.optionsArr[b].data()[0]==a)return this.selectOption(b,null,!0);this.DOMelem_hidden_input.value=a};dhtmlXCombo.prototype.getActualValue=function(){return this.DOMelem_hidden_input.value};dhtmlXCombo.prototype.getSelectedText=function(){return this._selOption?this._selOption.text:""};
dhtmlXCombo.prototype.getSelectedIndex=function(){for(var a=0;a<this.optionsArr.length;a++)if(this.optionsArr[a]==this._selOption)return a;return-1};dhtmlXCombo.prototype.setName=function(a){this.DOMelem_hidden_input.name=a;this.DOMelem_hidden_input2=a.replace(/(\]?)$/,"_new_value$1");this.name=a};dhtmlXCombo.prototype.show=function(a){this.DOMelem.style.display=convertStringToBoolean(a)?"":"none"};
dhtmlXCombo.prototype.destructor=function(){this.DOMParent.removeChild(this.DOMelem);this.DOMlist.parentNode.removeChild(this.DOMlist);var a=dhx_glbSelectAr;this.DOMParent=this.DOMlist=this.DOMelem=0;for(var b=this.DOMlist.combo=this.DOMelem.combo=0;b<a.length;b++)if(a[b]==this){a[b]=null;a.splice(b,1);break}};
dhtmlXCombo.prototype._createSelf=function(a,b,c,e){if(c.toString().indexOf("%")!=-1){var d=this,f=parseInt(c)/100;window.setInterval(function(){if(a.parentNode){var b=a.parentNode.offsetWidth*f-2;if(!(b<0)&&b!=d._lastTs)d.setSize(d._lastTs=b)}},500);c=parseInt(a.offsetWidth)}c=parseInt(c||100);this.ListPosition="Bottom";this.DOMParent=a;this._inID=null;this.name=b;this._selOption=null;this.optionsArr=[];var h=new this._optionObject;h.DrawHeader(this,b,c,e);this.DOMlist=document.createElement("DIV");
this.DOMlist.className="dhx_combo_list "+(dhtmlx.skin?dhtmlx.skin+"_list":"");this.DOMlist.style.width=c-(_isIE?0:0)+"px";if(_isOpera||_isKHTML)this.DOMlist.style.overflow="auto";this.DOMlist.style.display="none";document.body.insertBefore(this.DOMlist,document.body.firstChild);if(_isIE)this.DOMlistF=document.createElement("IFRAME"),this.DOMlistF.style.border="0px",this.DOMlistF.className="dhx_combo_list",this.DOMlistF.style.width=c-(_isIE?0:0)+"px",this.DOMlistF.style.display="none",this.DOMlistF.src=
"javascript:false;",document.body.insertBefore(this.DOMlistF,document.body.firstChild);this.DOMlist.combo=this.DOMelem.combo=this;this.DOMelem_input.onkeydown=this._onKey;this.DOMelem_input.onkeypress=this._onKeyF;this.DOMelem_input.onblur=this._onBlur;this.DOMelem.onclick=this._toggleSelect;this.DOMlist.onclick=this._selectOption;this.DOMlist.onmousedown=function(){this._skipBlur=!0};this.DOMlist.onkeydown=function(a){(a||event).cancelBubble=!0;this.combo.DOMelem_input.onkeydown(a)};this.DOMlist.onmouseover=
this._listOver};dhtmlXCombo.prototype._listOver=function(a){a=a||event;a.cancelBubble=!0;var b=_isIE?event.srcElement:a.target,c=this.combo;if(b.parentNode==c.DOMlist){c._selOption&&c._selOption.deselect();c._tempSel&&c._tempSel.deselect();for(var e=0;e<c.DOMlist.childNodes.length;e++)if(c.DOMlist.childNodes[e]==b)break;var d=c.optionsArr[e];c._tempSel=d;c._tempSel.select();c._autoxml&&e+1==c._lastLength&&c._fetchOptions(e+1,c._lasttext||"")}};
dhtmlXCombo.prototype._positList=function(){var a=this.getPosition(this.DOMelem);this.ListPosition=="Bottom"?(this.DOMlist.style.top=a[1]+this.DOMelem.offsetHeight-1+"px",this.DOMlist.style.left=a[0]+"px"):this.ListPosition=="Top"?(this.DOMlist.style.top=a[1]-this.DOMlist.offsetHeight+"px",this.DOMlist.style.left=a[0]+"px"):(this.DOMlist.style.top=a[1]+"px",this.DOMlist.style.left=a[0]+this.DOMelem.offsetWidth+"px")};
dhtmlXCombo.prototype.getPosition=function(a,b){if(_isChrome){if(!b)b=document.body;for(var c=a,e=0,d=0;c&&c!=b;)e+=c.offsetLeft-c.scrollLeft,d+=c.offsetTop-c.scrollTop,c=c.offsetParent;b==document.body&&(_isIE&&_isIE<8?(document.documentElement.scrollTop&&(d+=document.documentElement.scrollTop),document.documentElement.scrollLeft&&(e+=document.documentElement.scrollLeft)):_isFF||(e+=document.body.offsetLeft,d+=document.body.offsetTop));return[e,d]}var f=getOffset(a);return[f.left,f.top]};
dhtmlXCombo.prototype._correctSelection=function(){if(this.getComboText()!="")for(var a=0;a<this.optionsArr.length;a++)if(!this.optionsArr[a].isHidden())return this.selectOption(a,!0,!1);this.unSelectOption()};dhtmlXCombo.prototype.selectNext=function(a){for(var b=this.getSelectedIndex()+a;this.optionsArr[b];){if(!this.optionsArr[b].isHidden())return this.selectOption(b,!1,!1);b+=a}};
dhtmlXCombo.prototype._onKeyF=function(a){var b=this.parentNode.combo,c=a||event;c.cancelBubble=!0;c.keyCode=="13"||c.keyCode=="9"?(b._confirmSelection(),b.closeAll()):c.keyCode=="27"?(b._resetSelection(),b.closeAll()):b._activeMode=!0;return c.keyCode=="13"||c.keyCode=="27"?(b.callEvent("onKeyPressed",[c.keyCode]),!1):!0};
dhtmlXCombo.prototype._onKey=function(a){var b=this.parentNode.combo;(a||event).cancelBubble=!0;var c=(a||event).keyCode;if(c>15&&c<19)return!0;if(c==27)return!0;if(b.DOMlist.style.display!="block"&&c!="13"&&c!="9"&&(!b._filter||b._filterAny))b.DOMelem.onclick(a||event);if(c!="13"&&c!="9"){if(window.setTimeout(function(){b._onKeyB(c)},1),c=="40"||c=="38")return!1}else if(c==9)b._confirmSelection(),b.closeAll(),(a||event).cancelBubble=!1};
dhtmlXCombo.prototype._onKeyB=function(a){if(a=="40")var b=this.selectNext(1);else if(a=="38")this.selectNext(-1);else{this.callEvent("onKeyPressed",[a]);if(this._filter)return this.filterSelf(a==8||a==46);for(var c=0;c<this.optionsArr.length;c++)if(this.optionsArr[c].data()[1]==this.DOMelem_input.value)return this.selectOption(c,!1,!1),!1;this.unSelectOption()}return!0};
dhtmlXCombo.prototype._onBlur=function(){var a=this.parentNode._self;window.setTimeout(function(){if(a.DOMlist._skipBlur)return!(a.DOMlist._skipBlur=!1);a._confirmSelection();a.callEvent("onBlur",[])},100)};dhtmlXCombo.prototype.redrawOptions=function(){if(!this._skiprender){for(var a=this.DOMlist.childNodes.length-1;a>=0;a--)this.DOMlist.removeChild(this.DOMlist.childNodes[a]);for(a=0;a<this.optionsArr.length;a++)this.DOMlist.appendChild(this.optionsArr[a].render())}};
dhtmlXCombo.prototype.loadXML=function(a,b){this._load=!0;this.callEvent("onXLS",[]);if(this._prs)for(var c=0;c<this._prs.length;c++)a+=[getUrlSymbol(a),escape(this._prs[c][0]),"=",escape(this._prs[c][1])].join("");if(this._xmlCache&&this._xmlCache[a])this._fillFromXML(this,null,null,null,this._xmlCache[a]),b&&b();else{var e=new dtmlXMLLoaderObject(this._fillFromXML,this,!0,!0);if(b)e.waitCall=b;e._cPath=a;e.loadXML(a)}};
dhtmlXCombo.prototype.loadXMLString=function(a){var b=new dtmlXMLLoaderObject(this._fillFromXML,this,!0,!0);b.loadXMLString(a)};
dhtmlXCombo.prototype._fillFromXML=function(a,b,c,e,d){a._xmlCache&&(a._xmlCache[d._cPath]=d);var f=d.getXMLTopNode("complete");if(f.tagName!="complete")a._load=!1;else{var h=d.doXPath("//complete"),g=d.doXPath("//option"),j=!1;a.render(!1);if(!h[0]||!h[0].getAttribute("add")){if(a.clearAll(),a._lastLength=g.length,a._xml)if(!g||!g.length)a.closeAll();else if(a._activeMode)a._positList(),a.DOMlist.style.display="block",_isIE&&a._IEFix(!0)}else a._lastLength+=g.length||Infinity,j=!0;for(var i=0;i<
g.length;i++){var k={};k.text=g[i].firstChild?g[i].firstChild.nodeValue:"";for(var l=0;l<g[i].attributes.length;l++){var m=g[i].attributes[l];if(m)k[m.nodeName]=m.nodeValue}a._addOption(k)}a.render(j!=!0||!!g.length);a._load&&a._load!==!0?a.loadXML(a._load):(a._load=!1,!a._lkmode&&a._filter&&a._correctSelection());var n=d.doXPath("//option[@selected]");n.length&&a.selectOption(a.getIndexByValue(n[0].getAttribute("value")),!1,!0);a.callEvent("onXLE",[])}};
dhtmlXCombo.prototype.unSelectOption=function(){this._selOption&&this._selOption.deselect();this._tempSel&&this._tempSel.deselect();this._tempSel=this._selOption=null};dhtmlXCombo.prototype.confirmValue=function(){this._confirmSelection()};
dhtmlXCombo.prototype._confirmSelection=function(a,b){if(arguments.length==0){var c=this.getOptionByLabel(this.DOMelem_input.value),a=c?c.value:this.DOMelem_input.value,b=c==null;if(a==this.getActualValue())return}this.DOMelem_input.focus();this.DOMelem_hidden_input.value=a;this.DOMelem_hidden_input2.value=b?"true":"false";this.callEvent("onChange",[]);this._activeMode=!1};
dhtmlXCombo.prototype._resetSelection=function(){var a=this.getOption(this.DOMelem_hidden_input.value);this.setComboValue(a?a.data()[0]:this.DOMelem_hidden_input.value);this.setComboText(a?a.data()[1]:this.DOMelem_hidden_input.value)};
dhtmlXCombo.prototype.selectOption=function(a,b,c){arguments.length<3&&(c=!0);this.unSelectOption();var e=this.optionsArr[a];if(e){this._selOption=e;this._selOption.select();var d=this._selOption.content.offsetTop+this._selOption.content.offsetHeight-this.DOMlist.scrollTop-this.DOMlist.offsetHeight;d>0&&(this.DOMlist.scrollTop+=d);d=this.DOMlist.scrollTop-this._selOption.content.offsetTop;d>0&&(this.DOMlist.scrollTop-=d);var f=this._selOption.data();c&&(this.setComboText(f[1]),this._confirmSelection(f[0],
!1),this._autoxml&&a+1==this._lastLength&&this._fetchOptions(a+1,this._lasttext||""));if(b){var h=this.getComboText();h!=f[1]&&(this.setComboText(f[1]),dhtmlXRange(this.DOMelem_input,h.length+1,f[1].length))}else this.setComboText(f[1]);this._selOption.RedrawHeader(this);this.callEvent("onSelectionChange",[])}};
dhtmlXCombo.prototype._selectOption=function(a){(a||event).cancelBubble=!0;for(var b=_isIE?event.srcElement:a.target,c=this.combo;!b._self;)if(b=b.parentNode,!b)return;for(var e=0;e<c.DOMlist.childNodes.length;e++)if(c.DOMlist.childNodes[e]==b)break;c.selectOption(e,!1,!0);c.closeAll();c.callEvent("onBlur",[]);c._activeMode=!1};
dhtmlXCombo.prototype.openSelect=function(){if(!this._disabled){this.closeAll();this._positList();this.DOMlist.style.display="block";this.callEvent("onOpen",[]);this._tempSel&&this._tempSel.deselect();this._selOption&&this._selOption.select();if(this._selOption){var a=this._selOption.content.offsetTop+this._selOption.content.offsetHeight-this.DOMlist.scrollTop-this.DOMlist.offsetHeight;a>0&&(this.DOMlist.scrollTop+=a);a=this.DOMlist.scrollTop-this._selOption.content.offsetTop;a>0&&(this.DOMlist.scrollTop-=
a)}_isIE&&this._IEFix(!0);this.DOMelem_input.focus();this._filter&&this.filterSelf()}};dhtmlXCombo.prototype._toggleSelect=function(a){var b=this.combo;b.DOMlist.style.display=="block"?b.closeAll():b.openSelect();(a||event).cancelBubble=!0};
dhtmlXCombo.prototype._fetchOptions=function(a,b){if(b=="")return this.closeAll(),this.clearAll();var c=this._xml+(this._xml.indexOf("?")!=-1?"&":"?")+"pos="+a+"&mask="+encodeURIComponent(b);this._lasttext=b;this._load?this._load=c:this.callEvent("onDynXLS",[b,a])&&this.loadXML(c)};
dhtmlXCombo.prototype.filterSelf=function(a){var b=this.getComboText();if(this._xml)this._lkmode=a,this._fetchOptions(0,b);var c=RegExp("^"+b.replace(/([\[\]\{\}\(\)\+\*\\\?\.])/g,"\\$1"),"i");this.filterAny=!1;for(var e=0;e<this.optionsArr.length;e++){var d=c.test(this.optionsArr[e].content?this.optionsArr[e].data()[1]:this.optionsArr[e].text);this.filterAny|=d;this.optionsArr[e].hide(!d)}this.filterAny?(this.DOMlist.style.display!="block"&&this.openSelect(),_isIE&&this._IEFix(!0)):(this.closeAll(),
this._activeMode=!0);a?this.unSelectOption():this._correctSelection()};dhtmlXCombo.prototype._IEFix=function(a){this.DOMlistF.style.display=a?"block":"none";this.DOMlistF.style.top=this.DOMlist.style.top;this.DOMlistF.style.left=this.DOMlist.style.left};
dhtmlXCombo.prototype.closeAll=function(){if(window.dhx_glbSelectAr)for(var a=0;a<dhx_glbSelectAr.length;a++){if(dhx_glbSelectAr[a].DOMlist.style.display=="block")dhx_glbSelectAr[a].DOMlist.style.display="none",_isIE&&dhx_glbSelectAr[a]._IEFix(!1);dhx_glbSelectAr[a]._activeMode=!1}};
function dhtmlXRange(a,b,c){var e=typeof a=="object"?a:document.getElementById(a);try{e.focus()}catch(d){}var f=e.value.length;b--;if(b<0||b>c||b>f)b=0;c>f&&(c=f);if(b!=c)if(e.setSelectionRange)e.setSelectionRange(b,c);else if(e.createTextRange){var h=e.createTextRange();h.moveStart("character",b);h.moveEnd("character",c-f);try{h.select()}catch(g){}}}dhtmlXCombo_defaultOption=function(){this.init()};
dhtmlXCombo_defaultOption.prototype.init=function(){this.value=null;this.text="";this.selected=!1;this.css=""};dhtmlXCombo_defaultOption.prototype.select=function(){if(this.content)this.content.className="dhx_selected_option"+(dhtmlx.skin?" combo_"+dhtmlx.skin+"_sel":"")};dhtmlXCombo_defaultOption.prototype.hide=function(a){this.render().style.display=a?"none":""};dhtmlXCombo_defaultOption.prototype.isHidden=function(){return this.render().style.display=="none"};
dhtmlXCombo_defaultOption.prototype.deselect=function(){this.content&&this.render();this.content.className=""};dhtmlXCombo_defaultOption.prototype.setValue=function(a){this.value=a.value||"";this.text=a.text||"";this.css=a.css||"";this.content=null};
dhtmlXCombo_defaultOption.prototype.render=function(){if(!this.content){this.content=document.createElement("DIV");this.content._self=this;this.content.style.cssText="width:100%; overflow:hidden;"+this.css;if(_isOpera||_isKHTML)this.content.style.padding="2px 0px 2px 0px";this.content.innerHTML=this.text;this._ctext=_isIE?this.content.innerText:this.content.textContent}return this.content};
dhtmlXCombo_defaultOption.prototype.data=function(){if(this.content)return[this.value,this._ctext?this._ctext:this.text]};dhtmlXCombo_defaultOption.prototype.DrawHeader=function(a,b,c,e){var d=document.createElement("DIV");d.style.width=c+"px";d.className="dhx_combo_box "+(dhtmlx.skin||"");d._self=a;a.DOMelem=d;this._DrawHeaderInput(a,b,c,e);this._DrawHeaderButton(a,b,c);a.DOMParent.appendChild(a.DOMelem)};
dhtmlXCombo_defaultOption.prototype._DrawHeaderInput=function(a,b,c,e){var d=document.createElement("input");d.setAttribute("autocomplete","off");d.type="text";d.className="dhx_combo_input";if(e)d.tabIndex=e;d.style.width=c-19-(document.compatMode=="BackCompat"?0:3)+"px";a.DOMelem.appendChild(d);a.DOMelem_input=d;d=document.createElement("input");d.type="hidden";d.name=b;a.DOMelem.appendChild(d);a.DOMelem_hidden_input=d;d=document.createElement("input");d.type="hidden";d.name=(b||"").replace(/(\]?)$/,
"_new_value$1");d.value="true";a.DOMelem.appendChild(d);a.DOMelem_hidden_input2=d};dhtmlXCombo_defaultOption.prototype._DrawHeaderButton=function(a){var b=document.createElement("img");b.className="dhx_combo_img";if(dhtmlx.image_path)dhx_globalImgPath=dhtmlx.image_path;b.src=(window.dhx_globalImgPath?dhx_globalImgPath:"")+"combo_select"+(dhtmlx.skin?"_"+dhtmlx.skin:"")+".gif";a.DOMelem.appendChild(b);a.DOMelem_button=b};dhtmlXCombo_defaultOption.prototype.RedrawHeader=function(){};
dhtmlXCombo_optionTypes["default"]=dhtmlXCombo_defaultOption;
dhtmlXCombo.prototype.dhx_Event=function(){this.dhx_SeverCatcherPath="";this.attachEvent=function(a,b,c){c=c||this;a="ev_"+a;if(!this[a]||!this[a].addEvent){var e=new this.eventCatcher(c);e.addEvent(this[a]);this[a]=e}return a+":"+this[a].addEvent(b)};this.callEvent=function(a,b){return this["ev_"+a]?this["ev_"+a].apply(this,b):!0};this.checkEvent=function(a){return this["ev_"+a]?!0:!1};this.eventCatcher=function(a){var b=[],c=a,e=function(a,b){var a=a.split(":"),c="",d="",e=a[1];a[1]=="rpc"&&(c=
'<?xml version="1.0"?><methodCall><methodName>'+a[2]+"</methodName><params>",d="</params></methodCall>",e=b);var k=function(){};return k},d=function(){if(b)var a=!0;for(var d=0;d<b.length;d++)if(b[d]!=null)var e=b[d].apply(c,arguments),a=a&&e;return a};d.addEvent=function(a){typeof a!="function"&&(a=a&&a.indexOf&&a.indexOf("server:")==0?new e(a,c.rpcServer):eval(a));return a?b.push(a)-1:!1};d.removeEvent=function(a){b[a]=null};return d};this.detachEvent=function(a){if(a!=!1){var b=a.split(":");this[b[0]].removeEvent(b[1])}}};
(function(){dhtmlx.extend_api("dhtmlXCombo",{_init:function(a){if(a.image_path)dhx_globalImgPath=a.image_path;return[a.parent,a.name,a.width||"100%",a.type,a.index]},filter:"filter_command",auto_height:"enableOptionAutoHeight",auto_position:"enableOptionAutoPositioning",auto_width:"enableOptionAutoWidth",xml:"loadXML",readonly:"readonly",items:"addOption"},{filter_command:function(a){typeof a=="string"?this.enableFilteringMode(!0,a):this.enableFilteringMode(a)}})})();

//v.3.0 build 110707

/*
Copyright DHTMLX LTD. http://www.dhtmlx.com
You allowed to use this component or parts of it under GPL terms
To use it on other terms or get Professional edition of the component please contact us at sales@dhtmlx.com
*/
/*
	@author dhtmlx.com
	@license GPL, see license.txt
*/
if (window.dhtmlXGridObject){
	dhtmlXGridObject.prototype._init_point_connector=dhtmlXGridObject.prototype._init_point;
	dhtmlXGridObject.prototype._init_point=function(){
		//make separate config array for each grid
		this._con_f_used = [].concat(this._con_f_used);
		dhtmlXGridObject.prototype._con_f_used=[];
		
		var clear_url=function(url){
			url=url.replace(/(\?|\&)connector[^\f]*/g,"");
			return url+(url.indexOf("?")!=-1?"&":"?")+"connector=true"+(this.hdr.rows.length > 0 ? "&dhx_no_header=1":"");
		};
		var combine_urls=function(url){
			return clear_url.call(this,url)+(this._connector_sorting||"")+(this._connector_filter||"");
		};
		var sorting_url=function(url,ind,dir){
			this._connector_sorting="&dhx_sort["+ind+"]="+dir;
			return combine_urls.call(this,url);
		};
		var filtering_url=function(url,inds,vals){
			for (var i=0; i<inds.length; i++)
				inds[i]="dhx_filter["+inds[i]+"]="+encodeURIComponent(vals[i]);
			this._connector_filter="&"+inds.join("&");
			return combine_urls.call(this,url);
		};
		this.attachEvent("onCollectValues",function(ind){
			if (this._con_f_used[ind]){
				if (typeof(this._con_f_used[ind]) == "object")
					return this._con_f_used[ind];
				else
					return false;
			}
			return true;
		});	
		this.attachEvent("onDynXLS",function(){
				this.xmlFileUrl=combine_urls.call(this,this.xmlFileUrl);
				return true;
		});				
		this.attachEvent("onBeforeSorting",function(ind,type,dir){
			if (type=="connector"){
				var self=this;
				this.clearAndLoad(sorting_url.call(this,this.xmlFileUrl,ind,dir),function(){
					self.setSortImgState(true,ind,dir);
				});
				return false;
			}
			return true;
		});
		this.attachEvent("onFilterStart",function(a,b){
			if (this._con_f_used.length){
				this.clearAndLoad(filtering_url.call(this,this.xmlFileUrl,a,b));
				return false;
			}
			return true;
		});
		this.attachEvent("onXLE",function(a,b,c,xml){
			if (!xml) return;
		});
		
		if (this._init_point_connector) this._init_point_connector();
	};
	dhtmlXGridObject.prototype._con_f_used=[];
	dhtmlXGridObject.prototype._in_header_connector_text_filter=function(t,i){
		if (!this._con_f_used[i])
			this._con_f_used[i]=1;
		return this._in_header_text_filter(t,i);
	};
	dhtmlXGridObject.prototype._in_header_connector_select_filter=function(t,i){
		if (!this._con_f_used[i])
			this._con_f_used[i]=2;
		return this._in_header_select_filter(t,i);
	};
	dhtmlXGridObject.prototype.load_connector=dhtmlXGridObject.prototype.load;
	dhtmlXGridObject.prototype.load=function(url, call, type){
		if (!this._colls_loaded && this.cellType){
			var ar=[];
			for (var i=0; i < this.cellType.length; i++)
				if (this.cellType[i].indexOf("co")==0 || this._con_f_used[i]==2) ar.push(i);
			if (ar.length)
				arguments[0]+=(arguments[0].indexOf("?")!=-1?"&":"?")+"connector=true&dhx_colls="+ar.join(",");
		}
		return this.load_connector.apply(this,arguments);
	};
	dhtmlXGridObject.prototype._parseHead_connector=dhtmlXGridObject.prototype._parseHead;
	dhtmlXGridObject.prototype._parseHead=function(url, call, type){
		this._parseHead_connector.apply(this,arguments);
		if (!this._colls_loaded){
			var cols = this.xmlLoader.doXPath("./coll_options", arguments[0]);
			for (var i=0; i < cols.length; i++){
				var f = cols[i].getAttribute("for");
				var v = [];
				var combo=null;
				if (this.cellType[f] == "combo")
					combo = this.getColumnCombo(f);
				else if (this.cellType[f].indexOf("co")==0)
					combo=this.getCombo(f);
					
				var os = this.xmlLoader.doXPath("./item",cols[i]);
				var opts = [];
				for (var j=0; j<os.length; j++){
					var val=os[j].getAttribute("value");
					
					if (combo){
						var lab=os[j].getAttribute("label")||val;
						
						if (combo.addOption)
							opts.push([val, lab]);
						else
							combo.put(val,lab);
							
						v[v.length]=lab;
					} else
						v[v.length]=val;
				}
				if (opts.length)
					combo.addOption(opts);
					
				if (this._con_f_used[f*1])
					this._con_f_used[f*1]=v;
			};
			this._colls_loaded=true;
		}
	};	
	
	
	

}

if (window.dataProcessor){
	dataProcessor.prototype.init_original=dataProcessor.prototype.init;
	dataProcessor.prototype.init=function(obj){
		this.init_original(obj);
		obj._dataprocessor=this;
		
		this.setTransactionMode("POST",true);
		this.serverProcessor+=(this.serverProcessor.indexOf("?")!=-1?"&":"?")+"editing=true";
	};
};
dhtmlxError.catchError("LoadXML",function(a,b,c){
	alert(c[0].responseText);
});
