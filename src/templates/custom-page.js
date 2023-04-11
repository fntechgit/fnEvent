import * as React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { graphql } from "gatsby";
import { Redirect } from "@gatsbyjs/reach-router";
import Layout from "../components/Layout";
import Content, { HTMLContent } from "../components/Content";

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
  if (!isAuthorized && (
    (userRequirement === 'LOGGED_IN' && !isLoggedUser) || (userRequirement === 'HAS_TICKET' && !hasTicket)
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
  hasTicket: PropTypes.bool
};

const mapStateToProps = ({ loggedUserState, userState }) => ({
  isLoggedUser: loggedUserState.isLoggedUser,
  hasTicket: userState.hasTicket,
  isAuthorized: userState.isAuthorized
});

export default connect(mapStateToProps, null)(CustomPage);

export const customPageQuery = graphql`
  query ($id: String!) {    
    markdownRemark(id: { eq: $id }) {
      html
      frontmatter {        
        title
        userRequirement
      }
    }
  }
`;
