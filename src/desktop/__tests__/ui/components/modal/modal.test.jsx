import React from 'react';
import { shallow } from 'enzyme';

import Modal from 'ui/components/modal/Modal';

const props = {
    children: 'Lorem ipsum',
    onClose: jest.fn(),
    inline: true,
    isOpen: false,
};

describe('Modal component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<Modal {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Display content', () => {
        const wrapper = shallow(<Modal {...props} />);

        expect(wrapper.find('.content').text()).toEqual('Lorem ipsum');
    });

    // test('Modal hidden', () => {
    //     const wrapper = shallow(<Modal {...props} />);
    //     
    //     expect(wrapper.hasClass('hidden')).toBeTruthy();
    // });

    test('Modal visible', () => {
        const mockProps = Object.assign({}, props, { isOpen: true });
        const wrapper = shallow(<Modal {...mockProps} />);

        expect(wrapper.hasClass('hidden')).toBeFalsy();
    });

    // test('Modal variant is global', () => {
    //     const mockProps = Object.assign({}, props, { className: 'global' });
    //     const wrapper = shallow(<Modal {...mockProps} />);

    //     expect(wrapper.hasClass('global')).toBeTruthy();
    // });

    // test('Modal variant is confirm', () => {
    //     const mockProps = Object.assign({}, props, { className: 'confirm' });
    //     const wrapper = shallow(<Modal {...mockProps} />);

    //     expect(wrapper.hasClass('confirm')).toBeTruthy();
    // });
});
