import React from 'react';
import { shallow } from 'enzyme';

import {ListComponent}  from 'ui/components/list';

import * as dateLib from 'libs/date';
dateLib.formatTime = () => 'DD/MM/YYYY';

const props = {
    isBusy: false,
    mode: 'Standard',
    isLoading: false,
    currentlyPromotingBundleHash: '',
    isRetryingFailedTransaction: false,
    hideEmptyTransactions: false,
    updateAccount: jest.fn(),
    toggleEmptyTransactions: jest.fn(),
    accountInfo : {},
    promoteTransaction: jest.fn(),
    retryFailedTransaction: jest.fn(),
    setItem: jest.fn(),
    t: (str) => str,
    accountMeta: {
        type: 'keychain',
    },
    password: {},
    ui:{
    }
};

describe('List component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<ListComponent {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    // test('List all history items', () => {
    //     const wrapper = shallow(<ListComponent {...props} />);

    //     expect(wrapper.find('.list a')).toHaveLength(6);
    // });

    // test('Filter received items', () => {
    //     const wrapper = shallow(<ListComponent {...props} />);

    //     wrapper.setState({ filter: 'Received' });
    //     expect(wrapper.find('.list a')).toHaveLength(1);
    // });

    // test('Filter sent items', () => {
    //     const wrapper = shallow(<ListComponent {...props} />);

    //     wrapper.setState({ filter: 'Sent' });
    //     expect(wrapper.find('.list a')).toHaveLength(2);
    // });

    // test('Filter pending items', () => {
    //     const wrapper = shallow(<ListComponent {...props} />);

    //     wrapper.setState({ filter: 'Pending' });
    //     expect(wrapper.find('.list a')).toHaveLength(3);
    // });

    // test('Filter items by value search', () => {
    //     const wrapper = shallow(<ListComponent {...props} />);

    //     wrapper.setState({ search: '500000' });
    //     expect(wrapper.find('.list a')).toHaveLength(2);
    // });

    // test('Filter items by message search', () => {
    //     const wrapper = shallow(<ListComponent {...props} />);

    //     wrapper.setState({ search: 'dolor' });
    //     expect(wrapper.find('.list a')).toHaveLength(1);
    // });

    // test('Display single transaction', () => {
    //     const mockProps = Object.assign({}, props, {
    //         currentItem: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    //     });
    //     const wrapper = shallow(<ListComponent {...mockProps} />);

    //     expect(wrapper.find('.popup').hasClass('on')).toBeTruthy();
    // });
});
