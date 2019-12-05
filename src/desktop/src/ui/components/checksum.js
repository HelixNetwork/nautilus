import React from 'react';
import PropTypes from 'prop-types';
import { ADDRESS_LENGTH, VALID_SEED_REGEX } from 'libs/hlx/utils';

/**
 * Returns address with highlighted checksum
 */
const Checksum = ({ address }) => {
    const validAddress =
        typeof address === 'string' && address.length === ADDRESS_LENGTH && address.match(VALID_SEED_REGEX);

    return (
        <React.Fragment>
            {!validAddress ? address : address.substr(0, 64)}
            {validAddress && <mark>{address.substr(64)}</mark>}
        </React.Fragment>
    );
};

Checksum.propTypes = {
    /** Target address */
    address: PropTypes.string.isRequired,
};

export default Checksum;
