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

function extractBitmap(chr, font, px) {
    // TODO: correct bitmap extraction
    var canvas = document.createElement('canvas');
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

/*
@return [Array]pagedTable [{page: integer, table: []},...];
*/
function paginate(fontTable) {
    var indexed = {};
    var paged = [];

    fontTable.forEach(function (charDesc) {
        var page = charDesc.page;
        if (indexed[page] === undefined) {
            indexed[page] = [charDesc];
        } else {
            indexed[page].push(charDesc);
        }
    });

    for (page in indexed) {
        indexed[page] = indexed[page].sort(function (a, b) {
            return a.index - b.index;
        });
    }

    Object.keys(indexed).sort(function (a, b) {
        return a - b;
    }).forEach(function (page) {
        paged.push({page: parseInt(page), table:indexed[page]});
    });

    return paged;
}

function createCharDesc (gbkcode, fontDesc, gbk2uni) {
    var unicode = gbk2uni[gbkcode];
    var chr = String.fromCharCode(unicode);

    var charDesc = extractBitmap(chr, fontDesc.name, fontDesc.px);
    charDesc.page = Math.floor(gbkcode / 0x100);
    charDesc.index = Math.floor(gbkcode % 0xff)
    charDesc.chr = chr;
    charDesc.gbkcode = gbkcode;
    charDesc.unicode = unicode;

    return charDesc;
}

// @param [Object]codeTable charactor mapping from gbk to unicode
// @param [function]iterFn iterator function to be called on each charactor
function convertTable (codeTable, iterFn) {
    var gbk2uni = codeTable;
    var fontDesc = {
        name: 'song',
        px: 12
    };
    var fontTable = [];

    var limit = 300;
    for (var gbkcode in gbk2uni) {
        var charDesc = createCharDesc(gbkcode, fontDesc, gbk2uni);
        fontTable.push(charDesc);
        if (typeof iterFn === 'function') {
            iterFn(charDesc);
        }
        if (limit-- <=0) break;
    }

    return {
        desc: fontDesc,
        table: paginate(fontTable)
    };
}
