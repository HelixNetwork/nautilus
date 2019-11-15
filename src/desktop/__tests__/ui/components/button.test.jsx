import React from 'react';
import { shallow } from 'enzyme';

import Button from 'ui/components/button';

const props = {
    onClick: jest.fn(),
   };

describe('Button component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<Button {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Button click event', () => {
        const wrapper = shallow(<Button {...props} />);

        wrapper.simulate('click');
        expect(props.onClick).toHaveBeenCalledTimes(1);
    });

    test('Button additional class name', () => {
        const mockProps = Object.assign({}, props, { className: 'outline' });
        const wrapper = shallow(<Button {...mockProps} />);

        expect(wrapper.hasClass('outline')).toBeTruthy();
    });

    test('Button outlineSmall class name', () => {
        const mockProps = Object.assign({}, props, { className: 'outlineSmall' });
        const wrapper = shallow(<Button {...mockProps} />);

        expect(wrapper.hasClass('outlineSmall')).toBeTruthy();
    });

    // test('Button loading state', () => {
    //     const mockProps = Object.assign({}, props, { loading: true });
    //     const wrapper = shallow(<Button {...mockProps} />);

    //     expect(wrapper.hasClass('loading')).toBeTruthy();
    // });

    test('Button disabled state', () => {
        const mockProps = Object.assign({}, props, { disabled: true });
        const wrapper = shallow(<Button {...mockProps} />);

        expect(wrapper.props().disabled).toBeTruthy();
    });

    test('Button enabled state', () => {
        const mockProps = Object.assign({}, props, { disabled: false });
        const wrapper = shallow(<Button {...mockProps} />);

        expect(wrapper.props().disabled).toBeFalsy();
    });
});
