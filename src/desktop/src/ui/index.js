import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Switch, Route, withRouter, BrowserRouter, Link } from "react-router-dom";
import i18next from 'libs/i18next';
import { withI18n, useTranslation } from 'react-i18next';
import { withNamespaces } from 'react-i18next';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import Onboarding from 'ui/views/onboarding/index';
import Loading from 'ui/components/loading';

import css from './index.scss';

class App extends React.Component {

    constructor(props) {
        super(props);
    }

    Init = (props) => {
        return (
            <Loading />
        );
    };

    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route path="/wallet" component={Wallet} />
                    <Route path="/onboarding" component={Onboarding} />
                    <Route exact path="/" loop={false} component={this.Init} />
                </Switch>
            </BrowserRouter>
        );
    }
}
const Login = () => (
    <div>
        <h1> Hello this is react-router Login..! </h1>
        <Link to="/onboarding/">wallet</Link>
    </div>);

const Wallet = () => (
    <div>
        <h1> Hello this is react-router Wallet..! </h1>
        <Link to="/about/">About</Link>
    </div>);

const OnboardingNew = () => (
    <div>
        <h1> Hello this is react-router Onboarding..! </h1>
        <Link to="/about/">About</Link>
    </div>);

const mapStateToProps = state => ({});

const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App);
