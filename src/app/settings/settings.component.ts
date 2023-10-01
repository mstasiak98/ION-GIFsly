import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {SettingsService} from "../shared/data-access/settings/settings.service";
import {PopoverController} from "@ionic/angular";
import {Settings} from "../shared/models";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent  implements OnInit {

  settingsForm = this.fb.nonNullable.group<Settings>({
    sort: 'new',
    perPage: 10,
  });

  constructor(private fb: FormBuilder, public settingsService: SettingsService, public popoverCtrl: PopoverController) { }

  ngOnInit() {
    this.settingsForm.patchValue(this.settingsService.getSettings());
  }

  handleSave() {
    this.settingsService.save(this.settingsForm.getRawValue());
    this.popoverCtrl.dismiss();
  }

}
