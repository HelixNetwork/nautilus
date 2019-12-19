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
                    <p className={css.sidebar_p}>
                        MENU <span className={css.menu_span}> v </span>
                    </p>
                    <li>
                        <div
                            id="Send"
                            onClick={() => this.props.history.push('/wallet/send')}
                            className={classNames(css.img_sr1, active === 'send' ? css.menu_link : css.link_opacity)}
                        >
                            <img src={Send} alt=" " className={css.sidebar_icon} /> {t('home:send')}
                        </div>
                    </li>
                    <li>
                        <div
                            onClick={() => this.props.history.push('/wallet/receive')}
                            className={classNames(css.img_sr1, active === 'receive' ? css.menu_link : css.link_opacity)}
                        >
                            <img src={Receive} alt=" " className={css.sidebar_icon} /> {t('home:receive')}
                        </div>
                    </li>

                    <li>
                        <div
                            onClick={() => this.props.history.push('/wallet/chart')}
                            className={classNames(css.img_sr1, active === 'chart' ? css.menu_link : css.link_opacity)}
                        >
                            <img src={Chart} alt=" " className={css.sidebar_icon} /> {t('home:chart')}
                        </div>
                    </li>
                    <li>
                        <div
                            onClick={() => this.props.history.push('/wallet/history')}
                            className={classNames(css.img_sr1, active === 'history' ? css.menu_link : css.link_opacity)}
                        >
                            <img src={History} alt=" " className={css.sidebar_icon} /> {t('home:history')}
                        </div>
                    </li>
                    <li>
                        <div
                            onClick={() => this.props.history.push('/settings/editname')}
                            className={classNames(css.img_sr1, css.menu_settings)}
                        >
                            {t('home:settings')}
                        </div>
                    </li>
                    <li>
                        <div
                            onClick={() => this.props.history.push('/wallet/support')}
                            className={classNames(css.img_sr1, css.link_opacity)}
                        >
                            {t('global:support')}
                        </div>
                    </li>
                    <li>
                        <div onClick={this.doLogout.bind(this)} className={classNames(css.img_sr1, css.link_opacity)}>
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
