const mcache = require('memory-cache');
exports.cache = (req, res, next) => {
    if(process.env.NODE_ENV === 'development') next()
    let key = '__express__' + req.originalUrl || req.url
    let cachedBody = mcache.get(key)
    req.pageData = (cachedBody && Object.keys(cachedBody).length > 0) ? cachedBody : {}

    next()
}