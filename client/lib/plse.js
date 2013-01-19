var plse = (function () {
	return {
		init: function () {
			plse.assets = [];
		}

		after: function (func, count) {

		}

		// based upon: http://www.quirksmode.org/js/xmlhttp.html
		ajax: function (url,callback) {
			var XMLHttpFactories = [
				function () {return new XMLHttpRequest()},
				function () {return new ActiveXObject("Msxml2.XMLHTTP")},
				function () {return new ActiveXObject("Msxml3.XMLHTTP")},
				function () {return new ActiveXObject("Microsoft.XMLHTTP")}
			];

			function createXMLHTTPObject() {
				var xmlhttp = false;
				for (var i = 0; i < XMLHttpFactories.length; i++) {
					try {
						xmlhttp = XMLHttpFactories[i]();
					}
					catch (e) {
						continue;
					}
					break;
				}
				return xmlhttp;
			}		

			var req = createXMLHTTPObject();
			if (!req) return;
			req.open("GET", url, true);
			req.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
			req.onreadystatechange = function () {
				if (req.readyState != 4) return;
				if (req.status != 200 && req.status != 304) {
					return; // put robustness here
				}
				callback(req);
			}
			if (req.readyState == 4) return;
		}
	}
}());