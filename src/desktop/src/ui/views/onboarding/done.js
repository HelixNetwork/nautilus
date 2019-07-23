import React from 'react';
import { connect } from 'react-redux';
import css from './index.scss';
import classNames from 'classnames';
import { withI18n, Trans } from 'react-i18next';
import PropTypes from 'prop-types';
import images from 'ui/images/ic1.png';
import Button from 'ui/components/button';
import Top from '../../components/topbar';
import Logos from 'ui/components/logos';
import Lottie from 'react-lottie';
import * as animationData from 'animations/done.json';

class Done extends React.PureComponent {
    static propTypes = {
        history: PropTypes.object,
        t: PropTypes.func.isRequired,
          /** On animation end event callback */
          onEnd: PropTypes.func,
          /** Should animation loop */
          loop: PropTypes.bool,
    };

    /**
     * Navigate to Login view
     * @returns {undefined}
     */

    // stepForward(route) {
    // this.handleClick=this.handleClick.bind(this);

    //     this.props.history.push(`/onboarding/${route}`);
    // }

    // setComplete = () => {
    //     const { history } = this.props;
    //     history.push('/onboarding/login');
    // };

    render() {
        const {  loop, animate, onEnd } = this.props;
        const size = 190;
        const h_size= 120;

        const { t } = this.props;
        const defaultOptions = {
            loop: loop,
            autoplay: true,
            animationData: animationData.default,
            rendererSettings: {
                preserveAspectRatio: 'xMidYMid slice'
            }
        };
        return (
            <div>
                <Logos
                />
                <section className="spage_1">
                    <div className="container">
                        <div className="row">
                        <div className="col-lg-12">
                                <h1 className={classNames(css.head_h1)}>{t('onboardingComplete:allDone')}<span className={classNames(css.text_color)}>!</span></h1>
                            </div>
                            <div className={classNames(css.sseed_box, css.cre_pgs)}>
                                {/* <h1>{t('onboardingComplete:allDone')}<span className={classNames(css.text_color)}>!</span> </h1> */}
                                <Lottie className={classNames(css.lott)}
                    width={size}
                    height={h_size}
                    options={defaultOptions}
                    eventListeners={[
                        {
                            eventName: 'complete',
                            callback: () => {
                                if (typeof onEnd === 'function') {
                                    onEnd();
                                }
                            },
                        },
                    ]}
                />
                                <h6>{t('onboardingComplete:walletReady')}</h6>
                                <div className={classNames(css.icon_secs)}>
                                    <div className={(classNames(css.img_sr, css.img_sr_imgss1))}>
                                        <img src="" alt="" />
                                    </div>
                                </div>
                            </div>
                            <div className={css.onboard_nav}>
                                <Button className="navleft" variant="backgroundNone" onClick={() => this.props.history.push('/onboarding/seed-verify')} >{t('global:goBack')} <span>></span></Button>
                                <Button className="navright" variant="backgroundNone" onClick={() => this.props.history.push('/wallet')} >{t('login:login')} <span>></span></Button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        )
    }
}

const mapDispatchToProps = {

};

export default connect(null, mapDispatchToProps)(withI18n()(Done));