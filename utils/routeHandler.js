const { slugParamToPath, getSlugVariations } = require("./slugs");
const { client} = require('./saniyClient')
const groq = require('groq')
const {componentHandler, handlePosts} = require('./components')
exports.indexRoute = async(_, res) => {
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
            posts: null 
        }
        data = await client.fetch(gr)
        if(data) {
            page.introduce = data.introduce ? componentHandler(data.introduce) : null
            page.posts = data.posts ? handlePosts(data.posts) : null
        } 
        return res.render('index', {page})
    } catch (error) {
        return res.render('index', {page: {}})
    }
}
exports.slugRoute = async(req, res) => {
    let data
    const skip = ['favicon.ico']
    if(!skip.includes(req.params[0])){
        const slug = slugParamToPath(req.params[0])
        const slugVariations = getSlugVariations(slug)
        const gr = groq`*[_type == "route" && slug.current in $possibleSlugs][0]{
            slug,
            page-> {
                title,
                content[]
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
                    let contents = data.page.content.map(c => componentHandler(c))
                    return res.render("slug", {title: data.page.title, contents})
                } else {
                    return res.render("slug", {contents: ["<p>Sorry, this page is empty</p>"]})
                }
            }
            
        } catch (error) {
            return res.render('404')
        }
    } else{
        return res.send("hi")
    }
}