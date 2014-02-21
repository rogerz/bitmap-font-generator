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

function preview(charDesc) {
    var tgtCanvas = document.createElement('canvas');
    var target = document.getElementById('target');
    target.appendChild(tgtCanvas);

    var ctx = tgtCanvas.getContext('2d');

    // render the char
}

function extractBitmap(chr, font, px) {
    // TODO: correct bitmap extraction
    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = px;

    // DEBUG
    var source = document.getElementById('source');
    source.appendChild(srcCanvas);

    var ctx = canvas.getContext('2d');
    ctx.font = px + 'px ' + font;
    ctx.textBaseline = 'bottom';
    ctx.fillText(chr, 0, px);

    var data = ctx.getImageData(0, 0, px, px).data;
    var bitmap = [];
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

    var size = bitmap.length + 4;       /* size, width, height, ascent */
    var msb = size >> 0x8;
    var lsb = size & 0xFF;

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
        paged.push({page: parseInt(page), chars:indexed[page]});
    });

    return paged;
}

function createCharDesc (gbkcode, fontDesc, gbk2uni) {
    var unicode = gbk2uni[gbkcode];
    var chr = String.fromCharCode(unicode);

    var charDesc = extractBitmap(chr, fontDesc.name, fontDesc.px);
    charDesc.page = Math.floor(unicode / 0x100);
    charDesc.index = Math.floor(unicode & 0xff)
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
        name: 'SimSun',
        px: 12
    };
    var fontTable = [];

    var limit = 300;
    for (var gbkcode in gbk2uni) {
        var charDesc = createCharDesc(parseInt(gbkcode), fontDesc, gbk2uni);
        fontTable.push(charDesc);
        if (typeof iterFn === 'function') {
            iterFn(charDesc);
        }
        if (limit-- <=0) break;
    }

    fontDesc.pxMin = fontDesc.pxMax = fontDesc.px;
    fontDesc.faceName = fontDesc.familyName = fontDesc.name;
    fontDesc.leading = 1;
    fontDesc.maxAscent = fontDesc.px;
    fontDesc.maxDecent = 0;
    fontDesc.maxAdvance = fontDesc.px;

    return {
        desc: fontDesc,
        pages: paginate(fontTable)
    };
}
