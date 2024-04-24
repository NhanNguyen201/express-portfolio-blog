const mcache = require('memory-cache');
exports.cache = () => {
    return (req, res, next) => {
        let key = '__express__' + req.originalUrl || req.url
        let cachedBody = mcache.get(key)
        if(cachedBody) {
            return res.render("slug", {...cachedBody})
        } else next()
    }
}