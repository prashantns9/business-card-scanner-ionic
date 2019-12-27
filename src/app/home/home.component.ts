import { Component } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Platform, LoadingController, PopoverController, ToastController } from '@ionic/angular';
import { PreprocessorService } from '../shared/services/preprocessor.service';
import { ContactCandidateClass, ContactClass } from '../shared/models/contact';
import { OcrService } from '../shared/services/ocr.service';
import { FieldResolverComponent } from './field-resolver/field-resolver.component';
import { Contacts, Contact, ContactField, ContactName, ContactOrganization } from '@ionic-native/contacts/ngx';


@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
})
export class HomePage {

  contactCandidates: ContactCandidateClass = new ContactCandidateClass();
  contactData: ContactClass = new ContactClass();

  showForm: boolean = false;

  camOptions: CameraOptions = {
    quality: 50,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE
  }

  constructor(
    private camera: Camera,
    public platform: Platform,
    public loadingController: LoadingController,
    private toastCtrl: ToastController,
    public popoverController: PopoverController,
    private preprocessorService: PreprocessorService,
    private ocrService: OcrService,
    private contacts: Contacts
  ) { }

  prefillContactData() {
    this.contactData.name = this.contactCandidates.nameCandidates.length ? this.contactCandidates.nameCandidates[0] : '';
    this.contactData.phone = this.contactCandidates.phoneCandidates.length ? this.contactCandidates.phoneCandidates[0] : '';
    this.contactData.company = this.contactCandidates.companyCandidates.length ? this.contactCandidates.companyCandidates[0] : '';
    this.contactData.email = this.contactCandidates.emailCandidates.length ? this.contactCandidates.emailCandidates[0] : '';
    this.contactData.website = this.contactCandidates.websiteCandidates.length ? this.contactCandidates.websiteCandidates[0] : '';
  }

  async resolveField(field: string) {
    if (Object.keys(this.contactData).includes(field) && this.contactCandidates[field + 'Candidates'].length) {
      const popover = await this.popoverController.create({
        component: FieldResolverComponent,
        componentProps: {
          options: this.contactCandidates[field + 'Candidates']
        }
      });
      await popover.present();
      popover.onDidDismiss().then(res => {
        this.contactData[field] = res.data ? res.data.choice : this.contactData[field];
      });
    }
  }

  async showToastMessage(msg) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

  saveContact() {
    let contact: Contact = this.contacts.create();
    contact.name = new ContactName(null, this.contactData.name, '');
    contact.phoneNumbers = [new ContactField('mobile', this.contactData.phone)];
    contact.emails = [new ContactField('work', this.contactData.email)];
    contact.organizations = [new ContactOrganization('work', this.contactData.company)];
    contact.save().then(
      () => {
        this.showForm = false;
        this.showToastMessage('Contact saved!!')
      },
      (error: any) => this.showToastMessage('Error saving contact.')
    );
  }

  async getImageFromCamera() {
    const loading = await this.loadingController.create({
      message: 'Getting image',
    });
    await loading.present();
    this.platform.ready()
      .then(() => {
        // click picture
        if (this.platform.is('cordova')) {
          return this.camera.getPicture(this.camOptions)
        }
        return new Promise((resolve, reject) => reject('Platform error!!'));
      })
      .then((imageData) => {
        // add default filters
        loading.message = 'Preprocessing Image';
        imageData = 'data:image/jpeg;base64,' + imageData;
        return this.preprocessorService.preprocessImage(imageData);
      })
      .then(processedImage => {
        // run ocr
        loading.message = 'Recognizing text';
        return this.ocrService.getContactData(processedImage);
      })
      .then(c => {
        // show form
        loading.message = 'Loading contact';
        this.contactCandidates = <ContactCandidateClass>c;
        this.prefillContactData();
        this.showForm = true;
        loading.dismiss();
      })
      .catch(err => {
        console.error(err);
        loading.dismiss();
      });
  }

  async getImageFromFiles(e) {
    const loading = await this.loadingController.create({
      message: 'Reading file',
    });
    await loading.present();
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      loading.message = 'preprocessing image'
      this.preprocessorService.preprocessImage(reader.result)
        .then(processedImage => {
          loading.message = 'Recognizing text';
          return this.ocrService.getContactData(processedImage)
        })
        .then(result => {
          loading.message = 'Loading contact';
          this.contactCandidates = <ContactCandidateClass>result;
          this.prefillContactData();
          this.showForm = true;
          loading.dismiss();
        })
        .catch(err => {
          console.error(err);
          loading.dismiss();
        });
    }
  }
}
