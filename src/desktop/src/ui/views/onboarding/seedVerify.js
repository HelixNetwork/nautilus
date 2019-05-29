import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';

class SeedVerify extends React.PureComponent {
    render() {
        return (
            <h1>Seed Verify</h1>
        )
    }
}

const mapDispatchToProps = {
};

export default connect(null, mapDispatchToProps)(withI18n()(SeedVerify));