# InterIIT-AstrosatVisualization-frontend
The repository here contains the scripts developed for the front-end of a web visualization tool. The web visualization tool was a 3D environment showcasing data of the AstroSAT satellite (by ISRO), and this data is research about individual stars identified by the satellite. The data is accessible when we hover on a star out of all the stars which we have represented in a 3D environment similar to stellarium.
## **Sample of the Visualization Tool**
![unnamed](https://github.com/pranavteja/Inter_IIT_Astrosat_front_end/assets/45447693/c1f00998-ad81-478d-b4a6-010389314a0f)
## Folder Structure
```
Images folder
- containers all the images used in the tool along with the preloader
JS folder
- contains the functions used for perorming differend operations such as zoom in,zoom out,grid etc.
index.html
- The  base of all the files, which runs the tool.
```


## Frameworks used


```
The animation of the tool is created using ***Three.js***  
|-Three.js version : R119
Other tools used 
|- d3.js
|- tween.js
|- Orbit Controls.js
|- dat.gui.js
```
## Controls

- Use left click to navigate through the map of stars
- Click on the star to zomm into it
- The details of the stars are obtained on the right pane
- Double click on the empty space to zoom out
- The toogle present on the left side is used 
  - to add and remove the grid on the map of starts
  - to reset the sreen to the original orientation of the stars
