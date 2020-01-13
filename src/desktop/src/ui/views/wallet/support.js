import React from 'react';
import css from './wallet.scss';
import style from 'ui/global/about.scss';
import classNames from 'classnames';
import hlx from 'ui/images/logo.png';
/**
 * Support component
 */
class Support extends React.PureComponent {
    state = {
        active: 'li0',
    };
    handleActive(element) {
        this.setState({
            active: element,
        });
    }

    render() {
        return (
            <div>
                <section className={css.home}>
                    <div className={classNames(css.pg1_foo3)}>
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-12">
                                    <div className={classNames(css.foo_bxx1)}>
                                        <section className={style.about}>
                                            <div className={css.support_div}>
                                                <img src={hlx} alt="" />
                                            </div>
                                            <h1>Nautilus Wallet</h1>
                                            <h2>
                                                Email us at: <small>nautilus@helix-foundation.org</small>
                                            </h2>
                                        </section>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

export default Support;
