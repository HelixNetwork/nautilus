import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { withI18n, Trans } from 'react-i18next';
import PropTypes from 'prop-types';

import css from './index.scss';

class Login extends React.PureComponent {

    static propTypes = {
        history: PropTypes.object,
        t: PropTypes.func.isRequired,
    };

    /**
     * Verify password and trigger account setup
     * @param {event} Event - Form submit event
     * @returns {undefined}
     */
    handleSubmit = async (e) => {
        if (e) {
            e.preventDefault();
        }
        const { history } = this.props;
        history.push('/wallet');
    }
    render() {
        return (
            <section className="spage_1">
                <div className="container">
                    <div className="row">
                        <div className={classNames(css.sseed_box, css.cre_pgs)}>
                            <form onSubmit={(e) => this.handleSubmit(e)}>
                                <h5>Enter your account password</h5>
                                <input type="text" className={classNames(css.sseed_text)}></input><br /><br />
                                <button type="submit">Login</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        )
    }
}

const mapDispatchToProps = {
};

export default connect(null, mapDispatchToProps)(withI18n()(Login));