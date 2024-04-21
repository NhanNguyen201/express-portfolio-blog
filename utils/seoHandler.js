const htm =  require('htm')
const vhtml = require('vhtml')
const { urlFor } = require('./saniyClient')

const html = htm.bind(vhtml)

exports.seoHandler = (seoInfo) => {
    const seoImage = seoInfo.openGraphImage ? 
    `
        <meta property="og:image" content="${urlFor(seoInfo.openGraphImage.asset).width(600).height(400).format('jpg').crop('focalpoint').url()}">
        <meta property="og:image:width" content="600">
        <meta property="og:image:height" content="400">
        <meta property="og:image:type" content="image/jpeg">
    ` : `
        <meta property="og:image" content="./vite.svg">
        <meta property="og:image:width" content="500">
        <meta property="og:image:height" content="500">
        <meta property="og:image:type" content="image/jpeg">
    `
    const seoDescription = seoInfo.description ? `
        <meta name="description" content="${seoInfo.description}">
        <meta property="og:description" content="${seoInfo.description}">
    ` : ``
    const template = `
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">        
        <meta property="og:title" content="${seoInfo.title}">
        <link rel="canonical" href="${seoInfo.canonical}">
        ${seoImage}
        ${seoDescription}
        <meta property="og:site_name" content="Nhanever">
    `
    return html`${template}`
}