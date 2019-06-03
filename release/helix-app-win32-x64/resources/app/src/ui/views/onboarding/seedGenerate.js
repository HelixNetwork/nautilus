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
    render() {
        const { t } = this.props;
        const { ledger } = this.state;

        return (
            <section className="spage_1">
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <h1>Generate Seed </h1>
                    </div>
                    <div className={classNames(css.sseed_box2, css.cre_pgs)}>
                        <h3>Press 10 more letters to randomise your seed even more</h3>
                        <div className={css.text_ff}><span>A</span> A H H 1 M B 3 H I I U T Z H D F H</div>
                        <div className={css.text_ff}><span>A</span> A H H 1 M B 3 H I I U T Z H D F H</div>
                        <div className={css.text_ff}><span>A</span> A H H 1 M B 3 H I I U T Z H D F H</div>
                        <div className={css.text_ff}><span>A</span> A H H 1 M B 3 H I I U T Z H D F H</div>
                        <div><a className={css.arrow_bx}><img src={reload} alt=""/></a></div>

                    </div>
                    <div className={css.onboard_nav}>
                        <span className={css.navleft}>Login With Your seed</span>
                        <span className={css.navright}>Create Seed ></span>
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