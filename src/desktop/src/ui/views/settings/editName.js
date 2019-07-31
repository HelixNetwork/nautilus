import React from 'react';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { getAccountNamesFromState } from 'selectors/accounts';

import { MAX_ACC_LENGTH } from 'libs/crypto';
import SeedStore from 'libs/seed';

import { changeAccountName } from 'actions/accounts';

import css from './settings.scss';
import classNames from 'classnames';
import Top from '../../components/topbar';
import Icon from 'ui/components/icon';
import Sidebar from '../../components/sidebar';
import Button from 'ui/components/button';
import { generateAlert } from 'actions/alerts';
import { changeAccountName } from 'actions/accounts';
import { getAccountNamesFromState } from 'selectors/accounts';
/**
 * Change account name component
 */

class AccountName extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        accountNames: PropTypes.array.isRequired,
        /** @ignore */
        account: PropTypes.object.isRequired,
        /** @ignore */
        password: PropTypes.object.isRequired,
        /** @ignore */
        changeAccountName: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        location: PropTypes.object,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        t: PropTypes.func.isRequired,
    }


    state = {
        newAccountName: this.props.account.accountName,
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.account.accountName !== this.state.newAccountName) {
            this.setState({
                newAccountName: nextProps.account.accountName,
            });
        }
    }

    /**
     * Check for unique account name and change account name in wallet state and in Seedstore object
     * @returns {undefined}
     **/
    async setAccountName() {
        const { account, accountNames, password, changeAccountName, generateAlert, t } = this.props;
        console.log("SETACCOUNT===",accountname);
        

        const newAccountName = this.state.newAccountName.replace(/^\s+|\s+$/g, '');

        if (newAccountName.length < 1) {
            generateAlert('error', t('addAdditionalSeed:noNickname'), t('addAdditionalSeed:noNicknameExplanation'));
            return;
        }

        if (newAccountName.length > MAX_ACC_LENGTH) {
            generateAlert(
                'error',
                t('addAdditionalSeed:accountNameTooLong'),
                t('addAdditionalSeed:accountNameTooLongExplanation', { maxLength: MAX_ACC_LENGTH }),
            );
            return;
        }

        if (accountNames.map((name) => name.toLowerCase()).indexOf(newAccountName.toLowerCase()) > -1) {
            generateAlert('error', t('addAdditionalSeed:nameInUse'), t('addAdditionalSeed:nameInUseExplanation'));
            return;
        }

        generateAlert('success', t('settings:nicknameChanged'), t('settings:nicknameChangedExplanation'));

        changeAccountName({
            oldAccountName: account.accountName,
            newAccountName,
        });

        const seedStore = await new SeedStore[account.meta.type](password, account.accountName, account.meta);
        await seedStore.renameAccount(newAccountName);
    }
    render() {
        const { account, t } = this.props;
        const { newAccountName } = this.state;

        return (
            <div>

                <section className="spage_1">
                    <div className="container">
                        <div className="col-lg-4">
                            <div className={classNames(css.menu_bx)}>


                            </div>

                        </div>
                        <div className="col-lg-8">
                            {/* <div className={classNames(css.set_bx)}> */}
                            <div className={classNames(css.foo_bxx12)}>
                                <div cllassname={classNames(css.set_bxac)}>
                                <Button type="submit" style={{ marginLeft: '39vw' }} variant="backgroundNone" onClick={() => this.props.history.push('/wallet')} ><span >
                                            <Icon icon="cross" size={14} />
                                        </span></Button>
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            this.setAccountName();
                                        }}
                                    >
                                        <h5 style={{ marginLeft: '14vw', marginTop: '11vw' }}>{t('accountManagement:editAccountName')}</h5>
                                        <input type="text" className={classNames(css.ssetting_textline)} style={{ width: '18vw' }}></input><br /><br />

                                        <Button style={{ marginLeft: '14vw', marginTop: '4vw' }} disabled={newAccountName && newAccountName.replace(/^\s+|\s+$/g, '') === account.accountName} onClick={() => this.stepForward('done')}>{t('global:save')}</Button>
                                    </form>
                                   
                                </div>
                            </div>
                            {/* </div> */}
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    accountNames: getAccountNamesFromState(state),
    password: state.wallet.password,
});

const mapDispatchToProps = {
    changeAccountName,
    generateAlert,
};

export default connect(mapStateToProps, mapDispatchToProps)(withI18n()(AccountName));
