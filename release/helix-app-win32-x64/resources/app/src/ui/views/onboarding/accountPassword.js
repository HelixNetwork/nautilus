import React from 'react';
import { connect } from 'react-redux';

class AccountPassword extends React.PureComponent {
    render() {
        return (
            <h1>Account Name</h1>
        )
    }
}

const mapDispatchToProps = {
};

export default connect(null, mapDispatchToProps)(AccountPassword);