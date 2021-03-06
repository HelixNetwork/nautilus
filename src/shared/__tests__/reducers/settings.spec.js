import { expect } from 'chai';
import reducer from '../../reducers/settings';
import { SettingsActionTypes } from '../../actions/types';
import { DEFAULT_NODES, DEFAULT_NODE, QUORUM_SIZE } from '../../config';

describe('Reducer: settings', () => {
    describe('initial state', () => {
        it('should have an initial state', () => {
            const initialState = {
                locale: 'en',
                language: 'English (International)',
                node: DEFAULT_NODE,
                remotePoW: false,
                ignoreProxy: false,
                autoPromotion: true,
                nodes: DEFAULT_NODES,
                customNodes: [],
                mode: 'Standard',
                quorum: {
                    size: QUORUM_SIZE,
                    enabled: true,
                },
                nodeAutoSwitch: true,
                autoNodeList: true,
                currency: 'USD',
                availableCurrencies: [
                    'USD',
                    'GBP',
                    'EUR',
                    'AUD',
                    'BGN',
                    'BRL',
                    'CAD',
                    'CHF',
                    'CNY',
                    'CZK',
                    'DKK',
                    'HKD',
                    'HRK',
                    'HUF',
                    'IDR',
                    'ILS',
                    'INR',
                    'ISK',
                    'JPY',
                    'KRW',
                    'MXN',
                    'MYR',
                    'NOK',
                    'NZD',
                    'PHP',
                    'PLN',
                    'RON',
                    'RUB',
                    'SEK',
                    'SGD',
                    'THB',
                    'TRY',
                    'ZAR',
                ],

                themeName: 'Default',
                acceptedTerms: false,
                acceptedPrivacy: false,
                notifications: {
                    general: true,
                    confirmations: true,
                    messages: true,
                },
                completedMigration: false,
                lockScreenTimeout: 3,
                helixUnit: 'mHLX',
            };
            expect(reducer(undefined, {})).to.eql(initialState);
        });
    });
    describe(SettingsActionTypes.SET_REMOTE_POW, () => {
        it('should update remotePoW in state', () => {
            const initialState = {
                remotePoW: false,
            };

            const action = {
                type: SettingsActionTypes.SET_REMOTE_POW,
                payload: true,
            };

            const newState = reducer(initialState, action);

            const expectedState = {
                remotePoW: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(SettingsActionTypes.SET_AUTO_PROMOTION, () => {
        it('should update autoPromotion in state', () => {
            const initialState = {
                autoPromotion: false,
            };

            const action = {
                type: SettingsActionTypes.SET_AUTO_PROMOTION,
                payload: true,
            };

            const newState = reducer(initialState, action);

            const expectedState = {
                autoPromotion: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(SettingsActionTypes.UPDATE_NODE_AUTO_SWITCH_SETTING, () => {
        describe('when action.payload is defined', () => {
            it('should set nodeAutoSwitch to action.payload', () => {
                const initialState = {
                    nodeAutoSwitch: false,
                };

                const action = {
                    type: SettingsActionTypes.UPDATE_NODE_AUTO_SWITCH_SETTING,
                    payload: true,
                };

                const newState = reducer(initialState, action);

                const expectedState = {
                    nodeAutoSwitch: true,
                };

                expect(newState).to.eql(expectedState);
            });
        });
    });

    describe(SettingsActionTypes.SET_LOCALE, () => {
        it('should set locale to payload', () => {
            const initialState = {
                locale: 'en',
            };

            const action = {
                type: SettingsActionTypes.SET_LOCALE,
                payload: 'foo',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                locale: 'foo',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(SettingsActionTypes.SET_NODE, () => {
        it('should set node to action.payload', () => {
            const initialState = {
                node: 'http://localhost:9000',
            };

            const action = {
                type: SettingsActionTypes.SET_NODE,
                payload: 'http://localhost:8000',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                node: 'http://localhost:8000',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(SettingsActionTypes.ADD_CUSTOM_NODE_SUCCESS, () => {
        describe('when payload.url exists in "customNodes" state prop', () => {
            it('should return existing state prop "customNodes"', () => {
                const initialState = {
                    customNodes: [
                        {
                            url: 'http://localhost:9000',
                            pow: false,
                            token: '',
                            password: '',
                        },
                        {
                            url: 'http://localhost:5000',
                            pow: true,
                            token: '',
                            password: '',
                        },
                    ],
                };

                const action = {
                    type: SettingsActionTypes.ADD_CUSTOM_NODE_SUCCESS,
                    payload: {
                        url: 'http://localhost:9000',
                        pow: false,
                        token: '',
                        password: '',
                    },
                };

                const newState = reducer(initialState, action);
                const expectedState = {
                    customNodes: [
                        {
                            url: 'http://localhost:9000',
                            pow: false,
                            token: '',
                            password: '',
                        },
                        {
                            url: 'http://localhost:5000',
                            pow: true,
                            token: '',
                            password: '',
                        },
                    ],
                };

                expect(newState).to.eql(expectedState);
            });
        });

        describe('when payload.url does not exist in "customNodes" state prop', () => {
            it('should return concat payload to state prop "customNodes"', () => {
                const initialState = {
                    customNodes: [
                        {
                            url: 'http://localhost:9000',
                            pow: false,
                            token: '',
                            password: '',
                        },
                        {
                            url: 'http://localhost:5000',
                            pow: true,
                            token: '',
                            password: '',
                        },
                    ],
                };

                const action = {
                    type: SettingsActionTypes.ADD_CUSTOM_NODE_SUCCESS,
                    payload: {
                        url: 'http://localhost:3000',
                        pow: false,
                        token: '',
                        password: '',
                    },
                };

                const newState = reducer(initialState, action);
                const expectedState = {
                    customNodes: [
                        {
                            url: 'http://localhost:9000',
                            pow: false,
                            token: '',
                            password: '',
                        },
                        {
                            url: 'http://localhost:5000',
                            pow: true,
                            token: '',
                            password: '',
                        },
                        {
                            url: 'http://localhost:3000',
                            pow: false,
                            token: '',
                            password: '',
                        },
                    ],
                };

                expect(newState.nodes).to.eql(expectedState.nodes);
            });
        });
    });

    describe(SettingsActionTypes.REMOVE_CUSTOM_NODE, () => {
        it('should remove node object in customNodes with "url === payload"', () => {
            const initialState = {
                customNodes: [
                    {
                        url: 'http://localhost:9000',
                        pow: false,
                        token: '',
                        password: '',
                    },
                    {
                        url: 'http://localhost:5000',
                        pow: false,
                        token: '',
                        password: '',
                    },
                ],
            };

            const action = {
                type: SettingsActionTypes.REMOVE_CUSTOM_NODE,
                payload: 'http://localhost:5000',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                customNodes: [
                    {
                        url: 'http://localhost:9000',
                        pow: false,
                        token: '',
                        password: '',
                    },
                ],
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(SettingsActionTypes.SET_NODELIST, () => {
        it('should set nodes to action.payload', () => {
            const initialState = {
                nodes: [
                    {
                        url: 'http://localhost:4000',
                        pow: false,
                        token: '',
                        password: '',
                    },
                ],
            };

            const action = {
                type: SettingsActionTypes.SET_NODELIST,
                payload: [
                    {
                        url: 'http://localhost:5000',
                        pow: true,
                        token: '',
                        password: '',
                    },
                    {
                        url: 'http://localhost:80',
                        pow: false,
                        token: '',
                        password: '',
                    },
                ],
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                nodes: [
                    {
                        url: 'http://localhost:5000',
                        pow: true,
                        token: '',
                        password: '',
                    },
                    {
                        url: 'http://localhost:80',
                        pow: false,
                        token: '',
                        password: '',
                    },
                ],
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(SettingsActionTypes.SET_LANGUAGE, () => {
        it('should set language to payload', () => {
            const initialState = {
                language: 'English (International)',
            };

            const action = {
                type: SettingsActionTypes.SET_LANGUAGE,
                payload: 'Urdu',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                language: 'Urdu',
            };

            expect(newState).to.eql(expectedState);
        });
    });
    describe(SettingsActionTypes.UPDATE_THEME, () => {
        it('should set themeName to payload', () => {
            const initialState = {
                themeName: 'Default',
            };

            const action = {
                type: SettingsActionTypes.UPDATE_THEME,
                payload: 'foo',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                themeName: 'foo',
            };

            expect(newState).to.eql(expectedState);
        });
    });
    describe(SettingsActionTypes.SET_NOTIFICATIONS, () => {
        it('should set notifications.general to payload', () => {
            const initialState = {
                notifications: {
                    general: true,
                    confirmations: true,
                    messages: true,
                },
            };

            const action = {
                type: SettingsActionTypes.SET_NOTIFICATIONS,
                payload: { type: 'general', enabled: false },
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                notifications: {
                    general: false,
                    confirmations: true,
                    messages: true,
                },
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('SET_PROXY', () => {
        it('should set ignoreProxy to payload', () => {
            const initialState = {
                ignoreProxy: false,
            };

            const action = {
                type: SettingsActionTypes.SET_PROXY,
                payload: true,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                ignoreProxy: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });
});
