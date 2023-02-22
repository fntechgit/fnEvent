import React from "react";
import {connect} from "react-redux";
import {navigate} from "gatsby";

/**
 *
 * @param isLoggedIn
 * @param location
 * @param children
 * @returns {null|*}
 * @constructor
 */
const WithAuthRoute = ({

                           isLoggedIn,
                           location,
                           children
                       }) => {

    if (!isLoggedIn) {
        // reject it
        navigate("/#login=1", {state: {backUrl: `${location.pathname}`,},});
        return null;
    }

    return children;
};

const mapStateToProps = ({}) => ({});

export default connect(mapStateToProps, {})(WithAuthRoute);
