import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

import css from './index.scss';
class SeedIntro extends React.PureComponent {
    state = {
        ledger: false,
    };
    render() {
        const { t } = this.props;
        const { ledger } = this.state;

        return (
            <section className="spage_1">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <h1>Do you need to create a new <span>seed </span>?</h1>
                        </div>
                        <div className={classNames(css.sseed_box, css.cre_pgs)}>
                            <img src="images/ex_mark.png" alt="" />
                            <h5>Your helix seed is your account access.</h5>
                            <h6>You can use it access your funds from any wallet, or any device</h6>
                        </div>
                        <div className={css.onboard_nav}>
                            <span className={css.navleft}>Go back</span>
                            <span className={css.navright}>Continue ></span>
                        </div>
                    </div>
                </div>
            </section>
        )
    }
}

const mapDispatchToProps = {
};

export default connect(null, mapDispatchToProps)(SeedIntro);