import React from 'react';
import { connect } from 'react-redux';

class SeedSave extends React.PureComponent {
    render() {
        return (
            <h1>Seed Save</h1>
        )
    }
}

const mapDispatchToProps = {
};

export default connect(null, mapDispatchToProps)(SeedSave);