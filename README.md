# Crossing Dot Game

Implementation of minimax algorithm（without alpha beta pruning）that determine the optimal move of crossing-dot game. 

[>> Start Game](https://bolan6180.github.io/crossing-dot-game/dist/index.html)

<div align="center">
  <img src = '../crossing-dot-game/public/screenshots/screenshot.png' alt="screenshot" style="display:block; margin:0 auto; width:70%">
</div><br/>

### How it works
* **Simple and clear heuristic function.**
* **Cache calculated scores.** Since the game is stateless, the decision tree could reuse the score of the visited game state, which saves a lot of calculation time. Moreover, only recording one player's score is needed because the self's score is the opposite of the opponent's.
* **Slice the possible moves.** Stop calculating the rest of the possible moves immediately once the optimal move is found.


### Why isn't Alpha-Beta pruning being used?
Of course, pruning helps to reduce the decision tree dramatically. However, the calculation time becomes unacceptable when the game has more than 12 dots. The decision tree is too large to have an expected improvement.


---
This game was inspired by [Wilson and James Liang](https://jamesliang.net/)

