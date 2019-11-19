import React from 'react';
import { shallow, mount } from 'enzyme';

import DashSidebar  from 'ui/components/dash_sidebar';
import store from 'store';
import Provider from 'react-redux';

const props = {
        t: (str) => str,
        history:[
            {
            push:  jest.fn(),
            },
        ],
        accountNames:[],
        onClick: jest.fn(),
   };

   const onClick =  jest.fn();

describe('DashSidebar component', () => {
    test('Render the DashSidebar component', () => {
        const wrapper = mount(<Provider store={store}> <DashSidebar {...props} /></Provider>);
        console.log('wrapper in dash_sidebar: ', wrapper.debug());

        expect(wrapper).toMatchSnapshot();
    });

    test('Copy to clipboard event', () => {
        const wrapper = mount(<Provider store={store}><DashSidebar {...props} /></Provider>);

        wrapper.simulate('click');

        expect(props.history.push).toHaveBeenCalledTimes(7);
        
    });
});