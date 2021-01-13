/** handel error logging */
export class LogHandler {
  private _moduleName: string;

  constructor(moduleName: string) {
    this._moduleName = moduleName;
  }

  /** log an error */
  public log(msg: string, exeption?: Error) {
    console.log(this._moduleName + "\t" + msg);

    if (exeption) {
      console.log(this._moduleName + "\t" + exeption.message);
    }
  }

  /** write a debug message. If [msg] is not a String it is displayed: as {prop:value} */
  public debug(msg: string | object) {

    if (typeof msg === 'string') {
      console.log(this._moduleName + "\t" + msg);
    }
    else {
      console.dir(msg);
    }
  }

}


