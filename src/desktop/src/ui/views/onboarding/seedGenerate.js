import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';
import css from './index.scss';
import classNames from 'classnames';
import reload from 'ui/images/arrows.png';
import Button from 'ui/components/button';
import Top from '../../components/topbar';

class SeedGenerate extends React.PureComponent {
    static propTypes = {
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        t: PropTypes.func.isRequired,
    };

    state = {
    }
    stepBack() {
        this.props.history.goBack();
    }
    render() {
        const { t } = this.props;
        const { ledger } = this.state;

        return (
            <div>
                <Top
                    main={'none'}
                    user={'none'}
                    bal={'none'}
                    common={'none'}
                    history={history}
                />

                <section className="spage_1">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <h1>{t('newSeedSetup:generateSeed')}<span className={classNames(css.text_color)}>.</span></h1>
                            </div>
                            <div className={classNames(css.sseed_box2, css.cre_pgs)}>
                                <h3>{t('newSeedSetup:randomiseSeedMore')}</h3>
                                <div className={classNames(css.text_ff)}><span>A</span> A F E 1 B 0 9 C A 0 7 D 2 B 4 F 5</div>
                                <div className={classNames(css.text_ff)}><span>A</span> A F E 1 B 0 9 C A 0 7 D 2 B 4 F 5</div>
                                <div className={classNames(css.text_ff)}><span>A</span> A F E 1 B 0 9 C A 0 7 D 2 B 4 F 5</div>
                                <div className={classNames(css.text_ff)}><span>A</span> A F E 1 B 0 9 C A 0 7 D 2 B 4 F 5</div>
                                <div className={classNames(css.img_align)}><a><img src={reload} alt="" /></a></div>
                                <div className={classNames(css.text_align)}>{t('newSeedSetup:clickForNewSeed')}</div>
                            </div>
                            <div className={css.onboard_nav}>
                                <Button className="navleft" onClick={() => this.props.history.push('/onboarding/seed-intro')} >{t('global:goBack')} <span>></span></Button>
                                <Button className="navright">{t('global:continue')} <span>></span> </Button>

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