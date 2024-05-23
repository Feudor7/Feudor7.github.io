"use strict";
/**
 * Projet : Ile interdite
 * Desc : Classe du metier Plongueur
 *          Sa comptence est de pouvoir traverser des cases innondees ou coulees adjacente en une action a condition de s'arreter sur terre ferme
 *          L'ocean autour de l'ile n'est pas traversable, la nombre de cases traversee a la nage n'est pas limitee
 * Author : Fedor BTSK
 * Date : 16.05.2024
 */
import Player from "./Player.js";
import {TILES_ID, movePlayer, updateActionsMenu } from "./gameFunctions.js";

export default class Diver extends Player {
    constructor(name = "Diver", startingCell = TILES_ID.copperGate) {
        super(name, startingCell, "Diver", "black");
        document.querySelector(`#player${this.id}`).classList.add("blackPawn");
    }

    /**
     * Selection de toutes les cases atteignable en prenant compte la competance du plongeur
     */
    selectMovementCells() {
        const checkedCells = [];
        const availableCells = [this.currentGameCell];
        const movementCells = [this.currentGameCell];
        while (availableCells.length > 0) {
            const checkingCell = availableCells[0];
            availableCells.splice(0, 1);

            for (const nearCell of checkingCell.allNeighbors) {
                if (!checkedCells.includes(nearCell)) {
                    if (nearCell.waterLevel > 0) {

                        availableCells.push(nearCell);

                    }
                    if (nearCell.waterLevel < 2) {
                        movementCells.push(nearCell);
                    }
                    checkedCells.push(nearCell);
                }
            }
        }
        for (const movevableCell of movementCells){
            movevableCell.cellElement.addEventListener("click", movePlayer);
        }
    }

    /**
     * Deplacement sans la restriction de la distance
     * @param {*} targetCell 
     */
    move(targetCell) {
        if (this.currentHtmlCell !== targetCell) {
            const image = document.querySelector(`#player${this.id}`);
            targetCell.querySelector(".playerZone").appendChild(image);
            this.currentHtmlCell = targetCell;
            this.actionsLeft--;
        }
        for (const cell of document.querySelectorAll(".cell")) {
            cell.parentElement.removeEventListener("click", movePlayer);
        }
        updateActionsMenu();
    }
}