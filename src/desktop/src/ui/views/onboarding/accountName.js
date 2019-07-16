import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';

import { getAccountNamesFromState } from 'selectors/accounts';

import classNames from 'classnames';
import Button from 'ui/components/button';
import Input from 'ui/components/input/text';
import { setAccountInfoDuringSetup } from 'actions/accounts';
import css from './index.scss';
import Logos from 'ui/components/logos';

class AccountName extends React.PureComponent {
    static propTypes = {
        history: PropTypes.object,
        t: PropTypes.func.isRequired,
        accountNames: PropTypes.array.isRequired,
        additionalAccountMeta: PropTypes.object.isRequired,
        additionalAccountName: PropTypes.string.isRequired,
        setAccountInfoDuringSetup: PropTypes.func.isRequired
    };
    state = {
        name:
            this.props.additionalAccountName && this.props.additionalAccountName.length
                ? this.props.additionalAccountName
                : '',
    };
    stepForward(route) {
        this.props.setAccountInfoDuringSetup({
            meta: { type: 'keychain' },
        });

        this.props.history.push(`/onboarding/${route}`);
    }

    setName = async (event) => {
        event.preventDefault();

        const { accountNames, history, generateAlert, t } = this.props;
        console.log("here", this.state.name)
        const name = this.state.name.replace(/^\s+|\s+$/g, '');

        this.props.setAccountInfoDuringSetup({
            name: this.state.name
        });

        if (Electron.getOnboardingGenerated()) {
            history.push('/onboarding/seed-backup');
        } else {
            history.push('/onboarding/account-password');
        }
    }

    render() {
        const { t } = this.props;
        const { name } = this.state;
        
        return (
            
            <section className="spage_1">
                <Logos size={20} />
                <div className="container">
                    <div className="row">
                        <form onSubmit={this.setName}>
                            <div className="col-lg-12">
                                {/* <h1>{t('walletSetup:Seed Verify')}<span> {t('walletSetup:seed')}</span></h1> */}
                            </div>
                            <div className={classNames(css.sseed_box, css.cre_pgs)}>
                                <h4>{t('setSeedName:letsAddName')}</h4>
                                <h5>{t('setSeedName:setAccountName')}</h5>
                                <Input
                                    value={name}
                                    focus
                                    label={t('addAdditionalSeed:accountName')}
                                    onChange={(value) => this.setState({ name: value })}
                                />
                                <br />
                                {/* <img src={images} alt="send" className={(classNames(css.img))} /> */}
                                <div className={css.onboard_btn}>
                                    <Button className="navleft" variant="backgroundNone" onClick={() => this.stepForward('seed-generate')}>{t('global:goBack')} <span>></span></Button>
                                    <Button type="submit" className="navright" variant="backgroundNone">{t('global:confirm')} <span>></span></Button>
                                </div>
                            </div>

                        </form>
                    </div>
                </div>
                <footer className={classNames(css.footer)}>

                </footer>
            </section>

        )
    }
}

const mapStateToProps = (state) => ({
    accountNames: getAccountNamesFromState(state),
    additionalAccountMeta: state.accounts.accountInfoDuringSetup.meta,
    additionalAccountName: state.accounts.accountInfoDuringSetup.name
});

const mapDispatchToProps = {
    setAccountInfoDuringSetup,
};

export default connect(mapStateToProps, mapDispatchToProps)(withI18n()(AccountName));