# Progress Report

## Project Aims

1 be able to record a set of dart throws for statistical analysis
2 make an assumption of the distribution that best fits this data
3 be able to advise the player on the best part of the board to aim for during the scoring phase of a darts match
4 be able to advise the player on their chance of hitting each double given their specific throw distribution

### Stretch Goal

* be able to advise the player the optimum point in a match to switch from the scoring phase to the checkout phase 

## Equipment

* mounted dartboard and darts (in accordance with competition regulations)
* tripod mounted webcam
* HTML5 based data collection software (with a suitable mathematics javascript library)
* HTML5 based user interface to review data

## Achievements so Far

1 we can record an arbitrary number of darts throws
2 assuming only unskewed, 2D Gaussian distributions
3 we can generate heatmaps showing the statistically optimal places of a dartboard to aim for in the scoring phase assuming a radial Gaussian distribution  
4 we can integrate a players radial Gaussian distribution over the shape of each bed to give the percentage chance of hitting that bed

## Results so Far

All results thus far are based on observations of our own darts ability. We're both a bit shit

1 standard dev in x and y differ greatly (standard dev in x < standard dev y)
2 with the current assumptions, for amateur players, treble 19 is the optimal place to aim for the scoring phase of the game
3 preliminary investigations into doubles with non radial Gaussians indicate d6 and d11 are easier to hit than d20 and d3
4 qualitatively, it appears the Guassian spread is noticably smaller when a player aims for a double bed (when checking out) compared with aiming for the bullseye

## Plans for Remainder of Project

1 error in dart position needs quantifying an minimising (current estimate is of the order of 5mm)
2 plot the most optimal place to aim for each heatmap (effectively differentiation of the heatmaps)
3 produce heatmaps with non-radial Gaussians not centred about (0,0)

## Any Problems Encountered

* difficulty in taking data from a webcam and interpreting/recording distances accurately
* javascript can be problematic when dealing with floating point numbers - a library has been introduced to ensure numerical accuracy
