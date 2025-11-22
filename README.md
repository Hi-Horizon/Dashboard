# Dashboard
the data Dashboard for Hi-Horizon racing team. 

For more information, check the [wiki](https://github.com/Hi-Horizon/Dashboard/wiki)

## Dashboard Config
For now, the dashboard layout can be changed using a json object string. 

The format is a 2d array, you can imagine this as a grid. Each cell in this grid contains a component object inside, these correlate to svelte components.

an example config:
```
[
	[
		{
			"componentName": "list",
			"props": {
				"items": [
					{
						"componentName": "valueBig",
						"props": {
							"valueId": 1,
							"valType": 0
						}
					},
					{
						"componentName": "valueBig",
						"props": {
							"valueId": 22,
							"valType": 0
						}
					}
				]
			}
		},
		{
			"componentName": "list",
			"props": {
				"items": [
					{
						"componentName": "valueBig",
						"props": {
							"valueId": 2,
							"valType": 0
						}
					}
				]
			}
		}
	]
]
```
