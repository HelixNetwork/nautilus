import React from 'react';
import css from './settings.scss';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { clearVault } from 'libs/crypto';
import { reinitialise as reinitialiseStorage } from 'database';
import { getEncryptionKey, ALIAS_REALM } from 'libs/realm';
import { changePowSettings, changeAutoPromotionSettings, setNotifications, setProxy } from 'actions/settings';
import { generateAlert } from 'actions/alerts';
import Button from 'ui/components/button';
import Confirm from 'ui/components/modal/Confirm';
import Scrollbar from 'ui/components/scrollbar';
import ModalPassword from 'ui/components/modal/Password';
import Checkbox from 'ui/components/checkbox';
import Toggle from 'ui/components/toggle';

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
        notificationLog: PropTypes.array.isRequired,
        setNotifications: PropTypes.func.isRequired,
        setProxy: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        changeAutoPromotionSettings: PropTypes.func.isRequired,
        wallet: PropTypes.object,
        settings: PropTypes.object.isRequired,
    };
    state = {
        resetConfirm: false,
        resetCountdown: 0,
    };
    componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
    /**
     * Enable/disable global system proxy bypass
     * @returns {undefined}
     */
    setProxy = () => {
        const enabled = !this.props.settings.ignoreProxy;
        // eslint-disable-next-line no-undef
        Electron.setStorage('ignore-proxy', enabled);
        this.props.setProxy(enabled);
    };

    //reset wallet
    resetWallet = async () => {
        const { t, generateAlert } = this.props;

        try {
            await clearVault(ALIAS_REALM);
            localStorage.clear();
            // eslint-disable-next-line no-undef
            Electron.clearStorage();

            await reinitialiseStorage(getEncryptionKey);

            // eslint-disable-next-line no-undef
            Electron.reload();
        } catch (err) {
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

        this.setState({
            resetConfirm: !this.state.resetConfirm,
            resetCountdown: 15,
        });
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
        const { t, settings, wallet, changePowSettings, changeAutoPromotionSettings, setNotifications } = this.props;
        const { resetConfirm, resetCountdown } = this.state;

        return (
            <div className={classNames(css.foo_bxx12)}>
                <Scrollbar>
                    <div className={classNames(css.set_bxac)}>
                        <h3 className={css.advanced_powupdateh3}>{t('pow:powUpdated')}</h3>

                        {/* <hr className={classNames(css.setinghr)} /> */}
                        <p className={classNames(css.p_opacity, css.advanced_pow_p)}>
                            {t('pow:feeless')} {t('pow:localOrRemote')}
                        </p>
                        <Toggle
                            checked={settings.remotePoW}
                            onChange={() => changePowSettings()}
                            on={t('pow:remote')}
                            off={t('pow:local')}
                        />
                        {/* <hr className={classNames(css.setinghr)}/> */}
                        <h3 className={css.advanced_h3}>{t('advancedSettings:autoPromotion')}</h3>

                        <p className={css.p_opacity}>{t('advancedSettings:autoPromotionExplanation')}</p>
                        <Toggle
                            checked={settings.autoPromotion}
                            onChange={() => changeAutoPromotionSettings()}
                            on={t('enabled')}
                            off={t('disabled')}
                        />
                        {/* <hr className={classNames(css.setinghr)}/> */}
                        <h3 className={css.advanced_notification}>{t('notifications:notifications')}</h3>
                        <Toggle
                            checked={settings.notifications.general}
                            onChange={() =>
                                setNotifications({ type: 'general', enabled: !settings.notifications.general })
                            }
                            on={t('enabled')}
                            off={t('disabled')}
                        />
                        <Checkbox
                            disabled={!settings.notifications.general}
                            checked={settings.notifications.confirmations}
                            label={t('notifications:typeConfirmations')}
                            className="small"
                            onChange={(value) => setNotifications({ type: 'confirmations', enabled: value })}
                        />
                        <Checkbox
                            disabled={!settings.notifications.general}
                            checked={settings.notifications.messages}
                            label={t('notifications:typeMessages')}
                            className="small"
                            onChange={(value) => setNotifications({ type: 'messages', enabled: value })}
                        />

                        <p className={classNames(css.p_opacity, css.advanced_notification_p)}>
                            {t('notifications:notificationExplanation')}
                        </p>
                        {/* <hr className={classNames(css.setinghr1)} /> */}
                        <React.Fragment>
                            <h3 className={css.advanced_notification}>{t('proxy:proxy')}</h3>
                            <Toggle
                                checked={!settings.ignoreProxy}
                                onChange={this.setProxy}
                                on={t('enabled')}
                                off={t('disabled')}
                            />
                            <p className={css.p_opacity}>{t('proxy:proxyExplanation')}</p>
                        </React.Fragment>
                        {/* <hr className={classNames(css.setinghr2)} /> */}
                        <h3 className={css.advanced_reset}>{t('settings:reset')}</h3>
                        {/* <hr className={classNames(css.setinghr3)} /> */}
                        <Trans i18nKey="walletResetConfirmation:warning">
                            <p className={css.p_opacity}>
                                <React.Fragment>All of your wallet data including your </React.Fragment>
                                <strong>seeds, password,</strong>
                                <React.Fragment>and </React.Fragment>
                                <strong>other account information</strong>
                                <React.Fragment> will be lost.</React.Fragment>
                            </p>
                        </Trans>
                        <Button
                            variant="negative"
                            className="reset_button"
                            style={{ marginLeft: '26vw', marginTop: '2vw', backgroundColor: '#182051' }}
                            onClick={this.confirmReset}
                        >
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
                        <div className={classNames(css.spe_bx)}></div>
                    </div>
                </Scrollbar>
            </div>
        );
    }
}
const mapStateToProps = (state) => ({
    settings: state.settings,
    wallet: state.wallet,
    notificationLog: state.alerts.notificationLog,
});

const mapDispatchToProps = {
    generateAlert,
    changePowSettings,
    changeAutoPromotionSettings,
    setNotifications,
    setProxy,
};
export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withI18n()(AdvancedSettings));
