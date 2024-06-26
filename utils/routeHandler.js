const { slugParamToPath, getSlugVariations } = require("./slugs");
const { client} = require('./saniyClient')
const groq = require('groq')
const {componentHandler, handlePosts} = require('./components')
const {seoHandler} = require('./seoHandler')
const mcache = require('memory-cache');

exports.indexRoute = async(req, res) => {
    if(req.pageData && Object.keys(req.pageData).length > 0) return res.render("index", {...req.pageData})
    let data;
    const gr = groq`*[_type == "indexPage"] | order(createdAt desc)[0]{
        title,
        introduce,
        posts[] {
          title,
          content,
          link-> {
            slug {
              current
            }
          }
        },
    }`
    try {
        let page = {
            introduce: null,
            posts: [] 
        }
        data = await client.fetch(gr)
        if(data) {
            let key = '__express__' + req.originalUrl || req.url
            page.introduce = data.introduce ? componentHandler(data.introduce) : null
            page.posts = data.posts ? handlePosts(data.posts) : []
            mcache.put(key, page, 15 * 60 * 1000 )
        } 
        return res.render('index', {...page})
    } catch (error) {
        return res.render('index', {
            introduce: null,
            posts: [] 
        })
    }
}
exports.slugRoute = async(req, res) => {
    if(req.pageData && Object.keys(req.pageData).length > 0)  return res.render("slug", {...req.pageData})
    let data
    const skip = ['favicon.ico']
    if(!skip.includes(req.params[0])){
        const slug = slugParamToPath(req.params[0])
        const slugVariations = getSlugVariations(slug)
        const gr = groq`*[_type == "route" && slug.current in $possibleSlugs][0]{
            slug,
            page-> {
                title,
                content[],
                description,
                openGraphImage
            },

        }`
        try {
            data = await client.fetch(
                gr,
                {possibleSlugs: slugVariations}
            )
            if(!data) {
                return res.render('404')
            } else {
                if(data.page.content.length > 0) {
                    if(req.params[0] !== data.slug.current) {
                        return res.redirect(200, `/${data.slug.current}`)
                    }
                    let contents = data.page.content.map(c => componentHandler(c))
                    const seoParams = {
                        title:  data.page.title,
                        openGraphImage: data.page.openGraphImage,
                        description: data.page.description,
                        canonical: `https://${req.headers.host}/${data.slug.current}`
                    }
                    const seo = seoHandler(seoParams)
                    const pageData = {title: data.page.title, contents, seo}
                    let key = '__express__' + req.originalUrl || req.url
                    mcache.put(key, pageData, 15 * 60 * 1000 )

                    return res.render("slug", {...pageData})
                } else {
                    return res.render("slug", {contents: ["<p>Sorry, this page is empty</p>"]})
                }
            }
            
        } catch (error) {
            console.log("Error: ", error)
            return res.render('404')
        }
    } else{
        return res.send("hi")
    }
}