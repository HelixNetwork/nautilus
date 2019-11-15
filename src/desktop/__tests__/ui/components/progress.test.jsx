import React from 'react';
import { shallow } from 'enzyme';

import Progress from 'ui/components/progress';

const props = {
    progress: 45,
    title: 'Dolor sit amet',
    type: 'large',
};

state = {
    color: 'error',
};

describe('Progress component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<Progress {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    // test('Correct progress', () => {
    //     const wrapper = shallow(<ProgressComponent {...props} />);

    //     expect(
    //         wrapper
    //             .find('.bar')
    //             .first()
    //             .props().style.width,
    //     ).toEqual(`${props.progress}%`);
    // });

    test('with default type', () => {
        const wrapper = shallow(<Progress {...props} />);
        
        expect(wrapper.hasClass('type')).toBeTruthy();
    });

    test('without type ', () => {
        const mockProps = Object.assign({}, props, { type: null });
        const wrapper = shallow(<Progress {...mockProps} />);
        
        expect(wrapper.hasClass('type')).toBeFalsy();
    });

    // test('with type send', () => {
    //     const mockProps = Object.assign({}, props, { type: send });
    //     const wrapper = shallow(<Progress {...mockProps} />);
        
    //     expect(wrapper.props().progress).toEqual(0);
    // });
 
    test('With title', () => {
        const wrapper = shallow(<Progress {...props} />);
        const titleEl = wrapper.find('p');

        expect(titleEl).toHaveLength(1);
        expect(titleEl.text()).toEqual(props.title);
    });

    test('Without title', () => {
        const mockProps = Object.assign({}, props, { title: null });
        const wrapper = shallow(<Progress {...mockProps} />);

        expect(wrapper.find('p')).toHaveLength(0);
    });

    // test('With subtitle', () => {
    //     const wrapper = shallow(<Progress {...props} />);
    //     const titleEl = wrapper.find('small');

    //     expect(titleEl).toHaveLength(1);
    //     expect(titleEl.text()).toEqual(props.subtitle);
    // });

});
