import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'
import Layout from '../components/Layout'
import { connect } from 'react-redux'
import Content, { HTMLContent } from '../components/Content'
import { Redirect } from "@gatsbyjs/reach-router";

export const CustomPageTemplate = ({
  title,
  content,
  contentComponent
}) => {
  const PageContent = contentComponent || Content

  return (
    <div className="content">
      <h1>{title}</h1>
      <PageContent content={content} />
    </div>
  )
}

CustomPageTemplate.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string,
  contentComponent: PropTypes.func,
}

const CustomPage = ({ data, isLoggedUser, hasTicket, isAuthorized }) => {
  const { frontmatter: {title, userRequirement}, html } = data.markdownRemark
  // if isAuthorized byoass the AUTHZ check
  if (
      !isAuthorized &&
      (
          (userRequirement === 'LOGGGED_IN' && !isLoggedUser) || (userRequirement === 'HAS_TICKET' && !hasTicket)
      )) {
    return <Redirect to='/' noThrow />
  }

  return (
    <Layout>
      <CustomPageTemplate
        contentComponent={HTMLContent}
        title={title}
        content={html}
      />
    </Layout>
  )
}

CustomPage.propTypes = {
  data: PropTypes.shape({
    markdownRemark: PropTypes.shape({
      frontmatter: PropTypes.object,
    }),
  }),
  isLoggedUser: PropTypes.bool,
  hasTicket: PropTypes.bool,
};

const mapStateToProps = ({ loggedUserState, userState }) => ({
  isLoggedUser: loggedUserState.isLoggedUser,
  hasTicket: userState.hasTicket,
  isAuthorized: userState.isAuthorized,
});

export default connect(mapStateToProps, null)(CustomPage)

export const customPageQuery = graphql`
  query CustomPageTemplate($id: String!) {    
    markdownRemark(id: { eq: $id }) {
      html
      frontmatter {        
        title
        userRequirement
      }
    }
  }
`

