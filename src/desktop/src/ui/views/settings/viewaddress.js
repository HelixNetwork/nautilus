import React from 'react';
import css from './settings.scss';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import { connect } from 'react-redux';
import { selectAccountInfo } from 'selectors/accounts';
import Scrollbar from 'ui/components/scrollbar';
import Clipboard from 'ui/components/clipboard';
import { formatValue, formatUnit } from 'libs/hlx/utils';

/**
 * View Address component
 */

class Viewaddress extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        account: PropTypes.object,
        /** @ignore */
        location: PropTypes.object,
        /** @ignore */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    render() {
        const { account, t } = this.props;
        const addressData = account.addressData.slice().sort((a, b) => b.index - a.index);

        return (
            <div className={classNames(css.foo_bxx12)}>
                <h5 className={css.addr_h5}>{t('accountManagement:viewAddresses')}</h5>
                <Scrollbar style={{ height: '88%' }}>
                    <div className={classNames(css.set_bxac)}>
                        <div className={css.scroll}>
                            <ul className={css.addresses}>
                                <Scrollbar className={css.scroll_address}>
                                    {addressData.map((addressObject) => {
                                        const address = addressObject.address + addressObject.checksum;

                                        return (
                                            <li key={address} className={css.address_li}>
                                                <p className={classNames(css.p_style)}>
                                                    <Clipboard
                                                        text={address}
                                                        title={t('receive:addressCopied')}
                                                        success={t('receive:addressCopiedExplanation')}
                                                    >
                                                        {addressObject.address.match(/.{1,2}/g).join(' ')}{' '}
                                                        <span className={css.active}>
                                                            {addressObject.checksum.match(/.{1,2}/g).join(' ')}
                                                        </span>
                                                    </Clipboard>
                                                </p>
                                                <strong className={css.addr_strong}>
                                                    {' '}
                                                    {formatValue(addressObject.balance)}{' '}
                                                    <span> {formatUnit(addressObject.balance)}</span>
                                                </strong>
                                            </li>
                                        );
                                    })}
                                </Scrollbar>
                            </ul>
                        </div>
                    </div>
                </Scrollbar>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    account: selectAccountInfo(state),
});

const mapDispatchToProps = {};
export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withI18n()(Viewaddress));
