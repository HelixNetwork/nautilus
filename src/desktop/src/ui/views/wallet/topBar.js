import React,{Component} from 'react';
import logo from 'ui/images/logo.png';
import css from './wallet.scss';
import hlx from 'ui/images/hlx.png';
class TopBar extends Component {
    state = {  }
    render() { 
        return ( 
            <div>
                <div className={css.top}>
                    <img src={logo}/>
                        <div className={css.topIn}>    
                            <h4>BALANCE</h4>
                            <br/>
                            <p>.</p><h6>€0.02/mHLX</h6>
                        </div>
                        <div className={css.topBal}>
                            <img src={hlx}/>
                            <h2>1337,0</h2>
                            <hr/>
                        </div>
                        <div className={css.topRight1}>
                                <h6>#MF_Private</h6>
                                <br/>
                                <h4>ACCOUNT 1</h4>
                                <hr/>
                        </div>
                        <div className={css.topRight}>    
                            
                            <h4>MARCEL</h4>
                            <br/>
                            <p>.</p><h6>CONNECTED</h6>
                        </div>
                </div>
                <hr className={css.topBorder}/>
            </div>
         );
    }
}
 
export default TopBar;