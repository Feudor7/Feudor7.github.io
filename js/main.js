"use strict"
/**
 * Projet : Ile interdite
 * Desc : Gestion de la page du menu principal du jeu
 * Author : Fedor BTSK
 * Date : 16.05.2024
 */

import { startGame } from "./gameFunctions.js";

const PLAYERNAME_KEY = "playernames";
const gameDiv = document.querySelector("#game");
const menuForm = document.querySelector("#menu form");
export const winMenuDiv = document.querySelector("#winMenu");

const playersInputRows = Array.from(menuForm.querySelectorAll("li"));
const playerNames = [];
let formShown = false;

const previousPlayers = localStorage.getItem(PLAYERNAME_KEY) || null;
if (previousPlayers !== null){
    const previousPlayersArray = JSON.parse(previousPlayers);
    for (let i = 0; i < previousPlayersArray.length; i++){
        playersInputRows[i].querySelector("input").value = previousPlayersArray[i];
    }
    menuForm.querySelector("#nbPlayers").value = previousPlayersArray.length;
}
toggleMenuDispay();

/**
 * Change entre l'affichage du menu et du jeu
 */
function toggleMenuDispay() {
    formShown = !formShown;
    gameDiv.hidden = formShown;
    menuForm.parentElement.classList.toggle("menuShown");
}

/**
 * Change le nombre d'input des noms des joueurs affiche
 * @param {*} nbRows 
 */
function displayPlayerInputs(nbRows) {
    for (let i = 0; i < playersInputRows.length; i++) {
        const playerInput = playersInputRows[i].querySelector("input");
        if (i >= nbRows) {
            playersInputRows[i].hidden = true;
            playerInput.value = "";
            playerInput.required = false;
        }
        else {
            playersInputRows[i].hidden = false;
            playerInput.required = true;
        }
    }
}

displayPlayerInputs(parseInt(menuForm.querySelector("#nbPlayers").value));
menuForm.querySelector("#nbPlayers").addEventListener("change", (event) => displayPlayerInputs(parseInt(event.target.value)));
/**
 * Si tout les champs sont rempli, lance le jeu
 */
menuForm.addEventListener("submit", (event) => {
    event.preventDefault();
    playerNames.length = 0;
    const nameInputs = Array.from(menuForm.elements);
    for (const input of nameInputs) {
        if (input.type === "text" && input.required) {
            playerNames.push(input.value);
        }
    }
    localStorage.setItem(PLAYERNAME_KEY, JSON.stringify(playerNames));

    startGame(playerNames);
    toggleMenuDispay();
})

//fonction de retour au menu principal
gameDiv.querySelector("#btnMenu").addEventListener("click", (event) => {
    if (confirm("Quitter la partie et retourner au menu?")) toggleMenuDispay();
})

winMenuDiv.querySelector("#restart").addEventListener("click", (event) => {
    startGame(playerNames);
    winMenuDiv.classList.toggle("menuShown");
});
winMenuDiv.querySelector("#quitMenu").addEventListener("click", (event) => {
    winMenuDiv.classList.toggle("menuShown");
    toggleMenuDispay()
});