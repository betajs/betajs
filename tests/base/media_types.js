QUnit.module("MediaTypes", function() {

    var mime = BetaJS.MediaTypes;
    
    QUnit.module("getExtension", function() {

        QUnit.test("returns extension for media type", function(assert) {
            assert.equal(mime.getExtension("video/mp4"), "mp4");
        });

        QUnit.test("returns extension for media type with parameters", function(assert) {
            assert.equal(mime.getExtension("video/webm;codecs=vp9"), "webm");
        });

        QUnit.test("is case insensitive", function(assert) {
            assert.equal(mime.getExtension("image/GIF"), "gif");
        });

        QUnit.test("returns false on invalid or unknown media type", function(assert) {
            assert.equal(false, mime.getExtension("video/no-bueno"));
            assert.equal(false, mime.getExtension("vido/webm"));
            assert.equal(false, mime.getExtension());
            assert.equal(false, mime.getExtension({}));
            assert.equal(false, mime.getExtension(null));
            assert.equal(false, mime.getExtension(-1));
            assert.equal(false, mime.getExtension(false));
            assert.equal(false, mime.getExtension(true));
            assert.equal(false, mime.getExtension(""));
        });
    });

    QUnit.module("getType", function() {

        QUnit.test("returns media type for extension", function(assert) {
            assert.equal("audio/ogg", mime.getType("ogg"));
        });

        QUnit.test("returns media type for filename", function(assert) {
            assert.equal("video/x-flv", mime.getType("file.flv"));
        });
        
        QUnit.test("returns media type for path", function(assert) {
            assert.equal("video/x-matroska", mime.getType("/home/file.mkv"));
            assert.equal("image/jpeg", mime.getType("C:\\home\\file.jpg"));
        });

        QUnit.test("is case insensitive", function(assert) {
            assert.equal("audio/x-wav", mime.getType("WAV"));
        });

        QUnit.test("returns false on invalid or unknown argument", function(assert) {
            assert.equal(false, mime.getType());
            assert.equal(false, mime.getType({}));
            assert.equal(false, mime.getType(null));
            assert.equal(false, mime.getType(-1));
            assert.equal(false, mime.getType(true));
            assert.equal(false, mime.getType(false));
            assert.equal(false, mime.getType(""));
            assert.equal(false, mime.getType("fake"));
        });
    });
});