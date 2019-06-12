import React from 'react';
import { connect } from 'react-redux';

class AccountPassword extends React.PureComponent {
    render() {
        const { t } = this.props;
        return (
            <h1>{t('addAdditionalSeed:accountName')}</h1>
        )
    }
}

const mapDispatchToProps = {
};

export default connect(null, mapDispatchToProps)(AccountPassword);