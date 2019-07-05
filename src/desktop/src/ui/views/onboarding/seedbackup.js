import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';
import Button from 'ui/components/button';
import { setAccountInfoDuringSetup } from 'actions/accounts';
import Logos from 'ui/components/logos';
import css from './index.scss';

class SeedBackup extends React.PureComponent{
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
    render(){
        const{ history, t }=this.props;
        return (
            <div>
                <Logos size={20} />

                <section className="spage_1">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <h1 className={classNames(css.head_h1)}>{t('saveYourSeed:saveYourSeed')}</h1>
                            </div>
                            <div className={classNames(css.sseed_box, css.cre_pgs)}>
                                 <div className={classNames(css.filebox)}>
                                        <input type="file"  ref="fileUploader" style={{}}/>
                                 </div>
                            </div>
                            <div className={css.onboard_nav}>
                                <Button className="navleft" variant="backgroundNone" onClick={() => this.stepForward('account-name')}>{t('global:goBack')} <span>></span></Button>
                                <Button className="navright" variant="backgroundNone" onClick={() => this.stepForward('seed-save')}>{t('global:confirm')} <span>></span></Button>
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

export default connect(null, mapDispatchToProps)(withI18n()(SeedBackup));