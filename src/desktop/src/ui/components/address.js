import React from 'react';
import css from './address.scss';
import { connect } from 'react-redux';
import { generateNewAddress } from 'actions/wallet';
import Scrollbar from 'ui/components/scrollbar';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import {
    selectLatestAddressFromAccountFactory,
    selectAccountInfo,
    getSelectedAccountName,
    getSelectedAccountMeta,
} from 'selectors/accounts';
import map from 'lodash/map';
import { mapNormalisedTransactions, formatRelevantTransactions } from 'libs/hlx/transfers';
/**
 * Component to set the
 */
class Address extends React.PureComponent {
    static propTypes = {
        location: PropTypes.object,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        generateNewAddress: PropTypes.func.isRequired,
        /** @ignore */
        isGeneratingReceiveAddress: PropTypes.bool.isRequired,
        /** @ignore */
        receiveAddress: PropTypes.string.isRequired,
        /** @ignore */
        account: PropTypes.object.isRequired,
    };
    state = {
        currentlyPromotingBundleHash: false,
        isRetryingFailedTransaction: false,
        transactions: [],
    };
    getAccountTransactions = (accountData) => {
        const addresses = map(accountData.addressData, (addressData) => addressData.address);
        const transactions = mapNormalisedTransactions(accountData.transactions, accountData.addressData);
        return formatRelevantTransactions(transactions, addresses);
    };
    componentDidMount() {
        const { ui, accountInfo } = this.props;
        const isBusy = ui.isSyncing || ui.isSendingTransfer || ui.isAttachingToTangle || ui.isTransitioning;
        const isLoading = ui.isFetchingAccountInfo;
        const currentlyPromotingBundleHash = ui.currentlyPromotingBundleHash;
        const isRetryingFailedTransaction = ui.isRetryingFailedTransaction;
        const tx = this.getAccountTransactions(accountInfo);
        this.setState({
            isBusy: isBusy,
            isLoading: isLoading,
            currentlyPromotingBundleHash: currentlyPromotingBundleHash,
            isRetryingFailedTransaction: isRetryingFailedTransaction,
            transactions: tx,
        });
    }
    listAddresses(tx) {}
    render() {
        return (
            <div className={css.addressbox}>
                <Scrollbar></Scrollbar>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    receiveAddress: selectLatestAddressFromAccountFactory()(state),
    isGeneratingReceiveAddress: state.ui.isGeneratingReceiveAddress,
    hadErrorGeneratingNewAddress: state.ui.hadErrorGeneratingNewAddress,
    account: selectAccountInfo(state),
    accountName: getSelectedAccountName(state),
    accountMeta: getSelectedAccountMeta(state),
    isValidatingAddress: state.wallet.isValidatingAddress,
});

const mapDispatchToProps = {
    generateNewAddress,
};
export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withI18n()(Address));
