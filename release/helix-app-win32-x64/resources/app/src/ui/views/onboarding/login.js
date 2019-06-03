import React from 'react';
import { connect } from 'react-redux';

class Login extends React.PureComponent {
    render() {
        return (
            <h1>Login</h1>
        )
    }
}

const mapDispatchToProps = {
};

export default connect(null, mapDispatchToProps)(Login);