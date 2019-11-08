import React from 'react';
import PropTypes from 'prop-types';
import Lottie from 'react-lottie';
import * as animationData from 'animations/lottie.json';

/**
 * Animated/static logo component
 */
export default class Logo extends React.PureComponent {
    static propTypes = {
        /** On animation end event callback */
        onEnd: PropTypes.func,
        /** Should animation loop */
        loop: PropTypes.bool,
    };

    render() {
        const { size, loop, onEnd } = this.props;

        const defaultOptions = {
            loop: loop,
            autoplay: true,
            animationData: animationData.default,
            rendererSettings: {
                preserveAspectRatio: 'xMidYMid slice',
            },
        };
        return (
            <div style={{ width: size, height: size }}>
                <Lottie
                    width={size}
                    height={size}
                    options={defaultOptions}
                    eventListeners={[
                        {
                            eventName: 'complete',
                            callback: () => {
                                if (typeof onEnd === 'function') {
                                    onEnd();
                                }
                            },
                        },
                    ]}
                />
            </div>
        );
    }
}
