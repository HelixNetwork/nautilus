/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Switch, Route, withRouter } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import classNames from 'classnames';

import Welcome from 'ui/views/onboarding/welcome';
import Login from 'ui/views/onboarding/login';
import SeedIntro from 'ui/views/onboarding/seedIntro';
import GenerateSeed from 'ui/views/onboarding/seedGenerate';
import SaveYourSeedOptions from 'ui/views/onboarding/seedSave';
import SeedEnter from 'ui/views/onboarding/seedVerify';
import SeedName from 'ui/views/onboarding/accountName';
import SeedBackup from 'ui/views/onboarding/seedbackup';
import SeedWallet from 'ui/views/onboarding/seedwallet';
import SecurityEnter from 'ui/views/onboarding/accountPassword';
import Done from 'ui/views/onboarding/done';
import css from './index.scss';
import Wallet from 'ui/views/wallet/index';

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

    steps(currentKey) {
        const steps = [
            'seed-intro',
            'seed-generate',
            'account-name',
            'seed-save',
            'seed-verify',
            'account-password',
            'done',
            'seed-backup',
            'login',
            'seed-wallet'
            
            
        ];
        const currentIndex =
            currentKey === 'seed-verify' ? 2 : steps.indexOf(currentKey) + 1;
            currentKey === 'seed-save' ? 2 : steps.indexOf(currentKey) + 1;

        if (currentIndex < 1) {
            return null;
        }
        return (
            <ul >
                {steps.map((step, index) => (
                    <li key={step} className={classNames(currentIndex > index ? css.active : null, index == steps.length - 1 ? css.done : null)}>
                    </li>
                ))}
            </ul>
        );
    }

    render() {
        const { history, location, complete, isAuthorised } = this.props;
        const indexComponent = complete ? Login : Welcome;
        const currentKey = location.pathname.split('/')[2] || '/';

        return (
            <main className={css.onboarding}>
                <TransitionGroup>
                    <CSSTransition classNames="slide" timeout={1000} mountOnEnter unmountOnExit>
                        <div>
                            <Switch >
                                <Route path="/onboarding/seed-intro" component={SeedIntro} />
                                <Route path="/onboarding/seed-generate" component={GenerateSeed} />
                                <Route path="/onboarding/seed-save" component={SaveYourSeedOptions} />
                                <Route path="/onboarding/seed-verify" component={SeedEnter} />
                                <Route path="/onboarding/account-name" component={SeedName} />
                                <Route path="/onboarding/account-password" component={SecurityEnter} />
                                <Route path="/onboarding/done" component={Done} />
                                <Route path="/onboarding/seed-wallet" component={SeedWallet}/>
                                <Route path="/onboarding/seed-backup" component={SeedBackup}/>
                                <Route path="/onboarding/login" component={Login} />
                                <Route path="/" component={indexComponent} />
                                <Route path="/wallet" component={Wallet} />
                            </Switch>
                        </div>
                    </CSSTransition>
                </TransitionGroup>
                <footer className={classNames(currentKey === '/' ? css.footer_none : null)}>
                    {this.steps(currentKey)}
                </footer>
            </main>

        );
    }
}

const mapStateToProps = (state) => ({

});

const mapDispatchToProps = {

};

export default connect(mapStateToProps, mapDispatchToProps)(Onboarding);
