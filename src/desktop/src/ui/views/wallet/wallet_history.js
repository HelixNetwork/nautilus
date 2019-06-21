import React from 'react';
import { connect } from 'react-redux';
import css from './wallet.scss';
import classNames from 'classnames';
import Top from '../../components/topbar';
import PropTypes from 'prop-types';
import reload from 'ui/images/refresh.svg';
import { withI18n } from 'react-i18next';
import Button from 'ui/components/button';
/**
 * Wallet History component
 */
class WalletHistory extends React.PureComponent {
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
                        disp={'block'}
                        history={this.props.history}
                    />
                    <div className={classNames(css.pg1_foo3)}>
                        <div className="container">
                            <div className="row">

                                <div className="col-lg-12">
                                    <div className={classNames(css.foo_bxx1)}>
                                        <h3>Transaction History.</h3>
                                        <h6>Access and manage your transactions.</h6>
                                        <div className={classNames(css.sseed_box2, css.sec_bxc)}>
                                        <div style={{marginRight:'30px',marginTop:'-36px'}}>

                                        </div>
                                        <div className={classNames(css.top_sec1)}>
                                        <a>All</a>
                                        <a>Sent</a>
                                        <a>Recieved</a>
                                        <a>Transfered</a>
                                        </div>
                                          <table className={classNames(css.table)}>
                                                <tr >
                                                    <td >> Pending<br/>December 20th 2019</td>
                                                    <td>To:2gaffadfghv54<br/>From:2gaffadfghv54</td>
                                                    
                                                    <td>  <div className={classNames(css.table_box1)}>14.3HLx</div></td>
                                                </tr>
                                                <tr >
                                                <td >> Pending<br/>December 20th 2019</td>
                                                    <td>To:2gaffadfghv54<br/>From:2gaffadfghv54</td>
                                                    
                                                    <td> <div className={classNames(css.table_box1)}>14.3HLx</div></td>
                                                </tr>
                                                <tr >
                                                <td >> Pending<br/>December 20th 2019</td>
                                                    <td>To:2gaffadfghv54<br/>From:2gaffadfghv54</td>
                                                    <td> <div className={classNames(css.table_box1)}>14.3HLx</div></td>
                                                </tr>
                                                <tr >
                                                <td >> Pending<br/>December 20th 2019</td>
                                                    <td>To:2gaffadfghv54<br/>From:2gaffadfghv54</td>
                                                    
                                                    <td> <div className={classNames(css.table_box1)}>14.3HLx</div></td>
                                                </tr>
                                             
                                               
                                          </table>

                                        </div>
                                       
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
export default connect(null, mapDispatchToProps)(withI18n()(WalletHistory));