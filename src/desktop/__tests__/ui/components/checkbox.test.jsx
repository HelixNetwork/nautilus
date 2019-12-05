import React from 'react';
import { shallow } from 'enzyme';

import Checkbox from 'ui/components/checkbox';

const props = {
    checked: false,
    label: 'Foo',
    onChange: jest.fn(),
};

describe('Test for Checkbox component', () => {
    test('Render the Checkbox component', () => {
        const wrapper = shallow(<Checkbox {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Test for unchecked state', () => {
        const wrapper = shallow(<Checkbox {...props} />);

        expect(wrapper.hasClass('on')).toBeFalsy();
    });

    test('Test for checked state', () => {
        const mockProps = Object.assign({}, props, { checked: true });
        const wrapper = shallow(<Checkbox {...mockProps} />);

        expect(wrapper.hasClass('on')).toBeTruthy();
    });

    test('Test for checkbox toggle event', () => {
        const wrapper = shallow(<Checkbox {...props} />);

        wrapper.simulate('click');
        expect(props.onChange).toHaveBeenCalledTimes(1);
    });

    test('Test for checking checkbox label', () => {
        const wrapper = shallow(<Checkbox {...props} />);

        expect(wrapper.text()).toEqual('Foo');
    });

    test('Test for checkbox is in disabled state', () => {
        const mockProps = Object.assign({}, props, { disabled: true });
        const wrapper = shallow(<Checkbox {...mockProps} />);

        expect(wrapper.hasClass('disabled')).toBeTruthy();
    });
});
