"use strict";
import { gameGrid } from "./gameFunctions.js";
export default class Cell {
    #position;

    get cellElement() {
        return document.querySelector(`#cell${this.#position.x}${this.#position.y}`);
    }

    #neighbors;
    #floodedNeighbors;
    #allNeighbors;
    #cornerNeighbors;

    waterLevel;

    get allNeighbors() {
        this.detectNeighbors();
        return this.#allNeighbors
    }
    get cornerNeighbors() { return this.#cornerNeighbors }
    get neighbors() { return this.#neighbors }
    get floodedNeighbors() { return this.#floodedNeighbors }

    constructor(x, y, waterLevel = 0) {
        this.#position = { x: y, y: x };

        this.#neighbors = [];
        this.#floodedNeighbors = [];
        this.#allNeighbors = [];

        this.waterLevel = waterLevel;
    }

    detectNeighbors() {
        this.#neighbors = [];
        this.#floodedNeighbors = [];
        this.#allNeighbors = [];
        this.#cornerNeighbors = [];

        for (let stepY = -1; stepY <= 1; stepY++) {
            for (let stepX = -1; stepX <= 1; stepX++) {
                let neighborY = this.#position.x + stepX;
                let neighborX = this.#position.y + stepY;
                
                if (neighborX >= 0 && neighborX <= 5 && neighborY >= 0 && neighborY <= 5) {
                    let neighbor = gameGrid[neighborY][neighborX];

                    if (Math.abs(stepX) + Math.abs(stepY) <= 1) {
                        this.addNeighbor(neighbor);
                    }
                    else {
                        if (neighbor.waterLevel !== 3) {
                            this.#cornerNeighbors.push(neighbor)
                        }
                    }
                }
            }
        }

    }

    addNeighbor(neighbor) {
        if (neighbor.waterLevel !== 3) {
            this.#allNeighbors.push(neighbor);
            if (neighbor.waterLevel !== 2) {
                this.#neighbors.push(neighbor);

                if (neighbor.waterLevel === 1) {
                    this.#floodedNeighbors.push(neighbor);
                }
            }
        }
    }

    increaseWaterLevel() {
        let cell = document.querySelector(`#cell${this.#position.x}${this.#position.y}`);
        if (this.waterLevel === 0) {
            cell.querySelector("img").style.opacity = "0.7";
            this.waterLevel = 1;
            cell.querySelector("img").classList.add("flodded");
        }
        else {
            cell.querySelector("img").style.opacity = "0.0";
            cell.querySelector("img").classList.remove("cell", "flodded");
            this.waterLevel = 2;
        }
    }

    decreaseWaterLevel() {
        let cell = document.querySelector(`#cell${this.#position.x}${this.#position.y}`);

        cell.querySelector("img").style.opacity = "1";
        this.waterLevel = 0;
    }
}