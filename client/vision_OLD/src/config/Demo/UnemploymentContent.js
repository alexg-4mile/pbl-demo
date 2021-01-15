import Dashboard from '../../components/Demo/Dashboard/Dashboard'
import HomeIcon from '@material-ui/icons/Home'; //already declared

export const UnemploymentContent = {
  "type": "customfilter",
  "label": "Home",
  "menuCategory": "Fraud and Improper Payments",
  "description": "Overview of all your web traffic",
  "icon": HomeIcon,
  "component": Dashboard,
  "lookerContent": [
    {
      "type": "dashboard",
      "lookerMethod": "embedDashboard",
      "id": "19",
      "label": "Unemployment",
      "isNext": false,
      "filters": [
        {
          "label": "Select Product Category",
          "filterName": "Category",
          "lookerMethod": "runInlineQuery"
        }
      ],
      "inlineQueries": [
        {
          "model": "atom_fashion",
          "view": "order_items",
          "fields": [
            "this_period",
            "last_period",
            "products.category"
          ],
          "filters": {
            "order_items.created_date": "60 days ago for 60 days",
            "order_items.count": ">5"
          },
          "sorts": [
            "products.category"
          ],
          "limit": 500,
          "dynamic_fields": "[{\"table_calculation\":\"trend\",\"label\":\"trend\",\"expression\":\"${this_period} / ${last_period} - 1\",\"value_format\":null,\"value_format_name\":null,\"_kind_hint\":\"measure\",\"_type_hint\":\"number\"},{\"measure\":\"this_period\",\"based_on\":\"order_items.total_sale_price\",\"type\":\"count_distinct\",\"label\":\"This Period\",\"value_format\":null,\"value_format_name\":null,\"_kind_hint\":\"measure\",\"_type_hint\":\"number\",\"filter_expression\":\"matches_filter(${order_items.created_date},`30 days ago for 30 days`)\"},{\"measure\":\"last_period\",\"based_on\":\"order_items.total_gross_margin\",\"label\":\"Last Period\",\"value_format\":null,\"value_format_name\":null,\"_kind_hint\":\"measure\",\"_type_hint\":\"number\",\"filter_expression\":\"matches_filter(${order_items.created_date},`60 days ago for 30 days`)\"}]",
          "theme": "atom_fashion"
        }
      ],
      "filterComponents": [
        "autocomplete"
      ],
      "dynamicThemeMode": {
        "title": "gfy"
      },
      "dynamicThemeFont": {
        "title": "gfy"
      },
      "dynamicVisConfig": {
        "title": "gfy",
        "colors": {
          "#2d4266": [
            "#2d4266",
            "#416098",
            "#5780cd",
            "#6391e8"
          ],
          "#43606b": [
            "#43606b",
            "#4a7880",
            "#66a99d",
            "#a3d9a9"
          ],
          "#414c67": [
            "#414c67",
            "#64689b",
            "#9682cd",
            "#b48ee4"
          ]
        },
        "series_cell_visualizations": {
          "#2d4266": {
            "palette_id": "a3425339-dbbb-2584-0e23-38ed7d87ed50",
            "collection_id": "b43731d5-dc87-4a8e-b807-635bef3948e7",
            "custom_colors": [
              "#6391e8",
              "#2d4266"
            ]
          },
          "#43606b": {
            "palette_id": "c5182d25-00a3-cd71-eed3-4056299dd78f",
            "collection_id": "atom-fashion",
            "custom_colors": [
              "#a3d9a9",
              "#43606b"
            ]
          },
          "#414c67": {
            "palette_id": "7e059aa1-0d23-dab1-dbf9-a751ab7f54fb",
            "collection_id": "b43731d5-dc87-4a8e-b807-635bef3948e7",
            "custom_colors": [
              "#b48ee4",
              "#414c67"
            ]
          }
        }
      },
      "theme": "light_arial"
    }
  ]
}