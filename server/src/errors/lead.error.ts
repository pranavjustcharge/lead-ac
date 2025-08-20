//custom invalid email error class
import { messages } from "../constants/message";
export class InvalidEmailError extends Error {
  constructor() {
    super(messages.invalidEmail);
    this.name = "InvalidEmailError";
    Object.setPrototypeOf(this, InvalidEmailError.prototype);
  }
}

export class InvalidPhoneError extends Error {
  constructor() {
    super(messages.invalidPhone);
    this.name = "InvalidPhoneError";
    Object.setPrototypeOf(this, InvalidPhoneError.prototype);
  }
}
