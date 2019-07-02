import React from 'react';
import css from '../views/onboarding/index.scss';
import classNames from 'classnames';
import Lottie from 'react-lottie';
import * as animationData from 'animations/done.json';
import PropTypes from 'prop-types';


class SeedA extends React.PureComponent {
    static propTypes = {
        loop: PropTypes.bool,
    };

    state = {
        viewSeed: 'none',
        viewReload: 'block'
    }

    render() {

        const defaultOptions = {
            loop: loop,
            autoplay: true,
            animationData: animationData.default,
            rendererSettings: {
                preserveAspectRatio: 'xMidYMid slice'
            }
        };
        const { loop, animate, onEnd } = this.props;


        return (
            <div className={css.seed_wrapbox}>
                <div className={css.seed_lotbox} style={{ width: "100%", height: "100%" }} onClick={this.generateNewSeed} style={{ display: this.state.viewReload }}>
                    <Lottie className={classNames(css.seed_lottie)}
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
                <div className={css.seed} style={{ display: this.state.viewSeed }}>

                    {seed.map((byte, index) => {
                        const offset = scramble[index];

                        const letter = offset > 0 ? indexToChar(offset) : indexToChar(byte);
                        return (
                            <button
                                onClick={this.updateLetter}
                                key={`${index}${letter}`}
                                value={index}
                                style={{ opacity: 1 - offset / 255 }}
                            >
                                {letter}
                            </button>
                        );
                    })}

                </div>
            </div>
        );
    }
}
export default SeedA;
