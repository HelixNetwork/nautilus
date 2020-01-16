import head from 'lodash/head';
import last from 'lodash/last';
import configureStore from 'redux-mock-store';
import { expect } from 'chai';
import thunk from 'redux-thunk';
import networkMiddleware from '../../middlewares/network';

describe('Middlewares: networkMiddleware', () => {
    describe('when action type is "HELIX/WALLET/CONNECTION_CHANGED"', () => {
        describe('when has lost connection', () => {
            it('should dispatch an alert action', () => {
                const middleware = [thunk, networkMiddleware];
                const mockStore = configureStore(middleware);
                const store = mockStore({});

                store.dispatch({
                    type: 'HELIX/WALLET/CONNECTION_CHANGED',
                    payload: { isConnected: false },
                });

                const actions = store.getActions();

                const firstExpectedAction = {
                    type: 'HELIX/ALERTS/SHOW',
                    category: 'error',
                    title: 'No network connection',
                    message: 'Your internet connection appears to be very weak or offline.',
                    closeInterval: 3600000,
                };

                expect(head(actions)).to.eql(firstExpectedAction);
            });

            it('should dispatch a connection change action', () => {
                const middleware = [thunk, networkMiddleware];
                const mockStore = configureStore(middleware);
                const store = mockStore({});

                store.dispatch({
                    type: 'HELIX/WALLET/CONNECTION_CHANGED',
                    payload: { isConnected: false },
                });

                const actions = store.getActions();

                const lastExpectedAction = {
                    type: 'HELIX/WALLET/CONNECTION_CHANGED',
                    payload: { isConnected: false },
                };

                expect(last(actions)).to.eql(lastExpectedAction);
            });
        });

        describe('when has restored connection', () => {
            it('should dispatch a connection change action', () => {
                const middleware = [thunk, networkMiddleware];
                const mockStore = configureStore(middleware);
                const store = mockStore({
                    wallet: {
                        hasConnection: false,
                    },
                });

                store.dispatch({
                    type: 'HELIX/WALLET/CONNECTION_CHANGED',
                    payload: { isConnected: true },
                });

                const actions = store.getActions();

                const firstExpectedAction = {
                    type: 'HELIX/WALLET/CONNECTION_CHANGED',
                    payload: { isConnected: true },
                };

                expect(head(actions)).to.eql(firstExpectedAction);
            });

            it('should dispatch an alerts actions', () => {
                const middleware = [thunk, networkMiddleware];
                const mockStore = configureStore(middleware);
                const store = mockStore({
                    wallet: {
                        hasConnection: false,
                    },
                });

                store.dispatch({
                    type: 'HELIX/WALLET/CONNECTION_CHANGED',
                    payload: { isConnected: true },
                });

                const actions = store.getActions();

                const lastExpectedAction = {
                    type: 'HELIX/ALERTS/HIDE',
                };

                expect(last(actions)).to.eql(lastExpectedAction);
            });
        });
    });
});
