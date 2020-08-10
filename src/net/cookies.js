Scoped.define("module:Net.Cookies", ["module:Objs", "module:Types"], function(Objs, Types) {
    return {

        getCookielikeValue: function(cookies, key) {
            cookies = cookies || "";
            return decodeURIComponent(cookies.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
        },

        /**
         *
         * @param {string} key
         * @param {string} value
         * @param {Date} end
         * @param {string} path
         * @param {string} domain
         * @param {boolean} secure
         * @param {string} sameSite
         * @return {null|*}
         */
        createCookielikeValue: function(key, value, end, path, domain, secure, sameSite) {
            if (!key || /^(?:expires|max\-age|path|domain|secure)$/i.test(key))
                return null;
            var components = [];
            components.push([encodeURIComponent(key), encodeURIComponent(value)]);
            if (end) {
                if (end === Infinity)
                    components.push(["expires", "Fri, 31 Dec 9999 23:59:59 GMT"]);
                else if (typeof end === "number")
                    components.push(["max-age", end]);
                else if (typeof end === "object")
                    components.push(["expires", end.toUTCString()]);
                else
                    components.push(["expires", end]);
            }
            if (domain)
                components.push(["domain", domain]);
            if (path)
                components.push(["path", path]);
            if (secure)
                components.push("secure");
            // Any cookie that requests SameSite=None but is not marked Secure will be rejected.
            sameSite = sameSite || 'None';
            components.push("SameSite", sameSite);
            return Objs.map(components, function(component) {
                return Types.is_array(component) ? component.join("=") : component;
            }).join("; ");
        },

        removeCookielikeValue: function(key, value, path, domain) {
            return this.createCookielikeValue(key, value, new Date(0), path, domain);
        },

        hasCookielikeValue: function(cookies, key) {
            return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(cookies);
        },

        keysCookielike: function(cookies) {
            var base = cookies.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
            return Objs.map(base, decodeURIComponent);
        }

    };
});