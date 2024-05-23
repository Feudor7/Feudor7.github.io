"use strict";
/**
 * Projet : Ile interdite
 * Desc : Classe mere representant un joueur
 * Author : Fedor BTSK
 * Date : 16.05.2024
 */
import { gameGrid, movePlayer, updateActionsMenu, shoreCell } from "./gameFunctions.js";
export default class Player {
    static playerID = 0;
    id;
    actionsLeft = 3;
    color;

    #job = "";

    get job() {return this.#job};

    inventory = {
        fire: 0,
        wind: 0,
        earth: 0,
        water: 0,
        bag: 0,

        fireArtefact: false,
        windArtefact: false,
        earthArtefact: false,
        waterArtefact: false,
    };


    /**
     * @var currentHtmlCell - case html actuel du joueur
     */
    currentHtmlCell;

    /**
     * @var currentGameCell - objet de type cell correspondant a la classe su joueur
     */
    get currentGameCell() {
        return gameGrid[this.currentHtmlCell.id[4]][this.currentHtmlCell.id[5]];
    }

    #playerName;
    get playerName() {return this.#playerName}

    constructor(playerName, startingCell, job = "nojob", color = "grey") {
        this.id = Player.playerID;
        Player.playerID++;
        this.#job = job;
        this.#playerName = playerName;

        this.currentHtmlCell = document.querySelector(startingCell);

        this.currentHtmlCell.querySelector(".playerZone").innerHTML += `<div class="player" id="player${this.id}"></div>`;
        this.color = color;
    }

    /**
     * verifie les action special possible
     * Explorer a le droit d'assecher les case en diagonale
     */
    checkAditionalActions(){}

    /**
     * Attache un event aux cases sur lequel le joueur peut se deplacer
     */
    selectMovementCells() {
        for (const cell of document.querySelectorAll(".cell")) {
            cell.addEventListener("click", movePlayer);
        }
    }

    /**
     * Deplace le joueur vers une case cible
     * @param {*} targetCell 
     */
    move(targetCell) {
        let distanceX = Math.abs(this.currentHtmlCell.id[4] - targetCell.id[4]);
        let distanceY = Math.abs(this.currentHtmlCell.id[5] - targetCell.id[5]);

        if (distanceX + distanceY <= 1) {
            const image = document.querySelector(`#player${this.id}`);
            targetCell.querySelector(".playerZone").appendChild(image);
            this.currentHtmlCell = targetCell;
            if (distanceX + distanceY !== 0) { this.actionsLeft--; }
        }
        for (const cell of document.querySelectorAll(".cell")) {
            cell.removeEventListener("click", movePlayer);
        }
        
        updateActionsMenu();
    }

    /**
     * Attache un event aux cases que le joueur peut assecher
     */
    actionShore() {
        for (const floodedCell of this.currentGameCell.floodedNeighbors) {
            floodedCell.cellElement.addEventListener("click", shoreCell)
        }
    }

    /**
     * Le joueur asseche une case
     * @param {*} event 
     * @param {*} sandBagUsed - true si cette action a ete faite avec un "sac a sable"
     * @param {*} updateLabel - true si il est necessaire de mettre a jour l'affichage des action
     */
    actionShoreCell(event, sandBagUsed, updateLabel = true) {
        let selectedCell = event.target.parentElement;

        for (const cell of document.querySelectorAll(".cell")) {
            cell.parentElement.removeEventListener("click", shoreCell);
        }

        gameGrid[selectedCell.id[4]][selectedCell.id[5]].decreaseWaterLevel();
        this.actionsLeft--;
        if (updateLabel) updateActionsMenu();
    }

    /**
     * Ajoute une carte d'un type choisi a l'inventaire
     * @param {*} cardtype 
     */
    recieveCrads(cardtype) {
        this.inventory[cardtype] += 1;
    }

    /**
     * Defausse une carte du type choisi
     * @param {*} cardtype 
     */
    discardCard(cardtype) {
        //derniere carte qui n'est pas un artefact
        document.querySelector(`#${cardtype}>.collectionCard:nth-last-of-type(${(this.inventory[`${cardtype}Artefact`]) ? 2 : 1})`).remove();
        this.inventory[cardtype] -= 1;
    }

    /**
     * Ajoute un artefact a l'inventaire
     * @param {*} type 
     */
    aquireArtefact(type) {
        this.inventory[`${type}Artefact`] = true;
    }
}