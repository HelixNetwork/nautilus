import React from 'react';
import { shallow } from 'enzyme';

import LanguageSelect from 'ui/components/input/language';


const Provider = require('react-redux').Provider;
const createStore = require('redux').createStore;
const reducers = require('reducers').default;

let store = createStore(reducers);


const props = {
    setLocale: () => {},
    t: (str) => str,
};

let wrapper;
beforeEach(() => {
    wrapper = shallow(<Provider store ={store}><LanguageSelect /></Provider>).dive();
});


describe('Test component', () => {
    test('Render the component', () => {
        expect(wrapper).toMatchSnapshot();
    });
});