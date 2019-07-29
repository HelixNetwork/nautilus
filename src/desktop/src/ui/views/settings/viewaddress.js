import React from 'react';
import css from './settings.scss';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';
import { Switch, Route, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Top from '../../components/topbar';
import Sidebar from '../../components/sidebar';
import Button from 'ui/components/button';
import Scrollbar from 'ui/components/scrollbar';
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
        const isSpent = ({ spent: { local, remote } }) => local || remote;
        const addressData = account.addressData.slice().sort((a, b) => b.index - a.index);
        const currentKey = location.pathname.split('/')[2] || '/';

        return (
            <div>

                <section className="spage_1">
                    <div className="container">
                        <div className="col-lg-4">
                            <div className={classNames(css.menu_bx)}>


                            </div>

                        </div>
                        <div className="col-lg-8">
                            <div className={classNames(css.foo_bxx12)}>
                                <div cllassname={classNames(css.set_bxac)}>

                                    <h5 style={{ marginLeft: '14vw', marginTop: '11vw' }}>{t('accountManagement:viewAddresses')}</h5>
                                    <div className={css.scroll}>
                                        <Scrollbar>
                                            <ul className={css.addresses}>
                                                <Scrollbar>
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
                                                                        {addressObject.address.match(/.{1,3}/g).join(' ')}{' '}
                                                                        <mark>{addressObject.checksum.match(/.{1,3}/g).join(' ')}</mark>
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
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}
const mapDispatchToProps = {

};
export default connect(null, mapDispatchToProps)(withI18n()(Viewaddress));