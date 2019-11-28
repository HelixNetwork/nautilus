import React from 'react';
import { shallow } from 'enzyme';

import {DashSidebar}  from 'ui/components/dash_sidebar';


const props = {
        t: (str) => str,
        history:
            {
            push:  jest.fn(),
            },
        accountNames:[]        
   };

   const onClick =  jest.fn();

describe('Test for DashSidebar component', () => {
    test('Render the DashSidebar component', () => {
        const wrapper = shallow( <DashSidebar {...props} />);
      
        expect(wrapper).toMatchSnapshot();
    });

    test('Test for page active type', () => {
        const wrapper = shallow(<DashSidebar {...props} />);
        const pushComp = wrapper.find('.list li').simulate('click');

        expect(pushComp.props().style.active).toHaveLength(7);
        
    });
});