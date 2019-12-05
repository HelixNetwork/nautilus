
import React from 'react';
import {shallow} from 'enzyme';

import {PasswordInput}  from 'ui/components/input/password';  

const props = {

    value: 'LoremIpsumDolorSitAmet',
    disabled: false,
    showScore: true,
    label: 'Bar',
    onChange: jest.fn(),
    t: (str) => str,
};

describe('Test for Password component', () => {

    test('Render the Password component', () => {
        const wrapper = shallow(<PasswordInput {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Checks the Password component exists ', () => {
        const wrapper = shallow(<PasswordInput {...props} />);
        expect(wrapper.exists()).toBe(true);
    });

    test('Checks password with input value = LoremIpsumDolorSitAmet', () => {
        const wrapper = shallow(<PasswordInput {...props} />);
        
        expect(wrapper.find('input').props().value).toEqual('LoremIpsumDolorSitAmet');
    });

    test('Input change callback', () => {
        const wrapper = shallow(<PasswordInput {...props} />);

        wrapper.find('input').simulate('change', { target: {value:'FooBar'} });
        expect(props.onChange).toHaveBeenLastCalledWith('FooBar');
    });

    test('Password score display', () => {
        const testValues = ['Foo', 'FooBar', 'FooBarBaz', 'FooBarBazF', 'FooBarBazFizz'];

        testValues.forEach((testValue, index) => {
            const wrapper = shallow(<PasswordInput {...props} value={testValue} />);
            expect(wrapper.find('div.score').props()['data-strength']).toEqual(index);
        });
    });

    test('Password valid input display', () => {
        const validProps = [
            {
                value: 'FooBarBazFizz',
            },
            {
                value: 'FooBarBazFizz',
                match: 'FooBarBazFizz',
            },
        ];

        const invalidProps = [
            {
                value: 'FooBar',
            },
            {
                value: 'FooBar',
                match: 'FooBar',
            },
            {
                value: 'FooBarBazFizz',
                match: 'FooBarBazFuzz',
            },
        ];

        validProps.forEach((testProps) => {
            const wrapper = shallow(<PasswordInput {...props} {...testProps} showValid />);
            expect(wrapper.find('.isValid')).toHaveLength(1);
        });

        invalidProps.forEach((testProps) => {
            const wrapper = shallow(<PasswordInput {...props} {...testProps} showValid />);
            expect(wrapper.find('.isValid')).toHaveLength(0);
        });
    });

    test('Check for input label', () => {
        const wrapper = shallow(<PasswordInput {...props} />);

        expect(wrapper.find('small').text()).toEqual('Bar');
    });

    test('Checks if input disabled state', () => {
        const mockProps = Object.assign({}, props, { disabled: true });
        const wrapper = shallow(<PasswordInput {...mockProps} />);
        expect(wrapper.hasClass('disabled')).toBeTruthy();
    });

    test('Checks the password visibility ', () => {
        const wrapper = shallow(<PasswordInput {...props} />);

        wrapper.setState({ hidden: null });

        wrapper
            .find('fieldset')
            .simulate('click');

        expect(wrapper.hasClass('hidden')).toBeFalsy();
    });

    test('Checks the password CapsLock off ', () => {
        const wrapper = shallow(<PasswordInput {...props} />);

        wrapper.setState({ capsLock: false });

        wrapper
            .find('fieldset')
            .simulate('click');

        expect(wrapper.find('input').props().value).toEqual('LoremIpsumDolorSitAmet');
    });
});
