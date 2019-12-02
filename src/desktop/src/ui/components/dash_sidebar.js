import React from 'react';
import css from 'ui/views/wallet/wallet.scss';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import Send from 'ui/images/svg/send.svg';
import Receive from 'ui/images/svg/receive.svg';
import Chart from 'ui/images/svg/chart.svg';
import History from 'ui/images/svg/history.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPowerOff } from '@fortawesome/free-solid-svg-icons';
import { setAccountInfoDuringSetup } from 'actions/accounts';
import { connect } from 'react-redux';
import { getAccountNamesFromState } from 'selectors/accounts';
import { setPassword, clearWalletData } from 'actions/wallet';

/**
 * Sidebar for dashboard
 */
export class DashSidebar extends React.PureComponent {
    static propTypes = {
        location: PropTypes.object,
        t: PropTypes.func.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        accounts: PropTypes.object,
        accountNames: PropTypes.array.isRequired,
        wallet: PropTypes.object,
    };

    doLogout() {
        this.props.clearWalletData();
        this.props.setPassword({});
        this.props.history.push('/');
    }

    render() {
        const { t, active } = this.props;
        return (
            <div className={classNames(css.sidebar)}>
                <ul className={classNames(css.acco_pg)}>
                    <p style={{ marginLeft: '43px', marginBottom: '20px', marginTop: '-20px', opacity: '0.3' }}>
                        MENU <span style={{ margin: '10px' }}> v </span>
                    </p>
                    <li>
                        <div
                            id="Send"
                            onClick={() => this.props.history.push('/wallet/send')}
                            className={classNames(css.img_sr1)}
                            style={
                                active === 'send'
                                    ? { opacity: '1', borderBottom: '1px solid rgba(250, 192, 0, 0.75)' }
                                    : { opacity: '0.3' }
                            }
                        >
                            <img src={Send} alt=" " className={css.sidebar_icon} /> {t('home:send')}
                        </div>
                    </li>
                    <li>
                        <div
                            onClick={() => this.props.history.push('/wallet/receive')}
                            className={classNames(css.img_sr1)}
                            style={
                                active === 'receive'
                                    ? { opacity: '1', borderBottom: '1px solid rgba(250, 192, 0, 0.75)' }
                                    : { opacity: '0.3' }
                            }
                        >
                            <img src={Receive} alt=" " className={css.sidebar_icon} /> {t('home:receive')}
                        </div>
                    </li>

                    <li>
                        <div
                            onClick={() => this.props.history.push('/wallet/chart')}
                            className={classNames(css.img_sr1)}
                            style={
                                active === 'chart'
                                    ? { opacity: '1', borderBottom: '1px solid rgba(250, 192, 0, 0.75)' }
                                    : { opacity: '0.3' }
                            }
                        >
                            <img src={Chart} alt=" " className={css.sidebar_icon} /> {t('home:chart')}
                        </div>
                    </li>
                    <li>
                        <div
                            onClick={() => this.props.history.push('/wallet/history')}
                            className={classNames(css.img_sr1)}
                            style={
                                active === 'history'
                                    ? { opacity: '1', borderBottom: '1px solid rgba(250, 192, 0, 0.75)' }
                                    : { opacity: '0.3' }
                            }
                        >
                            <img src={History} alt=" " className={css.sidebar_icon} /> {t('home:history')}
                        </div>
                    </li>
                    <li>
                        <div
                            onClick={() => this.props.history.push('/settings/editname')}
                            className={classNames(css.img_sr1)}
                            style={{ paddingTop: '20px', opacity: '0.3' }}
                        >
                            {t('home:settings')}
                        </div>
                    </li>
                    <li>
                        <div
                            onClick={() => this.props.history.push('/wallet/support')}
                            className={classNames(css.img_sr1)}
                            style={{ opacity: '0.3' }}
                        >
                            {t('global:support')}
                        </div>
                    </li>
                    <li>
                        <div
                            onClick={this.doLogout.bind(this)}
                            className={classNames(css.img_sr1)}
                            style={{ opacity: '0.3' }}
                        >
                            <FontAwesomeIcon icon={faPowerOff} /> LOGOUT{' '}
                        </div>
                    </li>
                </ul>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    accounts: state.accounts.accountInfo,
    accountNames: getAccountNamesFromState(state),
    wallet: state.wallet,
});

const mapDispatchToProps = {
    setAccountInfoDuringSetup,
    clearWalletData,
    setPassword,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withI18n()(DashSidebar));
