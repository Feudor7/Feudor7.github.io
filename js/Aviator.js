"use strict";
/**
 * Projet : Ile interdite
 * Desc : Classe du metier Pilote
 *          Sa comptence est de ce deplacer sans restriction sur l'ile
 * Author : Fedor BTSK
 * Date : 16.05.2024
 */
import Player from "./Player.js";
import {TILES_ID, movePlayer, updateActionsMenu } from "./gameFunctions.js";

export default class Aviator extends Player{
    constructor(name = "Pilot", startingCell = TILES_ID.helicopter) {
        super(name, startingCell, "Pilot", "darkblue");
        document.querySelector(`#player${this.id}`).classList.add("bluePawn");
    }

    move(targetCell) {
        if (this.currentHtmlCell !== targetCell) {
            const image = document.querySelector(`#player${this.id}`);
            targetCell.querySelector(".playerZone").appendChild(image);
            this.currentHtmlCell = targetCell;
            this.actionsLeft--;
        }
        for (const cell of document.querySelectorAll(".cell")) {
            cell.removeEventListener("click", movePlayer);
        }
        updateActionsMenu();
    }
}