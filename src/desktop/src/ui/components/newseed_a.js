import React from 'react';
import css from '../views/onboarding/index.scss';
import classNames from 'classnames';
import Lottie from 'react-lottie';
import * as animationData from 'animations/done.json';
import { withI18n, Trans } from 'react-i18next';
import PropTypes from 'prop-types';


class Seed extends React.PureComponent {
    static propTypes = {
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        t: PropTypes.func.isRequired,
        loop: PropTypes.bool,
    };

    state = {
        seed: Electron.getOnboardingSeed() || createRandomSeed(),
        scramble: Electron.getOnboardingSeed() ? new Array(MAX_SEED_LENGTH).fill(0) : randomBytes(MAX_SEED_LENGTH, 27),
        existingSeed: Electron.getOnboardingSeed(),
        clicks: [],
        viewSeed: 'none',
        viewReload: 'block',
    }
    onUpdatedSeed = (seed) => {
        this.setState(() => ({
            seed,
        }));
    };

    /**
     * Update individual seed byte to random
     * @param {event} event - Click event
     * @param {number} position - Letter seed position index
     * @returns {undefined}
     */
    updateLetter = (e) => {
        const { seed, clicks, scramble } = this.state;

        const position = e.target.value;

        const newClicks = clicks.indexOf(position) < 0 ? clicks.concat([position]) : clicks;
        console.log(seed[position]);
        const newSeed = seed.slice(0);
        newSeed[position] = createRandomSeed(1)[0];

        scramble[position] = 64;
        console.log(e.target.value);
        this.setState(() => ({
            seed: newSeed,
            clicks: newClicks,
            scramble: scramble,
        }));

        this.unscramble();
    };

    /**
     * Generate random seed[0] ℹ ｢wdm｣: Compiling...uence
     * @returns {undefined}[0] ℹ ｢wdm｣: Compiling...
     */
    generateNewSeed = () => {
        const newSeed = createRandomSeed();
        console.log("newSeed", newSeed);

        Electron.setOnboardingSeed(null);

        this.setState(() => ({
            seed: newSeed,
            existingSeed: false,
            clicks: [],
            viewSeed: 'block',
            viewReload: 'none'
        }));

        this.frame = 0;

        this.setState({
            scramble: randomBytes(MAX_SEED_LENGTH, 27),
        });

        this.unscramble();
    };

    /**
     * Seed generation animation sequence step
     * @returns {undefined}
     */
    unscramble() {
        const { scramble } = this.state;

        if (this.frame < 0) {
            return;
        }

        const scrambleNew = [];
        let sum = -1;

        if (this.frame > 2) {
            sum = 0;

            for (let i = 0; i < scramble.length; i++) {
                sum += scramble[i];
                scrambleNew.push(Math.max(0, scramble[i] - 15));
            }

            this.setState({
                scramble: scrambleNew,
            });

            this.frame = 0;
        }

        this.frame++;

        if (sum !== 0) {
            requestAnimationFrame(this.unscramble.bind(this));
        }
    }

    render() {
        const t = this.props;
        const clicksLeft = 4 - clicks.length;
        console.log("Seed::::" + seed);
        const { seed, scramble, existingSeed, clicks } = this.state;
        const { loop, animate, onEnd } = this.props;

        const defaultOptions = {
            loop: loop,
            autoplay: true,
            animationData: animationData.default,
            rendererSettings: {
                preserveAspectRatio: 'xMidYMid slice'
            }
        };

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
                        console.log("Offset", offset);

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
            // {/* <div className={classNames(css.top_sec1)}>
            //     <div className={classNames(css.lg_logos)}><img src={logo} alt="" /></div>
            //     <div className={classNames(css.bal_bx)} style={{ display: this.props.bal }}><span style={{ color: 'white', fontSize: '22px' }}>Balance</span><br /><br /><span>0,02€ /mHLX</span></div>
            //     <div className={classNames(css.bal_bxs)} style={{ display: this.props.bal }}>1337,00 &nbsp; <span style={{ color: '#e8b349', fontSize: '14px' }}> mHLX</span><br /><span>26,67 &nbsp;&nbsp;&nbsp;&nbsp;  <span style={{ fontSize: '15px', marginRight: '9px' }}>EUR</span></span></div>
            //     <div style={{ marginRight: '30px', marginTop: '-36px' }}>
            //         <a href="#" className={classNames(css.main_mn)} style={{ display: this.props.user }}><img src={log} style={{ width: '40px' }} alt="" /></a>
            //         <a onClick={() => this.props.history.push('/')} className={classNames(css.setting)} style={{ display: this.props.common }}><FontAwesomeIcon icon={faPowerOff} /> Logout </a>
            //         <a onClick={() => this.props.history.push('/settings')} className={classNames(css.setting)} style={{ display: this.props.common }}><FontAwesomeIcon icon={faCog} /> Settings</a>
            //         <a onClick={() => this.props.history.push('/wallet')} className={classNames(css.setting)} style={{ display: this.props.main }}><FontAwesomeIcon icon={faTh} /> Main Menu</a>
            //     </div>

            // </div> */}
        );
    }
}
export default Seed;
