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
import Lottie from 'react-lottie';
import * as animationData from 'animations/wallet-loading.json';
class Send extends React.PureComponent {
   
    static propTypes = {
        
        location: PropTypes.object,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        // generateAlert: PropTypes.func.isRequired,
    };

state={
    address:'TiEIoZLgAAg0YGWe06QLiF6nmqOyk3ebEGVvAUOv9pty7wCs6mh2zcf5wQw3FThO',
    amount:0,
    openModal:false,
    showAddress:[]
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

        let ch = e.target.value;
        this.setState({
            address:e.target.value,
            showAddress:ch.split('',64)
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

            const split= this.state.address.match(/.{1,4}/g);
            console.log(split);
            let ch='';
            split.map((char,index)=>{
                ch+=char+'    ';
                if(index!=0 && (index+1)%4==0){
                    ch+=' ';
                }
            })
            ch = ch.split('     ');
            console.log(ch);
            this.setState({
                openModal:true,
                showAddress:ch
            });
        
        
    }

    render() {
        const { history,loop, t } = this.props;
        const {openModal,showAddress} = this.state;
        const defaultOptions = {
            loop: loop,
            autoplay: true,
            animationData: animationData.default,
            rendererSettings: {
                preserveAspectRatio: 'xMidYMid slice'
            }
        };
        
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
                                           <div style={{marginTop:'-60px'}}><br/>
                                           <div className={css.transferLoading}><br/>
                                           <Lottie
                                                options={defaultOptions}
                                                eventListeners={[
                                                    {
                                                        eventName: 'complete',
                                                        callback: () => {
                                                            if (typeof onEnd === 'function') {
                                                                onEnd();
                                                            }
                                                        },
                                                    },
                                                ]}
                                            />
                                           </div><br/>
                                           <div>
                                               <h3>Continue transaction with</h3><br/>
                                               {showAddress.map((ch,index)=>{
                                                   return(<h2 key={index} className={css.confirmAddress}>{ch}</h2>)
                                               })}
                                           </div><br/>
                                               <Button variant="danger" onClick={()=>this.setState({openModal:false})}>Cancel</Button>
                                               &nbsp;&nbsp;&nbsp;&nbsp;
                                               <Button variant="success" onClick={()=>this.setState({openModal:false})}>Confirm</Button>
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