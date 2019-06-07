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

    /**
     * Navigate to Login view
     * @returns {undefined}
     */
    setComplete = () => {
        const { history } = this.props;
        history.push('/onboarding/login');
    };

    render() {
        const { t } = this.props;
        return (
            <div>
                <section className="spage_1">
                    <div className="container">
                        <div className="row">
                            <div className={classNames(css.sseed_box, css.cre_pgs)}>
                                <h1>{t('onboardingComplete:allDone')}</h1>
                                <p>{t('onboardingComplete:walletReady')}</p>
                                <div className={classNames(css.icon_secs)}>
                                    <div className={(classNames(css.img_sr, css.img_sr_imgss1))}>
                                        <img src="" alt="" />
                                        <h2 onClick={() => this.setComplete()} className={classNames(css.img_sr_h2)}>{t('login:login')}<span>></span>
                                        </h2>
                                    </div>
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