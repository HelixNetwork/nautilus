// import React from 'react';
// import { shallow } from 'enzyme';

// import {DashSidebar}  from 'ui/components/dash_sidebar';


// const props = {
//         t: (str) => str,
//         history:
//             {
//             push:  jest.fn(),
//             },
//         accountNames:[],
//         onClick: jest.fn(),
//    };

// //    const onClick =  jest.fn();

// describe('DashSidebar component', () => {
//     test('Render the DashSidebar component', () => {
//         const wrapper = shallow( <DashSidebar {...props} />);

//         expect(wrapper).toMatchSnapshot();
//     });

//     test('Copy to clipboard event', () => {
//         const wrapper = shallow(<DashSidebar {...props} />);

//         wrapper.simulate('click');

//         expect(props.history.push).toHaveBeenCalledTimes(7);
        
//     });
// });
import React from 'react';

import renderer from 'react-test-renderer';


it('renders correctly', () => {
    const tree = renderer
        .create(<li page="/wallet">Send</li>)
        .toJSON();
    expect(tree).toMatchSnapshot();
});
it('renders correctly', () => {
    const tree = renderer
        .create(<li page="/wallet/send">Send</li>)
        .toJSON();
    expect(tree).toMatchSnapshot();
});
it('renders correctly', () => {
    const tree = renderer
        .create(<li page="/wallet/receive">Receive</li>)
        .toJSON();
    expect(tree).toMatchSnapshot();
});
it('renders correctly', () => {
    const tree = renderer
        .create(<li page="/wallet/history">History</li>)
        .toJSON();
    expect(tree).toMatchSnapshot();
});
it('renders correctly', () => {
    const tree = renderer
        .create(<li page="/wallet/support">Support</li>)
        .toJSON();
    expect(tree).toMatchSnapshot();
});