function preview(str, elemId) {
    var id = elemId || 'output';
    document.getElementById(id).value = str;
}

function createAsyncPreview() {
    var buf = [];
    var waiting = false;
    return function (charDesc) {
        buf.push(charDesc.chr + charDesc.gbkcode + JSON.stringify(charDesc.bitmap));
        if (!waiting) {
            waiting = true;
            setTimeout(function () {
                preview(buf.join('\n'));
                waiting = false;
            }, 10)
        }
    }
}

var fontData = convertTable(createAsyncPreview());
preview(JSON.stringify(fontData), 'json');
