import React from 'react';
import { connect } from 'react-redux';
import css from './index.scss';
import classNames from 'classnames';
import { withI18n, Trans } from 'react-i18next';
import PropTypes from 'prop-types';
import images from 'ui/images/ic1.png';

class Done extends React.PureComponent {
    static propTypes = {
        history: PropTypes.object,
        t: PropTypes.func.isRequired,
    };
    render() {
        const { t } = this.props;
        return (
            <div>
                <div className={classNames(css.top_sec)}>


                    <a href="#" className={classNames(css.main_mn)}><img src="" alt="" /></a>
                    <a href="#" className={classNames(css.setting)}><img src="" alt="" />Logout <span>></span></a>
                    <a href="#" className={classNames(css.setting)}><img src="" alt="" />Settings<span>></span></a>

                </div>
                <section className="spage_1">
                    <div className="container">
                        <div className="row">
                            <div className={classNames(css.sseed_box, css.cre_pgs)}>
                                <h4>Welcome Marcel</h4>
                                <div className={classNames(css.sseed_box3)}>
                                    <h5>1337,00 mHLX</h5>
                                    <h5>26,67 EUR</h5>
                                </div>
                                <div className={classNames(css.icon_secs)}>

                                    <div className={(classNames(css.img_sr, css.img_sr_imgss1))}><img src="" alt="" /><h2 className={classNames(css.img_sr_h2)}>Send <span>></span></h2></div>
                                    <div className={(classNames(css.img_sr, css.img_sr_imgss2))}><img src="" alt="" /><h2 className={classNames(css.img_sr_h2)}>Receive <span>></span></h2></div>
                                    <div className={(classNames(css.img_sr, css.img_sr_imgss3))}><img src="" alt="" /><h2 className={classNames(css.img_sr_h2)}>Chart <span>></span></h2></div>
                                    <div className={(classNames(css.img_sr, css.img_sr_imgss4))}><img src="" alt="" /><h2 className={classNames(css.img_sr_h2)}>History <span>></span></h2></div>
                                    <div className={(classNames(css.img_sr, css.img_sr_imgss5))}><img src="" alt="" /><h2 className={classNames(css.img_sr_h2)}>Address Book <span>></span></h2></div>

                                </div>

                            </div>

                        </div>
                    </div>
                </section>
                <footer className={classNames(css.footer)}>

                </footer>
            </div>
        )
    }
}

const mapDispatchToProps = {

};

export default connect(null, mapDispatchToProps)(withI18n()(Done));