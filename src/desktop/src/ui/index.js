import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Switch, Route, withRouter } from "react-router-dom";
import i18next from 'libs/i18next';
import { withI18n, useTranslation } from 'react-i18next';
import { withNamespaces } from 'react-i18next';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import Routes from './routes';
import Onboarding from 'ui/views/onboarding/index';

class App extends React.Component {
    render() {
        return (
            <div>
                <Routes></Routes>
            </div>
        );
    }
}
const mapStateToProps = state => ({});

const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App);
