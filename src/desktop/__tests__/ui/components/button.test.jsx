import React from 'react';
import { shallow } from 'enzyme';

import Button from 'ui/components/button';

const props = {
    className:'icon',
    disabled: true,
    onClick: jest.fn(),
   };

describe('Test for Button component', () => {
    test('Render the Button component', () => {
        const wrapper = shallow(<Button {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Button click event', () => {
        const wrapper = shallow(<Button {...props} />);

        wrapper.simulate('click');   
        expect(props.onClick).toHaveBeenCalledTimes(1);
    });

    test('Button class name - additional', () => {
        const mockProps = Object.assign({}, props, { className: 'outline' });
        const wrapper = shallow(<Button {...mockProps} />);

        expect(wrapper.hasClass('outline')).toBeTruthy();
    });

    test('Button class name - outlineSmall', () => {
        const mockProps = Object.assign({}, props, { className: 'outlineSmall' });
        const wrapper = shallow(<Button {...mockProps} />);

        expect(wrapper.hasClass('outlineSmall')).toBeTruthy();
    });

    test('Button in disabled state', () => {
        //const mockProps = Object.assign({}, props, { disabled: true });
        const wrapper = shallow(<Button {...props} />);

        expect(wrapper.props().disabled).toBeTruthy();
    });

    test('Button is enabled state', () => {
        const mockProps = Object.assign({}, props, { disabled: false });
        const wrapper = shallow(<Button {...mockProps} />);

        expect(wrapper.props().disabled).toBeFalsy();
    });
});
