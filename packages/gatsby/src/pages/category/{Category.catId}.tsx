import * as React from "react"
import { PageProps, Link, graphql } from "gatsby"
import { css } from "@emotion/react"
import Layout from "../../components/layout"
import Seo from "../../components/seo"

type DataProps = {
  category: {
    name: string
    theads: {
      title: string
      theadId: string
      status: string
      author: string
    }[]
  }
}

const style = css`
.theads {
  width: 90rem;
}
.thead {
  color: currentColor;
  display: flex;
  column-gap: 1rem;;
  text-decoration: none;
  margin-top: 1rem;
  background-color: #5551;
  padding: .5rem;

  &__author {
    margin-left: auto;
  }
}

`

const UsingTypescript: React.FC<PageProps<DataProps>> = ({ data, location }) => {
  return (
    <Layout title="rmov" location={location}>
      <Seo title="Using TypeScript" />
      <main css={style}>
        <h2>{data.category.name}</h2>
        <section className="theads">
          {data.category.theads.map(thead => (
            <Link to={`/thead/${thead.theadId}`} className="thead" key={thead.theadId}>
              <span className="thead__status">{thead.status.startsWith("2") ? "unkown" : thead.status}</span>
              <span className="thead__title">{thead.title}</span>
              <span className="thead__author">{thead.author}</span>
            </Link>
          ))}
        </section>
      </main>
    </Layout>
  )
}
export default UsingTypescript

export const query = graphql`
  query($id: String) {
    category(id: { eq: $id }) {
      name
      theads {
        title
        theadId
        author
        status
      }
    }
  }
`
