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
                return `
                    <div class="bg-black my-4">
                        <img class="object-contain max-h-[400px] max-md:max-h-[300px] max-sm:max-h-[200px]  max-w-full m-auto" src="${source}" />
                    </div>
                `
            },
            callToAction: ({value, isInline}) =>
                isInline
                    ? `<a href="${value.url}">${value.text}</a>`
                    : `<div class="callToAction">${value.text}</div>`,
        },
        listItem: {
            bullet: ({children}) => {
                return `<li class="list-disc list-inside">${children}</li>`
            },
            number: ({children}) => {
                return `<li class="list-decimal list-inside">${children}</li>`
            }
        },
        block: {
            normal: ({children}) => {
                return `<p class="indent-3">${children}</p>`
            },
            h1: ({children}) => {
                return `<h1 class="text-5xl font-bold my-3">${children}</h1>`
            },
            h2: ({children}) => {
                return `<h2 class="text-4xl font-semibold my-3">${children}</h2>`
            },
            h3: ({children}) => {
                return `<h3 class="text-3xl font-semibold my-3">${children}</h3>`
            },
            h4: ({children}) => {
                return `<h4 class="text-2xl font-medium my-2">${children}</h4>`
            },
            h5: ({children}) => {
                return `<h5 class="text-xl font-medium my-2">${children}</h5>`
            },
            h6: ({children}) => {
                return `<h6 class="text-lg font-medium my-2">${children}</h6>`
            },
            blockquote: ({children}) => {
                return `
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
                    return includeChildren
                }
        
                // If the URI appears unsafe, render the children (eg, text) without the link
                return children
            }, 
            internalLink: ({children, value}) => {
                
                const href = value.href || ''
        
                if (uriLooksSafe(href)) {
                    const rel = href.startsWith('/') ? undefined : 'noreferrer noopener'
                    return `<a href="${href}" rel="${rel}" class="underline">${children}</a>`
                }
        
                // If the URI appears unsafe, render the children (eg, text) without the link
                return children
            },    
            color: ({children, value}) => { 
                return `<span class="text-[${value.hex}]">${children}</span>`
            },
            code: ({children}) => { 
                return `<code class="bg-gray-200 rounded-md">${children}</code>`
            },
            del: ({children}) => {
                return `<del>${children}</del>`
            },
            strong: ({children}) => {
                return `<strong>${children}</strong>`
            },
            em: ({children}) => {
                return `<em>${children}</em>`
            },
            underline: ({children}) => {
                return `<u>${children}</u>`
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
        <div class="bg-black my-4">
            <img class="object-contain max-h-[400px] max-md:max-h-[300px] max-sm:max-h-[200px]  max-w-full m-auto" src="${source}" />
            ${captiondiv}
        </div>
    `
}
const handleTextSection = comp => {
    const portableHandle = handlePortable(comp)
    const heading = comp.heading ? `<h2 class="text-4xl font-semibold my-3">${comp.heading}</h2>` : null
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