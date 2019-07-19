import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';
import Button from 'ui/components/button';
import { setAccountInfoDuringSetup } from 'actions/accounts';
import Logos from 'ui/components/logos';
import css from './index.scss';
import Modal from 'ui/components/modal';
import SeedExport from 'ui/global/seedExport';
import Lottie from 'react-lottie';
import * as animationData from 'animations/export.json';
// import Electron from '../../../../native/preload/electron';

class SeedBackup extends React.PureComponent {
    static propTypes = {
        history: PropTypes.object,
        t: PropTypes.func.isRequired,
    };


    state = {
        seed: Electron.getOnboardingSeed(),
        onboardingname:Electron.getOnboardingName()!=null?Electron.getOnboardingName():'',
        writeVisible: false,
        exportVisible: false,
    };

    stepForward(route) {
        this.props.setAccountInfoDuringSetup({
            meta: { type: 'keychain' },
        });


        this.props.history.push(`/onboarding/${route}`);
    }
    render() {
        const { loop, t } = this.props;
        const { writeVisible, exportVisible, onboardingname,seed } = this.state;
        const defaultOptions = {
            loop: loop,
            autoplay: true,
            animationData: animationData.default,
            rendererSettings: {
                preserveAspectRatio: 'xMidYMid slice'
            }
        };

        return (
            <div>
                <Logos size={20} />

                <section className="spage_1">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <h1>{t('saveYourSeed:saveYourSeed')}<span className={classNames(css.text_color)}>.</span></h1>
                            </div>
                            <div className={classNames(css.sseed_box, css.cre_pgs, css.hlx_box)}>
                                <nav className={css.choice}>
                                    <a onClick={() => this.setState({ exportVisible: true })} className={css.secure}>
                                        <h3>{t('saveYourSeed:recommended')}</h3>
                                        <div className={css.backup}>
                                            <Lottie
                                                options={defaultOptions}
                                                eventListeners={[
                                                    {
                                                        eventName: 'complete',
                                                        callback: () => {
                                                            if (typeof onEnd === 'function') {
                                                                onEnd();
                                                            }
                                                        },
                                                    },
                                                ]}
                                            />
                                            {/* <Icon icon="seedVault" size={72} /> */}
                                        </div>
                                        <h4>{t('seedVault:exportSeedVault')}</h4>
                                    </a>
                                </nav>
                            </div>
                            <div className={css.onboard_btn}>
                                <Button className="navleft" variant="backgroundNone" onClick={() => this.stepForward('account-name')}>{t('global:goBack')} <span>></span></Button>
                                <Button className="navright" variant="backgroundNone" onClick={() => this.stepForward('seed-import')}>{t('global:confirm')} <span>></span></Button>
                            </div>
                        </div>
                    </div>
                    <Modal
                        variant="confirm"
                        isOpen={ exportVisible}
                        onClose={() => this.setState({ exportVisible: false })}
                    >
                        <SeedExport
                                    seed={seed}
                                    title={onboardingname}
                                    onClose={() => this.setState({ exportVisible: false })}
                                />
                    </Modal>
                </section>
            </div>
        )
    }
}
const mapDispatchToProps = {
    setAccountInfoDuringSetup,
};

export default connect(null, mapDispatchToProps)(withI18n()(SeedBackup));