import React from 'react';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

/**
 * Wallet functionallity router wrapper component
 */
class Wallet extends React.PureComponent {
    static propTypes = {
    }
    render() {
        return (
            <div></div>
        );
    }
}
const mapStateToProps = (state) => ({
});

const mapDispatchToProps = {
};
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Wallet));