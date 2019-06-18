import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';
import image from 'ui/images/ex_mark.png';

import { setAccountInfoDuringSetup } from 'actions/accounts';
import Button from 'ui/components/button'

import css from './index.scss';
class SeedIntro extends React.PureComponent {

    static propTypes = {
        history: PropTypes.object,
        t: PropTypes.func.isRequired,
    };

    state = {
        ledger: false,
    };

    stepForward(route) {
        this.props.setAccountInfoDuringSetup({
            meta: { type: 'keychain' },
        });

        this.props.history.push(`/onboarding/${route}`);
    }

    render() {
        const { t } = this.props;

        return (
            <div>
                <section className="spage_1">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <h1>{t('walletSetup:doYouNeedASeed')}<span> {t('walletSetup:seed')}</span>?</h1>
                            </div>
                            <div className={classNames(css.sseed_box, css.cre_pgs)}>
                                <img src={image} alt="" />
                                <h5>{t('walletSetup:helixSeedIsAccess')}</h5>
                                <h6 style={{ color: '#F0F2F6' }}>{t('walletSetup:explanation')}</h6>
                            </div>
                            <div className={css.onboard_nav}>
                                <Button className="navleft" variant="backgroundNone" onClick={() => this.stepForward('seed-verify')}> >>{t('walletSetup:noIHaveOne')}</Button>
                                <Button className="navright" variant="backgroundNone" onClick={() => this.stepForward('seed-generate')}>{t('walletSetup:yesINeedASeed')}>></Button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        )
    }
}

const mapDispatchToProps = {
    setAccountInfoDuringSetup,
};

export default connect(null, mapDispatchToProps)(withI18n()(SeedIntro));