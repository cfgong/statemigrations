# State Migration Interactive Visualization
by Ashu Gupta and Crystal Gong   
View the Visualization [here](https://state-migrations.herokuapp.com/map.html)   
Read the writeup [here](https://github.com/cfgong/statemigrations/blob/master/writeup.pdf)   

### Instructions
Make sure you CTRL-SHIFT-R when viewing herokup app. 
1) To run from local run a web server: `python -m SimpleHTTPServer 8000`   
2) Head over to `http://127.0.0.1:8000/map.html`

### Datasets
- [State to State Migration Dataset](https://www.census.gov/data/tables/time-series/demo/geographic-mobility/state-to-state-migration.html)
- [List of Latitudes and Longitudes for every State](https://inkplant.com/code/state-latitudes-longitudes)

### Design Decisions/ Revisions
We decided not to implement a feature to display the arrows incoming and outgoing all at once. Although, this feature would allow for more information to be viewed and displayed at the same time, we saw this also resulted in an overload of information, making the graph difficult to view. In particular, a lot of the incoming outgoing arrows ended up overlapping (for example: Indiana &larr; Illinois and Illinois &larr; Indiana), making it difficult to differentiate when arrows were changing across time. 

### Code Resources
- [Stack Overflow: retrieve slider range value](https://stackoverflow.com/questions/29103818/how-can-i-retrieve-and-display-slider-range-value)
- [Stack Overflow: add space between two words](https://stackoverflow.com/questions/15343163/add-a-space-between-two-words)
- [Medium: Deploying a static site to Heroku](https://medium.com/@adityaniloi/how-to-deploy-a-static-website-to-heroku-49d55e07cb94)
- [Bl.ocks: Arc Map with Scaled Arrowheads](http://bl.ocks.org/vigorousnorth/e95a867b10de1239ab3a)