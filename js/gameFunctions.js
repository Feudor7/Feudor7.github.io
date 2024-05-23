"use strict";
/**
 * Projet : Ile interdite
 * Desc : Fonctions de gestion du processus du jeu
 * Author : Fedor BTSK
 * Date : 16.05.2024
 */
import Aviator from "./Aviator.js";
import Cell from "./Cell.js";
import Diver from "./Diver.js";
import Engineer from "./Engineer.js";
import Explorer from "./Explorer.js";
import { winMenuDiv } from "./main.js";

const GAME_TABLE = document.querySelector("#grid");
export const gameGrid = [];

let floodableCells = [];

let cardPile = [];
let discardPile = [];
let waterLevelIndex = 0;

const btnPlayers = document.querySelector("#playersBtn");
const btnControls = document.querySelector("#controls");
const indicationLabel = document.querySelector("#controls div");

/**
 * @var TILES_ID - dictionnaire des id des cases importantes du jeu
 */
export const TILES_ID = {
    helicopter: "",
    goldenGate: "",
    silveGate: "",
    ironGate: "",
    copperGate: "",
    bronzeGate: "",
    windGriphon: "",
    windFontaine: "",
    solarTemple: "",
    moonTemple: "",
    coralTemple: "",
    waterTemple: "",
    fireCave: "",
    fireTemple: "",
}
const CARDS_TYPES = {
    fire: "fire",
    water: "water",
    earth: "earth",
    wind: "wind",
    sandBag: "bag",
    levelRise: "level"
}
const WATER_LEVELS = [2, 2, 3, 3, 3, 4, 4, 5, 5, 6];
const ALL_JOBS = [Aviator, Diver, Engineer, Explorer];

//controls
const btnMove = document.querySelector("#btnMove");
export const btnShore = document.querySelector("#btnShore");
const btnArtefact = document.querySelector("#btnArtefact");
const btnBag = document.querySelector("#btnBag");
const btnEnd = document.querySelector("#btnEnd");
const btnQuit = document.querySelector("#btnQuit");
const btnGive = document.querySelector("#btnGive");
let sandBagUsed = false;

//player
let currentPlayerId;
let currentPlayer;
const players = [];

/**
 * Ajoute un nombre de copie d'une carte dans une pioche
 * @param {*} pile - la pioche
 * @param {*} card - la carte
 * @param {*} number - le nombre de copie
 */
function fillCardPile(pile, card, number) {
    for (let i = 0; i < number; i++) {
        pile.push(card);
    }
}

/**
 * Fait les preparations necessaires pour commencer a jouer
 *  - lance la creation de l'ile
 *  - rempli le pioche
 *  - attribue un role a chaque joueur et lui distribue 2 cartes
 *  - attribue un bouton par joueur (pour la transmition de cartes)
 *  - cree la situation initale avec 6 cases innondees
 * Puis lance le jeu
 * @param {*} playerNames - liste des noms des joueurs
 */
export function startGame(playerNames) {
    //lance la creation de l'ile
    createIsland(GAME_TABLE);

    //rempli le pioche
    cardPile = [];
    fillCardPile(cardPile, CARDS_TYPES.fire, 5);
    fillCardPile(cardPile, CARDS_TYPES.water, 5);
    fillCardPile(cardPile, CARDS_TYPES.earth, 5);
    fillCardPile(cardPile, CARDS_TYPES.wind, 5);
    fillCardPile(cardPile, CARDS_TYPES.sandBag, 2);

    //attribue un role a chaque joueur et lui distribue 2 cartes
    const jobs = ALL_JOBS.slice(); //faire une copie sans reference
    players.length = 0;
    for (const name of playerNames) {
        let jobId = Math.round(Math.random() * (jobs.length - 1));
        players.push(new jobs[jobId](name));
        jobs.splice(jobId, 1);
    }


    let htmlButtons = "";
    for (const player of players) {
        htmlButtons += `<button id="player${player.job}">${player.playerName}</button>`;
    }
    btnPlayers.innerHTML = htmlButtons;
    btnPlayers.hidden = true;

    for (const player of players) {
        btnPlayers.querySelector(`#player${player.job}`).addEventListener("click",
            (event) => {
                if (playerSelectionPromiseResolve !== null) {
                    playerSelectionPromiseResolve(player);
                }
            });

        currentPlayer = player;
        drawCard();
        drawCard();
    }

    //cree la situation initale avec 6 cases innondees
    floodableCells = Array.from(document.querySelectorAll(".cell"));
    for (let i = 0; i < 6 / WATER_LEVELS[waterLevelIndex]; i++) {
        floodIsland();
    }

    //lance le jeu
    currentPlayerId = 0;
    currentPlayer = players[currentPlayerId];

    fillCardPile(cardPile, CARDS_TYPES.levelRise, 3);
    displayInventory();
    checkAvailableActions();
    updateActionsMenu();
    document.querySelector("#jobCardDisplay img").src = `img/${currentPlayer.job}Card.webp`;
}

/**
 * Cree le plateau de jeu et le met dans la grille
 * Cree un tableau d'elements de class Cell corespandant
 * @param {*} grid - element HTML pour la grille
 */
function createIsland(grid) {
    let tableHtml = "";

    const cards = [];
    for (let i = 1; i <= 24; i++) {
        cards.push(i)
    }

    for (let i = 0; i < 6; i++) {
        tableHtml += "<tr>";
        let ligne = [];
        for (let j = 0; j < 6; j++) {
            if (j >= Math.floor(Math.abs(i - 2.5)) && j <= 5 - Math.floor(Math.abs(i - 2.5))) {
                const cardId = Math.floor(Math.random() * cards.length);

                const cardNumber = Math.min(cards[cardId], 15);
                tableHtml += `<td id="cell${j}${i}"><img class="cell" src="img/carte${cardNumber}.jpeg"><div class="playerZone"></div></img></td>`;

                const TILES_KEYS = Object.keys(TILES_ID);
                if (cards[cardId] - 1 < 15) {
                    TILES_ID[TILES_KEYS[cards[cardId] - 1]] = `#cell${j}${i}`;
                }

                ligne.push(new Cell(j, i));

                cards.splice(cardId, 1);
            }
            else {
                tableHtml += `<td id="cell${j}${i}"></td>`;
                ligne.push(new Cell(j, i, 3));
            }
        }
        tableHtml += "</tr>";
        gameGrid.push(ligne);
    }

    grid.innerHTML = tableHtml;
}

/**
 * Innonde un nombre de cases corespandant au niveau de l'eau actuel
 */
function floodIsland() {
    for (let i = 0; i < WATER_LEVELS[waterLevelIndex]; i++) {

        let cellIndex = Math.round(Math.random() * (floodableCells.length - 1));
        let cell = floodableCells[cellIndex].parentElement;
        gameGrid[cell.id[4]][cell.id[5]].increaseWaterLevel();

        floodableCells.splice(cellIndex, 1);

        if (floodableCells.length === 0) {
            floodableCells = Array.from(document.querySelectorAll(".cell"));
        }
    }
}

/**
 * Affiche l'inventair du joueur actuel
 * Pause le jeu si le joueur doit se defausser de cartes
 */
function displayInventory() {
    displayCardsPile(CARDS_TYPES.fire);
    displayCardsPile(CARDS_TYPES.wind);
    displayCardsPile(CARDS_TYPES.water);
    displayCardsPile(CARDS_TYPES.earth);
    displayCardsPile(CARDS_TYPES.sandBag);

    displayMiniatureInventorys();
    document.querySelector("#hand").style.backgroundColor = currentPlayer.color;

    let nbCards = document.querySelectorAll(".collectionCard").length
    if (nbCards > 5) {
        disableButtons();
        indicationLabel.innerHTML = `Défaussez-vous de ${nbCards - 5} cartes`;

        for (const carte of document.querySelectorAll(".handCard")) {
            carte.addEventListener('click', discardCard);
        }

    }
}

/**
 * Affiche une pile de cartes dans l'inventair du joueur
 * Affiche la carte de l'artefacte par dessu si le joueur le possede
 * @param {*} cardtype - type de carte (feu, eau, sac a sable)
 */
function displayCardsPile(cardtype) {
    let htmlCode = ""
    //carte
    for (let i = 0; i < currentPlayer.inventory[cardtype]; i++) {
        htmlCode += `<div class="handCard collectionCard animateCard" id="${cardtype}Card${currentPlayer.inventory[cardtype]}" style="top: ${-5 * i}px; left: ${5 * i}px;
        filter: brightness(${(i + 1) / currentPlayer.inventory[cardtype] * 100}%);">
        <img src="img/${cardtype}Card.jpg"></div>`;
    }
    //artefact
    if (currentPlayer.inventory[`${cardtype}Artefact`]) {
        htmlCode += `<div class="handCard handArtefact" id="${cardtype}Artefact" style="top: ${-5 * currentPlayer.inventory[cardtype]}px; left: ${5 * currentPlayer.inventory[cardtype]}px;">
        <img src="img/${cardtype}Artefact.jpg"></div>`;
    }

    document.querySelector(`#${cardtype}`).innerHTML = htmlCode;
}

/**
 * Affiche l'inventair miniature des joueurs
 */
function displayMiniatureInventorys() {
    let htmlCode = "";
    for (const player of players) {
        htmlCode += `
        <div class="minInventory" style="background-color: ${player.color}">
        <span>${player.inventory.fire} <img src="img/fireLogo.png"></span>
        <span>${player.inventory.wind} <img src="img/windLogo.png"></span>
        <span>${player.inventory.water} <img src="img/waterLogo.png"></span>
        <span>${player.inventory.earth} <img src="img/earthLogo.png"></span>
        <span>${player.inventory.bag} <img src="img/sandBagLogo.png"></span>
        </div>
        `;
    }
    document.querySelector("#playersInventorys").innerHTML = htmlCode;
}

/**
 * Le joueur actuel pioche un carte
 */
function drawCard() {
    let cardIndex = Math.round(Math.random() * (cardPile.length - 1))
    if (cardPile[cardIndex] != CARDS_TYPES.levelRise) {
        currentPlayer.recieveCrads(cardPile[cardIndex]);
    }
    else {
        floodableCells = Array.from(document.querySelectorAll(".cell"));
        waterLevelIndex += 1;
        const sections = Array.from(document.querySelectorAll(".waterlevel")).reverse();
        const marker = document.querySelector("#waterMarker");
        const nextSection = sections[waterLevelIndex];
        nextSection.appendChild(marker);
        discardPile.push(CARDS_TYPES.levelRise);
        // nextSection.classList.remove("waterlevel")
    }
    cardPile.splice(cardIndex, 1);

    if (cardPile.length === 0) {
        cardPile = discardPile;
    }
}

/**
 * Le joueur se defausse de la carte du type choisi
 * @param {*} event 
 * @param {*} type 
 */
function discardCard(event, type = null) {
    let cardType = type;
    if (type === null) {
        let cardId = event.target.parentElement.id;

        //optimisation pour cliquer les cartes normales ou artefacts
        cardId = cardId.replace("A", "C");
        cardType = cardId.split("C")[0];
    }

    if (currentPlayer.inventory[cardType] > 0) {
        currentPlayer.discardCard(cardType);
        discardPile.push(cardType);
        displayInventory();
    }
    //cas du sac a sable
    btnBag.disabled = (currentPlayer.inventory.bag === 0 || GAME_TABLE.querySelectorAll(".flodded").length === 0);

    //resume le jeu
    if (document.querySelectorAll(".collectionCard").length <= 5) {
        checkAvailableActions();
        updateActionsMenu();

        for (const carte of document.querySelectorAll(".handCard")) {
            carte.removeEventListener('click', discardCard);
        }
    }
}

/**
 * Desactive tout les boutons du menu d'actions du joueur
 */
export function disableButtons() {
    for (const btn of document.querySelectorAll("#controls button")) {
        btn.disabled = true;
    }
}

/**
 * Active les boutons du menu d'actions du joueur quand elles sont disponibles
 */
function checkAvailableActions() {
    const currentGameCell = currentPlayer.currentGameCell;
    currentGameCell.detectNeighbors();

    btnMove.disabled = false;
    btnEnd.disabled = false;
    btnShore.disabled = (currentGameCell.floodedNeighbors.length === 0)
    checkArtefactAvailable()
    btnBag.disabled = (currentPlayer.inventory.bag === 0 || GAME_TABLE.querySelectorAll(".flodded").length === 0);

    btnGive.disabled = currentPlayer.currentHtmlCell.querySelectorAll(".playerZone .player").length < 2;

    btnQuit.disabled = !checkIslandQuit();

    currentPlayer.checkAditionalActions();
}

/**
 * Met a jour l'affichage des tour
 * Passe le tour quand le joueur n'a plus d'actions
 * @param {*} event 
 */
export function updateActionsMenu(event) {
    indicationLabel.innerHTML = `Tour de : ${currentPlayer.playerName} Actions : ${currentPlayer.actionsLeft}`;

    checkAvailableActions();

    if (currentPlayer.actionsLeft === 0) {
        drawCard();
        drawCard();
        if (currentPlayerId === players.length - 1) {
            floodIsland();
        }
        if (!checkDefeat()) {
            currentPlayerId = (currentPlayerId + 1) % players.length;
            currentPlayer = players[currentPlayerId];
            currentPlayer.actionsLeft = 3;
            updateActionsMenu();
            displayInventory();
            document.querySelector("#jobCardDisplay img").src = `img/${currentPlayer.job}Card.webp`;
        }
    }
}

/**
 * Action du joueur : se deplacer
 * le joueur prepare son deplacement
 * @param {*} event 
 */
function actionMove(event) {
    disableButtons();
    currentPlayer.selectMovementCells();
}

/**
 * utilise la fonction de deplacement du joueur actuel
 * @param {*} event 
 */
export function movePlayer(event) {
    currentPlayer.move(event.target.parentElement);
}

/**
 * Action du joueur : assecher une case
 * le joueur prepare les cases qu'il peut assecher
 * @param {*} event 
 */
function actionShore(event) {
    disableButtons();
    currentPlayer.actionShore();
}

/**
 * le joueur asseche une case
 * @param {*} event 
 */
export function shoreCell(event) {
    currentPlayer.actionShoreCell(event, sandBagUsed);
    sandBagUsed = false;
}

/**
 * Action du joueur : utiliser un sac a sable
 * Prepare les cases que le joueur peut assecher avec un sac a sable
 * @param {*} event 
 */
function useSandBag(event) {
    disableButtons();
    for (const floodedCell of GAME_TABLE.querySelectorAll(".flodded")) {
        floodedCell.parentElement.addEventListener("click", shoreCell)
    }
    currentPlayer.discardCard(CARDS_TYPES.sandBag);
    sandBagUsed = true;
    updateActionsMenu();
    displayInventory();
    currentPlayer.actionsLeft++;
}

/**
 * @var artefactAction - methode de recuperation sur le boutton du joueur
 */
let artefactAction = null;

/**
 * Verifie si le joueur se trouve sur une case ou il peut recuperer un artefact et qu'il possede le bon nombre de cartes
 */
function checkArtefactAvailable() {
    btnArtefact.removeEventListener("click", artefactAction);
    switch (`#${currentPlayer.currentHtmlCell.id}`) {
        case TILES_ID.fireCave:
        case TILES_ID.fireTemple:
            if (currentPlayer.inventory.fire >= 4 && !currentPlayer.inventory.fireArtefact) {
                artefactAction = (event) => {
                    actionGetArtefact(event, CARDS_TYPES.fire);
                }
                btnArtefact.addEventListener("click", artefactAction)
                btnArtefact.disabled = false;
            }
            else {
                btnArtefact.disabled = true;
            }
            break;
        case TILES_ID.waterTemple:
        case TILES_ID.coralTemple:
            if (currentPlayer.inventory.water >= 4 && !currentPlayer.inventory.waterArtefact) {
                artefactAction = (event) => {
                    actionGetArtefact(event, CARDS_TYPES.water);
                }
                btnArtefact.addEventListener("click", artefactAction)
                btnArtefact.disabled = false;
            }
            else {
                btnArtefact.disabled = true;
            }
            break;
        case TILES_ID.windFontaine:
        case TILES_ID.windGriphon:
            if (currentPlayer.inventory.wind >= 4 && !currentPlayer.inventory.windArtefact) {
                artefactAction = (event) => {
                    actionGetArtefact(event, CARDS_TYPES.wind);
                }
                btnArtefact.addEventListener("click", artefactAction)
                btnArtefact.disabled = false;
            }
            else {
                btnArtefact.disabled = true;
            }
            break;
        case TILES_ID.moonTemple:
        case TILES_ID.solarTemple:
            if (currentPlayer.inventory.earth >= 4 && !currentPlayer.inventory.earthArtefact) {
                artefactAction = (event) => {
                    actionGetArtefact(event, CARDS_TYPES.earth);
                }
                btnArtefact.addEventListener("click", artefactAction)
                btnArtefact.disabled = false;
            }
            else {
                btnArtefact.disabled = true;
            }
            break;
        default:
            btnArtefact.disabled = true;
            break;
    }
}

/**
 * Action du joueur : recuperer un artefact
 * Le joueur recupere un artefact en defaussant de 4 cartes du meme type
 * @param {*} event 
 * @param {*} type 
 */
function actionGetArtefact(event, type) {
    for (let i = 0; i < 4; i++) {
        currentPlayer.discardCard(type)
    }
    currentPlayer.aquireArtefact(type)
    displayInventory();
    currentPlayer.actionsLeft--;
    updateActionsMenu();
}

/**
 * Action du joueur : donner une carte
 * Prepare le transfert de carte
 */
function actionGiveCard(event) {
    disableButtons();
    indicationLabel.innerHTML = "Séléctionner une carte à donner"

    for (const card of document.querySelectorAll(".handCard")) {
        card.addEventListener('click', selectTransferCard);
    }
}

/**
 * @var playerSelectionPromiseResolve - contien le resolve la promesse du choix d'un joueur pour le transfer de carte
 */
let playerSelectionPromiseResolve = null;

/**
 * 
 * @param {*} event 
 */
function selectTransferCard(event) {
    btnControls.hidden = true;
    let cardId = event.target.parentElement.id;

    //optimisation pour utiliser avec les cartes d'artefacts
    cardId = cardId.replace("A", "C");
    let cardType = cardId.split("C")[0];

    if (currentPlayer.inventory[cardType] > 0) {
        for (const card of document.querySelectorAll(".handCard")) {
            card.removeEventListener('click', selectTransferCard);
        }

        new Promise((resolve, reject) => { playerSelectionPromiseResolve = resolve })
            .then(selectedPlayer => {
                discardCard(null, cardType);
                playerSelectionPromiseResolve = null;

                selectedPlayer.recieveCrads(cardType);
                btnPlayers.hidden = true;
                btnControls.hidden = false;
                currentPlayer.actionsLeft--;
                updateActionsMenu();
                displayMiniatureInventorys();
            })

        btnPlayers.hidden = false;
        for (const player of players) {
            if (player.currentGameCell === currentPlayer.currentGameCell)
                btnPlayers.querySelector(`#player${player.job}`).disabled = (player.job === currentPlayer.job);
        }

    }
}

/**
 * Action du joueur : finir son tour
 * @param {*} event 
 */
function finishTurn(event) {
    currentPlayer.actionsLeft = 0;
    updateActionsMenu();
}

/**
 * Verifie si toutes les conditions sont respecter pour gagner la partie
 * @returns true - les conditions sont respectees
 */
function checkIslandQuit() {
    const winConditions = {
        correctPosition: true,

        fireArtefact: false,
        windArtefact: false,
        earthArtefact: false,
        waterArtefact: false,
    };

    const helicopterTile = document.querySelector(TILES_ID.helicopter);
    for (const player of players) {
        winConditions.correctPosition = winConditions && player.currentHtmlCell === helicopterTile;

        winConditions.earthArtefact = winConditions.earthArtefact || currentPlayer.inventory.earthArtefact;
        winConditions.windArtefact = winConditions.windArtefact || currentPlayer.inventory.windArtefact;
        winConditions.waterArtefact = winConditions.waterArtefact || currentPlayer.inventory.waterArtefact;
        winConditions.fireArtefact = winConditions.fireArtefact || currentPlayer.inventory.fireArtefact;
    }

    return winConditions.correctPosition &&
        winConditions.earthArtefact &&
        winConditions.windArtefact &&
        winConditions.fireArtefact &&
        winConditions.waterArtefact;
}

/**
 * Action du joeur : Quitter l'ile
 * Gagner la partie
 * @param {*} event 
 */
function quitIsland(event) {
    const resultDisplay = winMenuDiv.querySelector("p");
    resultDisplay.innerText = "Félicitations vous avez fuit l'île avec tous les artefacts";
    winMenuDiv.querySelector("img").src = "img/victoryScreen.jpg";
    winMenuDiv.classList.toggle("menuShown");
    disableButtons();
    btnBag.disabled = true;
}

/**
 * Verification des conditions de defaite
 *  - un joueur s'est noye
 *  - le niveau d'esu est trop elve
 *  - ou la case "helicopter" a coulee
 * @returns true - la partie est perdue
 */
function checkDefeat() {
    const resultDisplay = winMenuDiv.querySelector("p");
    let gameLost = false;
    currentPlayer.currentGameCell.detectNeighbors()
    if (currentPlayer.currentGameCell.waterLevel === 2) {
        if (currentPlayer.currentGameCell.neighbors.length === 0) {
            resultDisplay.innerText = "L'un des aventurier est mort noyé!"
            gameLost = true;
        }
        else {
            savingSwim(currentPlayer.currentGameCell.neighbors)
        }
    }

    if (waterLevelIndex === 11) {
        resultDisplay.innerText = "Le eau a atteint un niveau mortel!";
        gameLost = true;
    }

    if (gameGrid[TILES_ID.helicopter[5]][TILES_ID.helicopter[6]].waterLevel === 2) {
        resultDisplay.innerText = "Le cercle pour l'hélicopter a coulé!";
        gameLost = true;
    }

    if (gameLost) {
        winMenuDiv.querySelector("img").src = "img/defeatScreen.jpg";
        winMenuDiv.classList.toggle("menuShown");
        disableButtons();
        btnBag.disabled = true;
    }

    return gameLost;
}

/**
 * Deplacement vers une case adjacente aleatoire
 * @param {*} neighbors - les cases adjacentes
 */
function savingSwim(neighbors) {
    let id = Math.round(Math.random() * (neighbors.length - 1));
    currentPlayer.move(neighbors[id].cellElement)
}

btnMove.addEventListener("click", actionMove);
btnShore.addEventListener("click", actionShore);
btnBag.addEventListener("click", useSandBag);
btnEnd.addEventListener("click", finishTurn);
btnQuit.addEventListener("click", quitIsland);
btnGive.addEventListener("click", actionGiveCard);