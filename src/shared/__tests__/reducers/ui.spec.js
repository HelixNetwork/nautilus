import { expect } from 'chai';
import reducer from '../../reducers/ui';
import {
    SettingsActionTypes,
    UiActionTypes,
    WalletActionTypes,
    TransfersActionTypes,
    PollingActionTypes,
} from '../../actions/types';

describe('Reducer: ui', () => {
    describe('initial state', () => {
        it('should have an initial state', () => {
            const initialState = {
                isGeneratingReceiveAddress: false,
                isFetchingCurrencyData: false,
                hasErrorFetchingCurrencyData: false,
                isPromotingTransaction: false,
                isTransitioning: false,
                isAttachingToTangle: false,
                isFetchingAccountInfo: false,
                hasErrorFetchingAccountInfo: false,
                hasErrorFetchingFullAccountInfo: false,
                isSendingTransfer: false,
                isSyncing: false,
                inactive: false,
                minimised: false,
                sendAddressFieldText: '',
                sendAmountFieldText: '',
                sendMessageFieldText: '',
                sendDenomination: 'i',
                doNotMinimise: false,
                isModalActive: false,
                modalProps: {},
                modalContent: 'snapshotTransitionInfo',
                isCheckingCustomNode: false,
                isChangingNode: false,
                currentlyPromotingBundleHash: '',
                qrMessage: '',
                qrTag: '',
                qrAmount: '',
                loginRoute: 'login',
                isRetryingFailedTransaction: false,
                qrDenomination: 'i',
                selectedQrTab: 'message',
                currentRoute: 'login',
                hadErrorGeneratingNewAddress: false,
                isKeyboardActive: false,
                animateChartOnMount: true,
            };

            expect(reducer(undefined, {})).to.eql(initialState);
        });
    });

    describe('HELIX/SETTINGS/CURRENCY_DATA_FETCH_REQUEST', () => {
        it('should set "isFetchingCurrencyData" state prop to true', () => {
            const initialState = {
                isFetchingCurrencyData: false,
            };

            const action = {
                type: SettingsActionTypes.CURRENCY_DATA_FETCH_REQUEST,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isFetchingCurrencyData: true,
            };

            expect(newState.isFetchingCurrencyData).to.eql(expectedState.isFetchingCurrencyData);
        });
    });

    describe('HELIX/SETTINGS/CURRENCY_DATA_FETCH_SUCCESS', () => {
        it('should set "isFetchingCurrencyData" state prop to false', () => {
            const initialState = {
                isFetchingCurrencyData: true,
            };

            const action = {
                type: SettingsActionTypes.CURRENCY_DATA_FETCH_SUCCESS,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isFetchingCurrencyData: false,
            };

            expect(newState.isFetchingCurrencyData).to.eql(expectedState.isFetchingCurrencyData);
        });
    });

    describe('HELIX/SETTINGS/CURRENCY_DATA_FETCH_ERROR', () => {
        it('should set "isFetchingCurrencyData" state prop to false', () => {
            const initialState = {
                isFetchingCurrencyData: true,
            };

            const action = {
                type: SettingsActionTypes.CURRENCY_DATA_FETCH_ERROR,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isFetchingCurrencyData: false,
            };

            expect(newState.isFetchingCurrencyData).to.eql(expectedState.isFetchingCurrencyData);
        });
    });

    describe('HELIX/UI/SET_SEND_ADDRESS_FIELD', () => {
        it('should set "sendAddressFieldText" state prop to "payload"', () => {
            const initialState = {
                sendAddressFieldText: '',
            };

            const action = {
                type: UiActionTypes.SET_SEND_ADDRESS_FIELD,
                payload: 'foo',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                sendAddressFieldText: 'foo',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('HELIX/UI/SET_SEND_AMOUNT_FIELD', () => {
        it('should set "sendAmountFieldText" state prop to "payload"', () => {
            const initialState = {
                sendAmountFieldText: '',
            };

            const action = {
                type: UiActionTypes.SET_SEND_AMOUNT_FIELD,
                payload: 'foo',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                sendAmountFieldText: 'foo',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('HELIX/UI/SET_SEND_MESSAGE_FIELD', () => {
        it('should set "sendAddressFieldText" state prop to "payload"', () => {
            const initialState = {
                sendMessageFieldText: '',
            };

            const action = {
                type: UiActionTypes.SET_SEND_MESSAGE_FIELD,
                payload: 'foo',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                sendMessageFieldText: 'foo',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('HELIX/UI/CLEAR_SEND_FIELDS', () => {
        it('should set "sendAddressFieldText" state prop to an empty string', () => {
            const initialState = {
                sendAddressFieldText: 'foo',
            };

            const action = {
                type: UiActionTypes.CLEAR_SEND_FIELDS,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                sendAddressFieldText: '',
            };

            expect(newState.sendAddressFieldText).to.eql(expectedState.sendAddressFieldText);
        });

        it('should set "sendAmountFieldText" state prop to an empty string', () => {
            const initialState = {
                sendAmountFieldText: 'foo',
            };

            const action = {
                type: UiActionTypes.CLEAR_SEND_FIELDS,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                sendAmountFieldText: '',
            };

            expect(newState.sendAmountFieldText).to.eql(expectedState.sendAmountFieldText);
        });
    });
    describe('HELIX/UI/SET_SEND_DENOMINATION', () => {
        it('should set "sendDenomination" state prop to "payload" in action', () => {
            const initialState = {
                sendDenomination: 'i',
            };

            const action = {
                type: UiActionTypes.SET_SEND_DENOMINATION,
                payload: 'Mi',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                sendDenomination: 'Mi',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('HELIX/TRANSFERS/PROMOTE_TRANSACTION_REQUEST', () => {
        it('should set "isPromotingTransaction" state prop to true', () => {
            const initialState = {
                isPromotingTransaction: false,
            };

            const action = {
                type: TransfersActionTypes.PROMOTE_TRANSACTION_REQUEST,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isPromotingTransaction: true,
            };

            expect(newState.isPromotingTransaction).to.eql(expectedState.isPromotingTransaction);
        });
    });
    describe('HELIX/TRANSFERS/PROMOTE_TRANSACTION_ERROR', () => {
        it('should set "isPromotingTransaction" state prop to true and "currentlyPromotingBundleHash" to empty strings', () => {
            const initialState = {
                isPromotingTransaction: true,
                currentlyPromotingBundleHash: 'foo',
            };

            const action = {
                type: PollingActionTypes.PROMOTE_TRANSACTION_ERROR,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isPromotingTransaction: false,
                currentlyPromotingBundleHash: '',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('HELIX/UI/SET_USER_ACTIVITY', () => {
        it('should assign payload to state', () => {
            const initialState = {};

            const action = {
                type: UiActionTypes.SET_USER_ACTIVITY,
                payload: { foo: {} },
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                foo: {},
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('HELIX/WALLET/GENERATE_NEW_ADDRESS_REQUEST', () => {
        it('should set "isGeneratingReceiveAddress" state prop to true', () => {
            const initialState = {
                isGeneratingReceiveAddress: false,
                hadErrorGeneratingNewAddress: false,
            };

            const action = {
                type: WalletActionTypes.GENERATE_NEW_ADDRESS_REQUEST,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isGeneratingReceiveAddress: true,
                hadErrorGeneratingNewAddress: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('HELIX/WALLET/GENERATE_NEW_ADDRESS_SUCCESS', () => {
        it('should set "isGeneratingReceiveAddress" state prop to false', () => {
            const initialState = {
                isGeneratingReceiveAddress: true,
            };

            const action = {
                type: WalletActionTypes.GENERATE_NEW_ADDRESS_SUCCESS,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isGeneratingReceiveAddress: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('HELIX/WALLET/GENERATE_NEW_ADDRESS_ERROR', () => {
        it('should set "isGeneratingReceiveAddress" state prop to true', () => {
            const initialState = {
                isGeneratingReceiveAddress: true,
                hadErrorGeneratingNewAddress: false,
            };

            const action = {
                type: WalletActionTypes.GENERATE_NEW_ADDRESS_ERROR,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isGeneratingReceiveAddress: false,
                hadErrorGeneratingNewAddress: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('HELIX/TRANSFERS/SEND_TRANSFER_REQUEST', () => {
        it('should set "isSendingTransfer" state prop to true', () => {
            const initialState = {
                isSendingTransfer: false,
            };

            const action = {
                type: TransfersActionTypes.SEND_TRANSFER_REQUEST,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isSendingTransfer: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('HELIX/TRANSFERS/SEND_TRANSFER_SUCCESS', () => {
        it('should set "isSendingTransfer" state prop to false', () => {
            const initialState = {
                isSendingTransfer: true,
            };

            const action = {
                type: TransfersActionTypes.SEND_TRANSFER_SUCCESS,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isSendingTransfer: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('HELIX/TRANSFERS/SEND_TRANSFER_ERROR', () => {
        it('should set "isSendingTransfer" state prop to true', () => {
            const initialState = {
                isSendingTransfer: true,
            };

            const action = {
                type: TransfersActionTypes.SEND_TRANSFER_ERROR,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isSendingTransfer: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('HELIX/WALLET/CLEAR_WALLET_DATA', () => {
        it('should set "isSendingTransfer" state prop to false', () => {
            const initialState = {
                isSendingTransfer: true,
            };

            const action = {
                type: WalletActionTypes.CLEAR_WALLET_DATA,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isSendingTransfer: false,
            };

            expect(newState.isSendingTransfer).to.eql(expectedState.isSendingTransfer);
        });

        it('should set "sendDenomination" state prop to "i"', () => {
            const initialState = {
                sendDenomination: 'Mi',
            };

            const action = {
                type: WalletActionTypes.CLEAR_WALLET_DATA,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                sendDenomination: 'i',
            };

            expect(newState.sendDenomination).to.eql(expectedState.sendDenomination);
        });

        it('should set "sendAddressFieldText" state prop to an empty string', () => {
            const initialState = {
                sendAddressFieldText: 'foo',
            };

            const action = {
                type: WalletActionTypes.CLEAR_WALLET_DATA,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                sendAddressFieldText: '',
            };

            expect(newState.sendAddressFieldText).to.eql(expectedState.sendAddressFieldText);
        });

        it('should set "sendAmountFieldText" state prop to an empty string', () => {
            const initialState = {
                sendAmountFieldText: 'foo',
            };

            const action = {
                type: WalletActionTypes.CLEAR_WALLET_DATA,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                sendAmountFieldText: '',
            };

            expect(newState.sendAmountFieldText).to.eql(expectedState.sendAmountFieldText);
        });
    });
    describe('HELIX/ACCOUNTS/ACCOUNT_INFO_FETCH_SUCCESS', () => {
        it('should set "isFetchingAccountInfo" state prop to false', () => {
            const initialState = {
                isFetchingAccountInfo: true,
            };

            const action = {
                type: 'HELIX/ACCOUNTS/ACCOUNT_INFO_FETCH_SUCCESS',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isFetchingAccountInfo: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('HELIX/ACCOUNTS/ACCOUNT_INFO_FETCH_ERROR', () => {
        it('should set "isFetchingAccountInfo" state prop to true', () => {
            const initialState = {
                isFetchingAccountInfo: true,
                hasErrorFetchingAccountInfo: false,
            };

            const action = {
                type: 'HELIX/ACCOUNTS/ACCOUNT_INFO_FETCH_ERROR',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isFetchingAccountInfo: false,
                hasErrorFetchingAccountInfo: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('HELIX/ACCOUNTS/MANUAL_SYNC_REQUEST', () => {
        it('should set "isSyncing" state prop to true', () => {
            const initialState = {
                isSyncing: false,
            };

            const action = {
                type: 'HELIX/ACCOUNTS/MANUAL_SYNC_REQUEST',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isSyncing: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('HELIX/ACCOUNTS/MANUAL_SYNC_SUCCESS', () => {
        it('should set "isSyncing" state prop to false', () => {
            const initialState = {
                isSyncing: true,
            };

            const action = {
                type: 'HELIX/ACCOUNTS/MANUAL_SYNC_SUCCESS',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isSyncing: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('HELIX/SETTINGS/ADD_CUSTOM_NODE_SUCCESS', () => {
        it('should set "isCheckingCustomNode" to false', () => {
            const initialState = {
                isCheckingCustomNode: true,
            };

            const action = {
                type: 'HELIX/SETTINGS/ADD_CUSTOM_NODE_SUCCESS',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isCheckingCustomNode: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });
});
