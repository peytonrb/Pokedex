/**
 * Peyton Bischof
 * 5/8/2021
 *
 * Simulates the game itself and fills the page with data from a Pokedex API.
 */

"use strict";

(function() {
  window.addEventListener("load", init);
  const URL = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/";
  const LOW_HEALTH = 20;
  const PERCENTAGE = 100;
  const MAX_MOVES = 4;

  let gameId;
  let playerId;
  let playerPokemon;
  let totalHealthPoints;

  /**
   * Runs on page load, creates and fills the Pokedex with Pokemon cards
   */
  function init() {
    getPokedex();
    id("start-btn").addEventListener("click", startGame);
    id("start-btn").addEventListener("click", battleView);
    id("endgame").addEventListener("click", pokedexView);
    id("flee-btn").addEventListener("click", function() {
      pokemonMove("flee");
    });
  }

  /**
   * Retrieves game state data from API and assigns p2 a Pokemon
   */
  function startGame() {
    let parameters = new FormData();
    parameters.append("startgame", "true");
    parameters.append("mypokemon", playerPokemon);
    fetch(URL + "/game.php", {method: "POST", body: parameters})
      .then(statusCheck)
      .then(response => response.json())
      .then(getRival)
      .catch(console.error);
  }

  /**
   * Hides Pokedex view and changes to Pokemon Battle view
   */
  function battleView() {
    id("pokedex-view").classList.toggle("hidden");
    id("p2").classList.toggle("hidden");
    id("p1").querySelector(".hp-info").classList.remove("hidden");
    id("p2").querySelector(".hp-info").classList.remove("hidden");
    id("results-container").classList.toggle("hidden");
    id("flee-btn").classList.toggle("hidden");
    id("start-btn").classList.add("hidden");
    qs("h1").textContent = "Pokemon Battle!";
    let buttons = id("p1").querySelector(".moves")
      .querySelectorAll("button");

    for (let i = 0; i < buttons.length; i++) {
      buttons[i].disabled = false;
      buttons[i].addEventListener("click", function() {
        pokemonMove(buttons[i].querySelector(".move").textContent);
      });
    }
  }

  /**
   * Defines gameId and playerId with API retreived data, this game state data is
   * used to populate the p2 card
   * @param {JSONobject} data - API data that populates the gameId and playerId
   */
  function getRival(data) {
    gameId = data.guid;
    playerId = data.pid;
    let rivalPokemon = data.p2.name;
    pokemonCardData(rivalPokemon, "p2");
  }

  /**
   * Resets webpage into the Pokedex view after the game is over and shows new found
   * Pokemon if applicable
   */
  function pokedexView() {
    id("endgame").classList.add("hidden");
    id("results-container").classList.add("hidden");
    id("p1-turn-results").textContent = "";
    id("p2-turn-results").textContent = "";
    id("pokedex-view").classList.remove("hidden");
    id("p2").classList.add("hidden");
    id("p1").querySelector(".hp-info").classList.add("hidden");
    id("start-btn").classList.remove("hidden");
    qs("h1").textContent = "Your Pokedex";
    resetHp("p1");
    resetHp("p2");
  }

  /**
   * Resets health bars to 100% after game has been played
   * @param {String} player - player who's health needs to be reset
   */
  function resetHp(player) {
    let healthBar = id(player).querySelector(".health-bar");
    healthBar.style.width = "100%";
    healthBar.classList.remove("low-health");
  }

  /**
   * Called when a player's health points reach 0. Concludes the game and disables buttons
   * used during the game
   * @param {String} player - the player who lost
   */
  function endGame(player) {
    let buttons = id("p1").querySelector(".moves")
      .querySelectorAll("button");

    if (player === "p1") {
      qs("h1").textContent = "You Lost!";
    } else {
      let sprite = id("p2").querySelector(".name").textContent.toLowerCase();
      foundPokemon(sprite);
      qs("h1").textContent = "You Won!";
    }

    id("endgame").classList.toggle("hidden");
    id("flee-btn").classList.add("hidden");

    for (let i = 0; i < buttons.length; i++) {
      buttons[i].disabled = true;
    }
  }

  /**
   * Retrieves game state data from the API after the move has been selected and
   * simulates the fight as both players take a turn
   * @param {String} moveName - name of the chosen Pokemon move
   */
  function pokemonMove(moveName) {
    id("loading").classList.toggle("hidden");
    let parameters = new FormData();
    parameters.append("guid", gameId);
    parameters.append("pid", playerId);
    parameters.append("movename", moveName);

    fetch(URL + "/game.php", {method: "POST", body: parameters})
      .then(statusCheck)
      .then(response => response.json())
      .then(changeGameState)
      .then(updateLoadingScreen)
      .catch(console.error);
  }

  /**
   * Updates the player move text box with API data from the moves made
   * @param {JSONobject} data - API data about the player moves
   */
  function changeGameState(data) {
    id("p1-turn-results").textContent = "Player 1 played " + data.results["p1-move"] +
      " and " + data.results["p1-result"] + "!";
    id("p1-turn-results").classList.remove("hidden");

    changeHpBar(data, "p2");

    if (data.results["p2-move"] === null || data.results["p2-result"] === null) {
      id("p2-turn-results").classList.add("hidden");
    } else {
      id("p2-turn-results").textContent = "Player 2 played " + data.results["p2-move"] +
        " and " + data.results["p2-result"] + "!";
    }
    id("p2-turn-results").classList.remove("hidden");

    changeHpBar(data, "p1");
  }

  /**
   * Helper function to decrease the HP bar once a player has made a move
   * @param {JSONobject} data - API data about the player moves
   * @param {String} player - player HP bar to be changed
   */
  function changeHpBar(data, player) {
    let pokemonHealth = data[player]["current-hp"];
    totalHealthPoints = data[player].hp;
    let pokemonHp = id(player).querySelector(".hp");
    let pokemonHpBar = id(player).querySelector(".health-bar");
    pokemonHp.textContent = pokemonHealth + "HP";
    let hpBar = ((pokemonHealth / totalHealthPoints) * PERCENTAGE);
    let hpBarWidth = hpBar + "%";
    pokemonHpBar.style.width = hpBarWidth;

    if (hpBar < LOW_HEALTH) {
      pokemonHpBar.classList.add("low-health");
    }

    if (hpBar === 0) {
      endGame(player);
    }
  }

  /**
   * Takes the loading animation away once game information is updated
   */
  function updateLoadingScreen() {
    id("loading").classList.toggle("hidden");
  }

  /**
   * Fetches data from Pokemon API and verifies that the requested information exists
   */
  function getPokedex() {
    let apiUrl = URL + "pokedex.php?pokedex=all";
    fetch(apiUrl)
      .then(statusCheck)
      .then(response => response.text())
      .then(createPokedex)
      .catch(console.error);
  }

  /**
   * Separates Pokemon short and long names and retrieves images from source,
   * adds shortname as image src
   * @param {String} data - list of Pokemon names received from API
   */
  function createPokedex(data) {
    let names = data.split("\n");
    let defaultStarterPokemon = ["bulbasaur", "charmander", "squirtle"];

    for (let i = 0; i < names.length; i++) {
      let temp = names[i].split(":");
      let fullName = temp[0];
      let shortName = temp[1];

      getImage(fullName, shortName);
    }

    for (let k = 0; k < defaultStarterPokemon.length; k++) {
      foundPokemon(defaultStarterPokemon[k]);
    }
  }

  /**
   * Creates and appends image details to the Pokemon images retrieved from the API
   * @param {String} fullName - Pokemon's full registered name
   * @param {String} shortName - Pokemon's name written in HTML standard convention
   */
  function getImage(fullName, shortName) {
    let pokedexImage = document.createElement("img");
    pokedexImage.classList.add("sprite");
    pokedexImage.id = shortName;
    pokedexImage.src = URL + "sprites/" + shortName + ".png";
    pokedexImage.alt = fullName;
    id("pokedex-view").appendChild(pokedexImage);
  }

  /**
   * Reveals the Pokemon in the Pokedex display and turning it into a button
   * so that it can only be clicked once it is found
   * @param {String} pokemon - Pokemon that has been discovered
   */
  function foundPokemon(pokemon) {
    if (!(id(pokemon).classList.contains("found"))) {
      id(pokemon).classList.add("found");
    }

    id(pokemon).addEventListener("click", function() {
      playerPokemon = pokemon;
      pokemonCardData(pokemon, "p1");
    });
  }

  /**
   * Queries and retrieves data from the API about individual Pokemon
   * @param {String} pokemon - Pokemon name that is being accessed from API
   * @param {String} cardNumber - Specifies which card will be filled in with API information
   */
  function pokemonCardData(pokemon, cardNumber) {
    fetch(URL + "pokedex.php?pokemon=" + pokemon)
      .then(statusCheck)
      .then(response => response.json())
      .then(function(data) {
        pokemonCard(data, cardNumber, pokemon);
      })

      .catch(console.error);
  }

  /**
   * Uses API data to create the display card
   * @param {JSONobject} data - API data about the specified Pokemon
   * @param {String} cardNumber - specifies which card to be filled in
   * @param {String} pokemon - name of Pokemon on display card
   */
  function pokemonCard(data, cardNumber, pokemon) {
    let card = id(cardNumber);
    getCardInformation(data, card, pokemon);
    let pokemonMoves = data.moves;
    getMoveInformation(data, card, pokemonMoves);

    if (cardNumber === "p1") {
      id("start-btn").classList.remove("hidden");
    }
  }

  /**
   * Helper function that fills in the Pokemon card with move information
   * @param {JSONobject} data - API data containing Pokemon information
   * @param {String} card - the Card object to be filled in with data
   * @param {Array} pokemonMoves - array of Pokemon moves passed in from API
   */
  function getMoveInformation(data, card, pokemonMoves) {
    let cardMoves = card.querySelectorAll(".move");
    let cardDp = card.querySelectorAll(".dp");
    let moveClass = card.querySelector(".moves");
    let moveIcons = moveClass.querySelectorAll("img");
    let moveButtons = moveClass.querySelectorAll("button");

    for (let i = 0; i < pokemonMoves.length; i++) {
      moveIcons[i].src = URL + "icons/" + pokemonMoves[i].type + ".jpg";

      cardMoves[i].textContent = pokemonMoves[i].name;
      if (data.moves[i].dp) {
        cardDp[i].textContent = pokemonMoves[i].dp + "DP";
      } else {
        cardDp[i].textContent = "";
      }

      hideMoves(pokemonMoves, moveButtons);
    }
  }

  /**
   * If a Pokemon doesn't have all 4 moves, helper functions hides these
   * @param {Array} pokemonMoves - Pokemon moves in array form
   * @param {JSONobject} moveButtons - DOM object containing the buttons
   */
  function hideMoves(pokemonMoves, moveButtons) {
    if (pokemonMoves.length < MAX_MOVES) {
      for (let i = pokemonMoves.length; i < MAX_MOVES; i++) {
        moveButtons[i].classList.add("hidden");
      }
    } else {
      for (let i = 0; i < pokemonMoves.length; i++) {
        moveButtons[i].classList.remove("hidden");
      }
    }
  }

  /**
   * Helper function that fills in the Pokemon card information with API data
   * @param {JSONobject} data - API data about the specified Pokemon
   * @param {object} card - the card Object to be filled in with data
   * @param {String} pokemon - name of Pokemon on display card
   */
  function getCardInformation(data, card, pokemon) {
    card.querySelector(".name").textContent = data.name;
    getCardImages(data, card, pokemon);
    card.querySelector(".hp").textContent = data.hp + "HP";
    card.querySelector(".info").textContent = data.info.description;
  }

  /**
   * Helper function that retrieves src and alt data from the API for the images
   * on the Pokemon card
   * @param {JSONobject} data - API data about the specified Pokemon
   * @param {object} card - the Card object to be filled in
   * @param {String} pokemon - name of Pokemon on display card
   */
  function getCardImages(data, card, pokemon) {
    card.querySelector(".pokepic").src = URL + data.images.photo;
    card.querySelector(".pokepic").alt = pokemon;
    card.querySelector(".type").src = URL + data.images.typeIcon;
    card.querySelector(".type").alt = data.info.type;
    card.querySelector(".weakness").src = URL + data.images.weaknessIcon;
    card.querySelector(".weakness").alt = data.info.weakness;
  }

  /**
   * Checks whether response from API exists
   * @param {Promise} response - response from API call
   * @returns {JSONobject} response from API call
   */
  async function statusCheck(response) {
    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response;
  }

  /**
   * Returns the first element that matches the given CSS selector.
   * @param {string} selector - CSS query selector.
   * @returns {object} The first DOM object matching the query.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} idName - element ID
   * @returns {object} DOM object associated with id.
   */
  function id(idName) {
    return document.getElementById(idName);
  }
})();
