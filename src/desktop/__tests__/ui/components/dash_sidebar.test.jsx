import React from 'react';
import { shallow } from 'enzyme';

import {DashSidebar}  from 'ui/components/dash_sidebar';


const props = {
        t: (str) => str,
        history:
            {
            push:  jest.fn(),
            },
        accountNames:[],
        onClick: jest.fn(),
   };

   const onClick =  jest.fn();

describe('DashSidebar component', () => {
    test('Render the DashSidebar component', () => {
        const wrapper = shallow( <DashSidebar {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    // test('Copy to clipboard event', () => {
    //     const wrapper = shallow(<DashSidebar {...props} />);

    //     wrapper.simulate('click');

    //     expect(props.history.push).toHaveBeenCalledTimes(7);
        
    // });
});