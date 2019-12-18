import { expect } from 'chai';
import reducer from '../../reducers/home';

describe('Reducer: home', () => {
    describe('initial state', () => {
        it('should have an initial state', () => {
            const initialState = {
                childRoute: 'balance',
                isTopBarActive: false,
            };

            expect(reducer(undefined, {})).to.eql(initialState);
        });
    });

    describe('HELIX/HOME/ROUTE/CHANGE', () => {
        it('should assign "payload" to "childRoute" state prop', () => {
            const initialState = {
                childRoute: 'balance',
            };

            const action = {
                type: 'HELIX/HOME/ROUTE/CHANGE',
                payload: 'settings',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                childRoute: 'balance',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('HELIX/HOME/TOP_BAR/TOGGLE', () => {
        it('should invert "isTopBarActive" state prop', () => {
            const initialState = {
                isTopBarActive: false,
            };

            const action = {
                type: 'HELIX/HOME/TOP_BAR/TOGGLE',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isTopBarActive: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });
});
