import React from 'react';
import { connect } from 'react-redux';
import css from './wallet.scss';
import classNames from 'classnames';
import images from 'ui/images/ic1.png';
import Top from '../../components/topbar';
import PropTypes from 'prop-types';
import ic1 from 'ui/images/send_bt.png';
import { withI18n } from 'react-i18next';
import SeedStore from 'libs/seed';
import Modal from 'ui/components/modal/Modal';
import {isAddress} from '@helixnetwork/validators';
import Button from 'ui/components/button';
class Send extends React.PureComponent {
   
    static propTypes = {
        /** @ignore */
        fields: PropTypes.shape({
            address: PropTypes.string.isRequired,
            amount: PropTypes.string.isRequired,
            message: PropTypes.string.isRequired,
        }),
        /** @ignore */
        isSending: PropTypes.bool.isRequired,
        /** @ignore */
        password: PropTypes.object.isRequired,
        /** @ignore */
        accountMeta: PropTypes.object.isRequired,
        /** @ignore */
        accountName: PropTypes.string.isRequired,
        /** @ignore */
        availableBalance: PropTypes.number.isRequired,
        /** @ignore */
        settings: PropTypes.shape({
            conversionRate: PropTypes.number.isRequired,
            currency: PropTypes.string.isRequired,
            usdPrice: PropTypes.number.isRequired,
        }),
        /** @ignore */
        progress: PropTypes.shape({
            progress: PropTypes.number,
            title: PropTypes.string,
        }),
        /** @ignore */
        validateInputs: PropTypes.func.isRequired,
        /** @ignore */
        sendTransfer: PropTypes.func.isRequired,
        /** @ignore */
        setSendAddressField: PropTypes.func.isRequired,
        /** @ignore */
        setSendAmountField: PropTypes.func.isRequired,
        /** @ignore */
        setSendMessageField: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        themeName: PropTypes.string.isRequired,
        location: PropTypes.object,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        generateAlert: PropTypes.func.isRequired,
    };

state={
    address:'',
    amount:0,
    openModal:false
}
    confirmTransfer = async () => {
        const { fields, password, accountName, accountMeta, sendTransfer } = this.props;

        this.setState({
            isTransferModalVisible: false,
        });

        const seedStore = await new SeedStore[accountMeta.type](password, accountName, accountMeta);

        const message =
            SeedStore[accountMeta.type].isMessageAvailable || parseInt(fields.amount || '0') === 0
                ? fields.message
                : '';

            
        
        sendTransfer(seedStore, fields.address, parseInt(fields.amount) || 0, message);
    };

    addressInput(e){
        this.setState({
            address:e.target.value
        })
    }
    hlxInput(e){
        this.setState({
            amount:parseInt(e.target.value)
        })
    }
    amountInput(e){
        
    }
    send(){
        if(!isAddress(this.state.address) && isNaN(this.state.amount)){
            console.log(
                'error',
                'Invalid address',
                'You have a entered an invalid address.',
                1000
            ); 
        }
            this.setState({
                openModal:true
            });
        
        
    }

    render() {
        const { history, t } = this.props;
        const {openModal} = this.state;
        return (
            <div>
                <section className={css.home}>

                    <Top
                        bal={'block'}
                        main={'block'}
                        user={'block'}
                        history={history}
                    />
                    <div className={classNames(css.pg1_foo3)}>
                        <div className="container">
                            <div className="row">

                                <div className="col-lg-12">
                                    <div className={classNames(css.foo_bxx1)}>
                                        <h3 >{t('send:sendCoins')}<span>.</span></h3>
                                        <h6 >{t('send:irrevocableTransactionWarning')}</h6>
                                        <form >
                                            {/* <div className={classNames(css.bbx_box1, css.tr_box)}>
                                            <span className={classNames(css.er1)}>EUR</span>
                                            <span className={classNames(css.er2)}>26,74</span>
                                            <input type="text" classNames={css.er1} placeholder="EUR"></input>
                                        </div> */}
                                            <input type="text" className={classNames(css.bbx_box1, css.tr_box)} style={{ marginLeft: '335px', background: '#081726', color: '#eaac32' }} placeholder="EUR" onChange={this.amountInput.bind(this)}></input>
                                            <h1 className={classNames(css.eq)}>=</h1>
                                            {/* <div className={classNames(css.bbx_box1)}>
                                            <span className={classNames(css.er1)}>mHLX</span>
                                            <span className={classNames(css.er2)}>1337,00</span>
                                        </div> */}
                                            <input type="text" className={classNames(css.bbx_box1, css.tr_box)} style={{ marginLeft: '335px', background: '#081726', color: '#eaac32' }} placeholder="mHLX" onChange={this.hlxInput.bind(this)}></input>
                                            <h5>{t('send:enterReceiverAddress')}</h5>
                                            <input type="text" name="name" className={css.reci_text} onChange={this.addressInput.bind(this)}/> <br />
                                            <a href="#" className={css.send_bts} onClick={this.send.bind(this)}><img src={ic1} alt="" /></a>
                                            <h2 className={classNames(css.send_bts_h2)}>Send <span>></span></h2>
                                        </form>
                                        {openModal && 
                                        <Modal
                                        isOpen={openModal}
                                        onClose={() => this.setState({ openModal: false })}
                                        >
                                           <div>

                                               <Button onClick={()=>this.setState({openModal:false})}>Cancel</Button>
                                           </div>
                                        </Modal>}
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
export default connect(null, mapDispatchToProps)(withI18n()(Send));