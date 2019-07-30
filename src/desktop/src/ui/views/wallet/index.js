import React from 'react';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import classNames from 'classnames';
import Dashboard from 'ui/views/wallet/dashboard';
import img from 'ui/images/svg/send.svg';
import img1 from 'ui/images/svg/recieve.svg';
import img2 from 'ui/images/svg/chart.svg';
import img3 from 'ui/images/svg/history.svg';
import css from './wallet.scss';
import Top from '../../components/topbar';
import Button from '../../components/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faChartLine, faHistory, faExchange} from '@fortawesome/free-solid-svg-icons';
import { faPaperPlane } from '@fortawesome/free-regular-svg-icons';
import {getAccountNamesFromState} from 'selectors/accounts';
/**
 * Wallet functionallity router wrapper component
 */
class Wallet extends React.PureComponent {
    static propTypes = {
        accountInfo:PropTypes.object.isRequired,
        accounts:PropTypes.array.isRequired,
        location: PropTypes.object,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        t: PropTypes.func.isRequired,
    }
componentDidMount(){
    console.log('indash',this.props.accountInfo);
    console.log('accounts',this.props.getAccounts);
}

    render() {
        let styles = {
            color: '#E9B339',
            fontSize: '50px'

        };

        const { location, history, accounts,t } = this.props;
        const currentKey = location.pathname.split('/')[2] || '/';
        if (currentKey == '/') {
            return (
                <div>
                    <Top
                        bal={'block'}
                        main={'none'}
                        user={'block'}
                        history={this.props.history}
                    />
                    <section className="spage_1">
                        <div className="container">
                            <div className="row">
                                {/* <div className={classNames(css.sseed_box1, css.cre_pgs)}>
                                    
                                </div> */}
                                <h4 className={classNames(css.welcome)}>{t('welcome:welcome')} Marcel <span style={styles}>.</span> </h4>
                                    <div className={classNames(css.welcome_box)}>
                                        <h2 style={{ color: '#e8b349' }}>1337,00 mHLX</h2>
                                        <h3>26,67 EUR</h3>
                                    </div>
                                    <div className={classNames(css.icon_secs1)}>
                                         {/* <div onClick={() => history.push('/wallet/send')} className={(classNames(css.img_sr1))}><img src={img} size='3x' /><h2 className={classNames(css.img_sr_h2)}>Send <span>></span></h2></div>
                                        <div onClick={() => history.push('/wallet/receive')} className={(classNames(css.img_sr1))}><img src={img1} size='3x' /><h2 className={classNames(css.img_sr_h2)}>Receive <span>></span></h2></div>
                                        <div onClick={() => history.push('/wallet/chart')}className={(classNames(css.img_sr1))}><img src={img2} size='3x' /><h2 className={classNames(css.img_sr_h2)}>Chart <span>></span></h2></div>
                                        <div onClick={() => history.push('/wallet/history')}className={(classNames(css.img_sr1))}><img src={img3} size='3x' /><h2 className={classNames(css.img_sr_h2)}>History <span>></span></h2></div> */}
                                         <div onClick={() => history.push('/wallet/send')} className={(classNames(css.img_send))}><FontAwesomeIcon icon={faPaperPlane} size='3x' /><h2 className={classNames(css.img_send_h2)}>Send <span>></span></h2></div> 
                                        <div onClick={() => history.push('/wallet/receive')} className={(classNames(css.img_sr1))}><FontAwesomeIcon icon={faDownload} size='3x' /><h2 className={classNames(css.img_sr_h2)}>Receive <span>></span></h2></div>
                                        <div onClick={() => history.push('/wallet/chart')}className={(classNames(css.img_sr1))}><FontAwesomeIcon icon={faChartLine} size='3x' /><h2 className={classNames(css.img_sr_h2)}>Chart <span>></span></h2></div>
                                        <div onClick={() => history.push('/wallet/history')}className={(classNames(css.img_sr1))}><FontAwesomeIcon icon={faHistory} size='3x' /><h2 className={classNames(css.img_sr_h2)}>History <span>></span></h2></div>
                                    
                                        {/* <div className={(classNames(css.img_sr1))}><FontAwesomeIcon icon={faExchange} size='3x' /><h2 className={classNames(css.img_sr_h2)}>Swap <span>></span></h2></div> */}
                                </div>
                            </div>
                        </div>
                        {/* <div className="row">

                            <div className={(classNames(css.drop_fxbx))}>
                                
                            </div>
                        </div> */}
                    </section>
                    <footer className={classNames(css.footer)}>
                        <div className={classNames(css.box)}>
                            {accounts.map((account,index)=>{
                                return(<div className={(classNames(css.marc_bx))} key={index}>&nbsp;&nbsp;{account}<br /><span>Account{index+1}</span></div>)
                            })}
                            
                            <div className={(classNames(css.marc_bx, css.cc_clrs))}><a onClick={()=>history.push('/onboarding/seed-intro')}>+Add Account</a></div>
                        </div>
                    </footer>
                </div>

            );
        }
        return (
            <Dashboard></Dashboard>
        );

    }
}
const mapStateToProps = (state) => ({
        accountInfo:state.accounts.accountInfo,
        accounts:getAccountNamesFromState(state)

});

const mapDispatchToProps = {
};
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withI18n()(Wallet)));