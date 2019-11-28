import React from 'react';
import { shallow } from 'enzyme';

import Loading from 'ui/components/loading';


const props = {
    loop : true,
    inline :true,
    transparent : true,
    onEnd : jest.fn(),
};

describe('Test for Loading component', () => {
    test('Render the Loading component', () => {
        const wrapper = shallow(<Loading {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Checks the inline true state', () => {
        const wrapper = shallow(<Loading {...props} />);
        
        expect(wrapper.hasClass('inline')).toBeTruthy();
    });

    test('Checks the inline false state', () => {
        const mockProps = Object.assign({}, props, { inline: false });
        const wrapper = shallow(<Loading {...mockProps} />);

        expect(wrapper.hasClass('inline')).toBeFalsy ();
    });


    
});