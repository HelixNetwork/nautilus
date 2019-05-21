import React from 'react';
import { connect } from 'react-redux';

class SeedVerify extends React.PureComponent {
    render() {
        return (
            <h1>Seed Verify</h1>
        )
    }
}

const mapDispatchToProps = {
};

export default connect(null, mapDispatchToProps)(SeedVerify);