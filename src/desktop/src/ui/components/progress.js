import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import css from './progress.scss';
import { Progress} from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";
/**
 * Progress bar component
 */
const circleProgress = {
    width:'250px',
    height: '250px',
    position:'absolute !important',
    top:'100px',
    left:'0px',
    border:'none !important'
}
export default class ProgressBar extends React.PureComponent {
    static propTypes = {
        /** Progress bar progress */
        progress: PropTypes.number.isRequired,
        /** Progress bar title */
        title: PropTypes.string,
        /** Progress bar subtitle */
        subtitle: PropTypes.string,
        /** Progress bar style type */
        type: PropTypes.oneOf(['large']),
    };
    state={
        color:'error'
    }

    render() {
        const { progress, title, subtitle, type } = this.props;
        if(Math.min(progress, 100)==0){
            this.setState({
                color:'error'
            })
        }
        else if(Math.min(progress, 100)==25){
            this.setState({
                color:'default'
            })
        }
        else if(Math.min(progress, 100)==50){
            this.setState({
                color:'active'
            })
        }
        else if(Math.min(progress, 100)==100){
            this.setState({
                color:'success'
            })
        }
        
        return (
            <div className={classNames(css.progress, type ? css[type] : null)}>
                
                {/* <div>
                    <div className={css.bar} style={{ width: `${Math.min(progress, 100)}%` }} />
                    
                </div> */}
                <Progress type="circle" percent={Math.min(progress, 100)} status={this.state.color} style={circleProgress}/>
                <br/><br/><br/><br/>
                <br/><br/><br/><br/>
                {title && <p>{title}</p>}
            </div>
        );
    }
}
