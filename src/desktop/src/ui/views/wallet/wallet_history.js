import React from 'react';
import { connect } from 'react-redux';
import css from './wallet.scss';
import classNames from 'classnames';
import Top from '../../components/topbar';
import List from 'ui/components/list';
import { getSelectedAccountName, getSelectedAccountMeta} from 'selectors/accounts';
import { getAccountInfo } from 'actions/accounts';
import SeedStore from 'libs/seed';

import PropTypes from 'prop-types';
import reload from 'ui/images/refresh.svg';
import { withI18n } from 'react-i18next';
import Button from 'ui/components/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
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
        getAccountInfo: PropTypes.func.isRequired,
        accountName: PropTypes.string.isRequired,
        accountMeta: PropTypes.object.isRequired,
        password: PropTypes.object.isRequired,
    }
    state = {
        active: 'li0'
    };
    handleActive(element) {
        this.setState({
            active: element
        });
    }

    updateAccount = async () => {
        const { password, accountName, accountMeta } = this.props;

        const seedStore = await new SeedStore[accountMeta.type](password, accountName, accountMeta);

        this.props.getAccountInfo(
            seedStore,
            accountName,
            Electron.notify,
            true, // Sync with quorum enabled
        );
    };
    render() {
        const { t, history } = this.props;
        const subroute = location.pathname.split('/')[3] || null;

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
                                        <h3 style={{ marginLeft: '25vw' }}>Transaction History<span>.</span></h3>
                                        <h6 style={{ marginLeft: '28vw' }}>Access and manage your Transaction</h6>
                                        <div className={classNames(css.main_div)} style={{"height": "12%"}}>
                                            {/* <div className={classNames(css.Left_div)}>
                                                <ul>
                                                    <li className={classNames(css.list, (this.state.active == 'li0' ? css.active : ''))} onClick={this.handleActive.bind(this, 'li0')}>ALL</li>
                                                    <li className={classNames(css.list, (this.state.active == 'li1' ? css.active : ''))} onClick={this.handleActive.bind(this, 'li1')}><a className={classNames(css.list_anchor)} href="#">SENT</a></li>
                                                    <li className={classNames(css.list, (this.state.active == 'li2' ? css.active : ''))} onClick={this.handleActive.bind(this, 'li2')}><a className={classNames(css.list_anchor)} href="#">RECEIVED</a></li>
                                                </ul>
                                            </div>
                                            <div className={classNames(css.right_div)}>
                                                <div className={classNames(css.input_group)}>
                                                    <input type="text" name="name" className={classNames(css.search_text)} placeholder="Search Transaction" />
                                                    <button className={classNames(css.bts)} variant="backgroundNone" type=""> <FontAwesomeIcon style={{ verticalAlign: "-1.125em", marginLeft: "-140px" }} icon={faSearch} /></button>
                                                </div>
                                            </div> */}

                                            <List
                                                updateAccount={() => this.updateAccount()}
                                                setItem={(item) =>
                                                    item !== null ? history.push(`/wallet/history/${item}`) : history.push('/wallet/')
                                                }
                                                currentItem={subroute}
                                            />

                                            {/* <table className={classNames(css.table)}> */}
                                            {/* <tbody>
                                                    <tr style={{ borderTop: '5px solid #D1721E' }}>
                                                        <td><span className={classNames(css.icon)}><i className={classNames(css.fa)} aria-hidden="true"></i></span>
                                                            <div className={classNames(css.pending)}>Pending</div>
                                                            <div>December 27 @ 23:58</div></td>
                                                        <td><div>To:Lorem Ipsum is simply dummy text of the printing </div>
                                                            <div>From:Lorem Ipsum is simply dummy text of the printing </div></td> */}
                                            {/* <td>Add Description</td> */}
                                            {/* <td><button type="button" className={classNames(css.btn_pending)}>14.0r mHLX </button></td>
                                                    </tr>
                                                    <tr >
                                                        <td><span ></span>
                                                            <div className={classNames(css.sends)}>Send</div>
                                                            <div>December 27 @ 23:58</div></td>
                                                        <td><div>To:Lorem Ipsum is simply dummy text of the printing </div>
                                                            <div>From:Lorem Ipsum is simply dummy text of the printing </div></td> */}
                                            {/* <td>Add Description</td> */}
                                            {/* <td><button type="button" className={classNames(css.btn_send)}>14.0r mHLX</button></td>
                                                    </tr>
                                                    <tr >
                                                        <td><span></span>
                                                            <div className={classNames(css.recvd)}>Received</div>
                                                            <div>December 27 @ 23:58</div></td>
                                                        <td><div>To:Lorem Ipsum is simply dummy text of the printing </div>
                                                            <div>From:Lorem Ipsum is simply dummy text of the printing </div></td> */}
                                            {/* <td>Add Description</td> */}
                                            {/* <td><button type="button" className={classNames(css.btn_recvd)}>14.0r mHLX</button></td>
                                                    </tr>
                                                </tbody> */}

                                            {/* </table> */}
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

const mapStateToProps = (state) => ({
    accountName: getSelectedAccountName(state),
    accountMeta: getSelectedAccountMeta(state),
    password: state.wallet.password,
});

const mapDispatchToProps = {
    getAccountInfo
};
export default connect(mapStateToProps, mapDispatchToProps)(withI18n()(WalletHistory));