import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Switch, Route, withRouter, Link } from "react-router-dom";
import i18next from 'libs/i18next';
import { withI18n, useTranslation } from 'react-i18next';
import { withNamespaces } from 'react-i18next';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import Onboarding from 'ui/views/onboarding/index';
import Wallet from 'ui/views/wallet/index';
import Loading from 'ui/components/loading';

import css from './index.scss';
/**
 * Wallet wrapper component
 **/
class App extends React.Component {
    static propTypes = {
        history: PropTypes.object.isRequired,
    }
    constructor(props) {
        super(props);
    }

    Init = (props) => {
        return (
            <Loading loop={false} onEnd={() => this.props.history.push('/onboarding/')} />
        );
    };

    render() {
        return (
            <div>
                <Switch>
                    <Route path="/wallet" component={Wallet} />
                    <Route path="/onboarding" component={Onboarding} />
                    <Route exact path="/" loop={false} component={this.Init} />
                </Switch>
            </div>
        );
    }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = {};

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(App));
