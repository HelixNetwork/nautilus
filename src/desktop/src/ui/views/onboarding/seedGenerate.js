import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';

class SeedGenerate extends React.PureComponent {
    static propTypes = {
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        t: PropTypes.func.isRequired,
    };

    state = {
    }
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

export default connect(null, mapDispatchToProps)(withI18n()(SeedGenerate));