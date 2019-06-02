import React from 'react';
import { connect } from 'react-redux';
import css from './index.scss';
import classNames from 'classnames';
import images  from 'ui/images/ic1.png';



class HelixCoin extends React.PureComponent {
    render() {
        return (
            <div>
                <section className={css.home}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                         <div className={classNames(css.sseed_box, css.cre_pgs)}>
                                <h3>Send HLX Coins<span>.</span></h3>
                                <h6>Please note once funds are submitted, the transactions are irrevocable!</h6>
                                {/* <div className={classNames(css.form)}>
                                    <span className={classNames(css.sseed_box2)}>EUR</span>
                                    <span className={classNames(css.sseed_box2)}>26,74</span>
                                </div>
                                <div className={classNames(css.form)}>
                                     <span className={classNames(css.sseed_box2)}>mHLX</span>
                                     <span className={classNames(css.sseed_box2)}>1337,00</span>
                                </div> */}
                                <h5>Enter Reciever Address</h5>
                                {/* <input type="text" className={classNames(css.sseed_text)}></input>
                                <img src={images} alt="send" className={(classNames(css.img))}/> */}
                            </div>
                        </div>
                    </div>

                </div>
                </section>
                <footer classname={(classNames(css.footer))}>
                    <ul>
                        <li className={classNames(css.footer)}><a href="#">0</a></li>
                        <li><a href="#">1</a></li>
                        <li><a href="#">2</a></li>
                        <li><a href="#">3</a></li>
                        <li><a href="#">4</a></li>
                        <li className="db_none"><a href="#">5</a></li>
                    </ul>
                </footer>
            </div>
        )
    }
}
const mapDispatchToProps = {

};
export default connect(null, mapDispatchToProps)(HelixCoin);