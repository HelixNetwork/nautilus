import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';
import css from './index.scss';
import classNames from 'classnames';
import reload from 'ui/images/arrows.png';
import Button from 'ui/components/button';
import Top from '../../components/topbar';
import Logos from 'ui/components/logos';

import { createRandomSeed, randomBytes } from '../../../utils/crypto';
import { indexToChar } from 'libs/hlx/converter';
import { MAX_SEED_LENGTH } from 'libs/hlx/utils';

class SeedGenerate extends React.PureComponent {
    static propTypes = {
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        t: PropTypes.func.isRequired,
    };

    state = {
        seed: Electron.getOnboardingSeed() || createRandomSeed(),
        scramble: Electron.getOnboardingSeed() ? new Array(MAX_SEED_LENGTH).fill(0) : randomBytes(MAX_SEED_LENGTH, 27),
        existingSeed: Electron.getOnboardingSeed(),
        clicks: [],
        viewSeed: 'none',
        viewReload: 'block'
    }
    componentDidMount() {
        this.frame = 0;
        this.unscramble();
    }

    componentWillUnmount() {
        this.frame = -1;
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
    // stepBack() {
    //     this.props.history.goBack();
    // }
    render() {
        const { t } = this.props;
        const { ledger } = this.state;
        const { seed, scramble, existingSeed, clicks } = this.state;
        const clicksLeft = 4 - clicks.length;
        console.log("Seed::::" + seed);

        return (
            <div>
                <Logos
                />

                <section className="spage_1">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <h1>{t('newSeedSetup:generateSeed')}<span className={classNames(css.text_color)}>.</span></h1>
                            </div>

                            <div className={classNames(css.sseed_box_wrap, css.cre_pgs)}>
                                <h3>
                                    {!existingSeed && clicksLeft > 0 ? (
                                        <Trans i18nKey="newSeedSetup:individualLetterCount" count={clicksLeft}>
                                            Press <strong className={css.highlight}>{{ count: clicksLeft }}</strong> more letter to
                                            randomise it.
                            </Trans>
                                    ) : (
                                            <span>&nbsp;</span>
                                        )}
                                </h3>
                                <div>

                                    <div className={css.seed_wrapper}>
                                        <div className={css.seed_wrapbox}>
                                            <div className={css.seed}>

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
                                        <div class={css.seed_wrapbox}>
                                            <div class={css.seed_space}></div>
                                        </div>
                                        <div class={css.seed_wrapbox}>
                                            <div class={css.seed_space}></div>
                                        </div>
                                        <div class={css.seed_wrapbox}>
                                            <div class={css.seed_space}></div>
                                        </div>

                                    </div>


                                </div>
                                {/* <div className={css.seed}>                                                                                                                                                      

                                    <Button type="button" onClick={this.generateNewSeed} style={{ display: this.state.viewReload }} className="icon">
                                        <img src={reload} alt="" />
                                        {t('newSeedSetup:clickForNewSeed')}
                                    </Button>

                                    <div style={{ display: this.state.viewSeed }}>
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

                                </div> */}
                            </div>

                            <div className={css.onboard_nav}>
                                <Button className="navleft" variant="backgroundNone" onClick={() => this.props.history.push('/onboarding/seed-intro')} >{t('global:goBack')} <span>></span></Button>
                                <Button className="navright" variant="backgroundNone" >{t('global:continue')} <span>></span> </Button>

                                {/* <span className={css.navleft}>{t('newSeedSetup:loginWithYourSeed')}</span>
                            <span className={css.navright}>{t('newSeedSetup:createSeed')} ></span> */}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        )
    }
}

const mapDispatchToProps = {
};

export default connect(null, mapDispatchToProps)(withI18n()(SeedGenerate));