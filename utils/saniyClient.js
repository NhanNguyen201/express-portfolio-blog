const { createClient }  = require('@sanity/client')
const imageUrlBuilder = require('@sanity/image-url')

const client = createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: "production",
    apiVersion: '2024-04-14',
    useCdn: false,
    ignoreBrowserTokenWarning: true
})

const builder = imageUrlBuilder(client)

exports.client = client
exports.writeClient =  createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: "production",
    apiVersion: '2024-04-14', // YYYY-MM-DD
    token: process.env.SANITY_TOKEN,
    useCdn: false,
    ignoreBrowserTokenWarning: true
})
exports.urlFor = source => builder.image(source)