import React from 'react';
import css from 'ui/views/wallet/index.scss';
import classNames from 'classnames';
import main from 'ui/images/main.png';
import logout from 'ui/images/logout.png';
import setting from 'ui/images/setting.png';
import log from 'ui/images/log_icon.png';
class Top extends React.PureComponent {
    render() {

        
        return (



            <div className={classNames(css.top_sec1)}>
            <div className={classNames(css.bal_bx)}>Balance<br /><br/><span>0,02€ /mHLX</span></div>
            <div className={classNames(css.bal_bxs)}>1337,00 &nbsp; mHLX<br /><span>26,67 &nbsp; EUR</span></div>
            <div style={{marginRight:'10px'}}>
            <a href="#" className={classNames(css.main_mn)}><img src={log} alt="" /></a>
            <a href="#" className={classNames(css.setting)}><img src={logout} alt="" /> Logout <span>></span></a>
            <a href="#" className={classNames(css.setting)}><img src={setting} alt="" /> Settings<span>></span></a>
            <a onClick={()=>this.props.history.push('/wallet')} className={classNames(css.setting)}><img src={main} alt="" /> Main Menu<span>></span></a>
            </div>
            
        </div>
        );
    }
}
export default Top;
