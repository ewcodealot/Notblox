import { ClientMessageType } from "@shared/network/client/base";
import { InputMessage } from "@shared/network/client/input";
import { WebSocketManager } from "./WebsocketManager";

export class InputManager {
  private readonly inputState: InputMessage = {
    t: ClientMessageType.INPUT,
    up: false,
    down: false,
    left: false,
    right: false,
    space: false,
  };

  constructor(private webSocketManager: WebSocketManager) {
    // Add event listeners to handle user input
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keyup", this.handleKeyUp.bind(this));
  }
  private handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowUp":
      case "Z":
        this.inputState.up = true;
        break;
      case "ArrowDown":
      case "S":
        this.inputState.down = true;
        break;
      case "ArrowLeft":
      case "Q":
        this.inputState.left = true;
        break;
      case "ArrowRight":
      case "D":
        this.inputState.right = true;
        break;
      case " ":
        this.inputState.space = true;
        break;
    }
  }

  private handleKeyUp(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowUp":
      case "Z":
        this.inputState.up = false;
        break;
      case "ArrowDown":
      case "S":
        this.inputState.down = false;
        break;
      case "ArrowLeft":
      case "Q":
        this.inputState.left = false;
        break;
      case "ArrowRight":
      case "D":
        this.inputState.right = false;
        break;
      case " ":
        this.inputState.space = false;
        break;
    }
  }

  public sendInput() {
    // Send the updated input state to the WebSocketManager
    this.webSocketManager.send(this.inputState);
  }
}