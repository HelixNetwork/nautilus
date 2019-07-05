import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';
import classNames from 'classnames';
import images from 'ui/images/ic1.png';
import Button from 'ui/components/button';
import Top from '../../components/topbar';
import Logos from 'ui/components/logos';

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
        // this.handleClick=this.handleClick.bind(this);

        this.props.history.push(`/onboarding/${route}`);
    }

    // handleClick(e) {
    //     debugger;
    //     e.preventDefault();
    //     this.context.router.history.push('/done');
    // }

    render() {
        const { t } = this.props;
        return (
            <div>
                <Logos
                />
                <section className="spage_1">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                {/* <h1>{t('walletSetup:Seed Verify')}<span> {t('walletSetup:seed')}</span></h1> */}
                            </div>
                            <div className={classNames(css.sseed_box, css.cre_pgs)}>

                                <h5>{t('setSeedName:setAccountName')}</h5>
                                <input type="text" className={classNames(css.sseed_textline)}></input><br /><br />
                                {/* <img src={images} alt="send" className={(classNames(css.img))}/> */}

                            </div>
                            <div className={css.onboard_nav}>
                                <Button className="navleft" variant="backgroundNone" onClick={() => this.stepForward('seed-save')}>{t('global:goBack')} <span>></span></Button>
                                <Button className="navright" variant="backgroundNone" onClick={() => this.stepForward('done')}>{t('global:confirm')} <span>></span></Button>
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

export default connect(null, mapDispatchToProps)(withI18n()(SeedVerify));