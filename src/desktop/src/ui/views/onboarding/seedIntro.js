import React from 'react';
import { connect } from 'react-redux';

class SeedIntro extends React.PureComponent {
    render() {
        const { t } = this.props;
        const { ledger } = this.state;

        return (
            <h1>Seed Intro</h1>
        )
    }
}

const mapDispatchToProps = {
};

export default connect(null, mapDispatchToProps)(SeedIntro);