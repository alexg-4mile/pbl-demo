import _ from 'lodash'
import React, { useState, useEffect } from 'react';
import { AppBar, Tabs, Tab, Typography, Box, Grid, CircularProgress, Card, TextField } from '@material-ui/core'
import { Autocomplete, ToggleButton, ToggleButtonGroup } from '@material-ui/lab'
import { LookerEmbedSDK } from '@looker/embed-sdk'
import CodeFlyout from '../CodeFlyout';
import rawSampleCode from '!!raw-loader!./Dashboard.js'; // eslint-disable-line import/no-webpack-loader-syntax
import useStyles from './styles.js';
import { TabPanel, a11yProps } from './helpers.js';
const { validIdHelper } = require('../../../tools');

//start of Dashboard Component
export default function Dashboard(props) {
  //initialize state using hooks
  const [value, setValue] = useState(0);
  const [iFrameExists, setIFrame] = useState(0);
  const [apiContent, setApiContent] = useState([]);
  const [dashboardObj, setDashboardObj] = useState({});
  const [clientSideCode, setClientSideCode] = useState('');
  const [serverSideCode, setServerSideCode] = useState('');
  const [toggleValue, setToggleValue] = useState('');
  const [dashboardLayout, setDashboardLayout] = useState({});

  //declare constants
  const classes = useStyles();
  const { staticContent: { lookerContent }, staticContent: { type }, activeTabValue, handleTabChange, lookerUser } = props;
  const codeTab = {
    type: 'code flyout', label: 'Code', id: 'codeFlyout',
    lookerContent, lookerUser, clientSideCode, serverSideCode
  }
  const tabContent = [...lookerContent, codeTab];
  const demoComponentType = type || 'code flyout';

  //handle tab change
  const handleChange = (event, newValue) => {
    handleTabChange(0);
    setValue(newValue);
  };

  const handleToggle = (event, newValue) => {
    console.log('handleToggle')
    console.log('newValue', newValue)
    setToggleValue(newValue)
    const filteredLayout = _.filter(dashboardLayout.dashboard_layout_components, (row) => {
      return (lookerContent[0].dynamicFieldLookUp[newValue].indexOf(row.dashboard_element_id) > -1)
    })

    console.log('filteredLayout', filteredLayout)
    const newDashboardLayout = {
      ...dashboardLayout,
      dashboard_layout_components: filteredLayout
    }
    console.log('newDashboardLayout', newDashboardLayout)
    dashboardObj.setOptions({ "layouts": [newDashboardLayout] })
  };

  /**
   * listen for lookerContent and call 
   * performLookerApiCalls and setSampleCode
  */
  useEffect(() => {
    performLookerApiCalls([...lookerContent])
    setClientSideCode(rawSampleCode)
  }, [lookerContent]);


  useEffect(() => {
    if (Object.keys(dashboardLayout).length && Object.keys(dashboardObj).length && lookerContent[0].dynamicFieldLookUp) {
      handleToggle(null, Object.keys(lookerContent[0].dynamicFieldLookUp)[0])
    }
  }, [dashboardLayout]);

  /** 
   * What this function does:
   * iterate over Looker Content array referenced above and
   * calls specific endpoints and methods available from Looker Node SDK
   * and embed SDK to create the experience on this page
   */
  const performLookerApiCalls = function (lookerContent) {
    lookerContent.map(async lookerContent => {
      let dashboardId = lookerContent.id;
      LookerEmbedSDK.createDashboardWithId(dashboardId)
        .appendTo(validIdHelper(`#embedContainer-${demoComponentType}-${dashboardId}`))
        .withClassName('iframe')
        .withNext()
        // .withNext(lookerContent.isNext || false) //how can I make this dynamic based on prop??
        .withTheme('Embedded')
        .on('drillmenu:click', (event) => {
          if (typeof this[_.camelCase(demoComponentType) + 'Action'] === 'function') { this[_.camelCase(demoComponentType) + 'Action'](event) }
          // else console.log('elllse');
        })
        //.on('dashboard:loaded', dashboardLoaded)
        .on('dashboard:loaded', (event) => {
          // console.log('dashboard:loaded event', event)
          setDashboardLayout(event.dashboard.options.layouts[0])
        })
        .build()
        .connect()
        .then((dashboard) => {
          setIFrame(1)
          setDashboardObj(dashboard)
        })
        .catch((error) => {
          // console.error('Connection error', error)
        })

      if (lookerContent.hasOwnProperty('filter')) {
        //get inline query from usecase file & set user attribute dynamically
        let jsonQuery = lookerContent.inlineQuery;
        jsonQuery.filters = {
          [lookerContent.desiredFilterName]: lookerUser.user_attributes.brand
        };
        lookerContent.inlineQuery = jsonQuery;
        let stringifiedQuery = encodeURIComponent(JSON.stringify(lookerContent.inlineQuery))
        let lookerResponse = await fetch('/runinlinequery/' + stringifiedQuery + '/json', {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        })
        let lookerResponseData = await lookerResponse.json();
        let queryResultsForDropdown = [];
        let desiredProperty = Object.keys(lookerResponseData.queryResults[0])[0];
        for (let i = 0; i < lookerResponseData.queryResults.length; i++) {
          queryResultsForDropdown.push({ 'label': lookerResponseData.queryResults[i][desiredProperty] })
        }
        setApiContent(queryResultsForDropdown);
        if (serverSideCode.length === 0) setServerSideCode(lookerResponseData.code);
      }
    })
  }

  /**
   * update dashboard when custom filter changed
  */
  const customFilterAction = (dashboardId, filterName, newFilterValue) => {
    if (Object.keys(dashboardObj).length) {
      dashboardObj.updateFilters({ [filterName]: newFilterValue })
      dashboardObj.run()
    }
  }

  /**
   * What this return  does:
   * Rendering of actual html elements,
   * this section is necessary but less relevant to looker functionality itself
   */
  return (
    <div className={`${classes.root} demoComponent`}>
      <Grid container
        spacing={3}
        key={validIdHelper(type)} >
        <div className={classes.root}>
          {iFrameExists ? '' :
            <Grid item sm={12} >
              <Card className={`${classes.card} ${classes.flexCentered}`}>
                <CircularProgress className={classes.circularProgress} />
              </Card>
            </Grid>
          }

          {/* additional loading logic, need embedContainer to exist but want it hidden until iFrame has content...*/}
          <Box className={iFrameExists ? `` : `${classes.hidden}`}>
            <AppBar position="static">
              <Tabs
                className={classes.tabs}
                value={value}
                onChange={handleChange}
                aria-label="simple tabs example">
                {tabContent.map((item, index) => (
                  <Tab
                    key={`${validIdHelper(demoComponentType + '-tab-' + index)}`}
                    label={item.label}
                    className={item.type === 'code flyout' ? `${classes.mlAuto}` : ``}
                    {...a11yProps(index)} />
                ))}
              </Tabs>
            </AppBar>
            <Box className="tabPanelContainer">
              {tabContent.map((tabContentItem, index) => (
                <TabPanel
                  key={`${validIdHelper(demoComponentType + '-tabPanel-' + index)}`}
                  value={value}
                  index={index}>
                  <Grid container>
                    {tabContentItem.type === 'code flyout' ?
                      // could this go to home/parent component
                      // so it's not in the demo component itself whatsoever
                      <CodeFlyout {...props}
                        classes={classes}
                        lookerContent={lookerContent}
                        clientSideCode={clientSideCode}
                        serverSideCode={serverSideCode}
                        lookerUser={lookerUser} />
                      :
                      <React.Fragment
                        key={`${validIdHelper(demoComponentType + '-innerFragment-' + index)}`}>
                        {tabContentItem.filter ?
                          <Grid item sm={12}>
                            <Autocomplete
                              id={`combo-box-dashboard-${lookerContent.id}`}
                              options={Array.isArray(apiContent) ?
                                apiContent :
                                []}
                              getOptionLabel={(option) => option.label}
                              style={{ width: 300 }}
                              onChange={(event) => customFilterAction(tabContentItem.id, tabContentItem.filter.filterName, event.target.innerText || '')}
                              renderInput={(params) => <TextField {...params} label={tabContentItem.filter.filterName} variant="outlined" />}
                              loadingText="Loading..."
                            />
                          </Grid> : ''
                        }
                        {tabContentItem.dynamicFieldLookUp ?
                          <Grid item sm={12}>
                            <ToggleButtonGroup
                              value={toggleValue}
                              exclusive
                              onChange={handleToggle}
                              aria-label="text alignment"
                            >
                              {Object.keys(tabContentItem.dynamicFieldLookUp).map(key => {
                                return (
                                  <ToggleButton
                                    key={validIdHelper(`dynamicDashToggle-${key}`)}
                                    value={key} aria-label="left aligned">
                                    {key}
                                  </ToggleButton>
                                )
                              })}
                            </ToggleButtonGroup>
                          </Grid> : ''
                        }
                        <Box className={classes.w100} mt={2}>
                          <Grid item sm={12}>
                            <div
                              className="embedContainer"
                              id={validIdHelper(`embedContainer-${demoComponentType}-${tabContentItem.id}`)}
                              key={validIdHelper(`embedContainer-${demoComponentType}-${tabContentItem.id}`)}
                            >
                            </div>
                          </Grid>
                        </Box>
                      </React.Fragment>
                    }
                  </Grid>
                </TabPanel>
              ))}
            </Box>
          </Box >
        </div>
      </Grid >
    </div >
  )
}