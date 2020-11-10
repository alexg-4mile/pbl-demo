import React, { useState } from 'react';
import { Typography, Grid } from '@material-ui/core'
import { EmbedMethodHighlight } from '../../Highlights/Highlight';
import { CheckboxSVGMap } from "./CheckboxSvgMapRegion";
import { customUsa } from './helpers';
const { validIdHelper } = require('../../../tools');

export default function MapFilter({ lookerContent, apiContent, index, classes, customFilterAction, type }) {

  const [regionValue, setRegionValue] = useState('Pacific, South, Mountain, Midwest, Northeast');

  return (
    <Grid item sm={3} >
      <EmbedMethodHighlight classes={classes}
        key={validIdHelper(`dashEmbed-${type}${lookerContent.id}-${index}`)} >
        <Typography className={`${classes.heading} ${classes.ml12}  ${classes.verticalAlignTop}`}
        >
          {lookerContent[0].filters[index].label}: <b>{regionValue ? regionValue : "Outside US"}</b>
        </Typography>

        <CheckboxSVGMap map={customUsa}
          onChange={(locations) => {

            let allUniqueRegionsFromSelectedLocations = [];
            for (let j = 0; j < locations.length; j++) {
              if (allUniqueRegionsFromSelectedLocations.indexOf(locations[j].region) == -1) {
                allUniqueRegionsFromSelectedLocations.push(locations[j].region)
              }
            }
            let allUniqueRegionsFromSelectedLocationsCommaSep = allUniqueRegionsFromSelectedLocations.join(",")
            setRegionValue(allUniqueRegionsFromSelectedLocationsCommaSep)
            customFilterAction(lookerContent[0].id,
              lookerContent[0].filters[index].filterName,
              (regionValue) ? regionValue : '')
          }}
        />
      </EmbedMethodHighlight>
    </Grid>
  )
}
