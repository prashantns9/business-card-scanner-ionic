import { Component } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Platform } from '@ionic/angular';
import { PreprocessorService } from '../shared/services/preprocessor.service';
import { Contact } from '../shared/models/contact';
import { OcrService } from '../shared/services/ocr.service';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  errMsg = 'default';
  showProgress: boolean = false;
  loadingMsg: string = 'Loading';
  customMsg: any = 'default';
  selectedImage: any;
  contactInfo: Contact = new Contact();
  camOptions: CameraOptions = {
    quality: 100,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE
  }
  constructor(
    private camera: Camera,
    public platform: Platform,
    private preprocessorService: PreprocessorService,
    private ocrService: OcrService
  ) { }

  getImageFromCamera() {
    this.showProgress = true;
    this.platform.ready().then(() => {
      this.loadingMsg = "Loading Image";
      if (this.platform.is('cordova')) {
        this.camera.getPicture(this.camOptions).then((imageData) => {
          this.loadingMsg = "Preprocessing Image";
          this.selectedImage = 'data:image/jpeg;base64,' + imageData;
          this.preprocessorService.preprocessImage(this.selectedImage).then(processedImage => {
            this.selectedImage = processedImage;
            this.loadingMsg = "Recognizing Text";
            this.ocrService.getContactData(this.selectedImage).then(result => {
              this.customMsg = result;
              this.showProgress = false;
            });
          });
        }).catch(err => this.errMsg = err).finally(() => (this.showProgress = false));
      }
    })
  }


  getImageFromFiles(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.selectedImage = reader.result;
      this.preprocessorService.preprocessImage(this.selectedImage).then(processedImage => {
        this.selectedImage = processedImage;
        this.ocrService.getContactData(this.selectedImage).then(result => {
          this.customMsg = result;
          console.log(result);
        }).catch(err => this.errMsg = err).finally(() => this.showProgress = false);
      });
    }
  }

}
