import React from 'react';
import { shallow } from 'enzyme';

import Text from 'ui/components/input/text';

const props = {
    value: 'Foo Bar',
    label: 'Foo',
    onChange: jest.fn(),
};


let wrapper;
// beforeEach(() => {
//     wrapper = shallow(<Text {...props} />);
//     console.log(wrapper.debug());
// });

describe('test for Text component', () => {
    test('Render the Text component', () => {
      wrapper = shallow(<Text {...props} />);
      expect(wrapper).toMatchSnapshot();
    });

    test('Check with sample input value', () => {
      wrapper = shallow(<Text {...props} />);
      expect(wrapper.find('input').props().value).toEqual('Foo Bar');
    });

    test('Check with Input value change ', () => {
      wrapper = shallow(<Text {...props} />);
      wrapper.find('input').simulate('change', { target: { value: 'Bar' } });
        expect(props.onChange).toHaveBeenLastCalledWith('Bar');
    });

    test('Check with sample input label', () => {
      wrapper = shallow(<Text {...props} />);
      expect(wrapper.find('small').text()).toEqual('Foo');
    });

//     test('Input disabled state', () => {
//         const mockProps = Object.assign({}, props, { disabled: true });
//         const wrapper = shallow(<Text {...mockProps} />);

//         expect(wrapper.hasClass('disabled')).toBeTruthy();
//     });
 });
