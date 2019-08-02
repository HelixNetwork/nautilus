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
import Button from 'ui/components/button';
import Icon from 'ui/components/icon';
import { setPassword, clearWalletData } from 'actions/wallet';

class Top extends React.PureComponent {

    static propTypes = {
        wallet: PropTypes.object,
    }

    doLogout(){
      this.props.clearWalletData();
      this.props.history.push('/');
    }
    render() {
        const { wallet, balance} = this.props;
        return (
            <div className={classNames(css.top_sec1)}>
                <div className={classNames(css.lg_logos)}><img src={logo} alt="" /></div>
                <div className={classNames(css.bal_bx)} style={{ display: this.props.bal }}><span style={{ color: 'white', fontSize: '22px' }}>Balance</span><br /><br /><span>0,02€ /mHLX</span></div>
                <div className={classNames(css.bal_bxs)} style={{ display: this.props.bal }}>&nbsp;&nbsp;{balance} &nbsp; <span style={{ color: '#e8b349', fontSize: '14px' }}> mHLX</span><br /><span style={{ marginLeft: "20px" }}>26,67 &nbsp;&nbsp;&nbsp;&nbsp;  <span style={{ fontSize: '15px', marginRight: '9px' }}>EUR</span></span></div>
                <div style={{ marginRight: '30px', marginTop: '-36px' }}>
                    {wallet.ready ? (
                        <React.Fragment>
                            <a href="#" className={classNames(css.main_mn)} style={{ display: this.props.user }}><img src={log} style={{ width: '40px' }} alt="" /></a>
                            <a onClick={this.doLogout.bind(this)} className={classNames(css.setting)} style={{ display: this.props.common }}><FontAwesomeIcon icon={faPowerOff} /> Logout </a>
                            <a onClick={() => this.props.history.push('/settings/editname')} className={classNames(css.setting)} style={{ display: this.props.common }}><FontAwesomeIcon icon={faCog} /> Settings</a>
                            <a onClick={() => this.props.history.push('/wallet')} className={classNames(css.setting)} style={{ display: this.props.main }}><FontAwesomeIcon icon={faTh} /> Main Menu</a>
                        </React.Fragment>
                    ) : (
                            <React.Fragment>
                                <span style={{ float: "right", cursor: 'pointer'}} onClick={() => this.props.history.push('/onboarding/login')} >
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
  clearWalletData
};

export default connect(mapStateToProps, mapDispatchToProps)(withI18n()(Top));;
