
import $ from 'jquery';
import _ from 'lodash'
import React, { Component } from 'react'
import clsx from 'clsx';
import { withStyles } from "@material-ui/core/styles";
import {
  Drawer, CssBaseline, AppBar, Toolbar, Typography,
  Divider, IconButton, Tabs, Tab, Icon, Box, Avatar
} from '@material-ui/core/';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { TreeView, TreeItem } from '@material-ui/lab';
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { blue, green, orange, indigo, red, grey } from '@material-ui/core/colors';
import './Home.css'; //needed for iframe height

//fabio suggestion 6/12
//look at dynamic importing + code splitting to further optimize load
//https://github.com/fabio-looker/cs-app-internal/blob/master/extension/src/index.js lines ~34
//https://github.com/fabio-looker/cs-app-internal/blob/master/extension/src/main.jsx lines 11, 54
//https://github.com/fabio-looker/cs-app-internal/blob/master/extension/webpack.config.js output line
import UserMenu from './Material/UserMenu';
import { LookerEmbedSDK } from '@looker/embed-sdk'
import UsecaseContent from '../usecaseContent.json';
import SplashPage from './Demo/SplashPage/SplashPage';
import Dashboard from './Demo/Dashboard/Dashboard';
import CustomVis from './Demo/CustomVis/CustomVis';
import ReportBuilder from './Demo/ReportBuilder/ReportBuilder';
import QueryBuilder from './Demo/QueryBuilder/QueryBuilder';
import ComingSoon from './Demo/ComingSoon';
import AppContext from '../AppContext';
import { HighlightSourcesLegend } from './HighlightSourcesLegend';
import style from 'react-syntax-highlighter/dist/esm/styles/hljs/agate';



const drawerWidth = 240;
const { validIdHelper } = require('../tools');

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      <Box p={3}>{children}</Box>
    </Typography>
  );
}

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

const styles = theme => ({
  root: {
    display: 'flex',
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  title: {
    flexGrow: 1,
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  dNone: {
    display: 'none'
  },
  dBlock: {
    display: 'block'
  },
  relative: {
    position: 'relative'
  },
  absolute: {
    position: 'absolute'
  },
  right0: {
    right: 0
  },
  top0: {
    top: 0
  },
  right24: {
    right: 24
  },
  top24: {
    top: 24
  },
  ml12: {
    marginLeft: 12
  },
  highlightLegend: {
    position: 'fixed',
    bottom: theme.spacing(2),
    left: theme.spacing(2),
    zIndex: 1200
  },
  tree: {
    height: 240,
    flexGrow: 1,
    maxWidth: 400
  },
});

const defaultTheme = createMuiTheme({})
const atomTheme = createMuiTheme({
  palette: {
    primary: {
      main: grey[900],
    },
    secondary: {
      main: grey[400],
    },
  },
})

const vidlyTheme = createMuiTheme({
  palette: {
    primary: {
      main: blue[500],
    },
  },
})

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      drawerOpen: true,
      drawerTabValue: 0,
      activeTabValue: 0,
      activeUsecase: '',
      appLayout: '',
      highlightShow: false,
      selectedTreeItem: ''
    }
  }

  toggleHighlightShow = () => {
    this.setState({ highlightShow: !this.state.highlightShow })
  }

  handleDrawerTabChange = (event, newValue) => {
    this.handleDrawerChange(true);
    this.setState({
      drawerTabValue: newValue
    }, () => {
      this.handleTabChange(0)
    })
  };

  handleTabChange = newValue => {
    this.setState({
      activeTabValue: newValue
    })
  }

  handleDrawerChange = (open) => {
    this.setState({
      drawerOpen: open
    })
  }

  componentDidMount(props) {
    let usecaseFromUrl = window.location.pathname.replace(/^\/([^\/]*).*$/, '$1');
    this.setState({
      activeUsecase: usecaseFromUrl,
      appLayout: UsecaseContent[usecaseFromUrl].layout || 'left-sidebar'
    }, () => {
      LookerEmbedSDK.init(`${this.props.lookerHost}.looker.com`, '/auth');
    })
  }

  /*dashboardOverviewDetailAction(event) {
      // console.log('dashboardOverviewDetailAction')
      // console.log('event', event)
      if (event.label === 'Campaign Performance Dashboard') { //ecommm
          const url = event.url;
          let stateName = decodeURIComponent(url.substring(url.lastIndexOf('/') + 1, url.indexOf('?')));
          const filterName = decodeURIComponent(url.substring(url.indexOf('?') + 1, url.indexOf('=')));
          const filterValue = decodeURIComponent(url.substring(url.lastIndexOf('=') + 1, url.length));
          if (stateName === 'pwSkck3zvGd1fnhCO7Fc12') stateName = 3106; // hack for now...
          this.setState({}, () => {
              this.state[stateName].updateFilters({ [filterName]: filterValue })
              this.state[stateName].run()
          })

          this.handleTabChange(1) //can assume one for now
          return { cancel: true }
      } else if (event.label === "Condition Lookup Dashboard") { //insurance
          const url = event.url;
          let stateName = decodeURIComponent(url.substring(url.lastIndexOf('/') + 1, url.indexOf('?')));
          const filterName = decodeURIComponent(url.substring(url.indexOf('?') + 1, url.indexOf('=')));
          const filterValue = decodeURIComponent(url.substring(url.lastIndexOf('=') + 1, url.length));
          if (stateName === 'TU4SBUVLvW1gDzfwCms2ji') stateName = 286; // hack for now...
          this.setState({}, () => {
              this.state[stateName].updateFilters({ [filterName]: filterValue })
              this.state[stateName].run()
          })
          this.handleTabChange(1) //can assume one for now
          return { cancel: true }
      }
  }*/

  /*cohortBuilderAction = async (lookerContent) => {
      // console.log('cohortBuilderAction');
      // console.log('lookerContent', lookerContent);
  
  
      let cohortBuilderApiContentCopy = { ...this.state.cohortBuilderApiContent }
      cohortBuilderApiContentCopy.status = 'running';
      cohortBuilderApiContentCopy.filterContent = {};
      // this.setState({ 'cohortBuilderApiContent': cohortBuilderApiContentCopy })
  
      for (let i = 0; i < lookerContent.fields.length; i++) {
  
          let newQuery = lookerContent.queryBody;
          newQuery.fields = [lookerContent.fields[i]];
          // console.log('newQuery', newQuery);
  
  
          let lookerCreateTaskResposnse = await fetch('/createquerytask/' + JSON.stringify(newQuery), {
              method: 'GET',
              headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json'
              }
          })
          let lookerCreateTaskResponseData = await lookerCreateTaskResposnse.json();
          // console.log('lookerCreateTaskResponseData', lookerCreateTaskResponseData);
  
          let taskInterval = setInterval(async () => {
              let lookerCheckTaskResposnse = await fetch('/checkquerytask/' + lookerCreateTaskResponseData.queryTaskId, {
                  method: 'GET',
                  headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json'
                  }
              })
              let lookerCheckTaskResponseData = await lookerCheckTaskResposnse.json();
  
              if (lookerCheckTaskResponseData.queryResults.status === 'complete') {
                  clearInterval(taskInterval)
  
                  lookerCheckTaskResponseData.queryResults.options = []
                  for (let j = 0; j < lookerCheckTaskResponseData.queryResults.data.length; j++) {
                      let thisOption = {};
                      thisOption.label = lookerCheckTaskResponseData.queryResults.data[j][lookerCheckTaskResponseData.queryResults.added_params.sorts[0]].value == null
                          ? '' :
                          lookerCheckTaskResponseData.queryResults.data[j][lookerCheckTaskResponseData.queryResults.added_params.sorts[0]].value
                      lookerCheckTaskResponseData.queryResults.options.push(thisOption)
                  }
  
                  cohortBuilderApiContentCopy.filterContent[lookerCheckTaskResponseData.queryResults.id] = lookerCheckTaskResponseData.queryResults
                  cohortBuilderApiContentCopy.status = Object.keys(cohortBuilderApiContentCopy.filterContent).length === lookerContent.fields.length ? "complete" : "running";
                  this.setState((prevState) => ({
                      'cohortBuilderApiContent': cohortBuilderApiContentCopy
                  }))
              }
          }, 1000)
  
      }
      // console.log('cohortBuilderApiContentCopy', cohortBuilderApiContentCopy)
      // this.setState({
      //     cohortBuilderApiContent: cohortBuilderApiContentCopy
      // })
  
  }*/

  render() {

    //how to make this dynamic????
    const demoComponentMap = {
      "splashpage19": SplashPage,
      "simpledashboard5": Dashboard,
      "simpledashboard9": Dashboard,
      "customfilter1": Dashboard,
      "customvis": CustomVis,
      "querybuilderexplorelite": QueryBuilder,
      "reportbuilder14": ReportBuilder,
    };

    const themeMap = {
      "atom": atomTheme,
      "vidly": vidlyTheme
    }

    const { drawerTabValue, drawerOpen, activeTabValue, activeUsecase, selectedTreeItem } = this.state; //, sampleCode
    const { handleDrawerChange, handleDrawerTabChange, handleTabChange } = this;
    const { classes, activeCustomization, switchLookerUser, lookerUser, applySession, lookerUserAttributeBrandOptions, switchUserAttributeBrand, lookerHost } = this.props

    let treeCounter = 0;
    let orderedDemoComponentsForMenu = activeUsecase ? _.orderBy(UsecaseContent[activeUsecase].demoComponents, ['menuCategory'], ['asc']) : []; // Use Lodash to sort array by 'name'
    let orderedDemoComponentsForMenuObj = {};
    let expandedTreeItemsArr = [];
    let cumulativePusher = 0;
    orderedDemoComponentsForMenu.map((item, index) => {
      if (orderedDemoComponentsForMenuObj.hasOwnProperty(item.menuCategory)) {
        orderedDemoComponentsForMenuObj[item.menuCategory] = [...orderedDemoComponentsForMenuObj[item.menuCategory], item]
      } else {
        orderedDemoComponentsForMenuObj[item.menuCategory] = [item];
        cumulativePusher += 1;
        expandedTreeItemsArr.push("" + (index + cumulativePusher));
      }
    })

    if (activeUsecase && !selectedTreeItem.length) {
      this.setState({
        selectedTreeItem:
          UsecaseContent[activeUsecase].demoComponents[0].lookerContent[0].id ?
            validIdHelper(UsecaseContent[activeUsecase].demoComponents[0].type + UsecaseContent[activeUsecase].demoComponents[0].lookerContent[0].id) :
            validIdHelper(UsecaseContent[activeUsecase].demoComponents[0].type)
      }, () => {
      })

      //couldn't figure this out...
      // UsecaseContent[activeUsecase].demoComponents.map(item => {
      //   demoComponentMap[item.lookerContent[0].id ?
      //     validIdHelper(item.type + item.lookerContent[0].id) :
      //     validIdHelper(item.type)] = item.type.split(" ").map(item => _.capitalize(item)).join("")
      // })
    }

    return (
      <div className={classes.root}>
        <AppContext.Provider value={{ show: this.state.highlightShow, toggleShow: this.toggleHighlightShow }} >
          <ThemeProvider theme={activeUsecase ? themeMap[activeUsecase] : defaultTheme}>
            <CssBaseline />
            <AppBar
              position="fixed"
              className={clsx(classes.appBar, {
                [classes.appBarShift]: drawerOpen,
              })}
            >
              <Toolbar>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  onClick={() => handleDrawerChange(true)}
                  edge="start"
                  className={clsx(classes.menuButton, drawerOpen && classes.hide)}
                >
                  <MenuIcon />
                </IconButton>

                {activeUsecase ?
                  <Avatar alt="Icon"
                    src={require(`../images/${activeUsecase}_logo.png`)}
                  /> : ''}

                <Typography variant="h6" noWrap className={`${classes.title} ${classes.ml12}`}>
                  {activeUsecase ? UsecaseContent[activeUsecase].vignette.name : ''}
                </Typography>
                <UserMenu
                  lookerUser={lookerUser}
                  switchLookerUser={switchLookerUser}
                  onLogoutSuccess={applySession}
                  lookerUserAttributeBrandOptions={lookerUserAttributeBrandOptions}
                  switchUserAttributeBrand={switchUserAttributeBrand}
                />
              </Toolbar>
            </AppBar>
            <Drawer
              className={classes.drawer}
              variant="persistent"
              anchor="left"
              open={drawerOpen}
              classes={{
                paper: classes.drawerPaper,
              }}
            >
              <div className={classes.drawerHeader}>
                <IconButton onClick={() => handleDrawerChange(false)}>
                  <ChevronLeftIcon />
                </IconButton>
              </div>
              <Divider />
              <TreeView
                className={classes.tree}
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
                expanded={expandedTreeItemsArr}
              >
                {activeUsecase ? Object.keys(orderedDemoComponentsForMenuObj).map((key, outerIndex) => (
                  <TreeItem
                    key={`${validIdHelper(key + '-outerTreeItem-' + outerIndex)}`}
                    nodeId={"" + (treeCounter += 1)}
                    treecounter={treeCounter}
                    label={_.capitalize(key)}>
                    {orderedDemoComponentsForMenuObj[key].map((item, innerIndex) => (
                      <TreeItem
                        key={`${validIdHelper(key + '-innerTreeItem-' + innerIndex)}`}
                        nodeId={"" + (treeCounter += 1)}
                        treecounter={treeCounter}
                        label={_.capitalize(item.label)}
                        selected={validIdHelper(item.lookerContent[0].id ? item.type + item.lookerContent[0].id : item.type) === selectedTreeItem}
                        className={validIdHelper(item.lookerContent[0].id ? item.type + item.lookerContent[0].id : item.type) === selectedTreeItem ? `Mui-selected innerTreeItem` : `innerTreeItem`}
                        onClick={(event) => {
                          this.setState({
                            selectedTreeItem:
                              item.lookerContent[0].id ? validIdHelper(item.type + item.lookerContent[0].id) : validIdHelper(item.type)
                          })
                        }}
                      // icon={<Icon className={`fa ${item.icon} ${classes.icon}`} />}
                      // disabled={apiContent[key].length ? false : true}
                      />
                    ))}
                  </TreeItem>)) : ''}
              </TreeView>
              <HighlightSourcesLegend className={classes.highlightLegend} />
            </Drawer>
            <main
              className={clsx(classes.content, {
                [classes.contentShift]: drawerOpen,
              })}
            >
              <div className={classes.drawerHeader} />
              {activeUsecase ?
                UsecaseContent[activeUsecase].demoComponents.map((item, index) => {
                  const key = item.lookerContent[0].id ? validIdHelper(item.type + item.lookerContent[0].id) : validIdHelper(item.type);
                  const DemoComponent = demoComponentMap[key];
                  return (
                    <Box className={key === selectedTreeItem ? `` : `${classes.hide}`}>
                      <DemoComponent key={validIdHelper(`list-${item.type}`)}
                        staticContent={item}
                        handleDrawerTabChange={handleDrawerTabChange}
                        activeTabValue={activeTabValue}
                        handleTabChange={handleTabChange}
                        lookerUser={lookerUser}
                        activeUsecase={activeUsecase}
                        LookerEmbedSDK={LookerEmbedSDK}
                        lookerHost={lookerHost}
                      />
                    </Box>)
                }) :
                ''
              }
            </main >
          </ThemeProvider>
        </AppContext.Provider>
      </div >
    )
  }
}
export default withStyles(styles)(Home);