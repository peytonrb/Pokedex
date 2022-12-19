# Pokedex

## Overview
Practice using **AJAX** to fetch data in text and JSON format and process it
using DOM manipulation. 

<p>
  <img src="http://courses.cs.washington.edu/courses/cse154/21sp/homework/hw3/screenshots/overview-img.png" width="60%" alt="Pokedex main view">
</p>

### Background Information
A **Pokedex** entry (referenced by the sprite image) will link directly to a **Pokemon card**, which is a card of information 
for a single Pokemon species, containing a larger image of the Pokemon, its type and weakness information, its set of moves, health
point data, and a short description.

Each Pokemon has one of 18 types (fire, water, grass, normal, electric, fighting, psychic, fairy, dark, bug, steel,
ice, ghost, poison, flying, rock, ground, and dragon) and one weakness type (also from this set of 18 types).
Again, you don’t need to know about the strength/weakness of different types - this information will be provided
to you as needed.

It is assumed that each Pokemon has no more than 4 moves (some have fewer, but
all Pokemon have at least one move). In addition, we assume that the complete Pokedex has 151 Pokemon
(more have been added over the game’s history, but these comprise the original set of Pokemon species).

#### Game Play

In the Game View, all `.move` buttons in `#p1` should stay enabled until either player wins/loses.

Each move that you make has an effect on the game state which is handled by the server.
Once the server responds with the data successfully, the returned game data includes a `results` object 
that provides the results of both Pokemon's moves (which moves were played and whether they were a hit or miss).

**Winning/Losing:** 
The game ends when one of the Pokemon has 0 hp points (this includes fleeing, discussed later). 
