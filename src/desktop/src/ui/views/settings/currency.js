import React from 'react';
import css from './settings.scss';
import classNames from  'classnames';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';
import { Switch, Route ,withRouter} from 'react-router-dom';
import { connect } from 'react-redux';
import Top from '../../components/topbar';
import Button from 'ui/components/button';
import Select from 'ui/components/input/select';
// import withCurrencyData from 'containers/settings/Currency';


/**
 * currency settings component
 */

 class Currency extends React.PureComponent{
     static propTypes= {

    
   
       
        t: PropTypes.func.isRequired,
     }
     render(){

        const {  t } = this.props;
      
         return(
            <div>
                    <Top
                        bal={'none'}
                        main={'block'}
                        user={'none'}
                        history={this.props.history}
                    />
                    <section className="spage_1">
                        <div className="container">
                        <div className="col-lg-4">
                            <div className={classNames(css.menu_box)}>

                            </div>
                           
                            </div>
                            <div className="col-lg-8">
                               
                                    <div className={classNames(css.foo_bxx12)}>
                                        <div cllassname={classNames(css.set_bxac)}>
                                            <h5 style={{marginLeft:'14vw',marginTop:'11vw'}}>{t('settings:currency')}</h5>
                                            <input type="text" className={classNames(css.ssetting_textline)}></input><br /><br />
                                            
                                       
                                           
                                            
                                            <Button style={{marginLeft:'14vw',marginTop:'4vw'}} onClick={() => this.stepForward('done')}>{t('global:save')}</Button>
                                            <div  className={classNames(css.spe_bx)}>
                                               {/* <a href="#" className={classNames(css.spe_boxs)}><img src="images/lock.png" alt=""/><br/>Lorem Ipsum  -></a>
                                               <hr className={classNames(css.ser_bts)}/>
                                         		<a href="#" className={classNames(css.ar_btns)}><img src="images/down_ar.png" alt=""/></a> */}
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
 const mapDispatchToProps = {

};
export default connect(null, mapDispatchToProps)(withI18n()(Currency));