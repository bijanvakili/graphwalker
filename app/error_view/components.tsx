import * as React from 'react';

import {ErrorState} from './models';

export function ErrorDisplayComponent(props: ErrorState) {
    return (
        <span className="error-message">{props.message}</span>
    );
}
