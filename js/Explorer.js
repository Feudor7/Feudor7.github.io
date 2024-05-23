"use strict";
/**
 * Projet : Ile interdite
 * Desc : Classe du metier Explorateur
 *          Sa competance est de pouvoir se deplacer ou assecher les cases en diagonale
 * Author : Fedor BTSK
 * Date : 16.05.2024
 */
import Player from "./Player.js";
import {TILES_ID, movePlayer, btnShore, updateActionsMenu, shoreCell } from "./gameFunctions.js";

export default class Explorer extends Player {
    constructor(name = "Explorer", startingCell = TILES_ID.ironGate) {
        super(name, startingCell, "Explorer", "green");
        document.querySelector(`#player${this.id}`).classList.add("greenPawn");
    }

    /**
     * Attache un event aux cases que le joueur peut assecher
     * Ajoute les cases en diagonale par rapport a la methode de base
     */
    actionShore() {
        super.actionShore()

        for (const cornerCell of this.currentGameCell.cornerNeighbors) {
            if (cornerCell.waterLevel > 0) {
                cornerCell.cellElement.addEventListener("click", shoreCell)
            }
        }
    }

    /**
     * Verifie si les cases en diagonale sont innonde
     */
    checkAditionalActions() {
        let hasflodedCorner = false;
        for (const cornerCell of this.currentGameCell.cornerNeighbors) {
            if (cornerCell.waterLevel > 0) {
                hasflodedCorner = true;
                break;
            }
        }

        btnShore.disabled = btnShore.disabled && !hasflodedCorner;
    }

    /**
     * Deplacement aussi possible en diagonnale
     * @param {*} targetCell 
     */
    move(targetCell) {
        let distanceX = Math.abs(this.currentHtmlCell.id[4] - targetCell.id[4]);
        let distanceY = Math.abs(this.currentHtmlCell.id[5] - targetCell.id[5]);

        if (distanceX  <= 1 && distanceY <= 1) {
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
}