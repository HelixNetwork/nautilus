import React from 'react';
import { connect } from 'react-redux';
import css from './welcome.scss';

/**
 * Helix Welcome Screen component
 */
class Welcome extends React.PureComponent {
    render() {
        return (
            <div>
                <section className={css.home}>
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <h3>Thank You</h3>
                                <h6>for downloading the HellixWallet</h6>
                                <br></br>
                                <h5>Language</h5>
                                <br></br>
                                <div className={css['custom-select']}>
                                    <select>
                                        <option value="0">English(International)</option>
                                        <option value="1">German</option>
                                        <option value="2">French</option>
                                        <option value="3">English</option>
                                    </select>
                                </div>
                                <br></br>
                                <a href="" className={css.cont}>Continue <span>></span></a>
                            </div>
                        </div>
                    </div>
                </section>
                <footer>
                    <ul>
                        <li className="active"><a href="#">0</a></li>
                        <li><a href="#">1</a></li>
                        <li><a href="#">2</a></li>
                        <li><a href="#">3</a></li>
                        <li><a href="#">4</a></li>
                        <li className="db_none"><a href="#">5</a></li>
                    </ul>
                </footer>
            </div>
        )
    }
}

const mapDispatchToProps = {
};

export default connect(null, mapDispatchToProps)(Welcome);