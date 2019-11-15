import React from 'react';
import { shallow } from 'enzyme';

import QR from 'ui/components/qr';

const props = {
    data: 'hlx',
};

describe('QR component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<QR {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Render QR code', () => {
        const wrapper = shallow(<QR {...props} />);
        console.log(wrapper.debug());

        expect(wrapper.find('rect')).toHaveLength(441);
    });
});
