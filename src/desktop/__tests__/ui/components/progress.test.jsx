import React from 'react';
import { shallow } from 'enzyme';

import ProgressBar from 'ui/components/progress';

const props = {
    progress: 45,
    title: 'Updated',
    pageType:'send',
    type: 'circle',
};


describe('Progress component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<ProgressBar {...props} />);
        expect(wrapper).toMatchSnapshot();
    });

    test('Correct progress', () => {
        let wrapper = shallow(<ProgressBar {...props} />);
        expect(wrapper.find('t').prop('type')).toEqual('circle');
        expect(
            wrapper
                .find('t')
                .prop('percent'),
        ).toEqual(props.progress);
    });

 
    test('without type ', () => {
        const mockProps = Object.assign({}, props, { type: null });
        const wrapper = shallow(<ProgressBar {...mockProps} />);
      
        expect(wrapper.hasClass('type')).toBeFalsy();
    });

    test('with type send', () => {
        const mockProps1 = Object.assign({}, props, { type: 'send', progress: 45 });
        const wrapper = shallow(<ProgressBar {...mockProps1} />);
    
        // expect(wrapper.hasClass('type')).toBe('true');
        
        expect(mockProps1.type).toEqual('send');
        expect(mockProps1.progress).toEqual(45);
    });
 
    test('With title', () => {
        const wrapper = shallow(<ProgressBar {...props} />);
        const titleEl = wrapper.find('p');


        expect(titleEl).toHaveLength(1);
        expect(titleEl.text()).toEqual(props.title);
    });

    test('Without title', () => {
        const mockProps = Object.assign({}, props, { title: null });
        const wrapper = shallow(<ProgressBar {...mockProps} />);

        expect(wrapper.find('p')).toHaveLength(0);
    });

});
