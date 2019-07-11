import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';
import Button from 'ui/components/button';
import { setAccountInfoDuringSetup } from 'actions/accounts';
import Logos from 'ui/components/logos';
import css from './index.scss';
import Icon from 'ui/components/icon';
import Modal from 'ui/components/modal';
import SeedExport from 'ui/global/SeedExport'

class SeedBackup extends React.PureComponent {
    static propTypes = {
        history: PropTypes.object,
        t: PropTypes.func.isRequired,
    };


    state = {
        seed: Electron.getOnboardingSeed(),
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
        const { onboardingName, t } = this.props;
        const { writeVisible, exportVisible, seed } = this.state;
        return (
            <div>
                <Logos size={20} />

                <section className="spage_1">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <h1 className={classNames(css.head_h1)}>{t('saveYourSeed:saveYourSeed')}</h1>
                            </div>
                            <div className={classNames(css.sseed_box, css.cre_pgs)}>
                                <nav className={css.choice}>
                                    <a onClick={() => this.setState({ exportVisible: true })} className={css.secure}>
                                        <h3>{t('saveYourSeed:recommended')}</h3>
                                        <div>
                                            <Icon icon="seedVault" size={72} />
                                        </div>
                                        <h4>{t('seedVault:exportSeedVault')}</h4>
                                    </a>
                                </nav>
                            </div>
                            <div className={css.onboard_nav}>
                                <Button className="navleft" variant="backgroundNone" onClick={() => this.stepForward('account-name')}>{t('global:goBack')} <span>></span></Button>
                                <Button className="navright" variant="backgroundNone" onClick={() => this.stepForward('seed-save')}>{t('global:confirm')} <span>></span></Button>
                            </div>
                        </div>
                    </div>
                    <Modal
                        variant="fullscreen"
                        isOpen={writeVisible || exportVisible}
                        onClose={() => this.setState({ writeVisible: false, exportVisible: false })}
                    >
                        {writeVisible ? (
                            <SeedSaveWrite
                                seed={seed}
                                checksum={checksum}
                                onClose={() => this.setState({ writeVisible: false })}
                            />
                        ) : (
                                <SeedExport
                                    seed={seed}
                                    title={onboardingName}
                                    onClose={() => this.setState({ exportVisible: false })}
                                />
                            )}
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