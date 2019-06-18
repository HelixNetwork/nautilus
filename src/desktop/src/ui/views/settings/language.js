import React from 'react';
import css from './settings.scss';
import classNames from  'classnames';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';
import { Switch, Route ,withRouter} from 'react-router-dom';
import { connect } from 'react-redux';
import Top from '../../components/topbar';
import Sidebar from '../../components/sidebar';
import Button from 'ui/components/button';
import Language from 'ui/components/input/language';
import Select from 'ui/components/input/select';
import { I18N_LOCALE_LABELS, I18N_LOCALES } from 'libs/i18n';

/**
 * Setting component
 */

 class SettingsLanguage extends React.PureComponent{
     static propTypes= {

        location: PropTypes.object,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        t: PropTypes.func.isRequired,

        
     }
     state = {
        step: 'language',
        scrollEnd: false,
        selection: null,
    };

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
                            <div className={classNames(css.menu_bx)}>
                                
                                <Sidebar
                                        disp={'none'}
                                        history={this.props.history}
                                        />
                                {/* <hr className={classNames(css.ser_bts)}/> */}
                                <a ></a>
                            </div>

                            </div>
                            <div className="col-lg-8">
                                {/* <div className={classNames(css.set_bx)}> */}
                                    <div className={classNames(css.foo_bxx12)}>
                                        <div cllassname={classNames(css.set_bxac)}>
                                            
                                            <h5>{t('accountManagement:editAccountName')}</h5>
                                            {/* <input type="text" className={classNames(css.ssetting_textline)}></input><br /><br /> */}
                                            <Select
                                                     label={t('languageSetup:language')}
                                                     value={I18N_LOCALE_LABELS[I18N_LOCALES.indexOf(selection || locale)]}
                                                     onChange={(value) => this.setState({ selection: value })}
                                                     options={I18N_LOCALES.map((item, index) => {
                                                     return { value: item, label: I18N_LOCALE_LABELS[index] };
                                                      })}
                                            />
                                            <Language></Language>                            
                                            <Button onClick={() => this.stepForward('done')}>{t('global:save')}</Button>
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
export default connect(null, mapDispatchToProps)(withI18n()(SettingsLanguage));