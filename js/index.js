function display(str, elemId) {
    var id = elemId || 'debug';
    document.getElementById(id).value = str;
}

function createAsyncDisplay() {
    var buf = [];
    var waiting = false;
    return function (charDesc) {
        buf.push(charDesc.chr + charDesc.gbkcode + JSON.stringify(charDesc.bitmap));
        if (!waiting) {
            waiting = true;
            setTimeout(function () {
                display(buf.join('\n'));
                waiting = false;
            }, 10)
        }
    }
}

function generateCode(template, data) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', template, true);
    xhr.onreadystatechange = function (event) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
		var template = xhr.responseText;
		ejs.filters.hex = function (obj) {
		    return '0x' + obj.toString(16);
		}
		display(ejs.render(template, data), 'code');
            } else {
                console.log("Error", xhr.statusText);
            }
        }
    };
    xhr.send();
}

var fontData = convertTable(gbk2uni, createAsyncDisplay());
display(JSON.stringify(fontData), 'json');
generateCode('src.ejs', fontData);
