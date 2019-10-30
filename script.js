var file;

function makeRequest() {
    var urlBack = document.getElementById('back').value;
    var urlMedia = document.getElementById('media').value;
    var name = document.getElementById('name').value;
    var language = document.getElementById('language').value;
    var speech = document.getElementById('speech').value;
    var button = document.getElementById("button")

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
    }
    if (speech) {
        speech = speech.trim()
    }

    if (!urlBack  || !urlMedia || !name) {
        alert('There are some required fields not filled');
        return;
    }
    var words = speech.split(',');
    var link = document.getElementById('link')

    var request = new XMLHttpRequest()
    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            document.getElementById('out').value = this.responseText;
            button.disabled = false;
            if (this.status === 200) {
                file = new Blob([this.responseText], { type: "text/plain;charset=utf-8" })
                link.href = URL.createObjectURL(file);
                link.download = name + '.srt'
                alert('File ready');
            } else {
                alert('Something happened')
            }
        }
    }
    var requestPayload = {
        fileName: name,
        url: urlMedia,
        language_code: language,
        speechContexts: [
            {
                "phrases": words
            }
        ]
    }
    button.disabled = true;
    request.open('POST', urlBack)
    request.send(JSON.stringify(requestPayload));
}
