/// <reference path="binary-reader.ts"/>
/// <reference path="../error-handler.ts"/>

module Lemmings {

  /**
  * Handle Files loading from remote/web
  */
  export class FileProvider {

    private _errorHandler: ErrorHandler = new ErrorHandler("FileProvider");


    constructor(private rootPath:string) {

    }

    /** load binary data from URL: rootPath + [path] + filename */
    public loadBinary(path:string, filename: string=null): Promise<BinaryReader> {


      let url = this.rootPath +"/"+ path + ((filename==null)? "" : "/"+ filename);

      this._errorHandler.debug("loading:"+ url);

      return new Promise( (resolve, reject) => {
        var xhr = new XMLHttpRequest();

        xhr.onload = () => {

          if (xhr.status >= 200 && xhr.status < 300) {
            let reader = new BinaryReader(xhr.response, 0, null, this.filenameFormUrl(url));
            resolve(reader);

          } else {

            this._errorHandler.log("error load file:"+ url);
            reject({ status: xhr.status, statusText: xhr.statusText });
          }
        };


        xhr.onerror = () => {
          this._errorHandler.log("error load file:"+ url);
          reject({ status: xhr.status, statusText: xhr.statusText });
        };

        xhr.open("GET", url);
        xhr.responseType = "arraybuffer";

        xhr.send();
      });
    }


    /** load string data from URL */
    public loadString(url: string): Promise<string> {

      this._errorHandler.log("Load file as string: " + url);

      return new Promise((resolve, reject) => {

        let xhr = new XMLHttpRequest();

        xhr.onload  = (oEvent) => {
            resolve(xhr.response);
        }

        xhr.onerror = () => {
           this._errorHandler.log("error load file:"+ url);
           reject({ status: xhr.status, statusText: xhr.statusText });
        }

        /// setup query
        xhr.open('GET', url, true);
        xhr.responseType = "text";
      

        /// call url
        xhr.send(null);
      });
    }


    // Extract filename form URL
    private filenameFormUrl(url: string): string {
      if (url == "") return "";

      url = url.substring(0, (url.indexOf("#") == -1) ? url.length : url.indexOf("#"));
      url = url.substring(0, (url.indexOf("?") == -1) ? url.length : url.indexOf("?"));
      url = url.substring(url.lastIndexOf("/") + 1, url.length);

      return url;
    }

  }
}