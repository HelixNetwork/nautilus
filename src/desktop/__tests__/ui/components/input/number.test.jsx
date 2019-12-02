import React from 'react';
import { shallow } from 'enzyme';

import Number from 'ui/components/input/number';

const props = {
    value: 10,
    label: 'Foo',
    onChange: jest.fn(),
};

let wrapper;
beforeEach(() => {
    wrapper = shallow(<Number {...props} />);
});


describe('Test for Number component', () => {
    test('Render the Number component', () => {

        expect(wrapper).toMatchSnapshot();
    });

    test('Input value should resolve to 10', () => {
        
        expect(wrapper.find('input').props().value).toEqual(10);
    });

    test('Input component change callback value =999', () => {
        wrapper.find('input').simulate('change', { target: { value: '999' } });
        expect(props.onChange).toHaveBeenLastCalledWith(999);
    });

    test('Input min value callback =5', () => {
        const wrapper = shallow(<Number min={10} {...props} />);

        wrapper.find('input').simulate('change', { target: { value: '5' } });
        expect(props.onChange).toHaveBeenLastCalledWith(10);
    });

    test('Input max value callback =15', () => {
        const wrapper = shallow(<Number max={10} {...props} />);

        wrapper.find('input').simulate('change', { target: { value: '15' } });
        expect(props.onChange).toHaveBeenLastCalledWith(10);
    });

    test('Checking Input label', () => {
        expect(wrapper.find('small').text()).toEqual('Foo');
    });

    test('Input decrement callback', () => {
        wrapper
            .find('span')
            .first()
            .simulate('click');
        expect(props.onChange).toHaveBeenLastCalledWith(9);
    });

    test('Input decrement callback', () => {
        wrapper
            .find('span')
            .last()
            .simulate('click');
        expect(props.onChange).toHaveBeenLastCalledWith(11);
    });
});
