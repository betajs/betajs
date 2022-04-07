Scoped.define("module:MediaTypes", [
    "module:Objs",
    "module:Types"
], function(Objs, Types) {

    /**
     * Helper module for working with media types (MIME types)
     *
     * @module BetaJS.MediaTypes
     */
    return {

        /**
         * Get first matching extension for media type.
         *
         * @param {string} mediaType
         *
         * @returns {string} extension that matches given media type.
         */
        getExtension: function(mediaType) {
            var extensions = this.getExtensions(mediaType);
            return extensions && Objs.peek(extensions);
        },

        /**
         * Get all matching extensions for media type.
         *
         * @param {string} mediaType
         *
         * @return {Array} array of extensions that match given media type.
         */
        getExtensions: function(mediaType) {
            if (!Types.is_string(mediaType) || mediaType.length == 0) {
                return false;
            }
            return this._getAll()[mediaType.split(';')[0].toLowerCase()] || false;
        },

        /**
         * Returns content type from path or extension.
         *
         * @param {string} path
         *
         * @return {string} media type
         */
        getType: function(path) {
            if (!Types.is_string(path)) {
                return false;
            }
            return this._getAll()[path.split(".").pop().toLowerCase()] || false;
        },

        _getAll: function() {
            if (!this._DB) {
                this._DB = Objs.bidirectionalMap(this._types);
            }
            return this._DB;
        },

        _types: {
            "application/vnd.apple.mpegurl": ["m3u8"],
            "audio/midi": ["midi", "mid", "kar"],
            "audio/mpeg": ["mp3"],
            "audio/ogg": ["ogg"],
            "audio/webm": ["weba"],
            "audio/x-aac": ["aac"],
            "audio/x-flac": ["flac"],
            "audio/x-m4a": ["m4a"],
            "audio/x-realaudio": ["ra"],
            "audio/x-wav": ["wav"],
            "audio/x-ms-wma": ["wma"],
            "image/gif": ["gif"],
            "image/jpeg": ["jpeg", "jpg"],
            "image/png": ["png"],
            "image/svg+xml": ["svg", "svgz"],
            "image/tiff": ["tif", "tiff"],
            "image/vnd.wap.wbmp": ["wbmp"],
            "image/webp": ["webp"],
            "image/x-icon": ["ico"],
            "image/x-jng": ["jng"],
            "image/x-ms-bmp": ["bmp"],
            "video/3gpp": ["3gpp", "3gp"],
            "video/3gpp2": ["3g2"],
            "video/mp2t": ["ts"],
            "video/mp4": ["mp4"],
            "video/mpeg": ["mpeg", "mpg"],
            "video/quicktime": ["mov"],
            "video/webm": ["webm"],
            "video/x-flv": ["flv"],
            "video/x-m4v": ["m4v"],
            "video/x-matroska": ["mkv", "mk3d", "mks"],
            "video/x-mng": ["mng"],
            "video/x-ms-asf": ["asx", "asf"],
            "video/x-ms-wmv": ["wmv"],
            "video/x-msvideo": ["avi"]
        }
    };
});