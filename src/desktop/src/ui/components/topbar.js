import React from 'react';
import { withI18n } from 'react-i18next';
import { connect } from 'react-redux';
import css from 'ui/views/wallet/wallet.scss';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import log from 'ui/images/log_icon.png';
import logo from 'ui/images/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faPowerOff, faTh } from '@fortawesome/free-solid-svg-icons';
import Icon from 'ui/components/icon';
import { setPassword, clearWalletData } from 'actions/wallet';

class Top extends React.PureComponent {
    static propTypes = {
        wallet: PropTypes.object,
    };

    doLogout() {
        this.props.clearWalletData();
        this.props.setPassword({});
        this.props.history.push('/');
    }
    render() {
        const { wallet, balance, unit } = this.props;
        return (
            <div className={classNames(css.top_sec1)}>
                <div className={classNames(css.lg_logos)}>
                    <img src={logo} alt="" />
                </div>
                <div className={classNames(css.bal_bx)} style={{ display: this.props.bal }}>
                    <span className={css.topbar_balance}>Balance</span>
                    <br />
                    <br />
                    <span>0,02€ /mHLX</span>
                </div>
                <div className={classNames(css.bal_bxs)} style={{ display: this.props.bal }}>
                    &nbsp;&nbsp;{balance} &nbsp; <span className={css.topbar_unit}>{unit}</span>
                    <br />
                    <span className={css.unit_span}>
                        26,67 &nbsp;&nbsp;&nbsp;&nbsp; <span className={css.unit}>EUR</span>
                    </span>
                </div>
                <div className={css.topbar_div}>
                    {wallet.ready ? (
                        <React.Fragment>
                            <a href=" " className={classNames(css.main_mn)} style={{ display: this.props.user }}>
                                <img src={log} className={css.log_img} alt="" />
                            </a>
                            <a
                                href=" "
                                onClick={this.doLogout.bind(this)}
                                className={classNames(css.setting)}
                                style={{ display: this.props.common }}
                            >
                                <FontAwesomeIcon icon={faPowerOff} /> Logout{' '}
                            </a>
                            <a
                                href=" "
                                onClick={() => this.props.history.push('/settings/editname')}
                                className={classNames(css.setting)}
                                style={{ display: this.props.common }}
                            >
                                <FontAwesomeIcon icon={faCog} /> Settings
                            </a>
                            <a
                                href=" "
                                onClick={() => this.props.history.push('/wallet/')}
                                className={classNames(css.setting)}
                                style={{ display: this.props.main }}
                            >
                                <FontAwesomeIcon icon={faTh} /> Main Menu
                            </a>
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <span
                                className={css.cross_span}
                                onClick={() => this.props.history.push('/onboarding/welcome')}
                            >
                                <Icon icon="cross" size={18} />
                            </span>
                        </React.Fragment>
                    )}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    wallet: state.wallet,
});

const mapDispatchToProps = {
    setPassword,
    clearWalletData,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withI18n()(Top));
