import React from 'react';
import css from 'ui/views/wallet/index.scss';
import fa from './fontawesome.css';
import classNames from 'classnames';
import main from 'ui/images/main.png';
import logout from 'ui/images/logout.png';
import setting from 'ui/images/setting.png';
import log from 'ui/images/log_icon.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog,faPowerOff,faTh } from '@fortawesome/free-solid-svg-icons';
class Top extends React.PureComponent {
    render() {

        
        return (



            <div className={classNames(css.top_sec1)}>
            <div className={classNames(css.bal_bx)} style={{display:this.props.disp}}><span style={{color: 'white',fontSize: '22px'}}>Balance</span><br /><br/><span>0,02€ /mHLX</span></div>
            <div className={classNames(css.bal_bxs)} style={{display:this.props.disp}}>1337,00 &nbsp; <span style={{color: '#e8b349',fontSize: '14px'}}> mHLX</span><br /><span>26,67 &nbsp;  <span style={{fontSize: '15px',marginRight: '9px'}}>EUR</span></span></div>
            <div style={{marginRight:'30px'}}>
            <a href="#" className={classNames(css.main_mn)}><img src={log} style={{width: '40px'}} alt="" /></a>
            <a href="#" className={classNames(css.setting)}><FontAwesomeIcon icon={faPowerOff}/> Logout <span>></span></a>
            <a href="#" className={classNames(css.setting)}><FontAwesomeIcon icon={faCog}/> Settings<span>></span></a>
            <a onClick={()=>this.props.history.push('/wallet')} className={classNames(css.setting)}><FontAwesomeIcon icon={faTh}/> Main Menu<span>></span></a>
            </div>
            
        </div>
        );
    }
}
export default Top;
