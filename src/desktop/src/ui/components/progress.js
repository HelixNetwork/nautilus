import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import css from './progress.scss';
import { Progress } from 'react-sweet-progress';
// import 'react-sweet-progress/lib/style.css';
/**
 * Progress bar component
 */
const circleProgress = {
    width: '250px',
    height: '250px',
    position: 'absolute !important',
    top: '100px',
    left: '0px',
    border: 'none !important',
};
export default class ProgressBar extends React.PureComponent {
    static propTypes = {
        /** Progress bar progress */
        progress: PropTypes.number.isRequired,
        /** Progress bar title */
        title: PropTypes.string,
        /** Progress bar subtitle */
        subtitle: PropTypes.string,
        /** Progress bar style type */
        type: PropTypes.oneOf(['send', 'circle']),
    };
    state = {
        color: 'error',
    };

    render() {
        const { progress, title, pageType, type } = this.props;
        console.log('page type', pageType);
        if (pageType === 'send') {
            console.log('type expected send', type);
            console.log('pageType expected send', pageType);
            console.log('Progress expected ', progress);
            if (Math.min(progress, 100) === 0) {
                this.setState({
                    color: 'error',
                });
            } else if (Math.min(progress, 100) === 25) {
                this.setState({
                    color: 'default',
                });
            } else if (Math.min(progress, 100) === 50) {
                this.setState({
                    color: 'active',
                });
            } else if (Math.min(progress, 100) === 100) {
                this.setState({
                    color: 'success',
                });
            }
        } else {
            console.log('Progress expected 2 ', progress);
            if (Math.min(Math.round(progress), 100) < 100) {
                console.log('Progress expected  3', progress);
                this.setState({
                    color: 'default',
                });
            } else {
                console.log('Progress expected  4', progress);
                this.setState({
                    color: 'success',
                });
            }
        }

        return (
            <div className={classNames(css.progress, type ? css[type] : null)}>
                <Progress
                    type="circle"
                    percent={Math.min(progress, 100)}
                    status={this.state.color}
                    style={circleProgress}
                    theme={{
                        default: {
                            symbol: Math.round(progress) + '%',
                            trailColor: '#152353',
                            color: '#ebba53',
                        },
                    }}
                />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                {title && <p>{title}</p>}
            </div>
        );
    }
}
