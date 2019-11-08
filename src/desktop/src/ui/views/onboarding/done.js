import React from 'react';
import { connect } from 'react-redux';
import css from './index.scss';
import classNames from 'classnames';
import { withI18n } from 'react-i18next';
import PropTypes from 'prop-types';
import Button from 'ui/components/button';
import Logos from 'ui/components/logos';
import Lottie from 'react-lottie';
import { setPassword } from 'actions/wallet';
import * as animationData from 'animations/done.json';
import { Row } from 'react-bootstrap';
import { setOnboardingComplete } from 'actions/accounts';

class Done extends React.PureComponent {
    static propTypes = {
        history: PropTypes.object,
        t: PropTypes.func.isRequired,
        /** On animation end event callback */
        onEnd: PropTypes.func,
        /** Should animation loop */
        loop: PropTypes.bool,
        setPassword: PropTypes.func.isRequired,
        setOnboardingComplete: PropTypes.func.isRequired,
    };

    /**
     * Navigate to Login view
     * @returns {undefined}
     */

    render() {
        const { loop, onEnd } = this.props;
        const size = 190;
        const h_size = 120;

        const { history, t, setOnboardingComplete } = this.props;
        const defaultOptions = {
            loop: loop,
            autoplay: true,
            animationData: animationData.default,
            rendererSettings: {
                preserveAspectRatio: 'xMidYMid slice',
            },
        };
        return (
            <div>
                <Logos history={history} />
                <Row style={{ marginTop: '5vw' }}>
                    <h1 className={classNames(css.head_h1)}>
                        {t('onboardingComplete:allDone')}
                        <span className={classNames(css.text_color)}>!</span>
                    </h1>
                </Row>

                <Row className={css.centerBox1}>
                    <Lottie
                        className={classNames(css.lott)}
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
                </Row>

                <Row>
                    <Button
                        className="navleft"
                        variant="backgroundNone"
                        onClick={() => this.props.history.push('/onboarding/seed-import')}
                    >
                        <span>&lt;</span> {t('global:goBack')}
                    </Button>
                    <Button
                        className="navright"
                        variant="backgroundNone"
                        onClick={() => {
                            setPassword({});
                            setOnboardingComplete(true);
                            this.props.history.push('/onboarding/login');
                        }}
                    >
                        {t('login:login')} <span>></span>
                    </Button>
                </Row>
            </div>
        );
    }
}

const mapDispatchToProps = {
    setPassword,
    setOnboardingComplete,
};

export default connect(
    null,
    mapDispatchToProps,
)(withI18n()(Done));
