/*
 * Tni.Ajax
 * O projeto Tni.Ajax tenta prover facilidades para a utilização do Ascyncronius Javascript And XML de forma cross-browser mantendo a compatibilidade com o objeto XMLHttpRequest
 * @version 0.03a
 * @author Thiniel P. Foti (tni04) <tni04@hotmail.com>
 */
 
// Namespace Tni (para previnir conflitos...)
if(typeof(Tni)==="undefined") var Tni = {};
(function(Tni,window,undefined){
	"use strict";
	function error(arg){
		error.history = error.history || [];
		if(typeof(console)!="undefined" && typeof(console.log)!="undefined"){
			arg = Array.prototype.slice.call(arguments);
			console.error.apply(console, arg);
			error.history.push(arg);
		}
	}
	Tni.Ajax = function(){
		//if(!(this instanceof Tni.Ajax)) return new Tni.Ajax();
		var param;
		var xhr;
		var fn;
		var _method; //  CONNECT, DELETE, GET:default, HEAD, OPTIONS, POST, PUT, TRACE, TRACK or UserDefinedMethod
		var _udMethod = false; // is User Defined Method ?
		var _url;
		var _async;
		var _opened = false;
		var _sent = false;
		var _user;
		var _pass;
		var self = this;
		
		/*
		╔═══════════════════════════════════════════════════════════════════╗
		║  ║ 186   ═ 205   ╣ 185   ╠ 204   ╔ 201   ╗ 187   ╚ 200   ╝ 188	║
		╚═══════════════════════════════════════════════════════════════════╝

		╔═══════════════════════════════════════════════════════════════════╗
		╠══════════ COMPATIBILIDADE COM O OBJETO "XMLHttpRequest" ══════════╣
		╠═══════════════════════════════════════════════════════════════════╣
		║																	║
		║	//!xhrN-1!														║
		║	---------- CONSTANTES ---------;								║
		║	1| this.UNSENT				= 0;								║
		║	2| this.OPENED				= 1;								║
		║	3| this.HEADERS_RECEIVED	= 2;								║
		║	4| this.LOADING				= 3;								║
		║	5| this.DONE				= 4;								║
		║																	║
		╠═══════════════════════════════════════════════════════════════════╣
		║																	║
		║	//!xhrN-2!														║
		║	---Propriedades Read-Only---									║
		║	1| this.reponse;												║
		║	2| this.responseXML;											║
		║	3| this.responseText;											║
		║	4| this.readyState;												║
		║	5| this.status;													║
		║	6| this.statusText;												║
		║																	║
		╠═══════════════════════════════════════════════════════════════════╣
		║																	║
		║	//!xhrN-3!														║
		║	*| this.withCredentials;										║
		║	*| this.responseType;											║
		║	*| this.timeout;												║
		║																	║
		║																	║
		║	*| this.constructor;											║
		║																	║
		╠═══════════════════════════════════════════════════════════════════╣
		║																	║
		║	//!xhrN-4.1!													║
		║	***Propriedades de Evento***									║
		║	1| this.onreadystatechange;										║
		║	2| this.onabort;												║
		║	3| this.onerror;												║
		║	4| this.onload;													║
		║	5| this.onloadend;												║
		║	6| this.onloadstart;											║
		║	7| this.onprogress;												║
		║	8| this.ontimeout;												║
		║																	║
		║	//!xhrN-4.2!														║
		║	//Metodos de Evento												║
		║	1| this.addEventListner();										║
		║	2| this.removeEventListener();									║
		║	3| this.dispatchEvent();										║
		║																	║
		╠═══════════════════════════════════════════════════════════════════╣
		║																	║
		║	//!xhrN-5!														║
		║	***Methodos de interação***										║
		║	1| this.abort();												║
		║	2| this.getResponseHeader();									║
		║	3| this.open();													║
		║	4| this.send();													║
		║	5| this.setRequestHeader();										║
		║	6| this.overrideMimeType();										║
		║	7| this.getAllResponseHeaders();								║
		║																	║
		╚═══════════════════════════════════════════════════════════════════╝


		╔═══════════════════════════════════════════════════════════════════╗
		╠═════ RECURSOS EXTENSIVOS E FACILIDADEs A SEREM IMPLEMENTADAS ═════╣
		╠═══════════════════════════════════════════════════════════════════╣
		║																	║
		║	//!xhrN-6!														║
		║	***Methodos de interação***										║
		║	*| this.url();													║
		║	*| this.async();												║
		║	*| this.getResponse();											║
		║	*| this.complete();												║
		║	*| this.progress();												║
		║	*| this.success();												║
		║	*| this.beforesend();											║
		║	*| this.aftersend();											║
		║	*| this.user();													║
		║	*| this.pass();													║
		║																	║
		╚═══════════════════════════════════════════════════════════════════╝
		*/
		
		//Funções "Privadas" e de controle;
		function init(){
			var efn = function(){return null;};
			fn = {complete:efn,sucess:efn,progress:efn,progressUp:efn};
			try{
				param = new FormData();
			} catch(e){
				error("Seu navegador não suporta essa aplicação (FormData) por favor atualize ou baixe um descente!");
			}
			try {
				xhr = new XMLHttpRequest();
			} catch(e){
				try{
					xhr = new ActiveXObject("Msxml2.XMLHTTP");
				} catch(e){
					error("Seu navegador não suporta essa aplicação (ajax 2.0) por favor atualize ou baixe um descente!");
					return false;
				}
			}
		}
		function prepereToSend(){
			xhr.onreadystatechange = function(){
				handleStatus.call(this);
			};
		}
		function enableResponse(){
			function parseJson(ret){
				try{
					ret = JSON.parse(ret);
				}catch($ex){
					try{
						ret = (1,eval)(ret);
					} catch($ex){
						error($ex,"Cannot parse \""+ret+"\" to JSON");
						ret = undefined;
					}
				}
				return ret;
			}
			function parseBufferToB64(buffer){
				var binary = "";
				try{
					var bytes = new Uint8Array( buffer );
					var len = bytes.byteLength;
					for (var i = 0; i < len; i++) binary += String.fromCharCode( bytes[ i ] );
					binary = window.btoa( binary );
				} catch(ex){
					error(ex);
				}
				return binary;
			}
			function parseNumber(ret){ return (!isNaN(parseFloat(ret)))?parseFloat(ret):undefined }
			self.getResponse = function($format){
				var ret = xhr.responseText;
				if((typeof($format)).toLowerCase() == "string"){
					switch ($format.toLowerCase()) {
						case "number": ret = parseNumber(ret); break;
						case "json": ret = parseJson(ret); break;
						case "xml": if(xhr.responseXML && (xhr.responseXML !== undefined)) ret = xhr.responseXML; break;
						case "base64": ret = parseBufferToB64(ret); break;
					}
				} else if((typeof($format)).toLowerCase() == "function"){
					ret = $format.call(xhr,xhr.responseText);
				} else {
					switch ($format) {
						case Number: ret = parseNumber(ret); break;
						case JSON: ret = parseJson(ret); break;
						case String: break;
						default: break;
					}
				}
				return ret;
			};
		}
		function handleStatus(){
			if(xhr.readyState === xhr.DONE){
				if(_async)enableResponse();
				fn.complete.call(xhr);
			}
		}

		//Funções "Publicas";
		this.url = function($url){
			_url = $url;
			return this;
		};
		this.complete = function($fn){
			fn.complete = $fn;
			return this;
		};

		//Funções de "Compatibilidade"
		this.open = function(method, url, async, user, password){
			/* Documentação Oficial - http://www.w3.org/TR/XMLHttpRequest/#dom-xmlhttprequest-open */
			if(typeof(method) == "string" || method instanceof String){
				switch (method.toUpperCase()) {
					case "CONNECT": 
					case "DELETE":
					case "GET":
					case "HEAD":
					case "OPTIONS":
					case "POST":
					case "PUT":
					case "TRACE":
					case "TRACK":
						_method = method;
						break;
					case "": //O método não pode ser vazio se não vai bugar...
						_method = method = "POST";
						break;
					default: _method = method;
							_udMethod = true;
							break;
				}
				if(typeof(url) !== "undefined"){
					if(typeof(async) !== "undefined"){
						if(typeof(user) !== "undefined"){
							if(typeof(password) !== "undefined"){
								xhr.open(url, async, user, password);
							}
						}
					}
				}
			}
				
		};
		this.send = function(data){
			if(!_opened) xhr.open(_method, _url, _async);
			if(typeof(data)!=="undefined"){
				xhr.send(data);
			} else {
				xhr.send();
			}
			return this;
		};
		this.async = function($async){
			if(typeof($async)!=="undefined"){
				if($async == "false"){
					_async = false;
				}else{
					_async = Boolean($async);
				}
				return this;
			}
			return _async;
		};
		this.getXhr = function() {
			return xhr;
		};
		init();
		return this;
	};
	Tni.Ajax.current = 0;
	Tni.Ajax.instances = [];
	
	//!xhrN-1!
	try{
		Tni.Ajax.prototype = {
			get UNSENT(){			return 0 },
			get OPENED(){			return 1 },
			get HEADERS_RECEIVED(){	return 2 },
			get LOADING(){			return 3 },
			get DONE(){				return 4 }
		};
		Object.defineProperties(Tni.Ajax, {
			UNSENT:			{get: function(){	return 0 }},
			OPENED:			{get: function(){	return 1 }},
			HEADERS_RECEIVED:{get: function(){	return 2 }},
			LOADING:		{get: function(){	return 3 }},
			DONE:			{get: function(){	return 4 }}
		});
	} catch(ex){
		error(ex);
		// A idéia é depois funcionar m navegadores antigo tipo IE7 e tals...
		/*Tni.Ajax.prototype = {
			UNSENT:0,
			OPENED:1,
			HEADERS_RECEIVED:2,
			LOADING:3,
			DONE:4
		}*/
	}
	//Tni.Ajax.prototype = new Tni.Core();
	error("teste",[1,2,3,4,5],{foo:"bar",1:void{}});
})(Tni,window,undefined);