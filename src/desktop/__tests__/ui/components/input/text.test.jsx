// import React from 'react';
// import { shallow } from 'enzyme';

import {Text} from 'ui/components/input/text';

// const props = {
//     value: 'Foo Bar',
//     label: 'Foo',
//     onChange: jest.fn(),
// };


// let wrapper;
// beforeEach(() => {
//     wrapper = shallow(<Text {...props} />);
// });

// describe('Text component', () => {
//     test('Render the component', () => {
//       expect(wrapper).toMatchSnapshot();
//     });

//     test('Input value', () => {
//       expect(wrapper.find('input').props().value).toEqual('Foo Bar');
//     });

//     test('Input change callback', () => {
//       wrapper.find('input').simulate('change', { target: { value: 'Bar' } });
//         expect(props.onChange).toHaveBeenLastCalledWith('Bar');
//     });

//     test('Input label', () => {
//       expect(wrapper.find('small').text()).toEqual('Foo');
//     });

//     test('Input disabled state', () => {
//         const mockProps = Object.assign({}, props, { disabled: true });
//         const wrapper = shallow(<Text {...mockProps} />);

//         expect(wrapper.hasClass('disabled')).toBeTruthy();
//     });
// });
