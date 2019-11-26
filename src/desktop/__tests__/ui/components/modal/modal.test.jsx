import React from 'react';
import { shallow , mount } from 'enzyme';

import Modal from 'ui/components/modal/Modal';

const props = {
    children: 'Lorem ipsum',
    variant: 'confirm',
    onClose: jest.fn(),
    inline: true,
    isOpen: false,
};

describe('test for Modal component', () => {
    test('Render the Model component', () => {
        const wrapper = shallow(<Modal {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('test for checking display content', () => {
        const wrapper = shallow(<Modal {...props} />);

        expect(wrapper.find('.content').text()).toEqual('Lorem ipsum');
    });

    test('Test for checking Modal hidden', () => {
        const wrapper = shallow(<Modal {...props} />);
        
        expect(wrapper.hasClass('hidden')).toBeTruthy();
    });

    test('Test for checking Modal visible', () => {
        const mockProps = Object.assign({}, props, { isOpen: true });
        const wrapper = shallow(<Modal {...mockProps} />);

        expect(wrapper.hasClass('hidden')).toBeFalsy();
    });

    test('Test for checking Modal variant is global', () => {
        const mockProps = Object.assign({}, props, { variant: 'global' });
        const wrapper = shallow(<Modal {...mockProps} />);

        expect(wrapper.hasClass('global')).toBeTruthy();
    });

    test(' Test for checking Modal variant is confirm', () => {
        const wrapper = shallow(<Modal {...props} />);

        expect(wrapper.hasClass('confirm')).toBeTruthy();
    });
});
