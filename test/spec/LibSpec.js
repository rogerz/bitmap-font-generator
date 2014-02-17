var expect = chai.expect;

describe('Font Converter', function () {
    it('should export gbk2uni table', function () {
	expect(gbk2uni).to.exist;
	expect(gbk2uni).to.be.an('object');
    });
    it('should extract bitmap of Chinese charactor', function () {
	var charDesc = extractBitmap('ËÎ', 'song', 12);
	expect(charDesc.bitmap).to.be.instanceof(Array);
    });
    it('should create desc for Chinese charactor', function () {
	var fontDesc = {
	    name: 'song',
	    px: 12
	};
	var charDesc = createCharDesc (0x4e00, fontDesc, gbk2uni);
	expect(charDesc.page).to.exist;
	expect(charDesc.index).to.exist;
    });
    it('should create a font table', function () {
	var fontTable = convertTable(gbk2uni);
	expect(fontTable).to.have.property('desc');
	expect(fontTable).to.have.property('table');
    });
    it('should paginate and sort the table', function () {
	var unsorted = [
	    {page: 10, index: 10},
	    {page: 10, index: 2},
	    {page: 2, index: 10},
	    {page: 2, index: 2}
	];
	var sorted = paginate(unsorted);
	var expected = [
	    {page: 2, table:[{page: 2, index: 2},{page: 2, index: 10}]},
	    {page: 10, table:[{page: 10, index: 2},{page: 10, index: 10}]}
	];
	expect(sorted).to.eql(expected);
    });
});


