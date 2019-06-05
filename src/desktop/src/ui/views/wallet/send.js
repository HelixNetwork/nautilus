import React from 'react';
import { connect } from 'react-redux';
import css from './index.scss';
import classNames from 'classnames';
import images from 'ui/images/ic1.png';
import Top from '../../components/topbar';
import PropTypes from 'prop-types';
import ic1 from 'ui/images/send_bt.png';

class Send extends React.PureComponent {
    static propTypes = {
        location: PropTypes.object,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        t: PropTypes.func.isRequired,
    }
    render() {
        const {history} = this.props;
        return (
            <div>
                <section className={css.home}>

                   <Top
                   disp={'block'}
                   history = {history}
                   />
                    <div className={classNames(css.pg1_foo3)}>
                        <div className="container">
                            <div className="row">

                                <div className="col-lg-12">
                                    <div className={classNames(css.foo_bxx1)}>
                                        <h3 >Send HLX Coins<span>.</span></h3>
                                        <h6>Please note once funds are submitted, the transactions are irrevocable!</h6>
                                        <div className={classNames(css.bbx_box1, css.tr_box)}>
                                            <span className={classNames(css.er1)}>EUR</span>
                                            <span className={classNames(css.er2)}>26,74</span>
                                        </div>
                                       <h1 className={css.eq}>=</h1> 
                                        <div className={classNames(css.bbx_box1)}>
                                            <span className={classNames(css.er1)}>mHLX</span>
                                            <span className={classNames(css.er2)}>1337,00</span>
                                        </div>
                                        <h5>Enter Receiver Address</h5>
                                        <input type="text" name="name" className={css.reci_text} /> <br />
                                        <a href="#" className={css.send_bts}><img src={ic1} alt="" /></a>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                    <footer className={classNames(css.footer)}></footer>


                </section>
            </div>
        )
    }
}
const mapDispatchToProps = {

};
export default connect(null, mapDispatchToProps)(Send);