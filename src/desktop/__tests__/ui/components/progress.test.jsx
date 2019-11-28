// import React from 'react';
// import { shallow } from 'enzyme';

// import ProgressComponent from 'ui/components/progress';

// const props = {
//     progress: 45,
//     title: 'Updated',
//     type: 'circle',
// };


// describe('Progress component', () => {
//     test('Render the component', () => {
//         const wrapper = shallow(<ProgressComponent {...props} />);

//         expect(wrapper).toMatchSnapshot();
//     });

    test('Correct progress', () => {
        const wrapper = shallow(<ProgressComponent {...props} />);

        const titleE2 = wrapper.find('Progress');
        console.log('titleE2  ', wrapper.debug());
        expect(titleE2.percent).toEqual('${props.progress}%');

        // expect(
        //     wrapper
        //         .find(type)
        //         .props().theme.symbol,
        // ).toEqual(`${props.progress}%`);
    });

 
    // test('without type ', () => {
    //     const mockProps = Object.assign({}, props, { type: null });
    //     const wrapper = shallow(<ProgressComponent {...mockProps} />);
    //     console.log('without type  ', wrapper.debug());

    //     expect(wrapper.hasClass('type')).toBeFalsy();
    // });

    // test('with type send', () => {
    //     const mockProps1 = Object.assign({}, props, { type: 'send', progress: 45 });
    //     const wrapper = shallow(<ProgressComponent {...mockProps1} />);

    //     console.log('with type send   ', wrapper.debug());


    //     console.log("mockProps in send type:   ", mockProps1 );
    //     expect(wrapper.hasClass('type')).toBeTruthy();
        
    //     // expect(wrapper.mockProps1.type).toEqual('send');
    //     // expect(wrapper.mockProps1.progress).toEqual(45);
    // });
 
    // test('With title', () => {
    //     const wrapper = shallow(<ProgressComponent {...props} />);
    //     const titleEl = wrapper.find('p');

    //     console.log('With title  ', wrapper.debug());

    //     expect(titleEl).toHaveLength(1);
    //     expect(titleEl.text()).toEqual(props.title);
    // });

    // test('Without title', () => {
    //     const mockProps = Object.assign({}, props, { title: null });
    //     const wrapper = shallow(<ProgressComponent {...mockProps} />);

    //     expect(wrapper.find('p')).toHaveLength(0);
    // });

// });
