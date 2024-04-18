const htm =  require('htm')
const vhtml = require('vhtml')
const {toHTML, uriLooksSafe}= require('@portabletext/to-html')
const { urlFor } = require('./saniyClient')
const html = htm.bind(vhtml)
const handlePortable = comp => {
    const myPortableTextComponents = {
        types: {
            image: ({value}) => {
                const source = urlFor(value.asset).url()
                const includeChildren = `<img class="object-center object-cover max-h-[600px] w-full my-4" src="${source}" />`
                return html`${includeChildren}`
            },
            callToAction: ({value, isInline}) =>
                isInline
                    ? html`<a href="${value.url}">${value.text}</a>`
                    : html`<div class="callToAction">${value.text}</div>`,
        },
        listItem: {
            bullet: ({children}) => {
                const includeChildren = `<li class="list-disc list-inside">${children}</li>`
                return html`${includeChildren}`
            },
            number: ({children}) => {
                const includeChildren = `<li class="list-decimal  list-inside">${children}</li>`
                return html`${includeChildren}`
            }
        },
        block: {
            // normal: ({children}) => {
            //     let includeChildren = `<p>${children}</p>`
            //     return html`${includeChildren}`
            // },
            h1: ({children}) => {
                return html`<h1 class="text-5xl font-extrabold">${children}</h1>`
            },
            h2: ({children}) => {
                return html`<h2 class="text-4xl font-bold">${children}</h2>`
            },
            h3: ({children}) => {
                return html`<h3 class="text-3xl font-bold">${children}</h3>`
            },
            h4: ({children}) => {
                return html`<h4 class="text-2xl font-bold">${children}</h4>`
            },
            h5: ({children}) => {
                return html`<h5 class="text-xl font-bold">${children}</h5>`
            },
            h6: ({children}) => {
                return html`<h6 class="text-lg font-bold">${children}</h6>`
            },
            blockquote: ({children}) => {
                return html`
                <blockquote class="text-xl italic font-semibold text-gray-900 dark:text-white">
                    <p>"${children}"</p>
                </blockquote>`
            },
    
        },
        marks: {
            link: ({children, value}) => {
    
                const href = value.href || ''
        
                if (uriLooksSafe(href)) {
                    const rel = href.startsWith('/') ? undefined : 'noreferrer noopener'
                    const includeChildren = `<a href="${href}" rel="${rel}" class="underline">${children}</a>`
                    return html`${includeChildren}`
                }
        
                // If the URI appears unsafe, render the children (eg, text) without the link
                return html`${children}`
            }, 
            internalLink: ({children, value}) => {
                
                const href = value.href || ''
        
                if (uriLooksSafe(href)) {
                    const rel = href.startsWith('/') ? undefined : 'noreferrer noopener'
                    const includeChildren = `<a href="${href}" rel="${rel}" class="underline">${children}</a>`
                    return html`${includeChildren}`
                }
        
                // If the URI appears unsafe, render the children (eg, text) without the link
                return html`${children}`
            },    
            color: ({children, value}) => { 
                let includeChildren = `<span class="text-[${value.hex}]">${children}</span>`
                return html`${includeChildren}`
            },
            code: ({children}) => { 
                let includeChildren = `<code class="bg-gray-200 rounded-md">${children}</code>`
                return html`${includeChildren}`
            },
            del: ({children}) => {
                return html`<del>${children}</del>`
            },
            strong: ({children}) => {
                return html`<strong>${children}</strong>`
            },
            em: ({children}) => {
                return html`<em>${children}</em>`
            },
            underline: ({children}) => {
                return html`<u>${children}</u>`
            }
        },
    }
    let toHtml = toHTML(comp.contentText, {components: myPortableTextComponents})
    
    return toHtml
}
const handleFigure = comp => {
    const source = urlFor(comp.asset).url()
    const captiondiv = comp.caption ? html`<div class="p-2 text-center bg-gray-300">${comp.caption}</div>` : null
    return html`
        <div class="my-4">
            <img class="object-center object-cover max-h-[600px] w-full" src="${source}" />
            ${captiondiv}
        </div>
    `
}
const handleTextSection = comp => {
    const portableHandle = handlePortable(comp)
    const heading = comp.heading ? `<h2 class="text-4xl my-4 font-bold">${comp.heading}</h2>` : null
    // return  html`${heading}` + html`${portableHandle}`
    const mix = `
        <div class="my-4">
            <div class="bg-gray-300 py-1 px-2 mb-4">
                ${heading}
            </div>
            ${portableHandle}
        </div>
    `        
    return html`${mix}`
          
}
exports.componentHandler  = (component) => {
    const componentToHandle = [
        {
            type: 'simplePortableText',
            handler: comp => {
                return handlePortable(comp)
            }
        },
        {
            type: 'figure',
            handler: comp => {
                return handleFigure(comp)
            }
        },
        {
            type: 'textSection',
            handler: comp => {
                return handleTextSection(comp)
            }
        },
    ]
    // console.log("components: ", component)
    const idx = componentToHandle.findIndex(i => i.type === component._type)
    if(idx > -1) {
        return componentToHandle[idx].handler(component)
    } else return null
}

exports.handlePosts = (posts) => {
    const handled = posts.map(p => {
        
        const link = `/${p.link.slug.current}`
        const includeChildren = `
            <div class="text-black bg-white rounded-md m-3 min-w-[400px] max-w-[460px] max-lg:max-w-[400px]">
                <h4 class="px-4 py-2 text-2xl font-bold">${p.title}</h4>
                <div class="border-t-2 border-gray-300"></div>
                <div class="px-2 py-3">
                    <p>${p.content}</p>
                </div>
                <div class="border-t-2 border-gray-300"></div>
                <div class="px-2 py-1 text-right">
                    <a href="${link}" target="_blank" rel="noopener noreferrer" class=" underline">To the blog page</a>
                </div>
            </div>
        `
        return html`${includeChildren}`
    })
    
    return handled
}