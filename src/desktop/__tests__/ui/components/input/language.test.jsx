import React from 'react';
import { shallow } from 'enzyme';

import {LanguageSelect} from 'ui/components/input/language';


const props = {
    setLocale: () => {},
    t: (str) => str
};

let wrapper;
beforeEach(() => {
    wrapper = shallow(<LanguageSelect {...props} />).dive();
});


describe('Test component', () => {
    test('Render the component', () => {
        // expect(wrapper).toMatchSnapshot();
    });
});