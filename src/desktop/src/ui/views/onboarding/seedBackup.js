/* global Electron */
import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import Button from 'ui/components/button';
import { setAccountInfoDuringSetup } from 'actions/accounts';
import css from './index.scss';
import Modal from 'ui/components/modal';
import SeedExport from 'ui/global/seedExport';
import Lottie from 'react-lottie';
import * as animationData from 'animations/export.json';
import { Row } from 'react-bootstrap';
/**
 * Onboarding, Seed correct backup validation or existing seed input component
 */
class SeedBackup extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        history: PropTypes.object,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        onboardingName: PropTypes.string.isRequired,
    };

    state = {
        // eslint-disable-next-line no-undef
        seed: Electron.getOnboardingSeed(),
        // eslint-disable-next-line no-undef
        onboardingname: Electron.getOnboardingName() != null ? Electron.getOnboardingName() : '',
        writeVisible: false,
        exportVisible: false,
        exported: false,
    };

    stepForward(route) {
        this.props.setAccountInfoDuringSetup({
            meta: { type: 'keychain' },
        });
        this.props.history.push(`/onboarding/${route}`);
    }
    render() {
        const { loop, t } = this.props;
        const { exportVisible, onboardingname, seed, exported } = this.state;
        const defaultOptions = {
            loop: loop,
            autoplay: true,
            animationData: animationData.default,
            rendererSettings: {
                preserveAspectRatio: 'xMidYMid slice',
            },
        };

        return (
            <div>
                <Row className={css.done_row}>
                    <h1>
                        {t('saveYourSeed:saveYourSeed')}
                        <span className={classNames(css.text_color)}>.</span>
                    </h1>
                </Row>
                <Row className={css.centerBox1}>
                    <nav className={css.choice}>
                        <a href=" " onClick={() => this.setState({ exportVisible: true })} className={css.secure}>
                            <div className={css.backup}>
                                <Lottie
                                    options={defaultOptions}
                                    eventListeners={[
                                        {
                                            eventName: 'complete',
                                            callback: () => {
                                                if (typeof onEnd === 'function') {
                                                    // eslint-disable-next-line no-undef
                                                    onEnd();
                                                }
                                            },
                                        },
                                    ]}
                                />
                            </div>
                            <h4>{t('seedVault:exportSeedVault')}</h4>
                        </a>
                    </nav>
                </Row>

                <Row>
                    <Button
                        className="navleft"
                        variant="backgroundNone"
                        onClick={() => this.stepForward('account-name')}
                    >
                        <span>&lt;</span> {t('global:goBack')}
                    </Button>
                    <Button
                        className="navright"
                        variant="backgroundNone"
                        disabled={!exported}
                        onClick={() => this.stepForward('seed-import')}
                    >
                        {t('global:confirm')} <span>></span>
                    </Button>
                </Row>
                <Modal variant="confirm" isOpen={exportVisible} onClose={() => this.setState({ exportVisible: false })}>
                    <SeedExport
                        seed={seed}
                        title={onboardingname}
                        onClose={() => this.setState({ exportVisible: false, exported: true })}
                    />
                </Modal>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    onboardingName: state.accounts.accountInfoDuringSetup.name,
});

const mapDispatchToProps = {
    setAccountInfoDuringSetup,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withI18n()(SeedBackup));
