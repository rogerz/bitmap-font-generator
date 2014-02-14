// uni2gbk[unicode] = gbkcode
var uni2gbk = (function () {
    var tbl = {};
    for (var i in gbk2uni) {
        tbl[gbk2uni[i]] = i;
    }
    return tbl;
})(gbk2uni);

function convertString(str) {
    return 'string converted';
}

function preview(str) {
    document.getElementById('output').value = str;
}

function extractBitmap(chr, font, px) {
    // TODO: correct bitmap extraction
    var canvas = document.getElementById('debug');
    var ctx = canvas.getContext('2d');
    var bitmap = [];

    // clear canvas
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0 ,0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.font = px + 'px ' + font;
    ctx.textBaseline = 'top';
    ctx.fillText(chr, 0, 0);

    var data = ctx.getImageData(0, 0, px, px).data;
    // data = [r, g, b, a, r, g, b, a, ...]
    for (var i = 0, len = data.length; i < len; i = i + 4) {
        // pixel index
        var p = Math.floor(i / 4);
        // byte index
        var b = Math.floor(p / 8);
        // remainder
        var r = p - b * 8;

        var dot = data[i + 3] > 0 ? 1 : 0; // check non zero
        if (dot) {
            if (bitmap[b] === undefined) {
                bitmap[b] = 0;
            }
            bitmap[b] = bitmap[b] + (dot << r);
        }
    }

    var msb = Math.floor(bitmap.length / 0x100) & 0xFF;
    var lsb = bitmap.length & 0xFF;

    return {
        sizeMSB: msb,
        sizeLSB: lsb,
        width: px,
        height: px,
        ascent: px,
        bitmap: bitmap
    };
}

function convertTable (outputFn) {
    var font = 'song';
    var px = 12;

    var limit = 10;
    for (var gbkcode in gbk2uni) {
        var unicode = gbk2uni[gbkcode];
        var chr = String.fromCharCode(unicode);
        if (typeof outputFn === 'function') {
	    var fontDesc = extractBitmap(chr, font, px);
	    fontDesc.page = Math.floor(gbkcode / 0x100);
	    fontDesc.index = Math.floor(gbkcode % 0xff)
            outputFn(chr + ' ' + gbkcode + JSON.stringify(fontDesc));
        }
        
        if (limit-- <=0) break;
    }
}

convertTable(function () {
    var buf = [];
    var waiting = false;
    return function (str) {
        buf.push(str);
	if (!waiting) {
	    waiting = true;
            setTimeout(function () {
		preview(buf.join('\n'));
		waiting = false;
            }, 10)
	}
    }
}());
