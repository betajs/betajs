BetaJS = require("../../../dist/beta-server.js");

var db = new BetaJS.Databases.MongoDatabase({
    database: "betajs-test"
}, {
    sync: false,
    async: true
});

base = new BetaJS.Stores.MemoryStore();
for (var i = 1; i <= 10; ++i)
    for (var j = 1; j <= 10; ++j)
        base.insert({i: i, j: j});
query_store = new BetaJS.Stores.MongoDatabaseStore(db, "test-query-store");
cache_store = new BetaJS.Stores.MongoDatabaseStore(db, "test-cache-store", {}, "foreign_id");
cache_query_model = new BetaJS.Queries.StoreQueryModel(query_store);
dual = new BetaJS.Stores.CachedStore(base, {
    cache_store: cache_store,
    cache_query_model: cache_query_model,
    invalidation: {
        reload_after_first_hit: true
    }
});
hit = 0;
miss = 0;
invalidate = 0;
dual.on("invalidate_query", function () {
   invalidate++; 
});
dual.cache().on("query_hit", function () {
   hit++;
});
dual.cache().on("query_miss", function () {
   miss++;
});
cache_query_model.initialize({success: function () {
    dual.query({}, {}, {success: function (result) {
        result = result.asArray();
        console.log(result.length);
        console.log(hit, 1);
        console.log(miss, 1);
        console.log(invalidate, 0);
        return;
        dual.query({}, {}, {success: function (result2) {
            result2 = result2.asArray(); 
            console.log(result.length, result2.length);
            console.log(hit, 1);
            console.log(miss, 1);
            console.log(invalidate, 0);
            dual.destroy();
            dual = new BetaJS.Stores.CachedStore(base, {
                cache_store: cache_store,
                cache_query_model: cache_query_model,
                invalidation: {
                    reload_after_first_hit: true
                }
            });
            dual.on("invalidate_query", function () {
               invalidate++;
            });
            dual.query({}, {}, {success: function (result3) {
                result3 = result3.asArray();
                BetaJS.SyncAsync.eventually(function () {
                    console.log(result.length, result3.length);
                    console.log(hit, 2);
                    console.log(miss, 2);
                    console.log(invalidate, 1);
                    dual.query({}, {}, {success: function (result4) {
                        result4 = result4.asArray();
                        console.log(result.length, result4.length);
                        console.log(hit, 3);
                        console.log(miss, 2);
                        console.log(invalidate, 1);
                    }});
                });
            }});
        }});
    }});
}});