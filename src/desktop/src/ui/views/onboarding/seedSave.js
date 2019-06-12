import React from 'react';
import { connect } from 'react-redux';

class SeedSave extends React.PureComponent {
    render() {
        return (
            <h1>Save Seed</h1>
        )
    }
}

const mapDispatchToProps = {
};

export default connect(null, mapDispatchToProps)(SeedSave);