import React from 'react';
import css from './settings.scss';
import classNames from  'classnames';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import { Switch, Route ,withRouter} from 'react-router-dom';
import { connect } from 'react-redux';
import Top from '../../components/topbar';
/**
 * Setting component
 */

 class Settings extends React.PureComponent{
     static propTypes= {

        location: PropTypes.object,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        t: PropTypes.func.isRequired,
     }
     render(){

        const { location, history, t } = this.props;
        const currentKey = location.pathname.split('/')[2] || '/';
         return(
            <div>
                    <Top
                        disp={'none'}
                        history={this.props.history}
                    />
                    <section className="spage_1">
                        <div className="container">
                        <div className="col-lg-4">
                            <div className={classNames(css.menu_box)}>
                                <ul className={classNames(css.acco_pg)}>
                                    <li>Account Name</li>
                                    <li>View Seed</li>
                                    <li>View Address</li>
                                    
                                </ul>
                                {/* <hr className={classNames(css.ser_bts)}/> */}
                                <a ></a>
                            </div>

                            </div>
                            <div className="col-lg-8">
                                {/* <div className={classNames(css.set_bx)}> */}
                                    <div className={classNames(css.foo_bxx12)}>
                                        <div cllassname={classNames(css.set_bxac)}>
                                            <h2>Lorem Ipsum</h2>
		                                    <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod 
                                               tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. 
                                               At vero eos et accusam et justo duo dolores et ea rebum. 
                                               Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit 
                                               amet. 
                                            </p>
	                                        <hr className={classNames(css.ser_bts)}/>
		                                    <h2>Lorem Ipsum</h2>
		                                    <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod 
                                               tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. 
                                               At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd 
                                               gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. 
                                            </p>
                                            <div  className={classNames(css.spe_bx)}>
                                               <a href="#" className={classNames(css.spe_boxs)}><img src="images/lock.png" alt=""/><br/>Lorem Ipsum  -></a>
                                               <hr className={classNames(css.ser_bts)}/>
                                         		<a href="#" className={classNames(css.ar_btns)}><img src="images/down_ar.png" alt=""/></a>
                                            </div>
                                        </div>
                                    </div>
                                {/* </div> */}
                            </div>
                        </div>
                    </section>
            </div>
         );
     }
 }
 const mapDispatchToProps = {

};
export default connect(null, mapDispatchToProps)(withI18n()(Settings));