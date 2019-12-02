import React from 'react';
import { shallow } from 'enzyme';

import Icon from 'ui/components/icon';

const props = {
    icon: 'hlx',
    size: 32,
    color: '#ff0000',
};

describe('Test for Icon component', () => {
    test('Render the Icon component', () => {
        const wrapper = shallow(<Icon {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Test for Render svg element', () => {
        const wrapper = shallow(<Icon {...props} />);

        expect(wrapper.text()).toEqual('');
    });

    test('Test for Icon size', () => {
        const wrapper = shallow(<Icon {...props} />);

        expect(wrapper.props().style.fontSize).toEqual(32);
        expect(wrapper.props().style.lineHeight).toEqual('32px');
    });

    test('Test for Icon color', () => {
        const wrapper = shallow(<Icon {...props} />);

        expect(wrapper.props().style.color).toEqual('#ff0000');
    });
});
