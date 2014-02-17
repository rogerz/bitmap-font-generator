describe('Font Converter', function () {
    it('should extract bitmap of Chinese charactor', function () {
	var charDesc = extractBitmap('кн', 'song', 12);
	expect(charDesc.bitmap).toBeDefined();
    });
    it('should create a font table', function () {
	var fontTable = convertTable();
	expect(fontTable.desc).toBeDefined();
	expect(fontTable.table).toBeDefined();
    });
});

