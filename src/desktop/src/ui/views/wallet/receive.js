import React from 'react';
import { connect } from 'react-redux';
import css from './wallet.scss';
import classNames from 'classnames';
import Top from '../../components/topbar';
import PropTypes from 'prop-types';
import reload from 'ui/images/refresh.svg';
import { withI18n } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {fasync,faDownload} from '@fortawesome/free-solid-svg-icons';

/**
 * 
 */
class Receive extends React.PureComponent {
    static propTypes = {
        location: PropTypes.object,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        t: PropTypes.func.isRequired,
    }
    render() {
        const { t } = this.props;
        return (
            <div>
                <section className={css.home}>

                    <Top
                        bal={'none'}
                        main={'block'}
                        user={'block'}
                        history={this.props.history}
                    />
                    <div className={classNames(css.pg1_foo3)}>
                        <div className="container">
                            <div className="row">

                                <div className="col-lg-12">
                                    <div className={classNames(css.foo_bxx1)}>
                                        <h3>{t('receive:receiveCoins')}<span>.</span></h3>
                                        <h6>{t('receive:irrevocableTransactionWarning')}</h6>
                                        <div className={classNames(css.sseed_box2, css.sec_bxc)}>
                                            <div className={classNames(css.wrap)}>
                                                <div className={classNames(css.left)}>
                                                    <table style={{ width: "100%" }}>
                                                        <tbody style={{ width: "100%" }}>
                                                            <tr className={classNames(css.style_108)}>

                                                                <td className={classNames(css.tdcls1)}><span className={classNames(css.yellow)}>A</span></td>
                                                                <td className={classNames(css.tdcls1)}>A</td>
                                                                <td className={classNames(css.tdcls1)}>H</td>
                                                                <td className={classNames(css.tdcls1)}>H</td>

                                                            </tr >
                                                            <tr className={classNames(css.style_108)}>

                                                                <td className={classNames(css.tdcls2)}>Z</td>
                                                                <td className={classNames(css.tdcls2)}>H</td>
                                                                <td className={classNames(css.tdcls2)}>D</td>
                                                                <td className={classNames(css.tdcls2)}>F</td>

                                                            </tr>
                                                            <tr className={classNames(css.style_30)}>

                                                                <td className={classNames(css.tdcls2)}>C</td>
                                                                <td className={classNames(css.tdcls2)}>X</td>
                                                                <td className={classNames(css.tdcls2)}>Y</td>
                                                                <td className={classNames(css.tdcls2)}>Z</td>

                                                            </tr>
                                                            <tr className={classNames(css.style_108)}>

                                                                <td className={classNames(css.tdcls2)}>B</td>
                                                                <td className={classNames(css.tdcls2)}>N</td>
                                                                <td className={classNames(css.tdcls2)}><span className={classNames(css.yellow)}>M</span></td>
                                                                <td className={classNames(css.tdcls2)}>B</td>

                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className={classNames(css.right)}>
                                                    <table style={{ width: "100%" }}>
                                                        <tbody style={{ width: "100%" }}>
                                                            <tr className={classNames(css.style_108)}>

                                                                <td className={classNames(css.tdcls1)}><span className={classNames(css.yellow)}>A</span></td>
                                                                <td className={classNames(css.tdcls1)}>A</td>
                                                                <td className={classNames(css.tdcls1)}>H</td>
                                                                <td className={classNames(css.tdcls1)}>H</td>

                                                            </tr >
                                                            <tr className={classNames(css.style_108)}>

                                                                <td className={classNames(css.tdcls2)}>Z</td>
                                                                <td className={classNames(css.tdcls2)}>H</td>
                                                                <td className={classNames(css.tdcls2)}>D</td>
                                                                <td className={classNames(css.tdcls2)}>F</td>

                                                            </tr>
                                                            <tr className={classNames(css.style_30)}>

                                                                <td className={classNames(css.tdcls2)}>C</td>
                                                                <td className={classNames(css.tdcls2)}>X</td>
                                                                <td className={classNames(css.tdcls2)}>Y</td>
                                                                <td className={classNames(css.tdcls2)}>Z</td>

                                                            </tr>
                                                            <tr className={classNames(css.style_108)}>

                                                                <td className={classNames(css.tdcls2)}>B</td>
                                                                <td className={classNames(css.tdcls2)}>N</td>
                                                                <td className={classNames(css.tdcls2)}><span className={classNames(css.yellow)}>M</span></td>
                                                                <td className={classNames(css.tdcls2)}>B</td>

                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                            <div className={classNames(css.wrap)}>
                                                <div className={classNames(css.left)}>
                                                    <table style={{ width: "100%" }}>
                                                        <tbody style={{ width: "100%" }}>
                                                            <tr className={classNames(css.style_108)}>

                                                                <td className={classNames(css.tdcls1)}><span className={classNames(css.yellow)}>A</span></td>
                                                                <td className={classNames(css.tdcls1)}>A</td>
                                                                <td className={classNames(css.tdcls1)}>H</td>
                                                                <td className={classNames(css.tdcls1)}>H</td>

                                                            </tr >
                                                            <tr className={classNames(css.style_108)}>

                                                                <td className={classNames(css.tdcls2)}>Z</td>
                                                                <td className={classNames(css.tdcls2)}>H</td>
                                                                <td className={classNames(css.tdcls2)}>D</td>
                                                                <td className={classNames(css.tdcls2)}>F</td>

                                                            </tr>
                                                            <tr className={classNames(css.style_30)}>

                                                                <td className={classNames(css.tdcls2)}>C</td>
                                                                <td className={classNames(css.tdcls2)}>X</td>
                                                                <td className={classNames(css.tdcls2)}>Y</td>
                                                                <td className={classNames(css.tdcls2)}>Z</td>

                                                            </tr>
                                                            <tr className={classNames(css.style_108)}>

                                                                <td className={classNames(css.tdcls2)}>B</td>
                                                                <td className={classNames(css.tdcls2)}>N</td>
                                                                <td className={classNames(css.tdcls2)}><span className={classNames(css.yellow)}>M</span></td>
                                                                    <td className={classNames(css.tdcls2)}>B</td>
    
                                                    </tr>
                                                    </tbody>
                                                </table>
                                           </div>
                                                    <div className={classNames(css.right)}>
                                                        <table style={{ width: "100%" }}>
                                                            <tbody style={{ width: "100%" }}>
                                                                <tr className={classNames(css.style_108)}>

                                                                    <td className={classNames(css.tdcls1)}><span className={classNames(css.yellow)}>A</span></td>
                                                                    <td className={classNames(css.tdcls1)}>A</td>
                                                                    <td className={classNames(css.tdcls1)}>H</td>
                                                                    <td className={classNames(css.tdcls1)}>H</td>

                                                                </tr >
                                                                <tr className={classNames(css.style_108)}>

                                                                    <td className={classNames(css.tdcls2)}>Z</td>
                                                                    <td className={classNames(css.tdcls2)}>H</td>
                                                                    <td className={classNames(css.tdcls2)}>D</td>
                                                                    <td className={classNames(css.tdcls2)}>F</td>

                                                                </tr>
                                                                <tr className={classNames(css.style_30)}>

                                                                    <td className={classNames(css.tdcls2)}>C</td>
                                                                    <td className={classNames(css.tdcls2)}>X</td>
                                                                    <td className={classNames(css.tdcls2)}>Y</td>
                                                                    <td className={classNames(css.tdcls2)}>Z</td>

                                                                </tr>
                                                                <tr className={classNames(css.style_108)}>

                                                                    <td className={classNames(css.tdcls2)}>B</td>
                                                                    <td className={classNames(css.tdcls2)}>N</td>
                                                                    <td className={classNames(css.tdcls2)}><span className={classNames(css.yellow)}>M</span></td>
                                                                    <td className={classNames(css.tdcls2)}>B</td>

                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* <div><FontAwesomeIcon icon={fasync} className={(classNames(css.refresh))} size='2x' /><h2 className={classNames(css.refresh_h2)}>Click for new Address <span>></span></h2></div>
                                            <div><FontAwesomeIcon icon={faDownload} className={(classNames(css.download))} size='2x' /><h2 className={classNames(css.download_h2)}>Copy receiving Address <span>></span></h2></div> */}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>


                   
                </section>
                    <footer className={classNames(css.footer_bx)}>
                    </footer>
            </div>
                )
            }
        }
const mapDispatchToProps = {

                };
export default connect(null, mapDispatchToProps)(withI18n()(Receive));