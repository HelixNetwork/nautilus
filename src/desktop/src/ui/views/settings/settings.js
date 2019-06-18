import React from 'react';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import Settings from 'ui/views/settings/index';
import SettingsLanguage from 'ui/views/settings/language';
import SettingsNode from 'ui/views/settings/node';
import Currency from 'ui/views/settings/currency';
import SettingsTheme from 'ui/views/settings/themesetting';

/**
 * Settings dashboard component
 */

 class Dashboard extends React.PureComponent{
     static PropTypes={

     }
     render(){
         return(
             <Switch>
                 <Route path="/settings/accountname" component={Settings} />
                 <Route path="/settings/language" component={SettingsLanguage} />
                 <Route path="/settings/node" component={SettingsNode} />
                 <Route path="/settings/currency" component={Currency} />
                 <Route path="/settings/theme" component={SettingsTheme}/>
             </Switch>
         )
     }
 }
 const mapStateToProps = (state) => ({
});

const mapDispatchToProps = {
};

export default withI18n()(connect(mapStateToProps, mapDispatchToProps)(Dashboard));
