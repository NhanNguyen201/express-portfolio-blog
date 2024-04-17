// "/product//" => "/product/"
function removeDoubleSlashes(path) {
    return path.replace(/\/{2,}/g, '/')
}
  
  // "contact/" => "/contact/"
exports.getPathFromSlug = (slug) => {
    return removeDoubleSlashes(`/${slug || ''}`)
}
  
  // "/about" => "https://my-site.com/about"
exports.slugToAbsUrl = (slug, baseUrl) => {
    return baseUrl + getPathFromSlug(slug)
}
  
  /**
   * Transforms a single slug into an array of its possible variations.
   *
   * As editors can include leading and/or trailing slashes in routes' slugs,
   * we need to normalize them before searching routes by slug.
   */
exports.getSlugVariations =(slug) => {
    const slashless = slug.replace(/\//g, '')
    const joinSlug = slug.split('/').join('/')
    return [
      joinSlug,
      slashless,
      // /slash-on-both-ends/
      `/${slashless}/`,
      // trailing/
      `${slashless}/`,
      // /leading
      `/${slashless}`,
    ]
}
  
exports.slugParamToPath=(slugParam)=> {
    // Possible slug value types:
    const slug = Array.isArray(slugParam)
      ?  slugParam.join('/')
      : (
        slugParam || '/'
      )
    return slug
}