import * as React from "react"
import { PageProps, Link, graphql } from "gatsby"
import { css } from "@emotion/react"
import Layout from "../../components/layout"
import Seo from "../../components/seo"

type DataProps = {
  thead: {
    title: string
    html: string
    releaseDate: string
    author: string
    imgs: string[]
  }
}

const style = css`
  `

const UsingTypescript: React.FC<PageProps<DataProps>> = ({
  data,
  location
}) => {
  return (
    <Layout title="rmov" location={location}>
      <Seo title="Using TypeScript" />
      <main css={style}>
        <article>
          <h2>{data.thead.title}</h2>
          <p>
            {data.thead.author} &nbsp; {data.thead.releaseDate}
          </p>
          <section dangerouslySetInnerHTML={{__html: data.thead.html}}></section>
          {data.thead.imgs.map(filename => (
            <img src={`/img/${filename}`} alt="unkonw" key={filename}/>
          ))}
        </article>
      </main>
    </Layout>
  )
}
export default UsingTypescript

export const query = graphql`
  query($id: String) {
    thead(id: { eq: $id }) {
      title
      releaseDate
      author
      html
      imgs
    }
  }
`
