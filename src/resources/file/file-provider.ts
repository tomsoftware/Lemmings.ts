import { LogHandler } from '@/game/utilities/log-handler';
import { BinaryReader } from './binary-reader';

/**
* Handle Files loading from remote/web
*/
export class FileProvider {

  private log: LogHandler = new LogHandler('FileProvider');


  constructor(private rootPath: string) {

  }

  private createFullUrl(path: string, fileName?: string) {

    return this.rootPath + (path ? '/' + path : '') + (fileName ? '/' + fileName : '');
  }


  /** load binary data from URL: rootPath + [path] + filename */
  public loadBinary(path: string, filename?: string): Promise<BinaryReader> {

    const url = this.createFullUrl(path, filename);

    this.log.debug('loading:' + url);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.onload = () => {

        if (xhr.status >= 200 && xhr.status < 300) {
          const reader = new BinaryReader(xhr.response, 0, null, this.fileNameFormUrl(url));
          resolve(reader);

        } else {

          this.log.log('error load file:' + url);
          reject({ status: xhr.status, statusText: xhr.statusText });
        }
      };


      xhr.onerror = () => {
        this.log.log('error load file:' + url);
        reject({ status: xhr.status, statusText: xhr.statusText });
      };

      xhr.open('GET', url);
      xhr.responseType = 'arraybuffer';

      xhr.send();
    });
  }


  /** load string data from URL */
  public loadString(path: string, filename?: string): Promise<string> {

    const url = this.createFullUrl(path, filename);

    this.log.log('Load file as string: ' + url);

    return new Promise((resolve, reject) => {

      const xhr = new XMLHttpRequest();

      xhr.onload = () => {
        resolve(xhr.response);
      }

      xhr.onerror = () => {
        this.log.log('error load file:' + url);
        reject({ status: xhr.status, statusText: xhr.statusText });
      }

      /// setup query
      xhr.open('GET', url, true);
      xhr.responseType = 'text';


      /// call url
      xhr.send(null);
    });
  }


  // Extract filename form URL
  private fileNameFormUrl(url: string): string {
    if (url == '') return '';

    url = url.substring(0, (url.indexOf('#') == -1) ? url.length : url.indexOf('#'));
    url = url.substring(0, (url.indexOf('?') == -1) ? url.length : url.indexOf('?'));
    url = url.substring(url.lastIndexOf('/') + 1, url.length);

    return url;
  }

}
