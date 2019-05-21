import React from 'react';
import { connect } from 'react-redux';

class Done extends React.PureComponent {
    render() {
        return (
            <h1>Done</h1>
        )
    }
}

const mapDispatchToProps = {
};

export default connect(null, mapDispatchToProps)(Done);