import React from 'react';
import css from './wallet.scss';
import classNames from 'classnames';

/**
 * Chart component
 */
class Charts extends React.PureComponent {
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

export default Charts;
