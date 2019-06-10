import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';
import css from './index.scss';
import classNames from 'classnames';
import reload from 'ui/images/arrows.png'

class SeedGenerate extends React.PureComponent {
    static propTypes = {
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        t: PropTypes.func.isRequired,
    };

    state = {
    }
    stepBack(){
        this.props.history.goBack();
    }
    render() {
        const { t } = this.props;
        const { ledger } = this.state;

        return (
            <section className="spage_1">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <h1>{t('newSeedSetup:generateSeed')}</h1>
                        </div>
                        <div className={classNames(css.sseed_box2, css.cre_pgs)}>
                        <h3>Press 10 more letters to randomise your seed even more</h3>
                        <div className={classNames(css.text_ff)}><span>A</span> A F E 1 B 0 9 C A 0 7 D 2 B 4 F 5</div>
                        <div className={classNames(css.text_ff)}><span>A</span> A F E 1 B 0 9 C A 0 7 D 2 B 4 F 5</div>
                        <div className={classNames(css.text_ff)}><span>A</span> A F E 1 B 0 9 C A 0 7 D 2 B 4 F 5</div>
                        <div className={classNames(css.text_ff)}><span>A</span> A F E 1 B 0 9 C A 0 7 D 2 B 4 F 5</div>
                        <div><a className={css.arrow_bx}><img src={reload} alt=""/></a></div>

                    </div>
                        <div className={css.onboard_nav}>
                            <span className={css.navleft}>{t('newSeedSetup:loginWithYourSeed')}</span>
                            <span className={css.navright}>{t('newSeedSetup:createSeed')} ></span>
                        </div>
                    </div>
                </div>
            </section>
        )
    }
}

const mapDispatchToProps = {
};

export default connect(null, mapDispatchToProps)(withI18n()(SeedGenerate));