import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import { connect } from 'react-redux';

import { generateAlert } from 'actions/alerts';
import {
    selectAccountInfo,
    getSelectedAccountName,
    getSelectedAccountMeta,
    getAccountNamesFromState,
} from 'selectors/accounts';
import SeedStore from 'libs/seed';
import { deleteAccount } from 'actions/accounts';
import ModalPassword from 'ui/components/modal/Password';
import css from './settings.scss';
import classNames from 'classnames';
import Button from 'ui/components/button';
import Confirm from 'ui/components/modal/Confirm';
import Info from 'ui/components/info';
import { getAccountInfo } from 'actions/accounts';

/**
 * Remove account component
 */
class Remove extends PureComponent {
    static propTypes = {
        /** @ignore */
        account: PropTypes.object.isRequired,
        /** @ignore */
        deleteAccount: PropTypes.func.isRequired,
        /** @ignore */
        accountName: PropTypes.string.isRequired,
        /** @ignore */
        accountMeta: PropTypes.object.isRequired,
        /** @ignore */
        password: PropTypes.object.isRequired,
        /** @ignore */
        history: PropTypes.object.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        removeConfirm: false,
    };

    /**
     * Remove account from wallet state and seed vault
     * @param {string} Password - Plain text account password
     * @returns {undefined}
     */
    removeAccount = async (password) => {
        const { accountMeta, accountName, history, t, generateAlert, deleteAccount } = this.props;
        this.setState({
            removeConfirm: false,
        });

        try {
            const seedStore = await new SeedStore[accountMeta.type](password, accountName, accountMeta);

            seedStore.removeAccount();

            deleteAccount(accountName);
            history.push('/wallet');

            generateAlert('success', t('settings:accountDeleted'), t('settings:accountDeletedExplanation'));
        } catch (err) {
            generateAlert(
                'error',
                t('changePassword:incorrectPassword'),
                t('changePassword:incorrectPasswordExplanation'),
            );
            return;
        }
    };

    render() {
        const { t, accountName } = this.props;
        const { removeConfirm } = this.state;

        if (removeConfirm) {
            return (
                <ModalPassword
                    isOpen
                    inline
                    onSuccess={(password) => this.removeAccount(password)}
                    onClose={() => this.setState({ removeConfirm: false })}
                    category="negative"
                    content={{
                        title: t('deleteAccount:enterPassword'),
                        confirm: t('accountManagement:deleteAccount'),
                    }}
                />
            );
        }

        return (
            <div className={classNames(css.foo_bxx12)}>
                <div className={classNames(css.set_bxac)}>
                    <form>
                        <div className={classNames(css.log)}>
                            <Info>
                                <p>{t('deleteAccount:yourSeedWillBeRemoved')}</p>
                            </Info>
                        </div>

                        <Button
                            style={{ marginLeft: '31vw', marginTop: '0vw' }}
                            onClick={() => this.setState({ removeConfirm: !removeConfirm })}
                        >
                            {t('accountManagement:deleteAccount')}
                        </Button>

                        <Confirm
                            isOpen={removeConfirm}
                            category="negative"
                            content={{
                                title: `Are you sure you want to delete ${accountName}?`, //FIXME
                                message: t('deleteAccount:yourSeedWillBeRemoved'),
                                cancel: t('cancel'),
                                confirm: t('accountManagement:deleteAccount'),
                            }}
                            onCancel={() => this.setState({ removeConfirm: false })}
                            onConfirm={() => this.removeAccount()}
                        />
                    </form>
                </div>
            </div>
        );
    }
}
const mapStateToProps = (state) => ({
    accountNames: getAccountNamesFromState(state),
    password: state.wallet.password,
    account: selectAccountInfo(state),
    accountName: getSelectedAccountName(state),
    accountMeta: getSelectedAccountMeta(state),
});
const mapDispatchToProps = {
    generateAlert,
    deleteAccount,
    getAccountInfo,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withI18n()(Remove));
