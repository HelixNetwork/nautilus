import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';

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
import { Row } from 'react-bootstrap';

/**
 * Onboarding, Set account name
 */
class AccountName extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        history: PropTypes.object,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        accountNames: PropTypes.array.isRequired,
        /** @ignore */
        additionalAccountMeta: PropTypes.object.isRequired,
        /** @ignore */
        additionalAccountName: PropTypes.string.isRequired,
        /** @ignore */
        setAccountInfoDuringSetup: PropTypes.func.isRequired,
    };
    state = {
        // eslint-disable-next-line no-undef
        isGenerated: Electron.getOnboardingGenerated(),

        name:
            // eslint-disable-next-line no-undef
            Electron.getOnboardingName() && Electron.getOnboardingName().length
                ? // eslint-disable-next-line no-undef
                  Electron.getOnboardingName()
                : '',
    };

    /**
     * Check for valid account name
     * @param {Event} event - Form submit event
     * @returns {undefined}
     */

    setName = async (event) => {
        event.preventDefault();

        const { wallet, accountNames, history, generateAlert, t } = this.props;
        const name = this.state.name.replace(/^\s+|\s+$/g, '');

        // eslint-disable-next-line no-undef
        Electron.setOnboardingName(name);
        if (!name.length) {
            generateAlert(
                'error',
                t('addAdditionalSeed:noNickname'),
                t('addAdditionalSeed:noNicknameExplanation'),
                1000,
            );
            return;
        }

        if (name.length > MAX_ACC_LENGTH) {
            generateAlert(
                'error',
                t('addAdditionalSeed:accountNameTooLong'),
                t('addAdditionalSeed:accountNameTooLongExplanation', {
                    maxLength: MAX_ACC_LENGTH,
                }),
                1000,
            );
            return;
        }

        if (accountNames.map((accountName) => accountName.toLowerCase()).indexOf(name.toLowerCase()) > -1) {
            generateAlert('error', t('addAdditionalSeed:nameInUse'), t('addAdditionalSeed:nameInUseExplanation'));
            return;
        }

        this.props.setAccountInfoDuringSetup({
            name: this.state.name,
            // eslint-disable-next-line no-undef
            completed: !Electron.getOnboardingGenerated() && accountNames.length > 0,
        });

        // eslint-disable-next-line no-undef
        if (Electron.getOnboardingGenerated()) {
            history.push('/onboarding/seed-backup');
        } else {
            if (accountNames.length > 0) {
                const seedStore = await new SeedStore.keychain(wallet.password);
                await seedStore.addAccount(
                    this.state.name,
                    // eslint-disable-next-line no-undef
                    Electron.getOnboardingSeed(),
                );
                history.push('/onboarding/login');
            } else {
                history.push('/onboarding/account-password');
            }
        }
    };

    render() {
        const { history, t } = this.props;
        const { name, isGenerated } = this.state;

        return (
            <div>
                <Logos size={20} history={history} />
                <form onSubmit={this.setName}>
                    <Row>
                        <h1>
                            {t('setSeedName:setAccountName')}
                            <span className={classNames(css.text_color)}>.</span>
                        </h1>
                    </Row>
                    <Row className={css.centerBox}>
                        <div className={css.centerBox_div}>
                            <Input
                                value={name}
                                focus
                                label={t('addAdditionalSeed:accountName')}
                                onChange={(value) => this.setState({ name: value })}
                            />
                        </div>
                    </Row>

                    <Row>
                        <Button
                            className="navleft"
                            variant="backgroundNone"
                            to={`/onboarding/seed-${isGenerated ? 'generate' : 'import'}`}
                        >
                            <span>&lt;</span> {t('global:goBack')}
                        </Button>
                        <Button type="submit" className="navright" variant="backgroundNone">
                            {t('global:confirm')} <span>></span>
                        </Button>
                    </Row>
                </form>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    accountNames: getAccountNamesFromState(state),
    additionalAccountMeta: state.accounts.accountInfoDuringSetup.meta
        ? state.accounts.accountInfoDuringSetup.meta
        : { type: 'Keychain' },
    additionalAccountName: state.accounts.accountInfoDuringSetup.name
        ? state.accounts.accountInfoDuringSetup.name
        : // eslint-disable-next-line no-undef
          Electron.getOnboardingName(),
    wallet: state.wallet,
});

const mapDispatchToProps = {
    setAccountInfoDuringSetup,
    generateAlert,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withI18n()(AccountName));
