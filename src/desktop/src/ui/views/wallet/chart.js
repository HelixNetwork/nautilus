import React from 'react';
import { connect } from 'react-redux';
import css from './wallet.scss';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';

/**
 * Chart component
 */
class Charts extends React.PureComponent {
    static propTypes = {
        /**@ignore */
        location: PropTypes.object,
        /**@ignore */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /**@ignore */
        t: PropTypes.func.isRequired,
    };
    render() {
        return (
            <div>
                <section className={css.home}>
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className={classNames(css.foo_bxx1)}>
                                    <p className={css.chart_p}>Currently not available</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}
const mapDispatchToProps = {};

export default connect(
    null,
    mapDispatchToProps,
)(withI18n()(Charts));
