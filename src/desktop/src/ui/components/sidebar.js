import React from 'react';
import css from 'ui/views/settings/settings.scss';
import classNames from  'classnames';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';
import { Switch, Route ,withRouter} from 'react-router-dom';
import { connect } from 'react-redux';
import Button from 'ui/components/button';


/**
 * Sidebar for dashboard
 */
class Sidebar extends React.PureComponent{
    static propTypes= {

        location: PropTypes.object,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
     }
    render(){
        
        
        return(
        <ul className={classNames(css.acco_pg)}>
            <li><a onClick={()=>this.props.history.push('/settings/accountname')}>Account Name </a></li>
            <li><a onClick={()=>this.props.history.push('/settings/viewseed')}>View Seed</a></li>
            <li><a onClick={()=>this.props.history.push('/settings/address')}>View Address</a></li>
            <li><a onClick={()=>this.props.history.push('/settings/language')}>Language</a></li>
            <li><a onClick={()=>this.props.history.push('/settings/node')}>Node</a></li>
            <li><a onClick={()=>this.props.history.push('/settings/theme')}>Theme</a></li>
            <li><a onClick={()=>this.props.history.push('/settings/currency')}>Currency</a></li>
            <li><a onClick={()=>this.props.history.push('/settings/password')}>Change Password</a></li>
            <li><a onClick={()=>this.props.history.push('/settings/mode')}>Mode</a></li>
        </ul>
        )
    }
}
export default Sidebar;