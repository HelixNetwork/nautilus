import React from 'react';
import { connect } from 'react-redux';
import Logos from 'ui/components/logos';
import css from './index.scss';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { setAccountInfoDuringSetup } from 'actions/accounts';
import { withI18n, Trans } from 'react-i18next';
import Button from 'ui/components/button';

class SeedSave extends React.PureComponent {
  
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
        const { history, t } = this.props;
        return (
            <div>
            <Logos/>
            <section className="spage_1">
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                    <h1>Enter Seed</h1>
                  
                    </div>
                    <div className={classNames(css.sseed_box, css.cre_pgs)}>

                        <h5>{t('seedReentry:enterYourSeed')}</h5>
                        <input type="text" className={classNames(css.sseed_textline)}></input><br /><br />
                        <div className={classNames(css.filebox)}>
                             <input id="file-upload" type="file"  ref="" style={{}}/>
                             <label for="file-upload">Upload Seed or type text</label>
                        </div>
                    </div>
                    <div className={css.onboard_nav}>
                        
                        <Button className="navleft" variant="backgroundNone" onClick={() => this.stepForward('seed-wallet')}>{t('global:goBack')} <span>></span></Button>
                        <Button className="navright" variant="backgroundNone" onClick={() => this.stepForward('seed-verify')}>{t('global:confirm')} <span>></span></Button>
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

export default connect(null, mapDispatchToProps)(withI18n()(SeedSave));