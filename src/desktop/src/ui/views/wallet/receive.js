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
                                            <div className={classNames(css.text_ff1)}><span>A</span> A F E 1 B 0 9 C A 0 7 D 2 B 4 F </div>
                                            <div className={classNames(css.text_ff1)}><span>A</span> A F E 1 B 0 9 C A 0 7 D 2 B 4 F </div>
                                            <div className={classNames(css.text_ff1)}><span>A</span> A F E 1 B 0 9 C A 0 7 D 2 B 4 F </div>
                                            <div className={classNames(css.text_ff1)}><span>A</span> A F E 1 B 0 9 C A 0 7 D 2 B 4 F </div><br />

                                        </div>
                                        <div><a className={css.reload}><img src={reload} alt="" /></a></div>
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