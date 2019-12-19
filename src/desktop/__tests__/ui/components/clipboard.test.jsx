import React from 'react';
import { shallow } from 'enzyme';

import { ClipboardComponent as Clipboard } from 'ui/components/clipboard';

const props = {
    text: 'Lorem ipsum',
    timeout: 0,
    title: 'Foo',
    success: 'Bar',
    generateAlert: jest.fn(),
};

global.Electron = {
    clipboard: jest.fn(),
};

describe('Test for Clipboard component', () => {
    test('Render the Clipboard component', () => {
        const wrapper = shallow(<Clipboard {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Check for Text content', () => {
        const wrapper = shallow(<Clipboard {...props} />);

        expect(wrapper.text()).toEqual('Lorem ipsum');
    });

    test('Check for Custom content', () => {
        const mockProps = Object.assign({}, props, { children: 'Fizz Buzz' });
        const wrapper = shallow(<Clipboard {...mockProps} />);

        expect(wrapper.text()).toEqual('Fizz Buzz');
    });

    test('Checks Copy to clipboard event', () => {
        const wrapper = shallow(<Clipboard {...props} />);

        wrapper.simulate('click');

        expect(props.generateAlert).toHaveBeenCalledTimes(1);
        // eslint-disable-next-line no-undef
        expect(Electron.clipboard).toHaveBeenCalledTimes(1);
    });

    test('Checks the Timeout event', () => {
        const wrapper = shallow(<Clipboard {...props} />);
        wrapper.simulate('click');
        // eslint-disable-next-line no-undef
        expect(Electron.clipboard).toHaveBeenCalledTimes(2);
    });

    test('checks the copy event', () => {
        const wrapper = shallow(<Clipboard {...props} />);
        const spy = jest.spyOn(wrapper.instance(), 'copy');
        console.log(spy);
        wrapper.update();
        wrapper.find('span').simulate('click');
        expect(spy).toHaveBeenCalled();
      
    });
});
