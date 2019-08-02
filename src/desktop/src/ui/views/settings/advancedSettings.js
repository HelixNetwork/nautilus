import React from 'react';
import css from './settings.scss';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withI18n, Trans, } from 'react-i18next';
import { connect } from 'react-redux';

import { clearVault } from 'libs/crypto';
import { reinitialise as reinitialiseStorage } from 'database';
import { getEncryptionKey, ALIAS_REALM } from 'utils/realm';
import  changePowSettings from 'actions/settings';
import { generateAlert } from 'actions/alerts';

import Button from 'ui/components/button';
import Confirm from 'ui/components/modal/Confirm';
import ModalPassword from 'ui/components/modal/Password';

/**
 * Advanced settings component
 */

class AdvancedSettings extends React.PureComponent {
    static propTypes = {
        location: PropTypes.object,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        t: PropTypes.func.isRequired,
        changePowSettings: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        wallet: PropTypes.object,
        settings: PropTypes.object.isRequired,
    }
    state = {
        resetConfirm: false,
        resetCountdown: 0,
    };
    componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
    //reset wallet  
    resetWallet = async () => {
        const { t, generateAlert } = this.props;

        try {
            await clearVault(ALIAS_REALM);
            localStorage.clear();
            Electron.clearStorage();

            await reinitialiseStorage(getEncryptionKey);

            Electron.reload();
        } catch (err) {
            console.log("wallet reset", err);
            generateAlert(
                'error',
                t('changePassword:incorrectPassword'),
                t('changePassword:incorrectPasswordExplanation'),
            );
            return;
        }
    };


    confirmReset = () => {
        const { wallet } = this.props;

        this.setState({ resetConfirm: !this.state.resetConfirm, resetCountdown: 15 });
        console.log('value address here');
        if (!wallet || !wallet.isOpen) {
            this.interval = setInterval(() => {
                if (this.state.resetCountdown === 1) {
                    clearInterval(this.interval);
                }

                this.setState({
                    resetCountdown: this.state.resetCountdown - 1,
                });
            }, 1000);
        }
    };

    render() {

        const { t, settings, wallet , changePowSettings} = this.props;
        const { resetConfirm, resetCountdown } = this.state;

        return (

            <div className={classNames(css.set_bx)}>
                <h3 style={{ marginLeft: '21vw', marginTop: '5vw' }}>{t('settings:reset')}</h3>
                <Trans i18nKey="walletResetConfirmation:warning">
                    <p>
                        <React.Fragment>All of your wallet data including your </React.Fragment>
                        <strong>seeds, password,</strong><br />
                        <React.Fragment>and </React.Fragment>
                        <strong>other account information</strong>
                        <React.Fragment> will be lost.</React.Fragment>
                    </p>
                </Trans>
                <Button variant="negative" className="small" style={{ marginLeft: '20vw', marginTop: '7vw' }} onClick={this.confirmReset}>
                    {t('settings:reset')}
                </Button>

                {wallet && wallet.ready ? (

                    <ModalPassword
                        isOpen={resetConfirm}
                        category="negative"
                        onSuccess={() => this.resetWallet()}
                        onClose={() => this.setState({ resetConfirm: false })}
                        content={{
                            title: t('walletResetConfirmation:cannotUndo'),
                            message: (
                                <Trans i18nKey="walletResetConfirmation:warning">
                                    <React.Fragment>
                                        <React.Fragment>All of your wallet data including your </React.Fragment>
                                        <strong>seeds, password,</strong>
                                        <React.Fragment>and </React.Fragment>
                                        <strong>other account information</strong>
                                        <React.Fragment> will be lost.</React.Fragment>
                                    </React.Fragment>


                                </Trans>
                            ),

                            confirm: t('settings:reset'),
                        }}
                    />
                ) : (
                        <Confirm
                            isOpen={resetConfirm}
                            category="negative"
                            content={{
                                title: t('walletResetConfirmation:cannotUndo'),
                                message: (
                                    <Trans i18nKey="walletResetConfirmation:warning">
                                        <React.Fragment>
                                            <React.Fragment>All of your wallet data including your </React.Fragment>
                                            <strong>seeds, password,</strong>
                                            <React.Fragment>and </React.Fragment>
                                            <strong>other account information</strong>
                                            <React.Fragment> will be lost.</React.Fragment>
                                        </React.Fragment>
                                    </Trans>
                                ),
                                cancel: t('cancel'),
                                confirm: t('settings:reset'),
                            }}
                            onCancel={() => this.setState({ resetConfirm: false })}
                            countdown={resetCountdown}
                            onConfirm={() => this.resetWallet()}
                        />
                    )}
                <div className={classNames(css.spe_bx)}>

                </div>
            </div>
        );
    }
}
const mapStateToProps = (state) => ({
    settings: state.settings,
    wallet: state.wallet,

});

const mapDispatchToProps = {
    generateAlert,
    changePowSettings
};
export default connect(mapStateToProps, mapDispatchToProps)(withI18n()(AdvancedSettings));
