import React  from 'react';
import { AppBar, Toolbar } from '@material-ui/core';
import { withTheme } from '@material-ui/styles';
import { Link, graphql, useStaticQuery } from 'gatsby';
import Img from 'gatsby-image';

import '../styles/layout.css';

const AppHeader = ({ theme }) => {
    const data = useStaticQuery(graphql`
            query {
                file(relativePath: { eq: "transparent_logo.png" }) {
                    childImageSharp {
                        fixed(width: 75, height: 75) {
                            ...GatsbyImageSharpFixed
                        }
                    }
                }
            }
    `);

    return (
        <AppBar position='static'>
            <Toolbar>
                <Link to='/'><Img fixed={ data.file.childImageSharp.fixed }/></Link>
            </Toolbar>
        </AppBar>
    );
};

export default withTheme(AppHeader);
