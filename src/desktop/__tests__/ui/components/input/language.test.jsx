// import React from 'react';
// import { shallow } from 'enzyme';

import {LanguageSelect} from 'ui/components/input/language';


const props = { 
    locale: 'en',
    setLocale: () => {},
    t: (str) => str
};

let wrapper;
beforeEach(() => {
    wrapper = shallow(<LanguageSelect {...props} />);
});


describe('Test for Language component component', () => {
    test('Render the Language component', () => {
        
        expect(wrapper).toMatchSnapshot();
    });

    test('Should select language as English(International)', ()=>{
        
        expect(wrapper.props().value).toEqual('English (International)');

    });
});
