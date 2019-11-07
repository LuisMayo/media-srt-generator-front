/*
This code has modifications by LuisMayo, check the original in this link.
source: https://gist.github.com/DimitrK/ece75318efbfce2605bfcf1a035f1472
*/

/**
* Similar to URLSearchParams. [https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams]
*
* [https://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet#Output_Encoding_Rules_Summary]
* Escapes HTML for parameter values in order to stop XSS attacks based on unsecured links and is compatible with >IE5
* 
* Copyright 2017 dimitrk
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
function UrlSearchParams(url, isHash) {
    url = url || window.location.href;
    var paramPairs, paramComponents, urlParamMap;

    this["delete"] = this.remove = function (key) {
        delete urlParamMap[key];
    };

    this.entries = function () {
        var entries = [];
        for (var key in urlParamMap) {
            if (this.has(key)) {
                entries.push([key, urlParamMap[key]]);
            }
        }

        entries = entries.sort(function(entryA, entryB) {
            if (entryA[0].toLowerCase() > entryB[0].toLowerCase()) {
                return 1;
            }
            if (entryA[0].toLowerCase() < entryB[0].toLowerCase()) {
                return -1;
            }
            return 0;
        });

        return entries;
    };

    this.get = function (key) {
        return urlParamMap[key];
    };

    this.has = function (key) {
        return urlParamMap.hasOwnProperty(key);
    };

    this.keys = function () {
        var keys = [];
        for (var key in urlParamMap) {
            if (this.has(key)) {
                keys.push(key);
            }
        }
        return keys;
    };

    this.set = function (key, val) {
        urlParamMap[key] = val;
    };

    this.toString = function () {
        var paramsString = '';
        var entries = this.entries();
        for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            if (this.has(entry[0])) {
                paramsString += '&' + entry[0] + '=' + encodeURIComponent(this._unesc(entry[1]));
            }
        }

        if (this.hash && this.hash.entries().length) {
            paramsString += '#' + this.hash.toString();
        }

        return paramsString.substr(1);
    };

    this.values = function () {
        var values = [];
        for (var key in urlParamMap) {
            if (this.has(key)) {
                values.push(urlParamMap[key]);
            }
        }
        return values;
    };

    this._esc = function (s) {
        return String(s)
            .replace(/</g, '&lt;')
            .replace(/'/g, '&#39;')
            .replace(/"/g, '&quot;')
            .replace(/>/g, '&gt;')
            .replace(/&/g, '&amp;');
    };

    this._unesc = function (s) {
        return String(s)
            .replace(/&lt;/g, '<')
            .replace(/&#39;/g, '\'')
            .replace(/&quot;/g, '"')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&');
    };

    urlParamMap = {};
    paramPairs = url.substr(url.indexOf('?') + 1);
    var urlHash;
    if (paramPairs.indexOf('#') > -1) {
        urlHash = paramPairs.substr(paramPairs.indexOf('#') + 1, paramPairs.length);
        paramPairs = paramPairs.substr(0, paramPairs.indexOf('#')) 
    }
    paramPairs = paramPairs.split('&');

    if (urlHash) {
        this.hash = new UrlSearchParams(urlHash, true);
    } else {
        this.hash = !isHash? new UrlSearchParams(' ', true) : null;
    }

    for (var i = 0; i < paramPairs.length; i++) {
        paramComponents = paramPairs[i].split('=');
        if (paramComponents.length === 2) {
            urlParamMap[paramComponents[0]] = this._esc(decodeURIComponent(paramComponents[1]));
        }
    }
}