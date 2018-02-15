import React, { Component } from 'react';
import TwitterLogin from 'react-twitter-auth';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import LayoutGrid from '@react-mdc/layout-grid'

const UnauthorizedPage = ({ onAuthSuccess, onAuthFail }) => (
  <LayoutGrid className="centered-grid">
      <LayoutGrid.Cell span={4}>
        <Card style={{minWidth:'600'}}>
          <Toolbar><ToolbarTitle text="Log in with your Twitter account" /></Toolbar>
           <CardText style={{textAlign:'center'}}>
            <RaisedButton primary={true}>
              <TwitterLogin loginUrl="http://dev.tweetboy.com/api/v1/auth/twitter"
                onFailure={(error) => onAuthFail(error)}
                onSuccess={(response) => onAuthSuccess(response)}
                requestTokenUrl="http://dev.tweetboy.com/api/v1/auth/twitter/reverse" />
            </RaisedButton>
            </CardText>
        </Card>
      </LayoutGrid.Cell>
  </LayoutGrid>
)

export default UnauthorizedPage
