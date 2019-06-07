import React from 'react';
import { connect } from 'react-redux';
import css from './index.scss';
import classNames from 'classnames';
import main from 'ui/images/main.png';
import logout from 'ui/images/logout.png';
import setting from 'ui/images/setting.png';
import log from 'ui/images/log_icon.png';



class Receive extends React.PureComponent {
    render() {
        return (
            <div>
                <section className={css.home}>

                    <div className={classNames(css.top_sec1)}>
                        <div className={classNames(css.bal_bx)}>Balance<br /><span>0,02€ /mHLX</span></div>
                        <div className={classNames(css.bal_bxs)}>1337,00 &nbsp; mHLX<br /><span>26,67 &nbsp; EUR</span></div>

                        <a href="#" className={classNames(css.main_mn)}><img src={main} alt="" /></a>
                        <a href="#" className={classNames(css.setting)}><img src={logout} alt="" />Logout <span>></span></a>
                        <a href="#" className={classNames(css.setting)}><img src={setting} alt="" />Settings<span>></span></a>
                        <a href="#" className={classNames(css.setting)}><img src={log} alt="" />Main Menu<span>></span></a>
                    </div>
                    <div className={classNames(css.pg1_foo3)}>
                        <div className="container">
                            <div className="row">

                                <div className="col-lg-12">
                                    <div className={classNames(css.foo_bxx1)}>
                                        <h3>Recieve HLX Coins<span>.</span></h3>
                                        <h6>Please note once funds are submitted, the transactions are irrevocable!</h6>
                                        {/* <div className={classNames(css.sseed_box2,css.sec_bxc)}>
                                             <h3 >Press 10 more letters to randomise your seed even more</h3>
                                             <div className={classNames(css.text_ff)}><span>A</span> A H H 1 M B 3 H I I U T Z H D F H</div>
                                             <div className={classNames(css.text_ff)}><span>A</span> A H H 1 M B 3 H I I U T Z H D F H</div>
                                             <div className={classNames(css.text_ff)}><span>A</span> A H H 1 M B 3 H I I U T Z H D F H</div>
                                             <div className={classNames(css.text_ff)}><span>A</span> A H H 1 M B 3 H I I U T Z H D F H</div>
                                        </div> */}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>


                    <ul>
                        <li className={classNames(css.footer)}><a href="#">0</a></li>
                        <li><a href="#">1</a></li>
                        <li><a href="#">2</a></li>
                        <li><a href="#">3</a></li>
                        <li><a href="#">4</a></li>
                        <li className="db_none"><a href="#">5</a></li>
                    </ul>
                </section>
            </div>
        )
    }
}
const mapDispatchToProps = {

};
export default connect(null, mapDispatchToProps)(Receive);