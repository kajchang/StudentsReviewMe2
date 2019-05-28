import React, { Fragment, useRef, useState } from 'react';
import { Button, Divider, Grid, withStyles } from '@material-ui/core';
import StarRatings from 'react-star-ratings';

import styles from '../styles/styles';

const ReviewDisplay = ({ classes, reviews }) => {
    const [pageNumber, setPageNumber] = useState(0);
    const reviewsRef = useRef(null);

    return (
        <Fragment>
            <h3 ref={ reviewsRef } className={ classes.card } style={ { textAlign: 'center' } }>Reviews</h3>
            {
                reviews.length > 0 ? reviews.slice(pageNumber * 5, (pageNumber + 1) * 5).map((review, idx) => <p key={ idx } className={ classes.card } style={ {
                    wordWrap: 'break-word'
                } }>
                    {
                        review.Text.replace(/Submitted by a student$/, '')
                    }
                </p>).reduce((acc, cur) => [acc, <Divider key={ cur.length + 4 }/>, cur]) : <p className={ classes.card } style={ { textAlign: 'center' } }>No Reviews Available.</p>
            }
            <Grid container className={ classes.card } direction='row' justify='space-between'>
                <Button disabled={ pageNumber === 0 } onClick={ () => {
                    setPageNumber(pageNumber - 1);
                    reviewsRef.current.scrollIntoView();
                } }>Previous Page</Button>
                <Button disabled={ (pageNumber + 1) * 5 >= reviews.length } onClick={ () => {
                    setPageNumber(pageNumber + 1);
                    reviewsRef.current.scrollIntoView();
                } }>Next Page</Button>
            </Grid>
        </Fragment>
    );
}

export default withStyles(styles)(ReviewDisplay);