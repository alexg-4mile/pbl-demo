import React from 'react';
import { Typography, Grid, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { ApiHighlight } from './Highlight';
import { NumberToColoredPercent } from './NumberToColoredPercent';
const { validIdHelper } = require('../utils/tools');

export const AutoComplete = ({ lookerContent, apiContent, index, classes, action }) => {
  // console.log("AutoComplete");
  // console.log({ apiContent })
  // console.log({ action })
  return (
    <ApiHighlight
      key={validIdHelper(`dashEmbed-${lookerContent.id}-${index}`)}
      classes={classes} >
      <Typography>
        {lookerContent[0].filters[index].label}:
        </Typography>
      <Autocomplete
        id={`combo-box-dashboard-${lookerContent.id}`}
        options={Array.isArray(apiContent) ?
          apiContent :
          []}
        renderOption={(option) => (
          <Grid container justify="space-between">
            <Grid item >
              {option.label}
            </Grid>
            {option.trend && <Grid item>
              <NumberToColoredPercent
                val={option.trend}
                positive_good={true}
                abs_val={Math.abs(option.trend)}
              />
            </Grid>}
          </Grid>
        )}
        getOptionLabel={(option) => option.label}
        onChange={(event, newValue) => {
          action(lookerContent[0].id,
            lookerContent[0].filters[index].filterName,
            (newValue) ? newValue.label : '')
        }}
        renderInput={(params) => <TextField {...params}
          label={lookerContent[0].filters[index].filterName}
          variant="outlined"
        />}
        loadingText="Loading..."
      />
    </ApiHighlight>
  )
}