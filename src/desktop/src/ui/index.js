import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Switch, Route, withRouter } from "react-router-dom";

class App extends React.Component {
  render() {
    return (
      <div>
        <h1>Hello World</h1>
      </div>
    );
  }
}
const mapStateToProps = state => ({});

const mapDispatchToProps = {};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(App)
);
