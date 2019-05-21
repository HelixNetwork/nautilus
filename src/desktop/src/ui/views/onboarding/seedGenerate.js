import React from 'react';
import { connect } from 'react-redux';

class SeedGenerate extends React.PureComponent {
    render() {
        const { t } = this.props;
        const { ledger } = this.state;

        return (
            <h1>Seed Generate</h1>
        )
    }
}

const mapDispatchToProps = {
};

export default connect(null, mapDispatchToProps)(SeedGenerate);