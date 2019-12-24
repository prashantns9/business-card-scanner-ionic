import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FieldResolverComponent } from './field-resolver.component';

describe('FieldResolverComponent', () => {
  let component: FieldResolverComponent;
  let fixture: ComponentFixture<FieldResolverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldResolverComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FieldResolverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
