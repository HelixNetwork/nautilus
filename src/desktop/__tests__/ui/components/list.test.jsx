import React from 'react';
import { shallow } from 'enzyme';

import {ListComponent}  from 'ui/components/list';

import * as dateLib from 'libs/date';
dateLib.formatTime = () => 'DD/MM/YYYY';

const props = {
    mode: 'Standard',
    isLoading: false,
    hideEmptyTransactions: false,
    updateAccount: jest.fn(),
    toggleEmptyTransactions: jest.fn(),
    accountInfo : {},
    transactions: [
        {
            attachmentTimestamp: 1546934663241,
            bundle: '0a2955eb6f6a240336b7a53b9b89cf4f588ed2847048b150c5622f89540f0675',
            incoming: false,
            inputs: [],
            message: 'Lorem ipsum',
            persistence: true,
            timestamp: 1546934661,
            transferValue: 0,
        },
        {
            attachmentTimestamp: 1546934663242,
            bundle: 'b2b43b3b04c06d640cb0b418817b713f11d6b5080e122f42c80efae73f44adda',
            incoming: true,
            inputs: [],
            message: 'Dolor sit amet',
            persistence: false,
            timestamp: 1546934661,
            transferValue: 500000,
        },
        {
            attachmentTimestamp: 1546934663242,
            bundle: '078960aba0d1379a0bdc7df25e974e156ca016b5b16d3c77e1ca695ce7b3b835',
            incoming: true,
            inputs: [],
            message: 'Lorem ipsum',
            persistence: true,
            timestamp: 1546934661,
            transferValue: 500000,
        },
        {
            attachmentTimestamp: 1546934663243,
            bundle: '2028ab80df9a63e7d41c39219b720a7be4c0b037f74f44c2d36f6ce01eaf5117',
            incoming: false,
            inputs: [],
            message: 'Lorem ipsum',
            persistence: true,
            timestamp: 1546934661,
            transferValue: 0,
        },
        {
            attachmentTimestamp: 1546934663243,
            bundle: 'fc95e8ce0ad3bf66b0af5de18c4b7d5c3f5a286221349b102fd51513670a3dbd',
            incoming: false,
            inputs: [],
            message: 'Lorem ipsum',
            persistence: false,
            timestamp: 1546934661,
            transferValue: 100000,
        },
        {
            attachmentTimestamp: 1546934663243,
            bundle: '38accd133327f0cdd345b6a657fd48082979cf585088fa87e11d61ea9973f759',
            incoming: false,
            inputs: [],
            message: 'Lorem ipsum',
            persistence: false,
            timestamp: 1546934661,
            transferValue: 100000,
        },
    ],
    promoteTransaction: jest.fn(),
    retryFailedTransaction: jest.fn(),
    setItem: jest.fn(),
    t: (str) => str,
    accountMeta: {
        type: 'keychain',
    },
    password: {},
    ui:{}
};

describe('Test for List component', () => {
    test('Render the List component', () => {
        const wrapper = shallow(<ListComponent {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('List all history items', () => {
        const wrapper = shallow(<ListComponent {...props} />);
        
        expect(wrapper.find('.lists')).toHaveLength(6);
    });

    test('Filter received items', () => {
        const wrapper = shallow(<ListComponent {...props} />);

        wrapper.setState({ filter: 'Received' });
        expect(wrapper.find('.lists')).toHaveLength(1);
    });

    test('Filter sent items', () => {
        const wrapper = shallow(<ListComponent {...props} />);

        wrapper.setState({ filter: 'Sent' });
        expect(wrapper.find('.lists')).toHaveLength(2);
    });

    test('Filter pending items', () => {
        const wrapper = shallow(<ListComponent {...props} />);

        wrapper.setState({ filter: 'Pending' });
        expect(wrapper.find('.lists')).toHaveLength(3);
    });

    test('Filter items by value search', () => {
        const wrapper = shallow(<ListComponent {...props} />);

        wrapper.setState({ search: '500000' });
        expect(wrapper.find('.lists')).toHaveLength(2);
    });

    test('Filter items by message search', () => {
        const wrapper = shallow(<ListComponent {...props} />);

        wrapper.setState({ search: 'dolor' });
        expect(wrapper.find('.lists')).toHaveLength(1);
    });

    test('Display single transaction', () => {
        const mockProps = Object.assign({}, props, {
            currentItem: '0a2955eb6f6a240336b7a53b9b89cf4f588ed2847048b150c5622f89540f0675',
        });
        const wrapper = shallow(<ListComponent {...mockProps} />);

        expect(wrapper.find('.popup').hasClass('on')).toBeTruthy();
    });
});
