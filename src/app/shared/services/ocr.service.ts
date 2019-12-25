import { Injectable } from '@angular/core';
import { Tesseract } from 'tesseract.ts';
import { ContactCandidateClass } from '../models/contact';

@Injectable({
  providedIn: 'root'
})
export class OcrService {
  lines: Array<any>;
  contactInfo: ContactCandidateClass = new ContactCandidateClass();
  validCharactersPattern = new RegExp(/[^a-zA-Z0-9@:/+. ]/g)
  websitePattern = new RegExp(/(https?:\/\/)?(www\.)[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g);
  emailPattern = new RegExp(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g);
  phoneNumberPattern = new RegExp(/(\+?( |-|\.)?\d{1,2}( |-|\.)?)?(\(?\d{3}\)?|\d{3})( |-|\.)?(\d{3}( |-|\.)?\d{4})/g);
  constructor() { }

  sanitizeLines() {
    this.lines.forEach((line, i) => {
      if (line.text) {
        // replace illegal characters with space
        this.lines[i].text = line.text.replace(this.validCharactersPattern, ' ').toLowerCase().trim();
        if (!this.lines[i].text) this.lines.splice(i, 1);
      }
    });
  }


  findWebsite() {
    this.lines.forEach((line, i) => {
      if (line.text) {
        if (this.websitePattern.test(line.text)) {
          //find matches for website pattern
          const websitesInCurrLine = line.text.match(this.websitePattern);
          //add all matches to website candidates
          if (websitesInCurrLine.length) {
            this.contactInfo.websiteCandidates = this.contactInfo.websiteCandidates.concat(websitesInCurrLine);
          }
          //remove website from line
          this.lines[i].text = line.text.replace(this.websitePattern, ' ').trim();
          //remove if line is empty
          if (!this.lines[i].text) {
            this.lines.splice(i, 1);
          }
        }
      }
    });
  }

  findEmail() {
    this.lines.forEach((line, i) => {
      if (line.text) {
        if (this.emailPattern.test(line.text)) {
          //find matches for email pattern
          let emailsInCurrLine = line.text.match(this.emailPattern);
          //add all matches to email candidates
          if (emailsInCurrLine.length) {
            this.contactInfo.emailCandidates = this.contactInfo.emailCandidates.concat(emailsInCurrLine);
          }
          //remove emails from current line
          this.lines[i].text = line.text.replace(this.emailPattern, ' ').trim();
          if (!this.lines[i].text) {
            this.lines.splice(i, 1);
          }
        }
      }
    });
  }

  findPhoneNumber() {
    this.lines.forEach((line, i) => {
      if (line.text) {
        if (this.phoneNumberPattern.test(line.text.replace(/ /g, ''))) {
          //find matches for phone number pattern
          let phonesInCurrLine = line.text.replace(/ /g, '').match(this.phoneNumberPattern);
          //add all matches to phone candidates
          if (phonesInCurrLine.length) {
            this.contactInfo.phoneCandidates = this.contactInfo.phoneCandidates.concat(phonesInCurrLine);
          }
          //remove phone from line
          this.lines[i].text = line.text.replace(/ /g, '').replace(this.phoneNumberPattern, ' ').trim();
          if (!this.lines[i].text) {
            this.lines.splice(i, 1);
          }
        }
      }
    });
  }

  getContactData(image) {
    return new Promise((resolve, reject) => {
      this.contactInfo = new ContactCandidateClass();
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