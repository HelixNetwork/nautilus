import React from 'react';
import css from './settings.scss';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';
import { Switch, Route, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Icon from 'ui/components/icon';
import Top from '../../components/topbar';
import Sidebar from '../../components/sidebar';
import {
    selectLatestAddressFromAccountFactory,
    selectAccountInfo,
    getSelectedAccountName,
    getSelectedAccountMeta,
} from 'selectors/accounts';
import Scrollbar from 'ui/components/scrollbar';
import Button from 'ui/components/button';
import Clipboard from 'ui/components/clipboard';
import { formatValue, formatUnit } from 'libs/hlx/utils';

/**
 * View Address component
 */

class Viewaddress extends React.PureComponent {
    static propTypes = {
        account: PropTypes.object,
        location: PropTypes.object,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        t: PropTypes.func.isRequired,
    }


    render() {

        const { account, location, t } = this.props;
        console.log("ViewACCOUNT===", account);

        const isSpent = ({ spent: { local, remote } }) => local || remote;
        const addressData = account.addressData.slice().sort((a, b) => b.index - a.index);

        const currentKey = location.pathname.split('/')[2] || '/';

        return (
            <div className={classNames(css.foo_bxx12)}>
                <div cllassname={classNames(css.set_bxac)}>
                    <h5 style={{ marginLeft: '3vw' }}>{t('accountManagement:viewAddresses')}</h5>
                    <div className={css.scroll}>
                        <Scrollbar>
                            <ul className={css.addresses}>
                                <Scrollbar className={css.scroll_address}>
                                    {addressData.map((addressObject) => {
                                        const address = addressObject.address + addressObject.checksum;

                                        return (
                                            <li key={address}>
                                                <p className={isSpent(addressObject) ? css.spent : null}>
                                                    <Clipboard
                                                        text={address}
                                                        title={t('receive:addressCopied')}
                                                        success={t('receive:addressCopiedExplanation')}
                                                    >
                                                        {addressObject.address.match(/.{1,2}/g).join(' ')}{' '}
                                                        <span className={css.active}>{addressObject.checksum.match(/.{1,2}/g).join(' ')}</span>
                                                    </Clipboard>
                                                </p>
                                                <strong>
                                                    {formatValue(addressObject.balance)}
                                                    {formatUnit(addressObject.balance)}
                                                </strong>
                                            </li>
                                        );
                                    })}
                                </Scrollbar>
                            </ul>
                        </Scrollbar>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    account: selectAccountInfo(state),
});

const mapDispatchToProps = {

};
export default connect(mapStateToProps, mapDispatchToProps)(withI18n()(Viewaddress));

