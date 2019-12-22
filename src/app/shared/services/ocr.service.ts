import { Injectable } from '@angular/core';
import * as Tesseract from 'tesseract.js';
import { Contact } from '../models/contact';

@Injectable({
  providedIn: 'root'
})
export class OcrService {
  lines: Array<any>;
  contactInfo: Contact = new Contact();
  validCharactersPattern = new RegExp(/[^a-zA-Z0-9@:/+. ]/g)
  websitePattern = new RegExp(/(https?:\/\/)?(www\.)[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g);
  emailPattern = new RegExp(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g);
  phoneNumberPattern = new RegExp(/(\+?( |-|\.)?\d{1,2}( |-|\.)?)?(\(?\d{3}\)?|\d{3})( |-|\.)?(\d{3}( |-|\.)?\d{4})/g);
  constructor() { }

  sanitizeLines() {
    this.lines.forEach((line, i) => {
      if (line.text) {
        this.lines[i].text = line.text.replace(this.validCharactersPattern, ' ').toLowerCase().trim();
        if (!this.lines[i].text) this.lines.splice(i, 1);
      }
    });
  }

  findWebsite() {
    this.lines.forEach((line, i) => {
      if (line.text) {
        if (this.websitePattern.test(line.text)) {
          this.contactInfo.website = (line.text.match(this.websitePattern))[0];
          this.lines[i].text = line.text.replace(this.websitePattern, ' ').trim();
          if (!this.lines[i].text) this.lines.splice(i, 1);
          return;
        }
      }
    });
  }

  findEmail() {
    this.lines.forEach((line, i) => {
      if (line.text) {
        if (this.emailPattern.test(line.text)) {
          this.contactInfo.email = line.text.match(this.emailPattern)[0];
          this.lines[i].text = line.text.replace(this.emailPattern, ' ').trim();
          if (!this.lines[i].text) this.lines.splice(i, 1);
          return;
        }
      }
    });
  }

  findPhoneNumber() {
    this.lines.forEach((line, i) => {
      if (line.text) {
        if (this.phoneNumberPattern.test(line.text.replace(/ /g, ''))) {
          this.contactInfo.phoneNumber = line.text.replace(/ /g, '').match(this.phoneNumberPattern)[0];
          return;
        }
      }
    });
  }

  getContactData(image) {
    return new Promise((resolve, reject) => {
      this.contactInfo = new Contact();
      Tesseract.recognize(image)
        .progress(message => { })
        .catch(err => reject(err))
        .then(result => {
          this.lines = result.lines;
          this.sanitizeLines();
          this.findWebsite();
          this.findEmail();
          this.findPhoneNumber();
          resolve(this.contactInfo);
        });
    });
  }
}