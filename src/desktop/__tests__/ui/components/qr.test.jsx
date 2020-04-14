import React from 'react';
import { shallow } from 'enzyme';

import QR from 'ui/components/qr';

const props = {
    data: 'hlx',
};

describe('Test for QR component', () => {
    test('Render the QR component', () => {
        const wrapper = shallow(<QR {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('checks the QR code', () => {
        const wrapper = shallow(<QR {...props} />);

        expect(wrapper.find('rect')).toHaveLength(441);
    });
});
