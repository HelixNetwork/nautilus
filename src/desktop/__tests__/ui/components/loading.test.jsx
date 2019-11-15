import React from 'react';
import { shallow } from 'enzyme';

import Loading from 'ui/components/loading';


const props = {
    loop : true,
    inline :true,
    transparent : true,
    onEnd : jest.fn(),
};

describe('Loading component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<Loading {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('inline true state', () => {
        const wrapper = shallow(<Loading {...props} />);
        
        expect(wrapper.hasClass('inline')).toBeTruthy();
    });

    test('inline false state', () => {
        const mockProps = Object.assign({}, props, { inline: false });
        const wrapper = shallow(<Loading {...mockProps} />);

        expect(wrapper.hasClass('inline')).toBeFalsy ();
    });


    
});