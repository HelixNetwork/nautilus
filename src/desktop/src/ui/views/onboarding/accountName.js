import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';
import classNames from 'classnames';
import images from 'ui/images/ic1.png';
import css from './index.scss';
import Logos from 'ui/components/logos';

class AccountName extends React.PureComponent {
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
          
            <section className="spage_1">
              <Logos size={20} />
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            {/* <h1>{t('walletSetup:Seed Verify')}<span> {t('walletSetup:seed')}</span></h1> */}
                        </div>
                        <div className={classNames(css.sseed_box, css.cre_pgs)}>
                            <h4>{t('setSeedName:letsAddName')}</h4>
                            <h5>{t('setSeedName:setAccountName')}</h5>
                            <input type="text" className={classNames(css.sseed_text)}></input><br />
                            <img src={images} alt="send" className={(classNames(css.img))} />

                        </div>
                        <div className={css.onboard_nav}>
                            {/* <span className={css.navleft} onClick={() => this.stepForward('seed-verify')}>{t('walletSetup:noIHaveOne')}</span>
                        <span className={css.navright} onClick={() => this.stepForward('helixcoin')}>{t('walletSetup:coin')}></span> */}
                        </div>

                    </div>
                </div>
                <footer className={classNames(css.footer)}>

                </footer>
            </section>

        )
    }
}

const mapDispatchToProps = {
};

export default connect(null, mapDispatchToProps)(withI18n()(AccountName));