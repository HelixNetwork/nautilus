import React from 'react';
import css from './loading.scss';
import {Link } from "react-router-dom";
export default class Loading extends React.PureComponent {
    render() {

        return (
            <div>
                <h1>Hi Loading  Screen</h1>
                <Link to="/onboarding">Next</Link>
            </div>
        );
    }
}