import React, { useEffect, useState } from 'react'
import { Button, Chip, Grid, Paper, Typography, ClickAwayListener } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { useTheme, withStyles } from '@material-ui/styles';
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';
import StarRatings from 'react-star-ratings';
import ReviewForm from '../components/ReviewForm';
import DepartmentChip from '../components/DepartmentChip';
import Modal from '../components/Modal';
import SemesterSelect from '../components/SemesterSelect';
import ScheduleTable from '../components/ScheduleTable';
import ReviewDisplay from '../components/ReviewDisplay';

import { isWidthUp } from '@material-ui/core/withWidth';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { graphql, prefetchPathname } from 'gatsby'
import { navigate } from '@reach/router';
import slugify from 'slugify';
import { FIND_REVIEWS } from '../graphql';
import { formatSemesterRange, getCurrentSemester, getBlocks, removeDupes, sortSemesters } from '../utils';

import styles from '../styles/styles';

 const useWidth = () => {
    const theme = useTheme();
    const keys = [...theme.breakpoints.keys].reverse();
    return (
        keys.reduce((output, key) => {
            const matches = useMediaQuery(theme.breakpoints.up(key));
            return !output && matches ? key : output;
        }, null) || 'xs'
    );
}

const HeaderCard = withStyles(styles)(({ classes, rating, semesters, departments, name }) => {
    const [modalExposed, setModalExposed] = useState(false);
    const theme = useTheme();

    return (
        <Paper className={ classes.control }>
            <div style={ {
                marginBottom: theme.spacing(1)
            } }>
                <Typography variant='h6' style={ {
                    display: 'inline',
                    marginRight: theme.spacing(2)
                } }>{ name }</Typography>
                <StarRatings
                    rating={ isNaN(rating) ? 0 : rating }
                    starRatedColor='gold'
                    starHoverColor='gold'
                    numberOfStars={ 5 }
                    starDimension={ theme.spacing(5) }
                    starSpacing={ theme.spacing(0.5) }
                />
            </div>
            <Chip
                label={ formatSemesterRange(semesters) }
            />
            {
                departments.map((department, idx) => <DepartmentChip
                    key={ idx }
                    department={ department }
                />)
            }
            <div style={ {
                marginTop: theme.spacing(1)
            } }>
                <Button
                    variant='contained'
                    color='primary'
                    disabled={ !semesters.includes(getCurrentSemester()) }
                    onClick={ () => setModalExposed(true) }
                >Write a Review</Button>
                <Modal shown={ modalExposed }>
                    <Grid item xs={ 12 } sm={ 6 }>
                        <ClickAwayListener onClickAway={ () => setModalExposed(false) }>
                            <Paper className={ classes.control }>
                                <Close onClick={ () => setModalExposed(false) } style={ { cursor: 'pointer', float: 'right' } }/>
                                <ReviewForm
                                    teacher={ name }
                                    onClose={ () => setModalExposed(false) }
                                />
                            </Paper>
                        </ClickAwayListener>
                    </Grid>
                </Modal>
            </div>
        </Paper>
    );
});

const Sidebar = withStyles(styles)(({ classes, courses, semesters, location }) => {
    const initialSemester = location.state && location.state.semester ? location.state.semester : getCurrentSemester();
    const [semester, setSemester] = useState(semesters.includes(initialSemester) ? initialSemester : semesters[semesters.length - 1]);

    const semesterCourses = courses
        .filter(course => course.semester === semester);

    useEffect(() => {
        const courses = removeDupes(semesterCourses.map(course => course.name));
        for (let course of courses) {
            prefetchPathname(`/courses/${ slugify(course, { lower: true }) }`);
        }
    }, [semesterCourses]);

    return (
        <>
            <SemesterSelect
                semesters={ semesters }
                value={ semester }
                onChange={ setSemester }
            />
            <ScheduleTable
                blocks={ getBlocks().concat(removeDupes(semesterCourses.map(course => course.block).filter(block => block > 8))) }
            >
                { ({ block }) => semesterCourses
                    .filter(course => course.block === block)
                    .map((course, idx) =>
                        <Chip
                            key={ idx }
                            className={ course.name.length > 25 ? classes.scalingText : null }
                            label={ course.name }
                            onClick={ () => navigate(`/courses/${ slugify(course.name, { lower: true }) }`, {
                                state: {
                                    semester: semester === semesters[0] ? null : semester
                                }
                            }) }
                        />)
                }
            </ScheduleTable>
        </>
    );
});

const TeacherPage = ({ data, pageContext, classes, location }) => {
    const { name } = pageContext;

    const courses = data.srapi.findManyClass;
    const semesters = sortSemesters(removeDupes(data.srapi.findManyClass.map(course => course.semester)));
    const departments = data.srapi.findOneTeacher.departments;

    const [rating, setRating] = useState(0);

    const width = useWidth();

    return (
        <>
            <Helmet>
                <title>{ name }</title>
                <meta name='description' content={ `See students' reviews of ${ name }, a teacher at Lowell High School.` }/>
                <meta name='keywords' content={ ['Education', 'Lowell High School', 'Teacher', name, ...departments] }/>
                <script type="application/ld+json">
                    { JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'AggregateRating',
                        itemReviewed: {
                            '@type': 'Person',
                            name,
                            jobTitle: 'Teacher',
                            knowsAbout: departments.join(', ')
                        },
                        ratingValue: data.srapi.findOneTeacher.rating,
                        reviewCount: data.srapi.findOneTeacher.reviewCount
                    }) }
                </script>
            </Helmet>
            <div className={ classes.root }>
                <Grid container spacing={ 3 }>
                    <Grid item xs={ 12 } sm={ 5 }>
                        <HeaderCard rating={ rating } semesters={ semesters } departments={ departments } name={ name }/>
                        { isWidthUp('sm', width) && <Sidebar courses={ courses } semesters={ semesters } location={ location }/> }
                    </Grid>
                    <Grid item xs={ 12 } sm={ 7 }>
                        <Query
                            query={ FIND_REVIEWS }
                            variables={ { name } }
                            onCompleted={ data => setRating(data.findOneTeacher.rating) }
                            notifyOnNetworkStatusChange={ true }
                        >
                            { ({ data }) => <ReviewDisplay teacher={ name } reviews={ data.reviewPagination }/> }
                        </Query>
                    </Grid>
                </Grid>
            </div>
        </>
    );
}

export default withStyles(styles)(TeacherPage);

export const query = graphql`
    query($name: String!) {
        srapi {
            findOneTeacher(filter: {
                name: $name
            }) {
                rating
                reviewCount
                departments
            }
            findManyClass(filter: {
                teacher: $name
            }) {
                semester
                name
                block
            }
        }
    }
`;
