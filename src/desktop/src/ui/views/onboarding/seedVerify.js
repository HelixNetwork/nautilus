import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';
import classNames from 'classnames';

import css from './index.scss';

class SeedVerify extends React.PureComponent {
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
        const {t}=this.props;
        return (
            <section className="spage_1">
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        {/* <h1>{t('walletSetup:Seed Verify')}<span> {t('walletSetup:seed')}</span></h1> */}
                    </div>
                    <div className={classNames(css.sseed_box, css.cre_pgs)}>
                        <img src="images/ex_mark.png" alt="" />
                        <h4>Let's add a name</h4>
                        <h5>Set your Account Name</h5>
                    <input type="text" className={classNames(css.sseed_text)}></input>
                    </div>
                    <div className={css.onboard_nav}>
                        {/* <span className={css.navleft} onClick={() => this.stepForward('seed-verify')}>{t('walletSetup:noIHaveOne')}</span>
                        <span className={css.navright} onClick={() => this.stepForward('seed-generate')}>{t('walletSetup:yesINeedASeed')}></span> */}
                    </div>
                   
                </div>
            </div>
        </section>

        )
    }
}

const mapDispatchToProps = {
};

export default connect(null, mapDispatchToProps)(withI18n()(SeedVerify));