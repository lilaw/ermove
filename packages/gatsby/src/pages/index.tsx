import * as React from "react"
import { PageProps, Link, graphql } from "gatsby"
import { css } from "@emotion/react"
import Layout from "../components/layout"
import Seo from "../components/seo"

type DataProps = {
  allZone: {
    nodes: [
      {
        categories: [{ name: string; catId: string }]
        topic: string
      }
    ]
  }
}


const style = css`
.zone {
  display: grid;
  grid-template-columns: repeat(4, 17rem);
  column-gap: 1rem;
}
.zone__topic {
  grid-column: 1 / -1;;
}
`

const UsingTypescript: React.FC<PageProps<DataProps>> = ({
  data,
  location
}) => {
  return (
    <Layout title="rmov" location={location}>
      <Seo title="Using TypeScript" />
      <main css={style}>
        {data.allZone.nodes.map(node => (
          <section className="zone" key={node.topic}>
            <h2 className="zone__topic">{node.topic}</h2>
            {node.categories.map(cat => (
              <Link to={`category/${cat.catId}`} className="zone__node" key={cat.catId}>
                <h3 className="zone__node-title">{cat.name}</h3>
              </Link>
            ))}
          </section>
        ))}
      </main>
    </Layout>
  )
}
export default UsingTypescript

export const query = graphql`
  {
    allZone {
      nodes {
        categories(removeRegExp: "測試區|密室") {
          name
          catId
        }
        topic
      }
    }
  }
`
