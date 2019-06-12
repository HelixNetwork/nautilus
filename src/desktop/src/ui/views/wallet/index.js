import React from 'react';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import classNames from 'classnames';
import Dashboard from 'ui/views/wallet/dashboard'
import css from './index.scss';
import Top from '../../components/topbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faDownload, faChartLine, faHistory, faAddressBook } from '@fortawesome/free-solid-svg-icons';

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
                    <Top
                        disp={'none'}
                        history={this.props.history}
                    />
                    <section className="spage_1">
                        <div className="container">
                            <div className="row">
                                <div className={classNames(css.sseed_box1, css.cre_pgs)}>
                                    <h4>{t('welcome:welcome')} Marcel</h4>
                                    <div className={classNames(css.sseed_box31)}>
                                        <h2 style={{ color: '#e8b349' }}>1337,00 mHLX</h2>
                                        <h3>26,67 EUR</h3>
                                    </div>
                                    <div className={classNames(css.icon_secs1)}>
                                        <div onClick={() => history.push('/wallet/send')} className={(classNames(css.img_sr1))}><FontAwesomeIcon icon={faPaperPlane} size='3x' /><h2 className={classNames(css.img_sr_h2)}>{t('history:send')}<span>></span></h2></div>
                                        <div onClick={() => history.push('/wallet/receive')} className={(classNames(css.img_sr1))}><FontAwesomeIcon icon={faDownload} size='3x' /><h2 className={classNames(css.img_sr_h2)}>{t('history:receive')} <span>></span></h2></div>
                                        <div className={(classNames(css.img_sr1))}><FontAwesomeIcon icon={faChartLine} size='3x' /><h2 className={classNames(css.img_sr_h2)}>Chart <span>></span></h2></div>
                                        <div className={(classNames(css.img_sr1))}><FontAwesomeIcon icon={faHistory} size='3x' /><h2 className={classNames(css.img_sr_h2)}>History <span>></span></h2></div>
                                        <div className={(classNames(css.img_sr1))}><FontAwesomeIcon icon={faAddressBook} size='3x' /><h2 className={classNames(css.img_sr_h2)}>Address Book <span>></span></h2></div>
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