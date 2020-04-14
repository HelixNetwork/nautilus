import React from 'react';
import { shallow } from 'enzyme';

import Toggle from 'ui/components/toggle';

const props = {
    checked: false,
    on: 'On',
    off: 'Off',  
    onChange: jest.fn(),
};

describe('Test for Toggle component', () => {
    test('Render the Toggle component', () => {
        const wrapper = shallow(<Toggle {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Checks Toggle Off state', () => {
        const wrapper = shallow(<Toggle {...props} />);

        expect(wrapper.find('div div').hasClass('on')).toBeFalsy();
    });

    test('Checks Toggle On state', () => {
        const mockProps = Object.assign({}, props, { checked: true });
        const wrapper = shallow(<Toggle {...mockProps} />);

        expect(wrapper.find('div div').hasClass('on')).toBeTruthy();
    });

    test('Checks the Toggle event', () => {
        const wrapper = shallow(<Toggle {...props} />);

        wrapper.simulate('click');
        expect(props.onChange).toHaveBeenCalledTimes(1);
    });
});
