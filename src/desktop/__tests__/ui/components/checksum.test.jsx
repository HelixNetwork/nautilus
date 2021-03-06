import React from 'react';
import { shallow } from 'enzyme';

import Checksum from 'ui/components/checksum';

const props = {
    address: 'a28c44524d557d2276170f1e662a9a3abccebb7cc6559a0c00b628613793a710125dc65c',
};

describe('test for Checksum component', () => {
    test('Render the Checksum component', () => {
        const wrapper = shallow(<Checksum {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Test with valid address value', () => {
        const wrapper = shallow(<Checksum {...props} />);

        expect(wrapper.text()).toEqual(
            'a28c44524d557d2276170f1e662a9a3abccebb7cc6559a0c00b628613793a710125dc65c',
        );
    });

    test('Test for Checksum highlight value', () => {
        const wrapper = shallow(<Checksum {...props} />);
        expect(wrapper.find('mark').text()).toEqual('125dc65c');
    });
});
