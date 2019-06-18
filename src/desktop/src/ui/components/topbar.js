import React from 'react';
import css from 'ui/views/wallet/wallet.scss';
import fa from './fontawesome.css';
import classNames from 'classnames';
import log from 'ui/images/log_icon.png';
import logo from 'ui/images/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog,faPowerOff,faTh } from '@fortawesome/free-solid-svg-icons';
class Top extends React.PureComponent {
    render() {

        
        return (
            <div className={classNames(css.top_sec1)}>
            <div className={classNames(css.lg_logos)}><img src={logo} alt=""/></div>
            <div className={classNames(css.bal_bx)} style={{display:this.props.bal}}><span style={{color: 'white',fontSize: '22px'}}>Balance</span><br /><br/><span>0,02€ /mHLX</span></div>
            <div className={classNames(css.bal_bxs)} style={{display:this.props.bal}}>1337,00 &nbsp; <span style={{color: '#e8b349',fontSize: '14px'}}> mHLX</span><br /><span>26,67 &nbsp;&nbsp;&nbsp;&nbsp;  <span style={{fontSize: '15px',marginRight: '9px'}}>EUR</span></span></div>
            <div style={{marginRight:'30px',marginTop:'-36px'}}>
            <a href="#" className={classNames(css.main_mn)} style={{display:this.props.user}}><img src={log} style={{width: '40px'}} alt="" /></a>
            <a onClick={()=>this.props.history.push('/')} className={classNames(css.setting)}><FontAwesomeIcon icon={faPowerOff}/> Logout </a>
            <a onClick={()=>this.props.history.push('/settings')} className={classNames(css.setting)}><FontAwesomeIcon icon={faCog}/> Settings</a>
            <a onClick={()=>this.props.history.push('/wallet')} className={classNames(css.setting)} style={{display:this.props.main}}><FontAwesomeIcon icon={faTh}/> Main Menu</a>
            </div>
            
        </div>
        );
    }
}
export default Top;
