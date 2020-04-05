/** Copyright 2019 Luis Mayo(LuisMayo)
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

var srtFile;
var finishedSets = new Set();
lastPetition = 0;
var params = new UrlSearchParams()
var templateObject = JSON.parse(`{
    "config": {
        "encoding": "FLAC",
        "language_code": "en-US",
        "enableWordTimeOffsets": true,
        "speechContexts": [
            {
                "phrases": []
            }
        ]
    },
    "audio": {
        "uri": ""
    }
}`);

function makeRequest() {
    var urlBack = document.getElementById('back').value;
    var urlMedia = document.getElementById('media').value;
    var files = document.getElementById('file').files;
    var name = document.getElementById('name').value;
    var language = document.getElementById('language').value;
    var manualLanguage = document.getElementById('manualLanguage').value;
    var speech = document.getElementById('speech').value;
    var onlyDownload = getDownloadCheck();
    var button = getActionButton()
    var currentPetition = lastPetition++;

    if (urlBack) {
        urlBack = urlBack.trim()
    }
    if (urlMedia) {
        urlMedia = urlMedia.trim()
    }
    if (name) {
        name = name.trim()
    }
    if (language) {
        language = language.trim()
        if (language === 'other') {
            language = (manualLanguage || '').trim();
        }
    }
    if (speech) {
        speech = speech.trim()
    }
    if (!urlBack || !name) {
        alert('There are some required fields not filled');
        return;
    }
    if (!urlMedia && (!files || files.length === 0)) {
        alert('You need to specify input media');
        return;
    }
    var words = speech.split(',');
    var link = document.getElementById('link')
    if (files && files.length > 0) {
        var reader  = new FileReader();
        reader.onloadend = function () {
            sendRequest(reader.result);
        }
        reader.readAsDataURL(files[0]);;
    } else {
        sendRequest();
    }

    function sendRequest(inputFile) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (this.readyState === 4) {
                finishedSets.add(currentPetition);
                enablePage();
                if (this.status === 200 && !getDownloadCheck().checked) {
                    getOutputElement().value = this.responseText;
                    srtFile = new Blob([this.responseText], { type: "text/plain;charset=utf-8" });
                    link.href = URL.createObjectURL(srtFile);
                    link.download = name + '.srt';
                    alert('File ready');
                } else if (this.status === 200 && getDownloadCheck().checked) {
                    templateObject.audio.uri = this.responseText;
                    getOutputElement().value = JSON.stringify(templateObject, null, 2);
                    alert('JSON ready');
                } else {
                    alert('Something happened');
                    getOutputElement().value = this.responseText;
                }
            }
        };
        setTimeout(() => {
            if (!finishedSets.has(currentPetition)) {
                enablePage();
                alert('Function Timeouted, please check the output box and follow the "for long clips" instructions');
                getOutputElement().value = 'https://gist.github.com/LuisMayo/8e7b95dee866841b218e046ddebb4028';
            }
        }, 16 * 60 * 1000);
        var requestPayload = {
            fileName: name,
            url: urlMedia,
            encodedFile: inputFile,
            language_code: language,
            onlyDownload: onlyDownload.checked,
            speechContexts: [
                {
                    "phrases": words
                }
            ]
        };
        templateObject.config.language_code = language;
        templateObject.config.speechContexts[0].phrases = words;
        disablePage();
        request.open('POST', urlBack);
        request.send(JSON.stringify(requestPayload));
    }
}

function getOutputElement() {
    return document.getElementById('out');
}

function enablePage() {
    forAllInputs((item) => item.disabled = false);
    document.getElementById('language').disabled = false;
    document.getElementById('speech').disabled = false;
    document.getElementById('button').disabled = false;
}

function disablePage() {
    forAllInputs((item) => item.disabled = true);
    document.getElementById('language').disabled = true;
    document.getElementById('speech').disabled = true;
    document.getElementById('button').disabled = true;
}


function forAllInputs(fn) {
    const inputs = document.getElementsByTagName('input');
    for (let i = 0; i< inputs.length; i++) {
        const input = inputs.item(i);
        fn(input);
    }
}

function getActionButton() {
    return document.getElementById("button");
}

function getDownloadCheck() {
    return document.getElementById('down');
}

function switchOnlyDownload() {
    if (document.getElementById('down').checked) {
        getActionButton().innerHTML = 'Trigger download and FLAC conversion';
    } else {
        getActionButton().innerHTML = 'Generate SRT';
    }
    setHashOfCheck(document.getElementById('down').checked);
}

window.onload = function() {
    // Load URL params
    for(const param of this.params.hash.entries()) {
        let item = document.getElementById(param[0]);
        if (item) {
            if (param[0] === 'language' && param[1] === 'other') {
                switchManualLanguage(param[1]);
            }

            if (item.type === 'checkbox') {
                item.checked = param[1] === 'true'
                switchOnlyDownload()
            } else {
                item.value = param[1];
            }  
        }
    }
    // Change URL to represent current status
    this.document.body.addEventListener('keyup', this.updateFieldOfURL);
    this.document.body.addEventListener('click', this.updateFieldOfURL);
}

function changeLanguageCombo(event) {
    switchManualLanguage(event.target.value);
}

function switchManualLanguage(value) {
    if (value === 'other') {
        document.getElementById('manualLanguage').style.display = 'inline-block';
    }
    else {
        document.getElementById('manualLanguage').style.display = 'none';
    }
}

function updateFieldOfURL(event) {
    if (event.target.value) {
        if (event.target.type === 'checkbox') {
            return;
        } else {
            params.hash.set(event.target.id, event.target.value);
        }
    } else {
        params.hash.remove(event.target.id);
    }
    document.location.hash = params.toString();
}

function setHashOfCheck(event) {
    params.hash.set('down', event ? 'true' : 'false');
    document.location.hash = params.toString();
}
