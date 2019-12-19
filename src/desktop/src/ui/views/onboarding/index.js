/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Switch, Route } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import classNames from 'classnames';

import { setAccountInfoDuringSetup } from 'actions/accounts';

import Welcome from 'ui/views/onboarding/welcome';
import Login from 'ui/views/onboarding/login';
import SeedIntro from 'ui/views/onboarding/seedIntro';
import GenerateSeed from 'ui/views/onboarding/seedGenerate';
import seedImport from 'ui/views/onboarding/seedImport';
import SeedName from 'ui/views/onboarding/accountName';
import SeedBackup from 'ui/views/onboarding/seedBackup';
import SeedWallet from 'ui/views/onboarding/seedwallet';
import SecurityEnter from 'ui/views/onboarding/accountPassword';
import Done from 'ui/views/onboarding/done';
import css from './index.scss';
import Wallet from 'ui/views/wallet/index';
import OnboardingLayout from 'ui/components/onboarding';
/**
 * Onboarding main router wrapper component
 */
class Onboarding extends React.PureComponent {
    static propTypes = {
        isAuthorised: PropTypes.bool,
        complete: PropTypes.bool,
        location: PropTypes.object,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        setAccountInfoDuringSetup: PropTypes.func.isRequired,
    };

    state = {};

    steps(currentKey) {
        const steps = [
            'seed-intro',
            'seed-generate',
            'account-name',
            'seed-backup',
            'seed-import',
            'account-password',
            'done',
        ];
        const currentIndex =
            currentKey === 'seed-import' && !Electron.getOnboardingSeed() ? 2 : steps.indexOf(currentKey) + 1;

        if (currentIndex < 1) {
            return null;
        }
        return (
            <ul>
                {' '}
                {steps.map((step, index) => (
                    <li
                        key={step}
                        className={classNames(
                            currentIndex > index ? css.active : null,
                            index === steps.length - 1 ? css.done : null,
                        )}
                    ></li>
                ))}{' '}
            </ul>
        );
    }

    render() {
        const { history, location, complete } = this.props;
        const indexComponent = complete ? Login : Welcome;
        const currentKey = location.pathname.split('/')[2] || '/';

        return (
            <main className={css.onboarding}>
                <TransitionGroup>
                    <CSSTransition classNames="slide" timeout={2000} mountOnEnter unmountOnExit>
                        <OnboardingLayout history={history}>
                            <Switch>
                                <Route path="/onboarding/seed-intro" component={SeedIntro} />
                                <Route path="/onboarding/seed-generate" component={GenerateSeed} />
                                <Route path="/onboarding/seed-import" component={seedImport} />
                                <Route path="/onboarding/account-name" component={SeedName} />
                                <Route path="/onboarding/account-password" component={SecurityEnter} />
                                <Route path="/onboarding/done" component={Done} />
                                <Route path="/onboarding/seed-wallet" component={SeedWallet} />
                                <Route path="/onboarding/seed-backup" component={SeedBackup} />
                                <Route path="/onboarding/login" component={Login} />
                                <Route path="/" component={indexComponent} />
                                <Route path="/wallet" component={Wallet} />
                            </Switch>
                        </OnboardingLayout>
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
    complete: state.accounts.onboardingComplete,
    isAuthorised: state.wallet.ready,
});

const mapDispatchToProps = {
    setAccountInfoDuringSetup,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Onboarding);
