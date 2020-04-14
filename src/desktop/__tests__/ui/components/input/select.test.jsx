import React from 'react';
import { shallow } from 'enzyme';

import Select from 'ui/components/input/select';

const props = {
    value: "Foo",
    valueLabel: "English(International)",
    options: [
        {
            value: "Foo",
            label: "English(International)",
        },
        {
            value: "Fizz",
            label: "Fizz Buzz",
        },
    ],
    label: "Lorem Ipsum",
    onChange: jest.fn(),
};

describe('Test for Select component', () => {
    test('Render the Select component', () => {
        const wrapper = shallow(<Select {...props} />);
        expect(wrapper).toMatchSnapshot();
    });

    test('Select component Input value is English(International)', () => {
        const wrapper = shallow(<Select {...props} />);
         let res = wrapper.find('.selectable').text();
        

        expect(wrapper.find('.selectable').text()).toEqual('English(International)');
    });

    test('Select component Input value is changed ', () => {
        const wrapper = shallow(<Select {...props} />);

        wrapper.setState({ open: true });

        wrapper
            .find('li')
            .last()
            .simulate('click');

        expect(props.onChange).toHaveBeenLastCalledWith('Fizz');
    });

    test('Select component Input value is disabled state', () => {
        const mockProps = Object.assign({}, props, { disabled: true });
        const wrapper = shallow(<Select {...mockProps} />);

        expect(wrapper.hasClass('disabled')).toBeTruthy();
    });
});
