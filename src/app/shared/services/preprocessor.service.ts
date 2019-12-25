import { Injectable } from '@angular/core';
import * as Jimp from 'jimp';
@Injectable({
  providedIn: 'root'
})
export class PreprocessorService {

  constructor() { }

  preprocessImage(inputImage) {
    return new Promise((resolve, reject) => {
      Jimp.read(inputImage).then((img) => {
        img.greyscale().contrast(0.5).getBase64(Jimp.MIME_JPEG, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data)
          }
        });
      }).catch(err => reject(err));
    });
  }
}
