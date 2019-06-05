import React from 'react';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import classNames from 'classnames';
import Dashboard from 'ui/views/wallet/dashboard'
import css from './index.scss';
import ic1 from 'ui/images/ic1.png';
import ic2 from 'ui/images/ic2.png';
import ic3 from 'ui/images/ic3.png';
import ic4 from 'ui/images/ic4.png';
import ic5 from 'ui/images/ic5.png';
import logout from 'ui/images/logout.png';
import setting from 'ui/images/setting.png';



/**
 * Wallet functionallity router wrapper component
 */
class Wallet extends React.PureComponent {
    static propTypes = {
        location: PropTypes.object,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        t: PropTypes.func.isRequired,
    }
    render() {
        const { location, history, t } = this.props;
        const currentKey = location.pathname.split('/')[2] || '/';
        if (currentKey == '/') {
            return (
                <div>
                    <div className={classNames(css.top_sec1)}>
                        <a href="#" className={classNames(css.main_mn)}><img src="" alt="" /></a>
                        <a href="#" className={classNames(css.setting)}><img src={logout} alt="" />Logout <span>></span></a>
                        <a href="#" className={classNames(css.setting)}><img src={setting} alt="" />Settings<span>></span></a>
                    </div>
                    <section className="spage_1">
                        <div className="container">
                            <div className="row">
                                <div className={classNames(css.sseed_box1, css.cre_pgs)}>
                                    <h4>Welcome Marcel</h4>
                                    <div className={classNames(css.sseed_box31)}>
                                        <h5>1337,00 mHLX</h5>
                                        <h5>26,67 EUR</h5>
                                    </div>
                                    <div className={classNames(css.icon_secs1)}>
                                        <div onClick={() => history.push('/wallet/send')} className={(classNames(css.img_sr1))}><img src={ic1} className={classNames(css.img)} alt="" /><h2 className={classNames(css.img_sr_h2)}>Send <span>></span></h2></div>
                                        <div onClick={() => history.push('/wallet/receive')} className={(classNames(css.img_sr1))}><img src={ic2} className={classNames(css.img)} alt="" /><h2 className={classNames(css.img_sr_h2)}>Receive <span>></span></h2></div>
                                        <div className={(classNames(css.img_sr1))}><img src={ic3} className={classNames(css.img)} alt="" /><h2 className={classNames(css.img_sr_h2)}>Chart <span>></span></h2></div>
                                        <div className={(classNames(css.img_sr1))}><img src={ic4} className={classNames(css.img)} alt="" /><h2 className={classNames(css.img_sr_h2)}>History <span>></span></h2></div>
                                        <div className={(classNames(css.img_sr1))}><img src={ic5} className={classNames(css.img)} alt="" /><h2 className={classNames(css.img_sr_h2)}>Address Book <span>></span></h2></div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </section>
                    <footer className={classNames(css.footer)}>

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
});

const mapDispatchToProps = {
};
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withI18n()(Wallet)));