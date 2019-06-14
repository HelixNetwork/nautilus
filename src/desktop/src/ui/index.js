import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Switch, Route, withRouter, Link } from "react-router-dom";
import { withI18n, useTranslation, translate, Trans } from 'react-i18next';
import i18next from 'libs/i18next';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import Onboarding from 'ui/views/onboarding/index';
import Wallet from 'ui/views/wallet/index';
import Loading from 'ui/components/loading';
import { updateTheme } from 'actions/settings';
import Theme from 'ui/global/theme';
import Settings from 'ui/views/settings/settings';
import css from './index.scss';

/**
 * Wallet wrapper component
 **/
class App extends React.Component {
    static propTypes = {
        history: PropTypes.object.isRequired,
        t: PropTypes.func.isRequired,
        themeName: PropTypes.string.isRequired,
        updateTheme: PropTypes.func.isRequired,
    }
    constructor(props) {
        super(props);
        this.state = {
            fatalError: false,
        };
    }

    componentDidMount() {
        // console.log(Electron);
    }

    componentWillReceiveProps(nextProps) {
        console.log("this prpps", this.props);
        /* On language change */
        if (nextProps.locale !== this.props.locale) {
            i18next.changeLanguage(nextProps.locale);
        }
    }

    Init = (props) => {
        return (
            <Loading loop={false} onEnd={() => this.props.history.push('/onboarding/')} />
        );
    };

    render() {
        console.log("index", this.props);
        const { location, history } = this.props;
        const { fatalError } = this.state;
        const currentKey = location.pathname.split('/')[1] || '/';
        return (
            <div>
                <Theme history={history} />
                <Switch>
                    <Route path="/wallet" component={Wallet} />
                    <Route path="/onboarding" component={Onboarding} />
                    <Route path="/setting" component={Settings} />
                    <Route exact path="/" loop={false} component={this.Init} />
                </Switch>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    locale: state.settings.locale,
    themeName: state.settings.themeName,
});

const mapDispatchToProps = {
    updateTheme,
};

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(withI18n()(App)));
