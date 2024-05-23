"use strict";
/**
 * Projet : Ile interdite
 * Desc : Classe du metier Ingenieur
 *          Sa competance est de pouvoir assecher 2 cases dans sa portee en une action
 * Author : Fedor BTSK
 * Date : 16.05.2024
 */
import Player from "./Player.js";
import {TILES_ID, updateActionsMenu, shoreCell, disableButtons } from "./gameFunctions.js";

export default class Engineer extends Player {
    #abilityUsed;
    constructor(name = "Engineer", startingCell = TILES_ID.bronzeGate) {
        super(name, startingCell, "Engineer", "red");
        this.#abilityUsed = true;
        document.querySelector(`#player${this.id}`).classList.add("redPawn");
    }

    /**
     * Attache un event aux cases que le joueur peut assecher
     * Verifie si une deuxieme case peut etre assechee et que cette competance n'a pas ete utilisee
     */
    actionShoreCell(event, sandBagUsed=false) {
        super.actionShoreCell(event, sandBagUsed, false);
        this.#abilityUsed = !this.#abilityUsed;

        if (!this.#abilityUsed && !sandBagUsed) {
            this.currentGameCell.detectNeighbors();
            const floodedNeighbors = this.currentGameCell.floodedNeighbors;
            if (floodedNeighbors.length > 0) {
                this.actionsLeft++;
                disableButtons();
                for (const floodedCell of floodedNeighbors) {
                    floodedCell.cellElement.addEventListener("click", shoreCell)
                }
            }
            else {
                this.#abilityUsed = true;
                updateActionsMenu();
            }
        }
        else {
            updateActionsMenu();
        }
    }
}