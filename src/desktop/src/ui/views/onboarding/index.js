/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Switch, Route, withRouter } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import Welcome from 'ui/views/onboarding/welcome';
import Login from 'ui/views/onboarding/login';
import SeedIntro from 'ui/views/onboarding/seedIntro';
import GenerateSeed from 'ui/views/onboarding/seedGenerate';
import SaveYourSeedOptions from 'ui/views/onboarding/seedSave';
import SeedEnter from 'ui/views/onboarding/seedVerify';
import SeedName from 'ui/views/onboarding/accountName';
import SecurityEnter from 'ui/views/onboarding/accountPassword';
import Done from 'ui/views/onboarding/done';
import css from './index.scss';

/**
 * Onboarding main router wrapper component
 */
class Onboarding extends React.PureComponent {
    static propTypes = {
        isAuthorised: PropTypes.bool,
        complete: PropTypes.bool,
        location: PropTypes.object,
        history: PropTypes.object,
    };

    state = {

    };

    render() {
        console.log('props', this.props);
        const { history, location, complete, isAuthorised } = this.props;
        const indexComponent = complete ? Login : Welcome;
        return (
            <Switch >
                <Route path="/onboarding/seed-intro" component={SeedIntro} />
                <Route path="/onboarding/seed-generate" component={GenerateSeed} />
                <Route path="/onboarding/seed-save" component={SaveYourSeedOptions} />
                <Route path="/onboarding/seed-verify" component={SeedEnter} />
                <Route path="/onboarding/account-name" component={SeedName} />
                <Route path="/onboarding/account-password" component={SecurityEnter} />
                <Route path="/onboarding/done" component={Done} />
                <Route path="/onboarding/login" component={Login} />
                <Route path="/" component={indexComponent} />
            </Switch>
        );
    }
}

const mapStateToProps = (state) => ({

});

const mapDispatchToProps = {

};

export default connect(mapStateToProps, mapDispatchToProps)(Onboarding);
