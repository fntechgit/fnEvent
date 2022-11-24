import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'
import { GatsbyImage } from "gatsby-plugin-image"
import Layout from '../components/Layout'
import Content, { HTMLContent } from '../components/Content'

import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'

export const VirtualBoothPageTemplate = ({
  title,
  content,
  intro,
  columns,
  endText,
  contentComponent
}) => {
  const PageContent = contentComponent || Content

  return (
    <div className="content">
      <h1>{title}</h1>
      <PageContent content={intro} />
      <div className="columns is-mobile">
        <div className="column is-half">
          <h2>{columns.leftColumn.title}</h2>
          {columns.leftColumn.content}
          <br />
          <br />
          <Zoom>
            <GatsbyImage image={columns.leftColumn.image.childImageSharp ? columns.leftColumn.image.childImageSharp.gatsbyImageData : columns.leftColumn.image} alt={columns.leftColumn.alt} />
          </Zoom>
        </div>
        <div className="column is-half">
          <h2>{columns.rightColumn.title}</h2>
          {columns.rightColumn.content}
          <br />
          <br />
          <br />
          <Zoom>
            <GatsbyImage image={columns.rightColumn.image.childImageSharp ? columns.rightColumn.image.childImageSharp.gatsbyImageData : columns.rightColumn.image} alt={columns.rightColumn.alt} />
          </Zoom>
        </div>
      </div>
      <br />
      <PageContent content={endText} />
    </div>
  )
}

VirtualBoothPageTemplate.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string,
  intro: PropTypes.string,
  columns: PropTypes.object,
  endText: PropTypes.string,
  contentComponent: PropTypes.func,
}

const VirtualBoothPage = ({ data }) => {
  const { frontmatter, html } = data.markdownRemark

  return (
    <Layout>
      <VirtualBoothPageTemplate
        contentComponent={HTMLContent}
        title={frontmatter.title}
        intro={frontmatter.intro}
        columns={frontmatter.columns}
        endText={frontmatter.endText}
        content={html}
      />
    </Layout>
  )
}

VirtualBoothPage.propTypes = {
  data: PropTypes.shape({
    markdownRemark: PropTypes.shape({
      frontmatter: PropTypes.object,
    }),
  }),
}

export default VirtualBoothPage

export const virtualBoothPagePageQuery = graphql`
  query VirtualBoothPagePageTemplate($id: String!) {    
    markdownRemark(id: { eq: $id }) {
      html
      frontmatter {        
        title
        intro
        columns {
          leftColumn {
            title
            content
            image {
              childImageSharp {
                gatsbyImageData(layout: FIXED)
              }
            }      
            alt      
          }
          rightColumn {
            title
            content
            image {
              childImageSharp {
                gatsbyImageData(layout: FIXED)
              }
            }
            alt
          }
        }
        endText
      }
    }
  }
`

