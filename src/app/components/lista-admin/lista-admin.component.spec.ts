import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaAdminComponent } from './lista-admin.component';

describe('ListaAdminComponent', () => {
  let component: ListaAdminComponent;
  let fixture: ComponentFixture<ListaAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListaAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
