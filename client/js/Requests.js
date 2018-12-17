function requestConnectionInfo(callback) {
    var req = new XMLHttpRequest();
    req.open('GET', document.location + "connector");

    req.onreadystatechange = function () {
        console.log('the response text was', req)

        if (req.readyState == 4 && req.status == 200) {
            var data = JSON.parse(req.responseText);
            callback(null, data);
        } else {
            callback(true)
        }
    };
    req.send();
}