
import React from 'react';
import { shallow } from 'enzyme';

import Info from 'ui/components/info';

const props = {
    children: 'Lorem ipsum',
};

describe('Test for Info component', () => {
    test('Render the Info component', () => {
        const wrapper = shallow(<Info {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Testing the Info content', () => {
        const wrapper = shallow(<Info {...props} />);

        expect(wrapper.text()).toEqual('<Icon />Lorem ipsum');
    });
});
