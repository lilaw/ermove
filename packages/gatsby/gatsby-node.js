const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  // Define a template for blog post
  const blogPost = path.resolve(`./src/templates/blog-post.js`)

  // Get all markdown blog posts sorted by date
  const result = await graphql(
    `
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: ASC }
          limit: 1000
        ) {
          nodes {
            id
            fields {
              slug
            }
          }
        }
      }
    `
  )

  if (result.errors) {
    reporter.panicOnBuild(
      `There was an error loading your blog posts`,
      result.errors
    )
    return
  }

  const posts = result.data.allMarkdownRemark.nodes

  // Create blog posts pages
  // But only if there's at least one markdown file found at "content/blog" (defined in gatsby-config.js)
  // `context` is available in the template as a prop and as a variable in GraphQL

  if (posts.length > 0) {
    posts.forEach((post, index) => {
      const previousPostId = index === 0 ? null : posts[index - 1].id
      const nextPostId = index === posts.length - 1 ? null : posts[index + 1].id

      createPage({
        path: post.fields.slug,
        component: blogPost,
        context: {
          id: post.id,
          previousPostId,
          nextPostId,
        },
      })
    })
  }
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })

    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions

  // Explicitly define the siteMetadata {} object
  // This way those will always be defined even if removed from gatsby-config.js

  // Also explicitly define the Markdown frontmatter
  // This way the "MarkdownRemark" queries will return `null` even when no
  // blog posts are stored inside "content/blog" instead of returning an error
  createTypes(`
    type SiteSiteMetadata {
      author: Author
      siteUrl: String
      social: Social
    }

    type Author {
      name: String
      summary: String
    }

    type Social {
      twitter: String
    }

    type MarkdownRemark implements Node {
      frontmatter: Frontmatter
      fields: Fields
    }

    type Frontmatter {
      title: String
      description: String
      date: Date @dateformat
    }

    type Fields {
      slug: String
    }
  `)
}

const sourceEntry = require("./content/sourceEntry.json")
const completedZone = require("./content/completedZone.json")
const mainZone = require("./content/mainZone.json")
const otherZone = require("./content/otherZone.json")

exports.sourceNodes = ({ actions, createNodeId, createContentDigest }) => {
  const { createNode, createTypes, createFieldExtension } = actions

  createFieldExtension({
    name: "filter",
    args: {
      removeRegExp: {
        type: "String",
      },
    },
    // The extension `args` (above) are passed to `extend` as
    // the first argument (`options` below)
    extend(options, prevFieldConfig) {
      return {
        args: {
          removeRegExp: {
            type: 'String',
            defaultValue: 0,
          },
        },
        resolve(source, args, context, info) {
          return context.nodeModel.getAllNodes({
            type: "Category",
          }).filter(cat => cat.atTopic === source.topic)
          .filter(cat => !(new RegExp(args.removeRegExp).test(cat.name)))
        },
      }
    },
  }) 
  createTypes(`
    type Thead implements Node { 
      theadId: String!
      title: String!
      author: String!
      releaseDate: String!
      category: Category @link(from: "atNode", by: "name") 
      imgs: [String]!
      html: String!
      status: String!
    }
    type Category implements Node {
      name: String!
      catId: String!
      theads: [Thead]! @link(from: "name", by: "atNode")
      atTopic: String!
      zone: Zone @link(from: "atTopic", by: "topic")
    }
    type Zone implements Node {
      topic: String!
      categories: [Category] @link(from: "topic", by: "atTopic") @filter
    }
  `)
      // cover: File @link(from: "fileName", by: "name") 
  // Data can come from anywhere, but for now create it manually

  completedZone.sourceNodes.forEach(node => node.theads.forEach((thead) => createTheadNode(thead, node.title)))
  mainZone.sourceNodes.forEach(node => node.theads.forEach((thead) => createTheadNode(thead, node.title)))
  otherZone.sourceNodes.forEach(node => node.theads.forEach((thead) => createTheadNode(thead, node.title)))
  function createTheadNode({title, author, releaseDate, imgs, html, url, status}, atNode) {
    const theadId = new  URL(url).searchParams.get('tid')
    const prune = {title, author, releaseDate, atNode, html, theadId, status, imgs: imgs.map(i => i.filename)}
    createNode({
      ...prune,
      id: createNodeId(`thead-${prune.theadId}`),
      parent: null,
      children: [],
      internal: {
        type: `Thead`,
        mediaType: `application/json`,
        content: JSON.stringify(prune),
        contentDigest: createContentDigest(prune)
      }
    })
  }
  sourceEntry.map(zone => zone.sourceNodes.map(cat => createCategoryNode(cat, zone.topic)))
  function createCategoryNode({title, url}, atTopic) {
    const catId = new  URL(url).searchParams.get('fid')
    const prune = {name: title, catId, atTopic }
    createNode({
      ...prune,
      id: createNodeId(`cat-${prune.catId}`),
      parent: null,
      children: [],
      internal: {
        type: `Category`,
        mediaType: `application/json`,
        content: JSON.stringify(prune),
        contentDigest: createContentDigest(prune)
      }
    })
  }
  sourceEntry.map(createZoneNode)
  function createZoneNode({topic}) {
    const prune = {topic}
    createNode({
      ...prune,
      id: createNodeId(`zone-${prune.topic}`),
      parent: null,
      children: [],
      internal: {
        type: `Zone`,
        mediaType: `application/json`,
        content: JSON.stringify(prune),
        contentDigest: createContentDigest(prune)
      }
    })
  }

}