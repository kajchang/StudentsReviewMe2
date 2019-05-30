import React, { Fragment, useEffect, useState, useRef } from 'react';
import { IconButton, MenuItem, Menu, withStyles } from '@material-ui/core';
import { MoreVert } from '@material-ui/icons';
import StarRatings from 'react-star-ratings';

import moment from 'moment';

import styles from '../styles/styles';

const Review = ({ classes, review }) => {
    const [open, setOpen] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const anchorEl = useRef(null);
    const dummyEl = useRef(null);

    useEffect(() => {
        if (!initialized && window.location.hash.substr(1) === review.mongodb_id) {
            anchorEl.current.scrollIntoView();
            setInitialized(true);
        }
    });

    return (
        <p className={ classes.card } style={ {
            wordWrap: 'break-word',
            background: window.location.hash.substr(1) === review.mongodb_id ? 'rgba(0, 0, 0, 0.14)' : 'inherit'
        } }>
            <IconButton style={ {
                float: 'right'
            } }
                buttonRef={ anchorEl }
                onClick={ () => setOpen(true) }
            >
                <MoreVert fontSize='small'/>
            </IconButton>
            <Menu
                anchorEl={ anchorEl.current }
                open={ open }
                onClose={ () => setOpen(false) }
                PaperProps={ {
                    style: {
                        width: 200
                    }
                } }
            >
                <MenuItem onClick={ () => {
                    const textField = document.createElement('textarea');
                    dummyEl.current.appendChild(textField);
                    textField.innerText = `${ window.location.origin }${ window.location.pathname }#${ review.mongodb_id }`;
                    textField.select();
                    document.execCommand('copy');
                    textField.remove();
                    setOpen(false);
                } }>
                    <div ref={ dummyEl }/>
                    Copy Link
                </MenuItem>
            </Menu>
            {
                review.version === 0 ? <Fragment>
                    <StarRatings
                        rating={ review.rating }
                        starRatedColor='gold'
                        starHoverColor='gold'
                        numberOfStars={ 5 }
                        starDimension={ 12.5 }
                        starSpacing={ 1.25 }
                    />
                    <span style={ {
                        marginLeft: 2.5,
                        fontSize: 12.5
                    } }>{ moment(review.timestamp).format('MMM Do YYYY') }</span>
                </Fragment> : <span style={ {
                    fontSize: 12.5
                } }>Restored from ratemyteachers.com</span>
            }
            <br/>
            {
                review.text.replace(/Submitted by a student$/, '').replace(/Submitted by a Parent$/, '')
            }
        </p>
    );
}

export default withStyles(styles)(Review);
