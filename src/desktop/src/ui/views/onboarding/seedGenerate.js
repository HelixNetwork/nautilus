import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';
import css from './index.scss';
import classNames from 'classnames';

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
                            <h1>{t('newSeedSetup:generateSeed')}</h1>
                        </div>
                        {/* <div className={classNames(css.sseed_box, css.cre_pgs)}>
                            <img src="images/ex_mark.png" alt="" />
                            <h5></h5>
                            <h6></h6>
                            <h3></h3>
                        </div> */}
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