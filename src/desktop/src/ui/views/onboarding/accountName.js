import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';

import { getAccountNamesFromState } from 'selectors/accounts';
import { generateAlert } from 'actions/alerts';
import classNames from 'classnames';
import Button from 'ui/components/button';
import Input from 'ui/components/input/text';
import { setAccountInfoDuringSetup } from 'actions/accounts';
import css from './index.scss';
import Logos from 'ui/components/logos';
import { MAX_ACC_LENGTH } from 'libs/crypto';
import SeedStore from 'libs/seed';

class AccountName extends React.PureComponent {
    static propTypes = {
        history: PropTypes.object,
        t: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        accountNames: PropTypes.array.isRequired,
        additionalAccountMeta: PropTypes.object.isRequired,
        additionalAccountName: PropTypes.string.isRequired,
        setAccountInfoDuringSetup: PropTypes.func.isRequired
    };
    state = {
        isGenerated: Electron.getOnboardingGenerated(),

        name:
            this.props.additionalAccountName && this.props.additionalAccountName.length
                ? this.props.additionalAccountName
                : '',
    };

    setName = async (event) => {
        event.preventDefault();

        const { wallet, accountNames, history, generateAlert, t } = this.props;
        const name = this.state.name.replace(/^\s+|\s+$/g, '');

        console.log("Account props", this.props);

        console.log("Acount", Electron.getOnboardingGenerated());
        console.log("Acount Names", accountNames);
        Electron.setOnboardingName(name);
        if (!name.length) {
            generateAlert('error', t('addAdditionalSeed:noNickname'), t('addAdditionalSeed:noNicknameExplanation'), 1000);
            return;
        }

        if (name.length > MAX_ACC_LENGTH) {
            generateAlert(
                'error',
                t('addAdditionalSeed:accountNameTooLong'),
                t('addAdditionalSeed:accountNameTooLongExplanation', { maxLength: MAX_ACC_LENGTH }),
            );
            return;
        }


        this.props.setAccountInfoDuringSetup({
            name: this.state.name,
            completed: !Electron.getOnboardingGenerated() && accountNames.length > 0,
        });

        if (Electron.getOnboardingGenerated()) {
            history.push('/onboarding/seed-backup');
        } else {
            if (accountNames.length > 0) {
                const seedStore = await new SeedStore.keychain(wallet.password);
                await seedStore.addAccount(this.state.name, Electron.getOnboardingSeed());
                history.push('/onboarding/login');
            } else {
                history.push('/onboarding/account-password');
            }
        }
    }

    render() {
        const { t, generateAlert } = this.props;
        const { name, isGenerated } = this.state;
        console.log("Name->SeedIsGenerated====", isGenerated);

        return (

            <section className="spage_1">
                <Logos size={20} />
                <div className="container">
                    <div className="row">
                        <form onSubmit={this.setName}>
                            <div className="col-lg-12">
                                <h1>{t('setSeedName:setAccountName')}<span className={classNames(css.text_color)}>.</span></h1>
                            </div>
                            <div className={classNames(css.sseed_box, css.cre_pgs, css.hlx_box)}>
                                <h4 style={{ marginTop: "8vw" }}>{t('setSeedName:letsAddName')}</h4>
                                <Input
                                    value={name}
                                    focus
                                    label={t('addAdditionalSeed:accountName')}
                                    onChange={(value) => this.setState({ name: value })}
                                />
                            </div>
                            <div className={css.onboard_btn}>
                                <Button className="navleft" variant="backgroundNone" to={`/onboarding/seed-${isGenerated ? 'generate' : 'import'}`} >{t('global:goBack')} <span>></span></Button>
                                <Button type="submit" className="navright" variant="backgroundNone">{t('global:confirm')} <span>></span></Button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

        )
    }
}

const mapStateToProps = (state) => ({
    accountNames: getAccountNamesFromState(state),
    additionalAccountMeta: state.accounts.accountInfoDuringSetup.meta,
    additionalAccountName: state.accounts.accountInfoDuringSetup.name,
    wallet: state.wallet,
});

const mapDispatchToProps = {
    setAccountInfoDuringSetup,
    generateAlert
};

export default connect(mapStateToProps, mapDispatchToProps)(withI18n()(AccountName));