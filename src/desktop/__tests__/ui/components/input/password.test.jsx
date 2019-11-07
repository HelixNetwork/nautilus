
import React from 'react';
import {shallow} from 'enzyme';

import PasswordInput from 'ui/components/input/password';

const props = {
    value: 'LoremIpsumDolorSit',
    focus: true,
    disabled: false,
    label: 'Bar',
    showScore: true, 
    onChange: jest.fn(),
    t: (str) => str,
};

describe('PasswordInput component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<PasswordInput {...props} />);
        expect(wrapper).toMatchSnapshot();
    });

    test('Input value', () => {
        const wrapper = shallow(<PasswordInput {...props} />);
        
        expect(wrapper.find('input').props().value).toEqual('LoremIpsumDolorSit');
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

    // test('Password valid input display', () => {
    //     const validProps = [
    //         {
    //             value: 'FooBarBazFizz',
    //         },
    //         {
    //             value: 'FooBarBazFizz',
    //             match: 'FooBarBazFizz',
    //         },
    //     ];

    //     const invalidProps = [
    //         {
    //             value: 'FooBar',
    //         },
    //         {
    //             value: 'FooBar',
    //             match: 'FooBar',
    //         },
    //         {
    //             value: 'FooBarBazFizz',
    //             match: 'FooBarBazFuzz',
    //         },
    //     ];

    //     validProps.forEach((testProps) => {
    //         const wrapper = shallow(<PasswordInput {...props} {...testProps} showValid />);
    //         expect(wrapper.find('.isValid')).toHaveLength(1);
    //     });

    //     invalidProps.forEach((testProps) => {
    //         const wrapper = shallow(<PasswordInput {...props} {...testProps} showValid />);
    //         expect(wrapper.find('.isValid')).toHaveLength(0);
    //     });
    // });

    // test('Input label', () => {
    //     const wrapper = shallow(<PasswordInput {...props} />);

    //     expect(wrapper.find('small').text()).toEqual('Bar');
    // });

    test('Input disabled state', () => {
        const mockProps = Object.assign({}, props, { disabled: true });
        const wrapper = shallow(<PasswordInput {...mockProps} />);
        expect(wrapper.hasClass('disabled')).toBeTruthy();
    });
});
