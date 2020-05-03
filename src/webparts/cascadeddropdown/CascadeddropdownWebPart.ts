import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart, PropertyPaneDropdown, IPropertyPaneAccessor } from '@microsoft/sp-webpart-base';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  IPropertyPaneDropdownOption
} from '@microsoft/sp-property-pane';

import * as strings from 'CascadeddropdownWebPartStrings';
import Cascadeddropdown from './components/Cascadeddropdown';
import { ICascadeddropdownProps } from './components/ICascadeddropdownProps';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { SPOperations } from './service/SPOperations';


export interface ICascadeddropdownWebPartProps {
  description: string;
  selectedList: string;
  selectedItem: string;
}

export default class CascadeddropdownWebPart extends BaseClientSideWebPart<ICascadeddropdownWebPartProps> {

  private listOptions: IPropertyPaneDropdownOption[] = [];
  private itemOptions: IPropertyPaneDropdownOption[] = [];
  private oSPOperations : SPOperations;
  public render(): void {
    this.oSPOperations = new SPOperations();
    if (!this.context.propertyPane.isPropertyPaneOpen() && this.properties.selectedList === undefined) {
      this.context.propertyPane.open();
    }

    const element: React.ReactElement<ICascadeddropdownProps> = React.createElement(
      Cascadeddropdown,
      {
        description: this.properties.description,
        selectedList: this.properties.selectedList,
        selectedItem: this.properties.selectedItem
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onPropertyPaneConfigurationStart(): void {
    if (this.listOptions.length === 0) {
      this.getAllLists().then((allLists) => {
        this.listOptions = allLists;
        this.context.propertyPane.refresh();
        return this.getItems();
      }).then((itemOptions: IPropertyPaneDropdownOption[]) => {
        this.itemOptions = itemOptions;
        this.context.propertyPane.refresh();
        this.render();
      });
    }
  }

  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {
    if (propertyPath === "selectedList") {
      super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
      this.getItems().then((itemOptions) => {
        this.itemOptions = itemOptions;
        this.render();
        // refresh the item selector control by repainting the property pane
        this.context.propertyPane.refresh();
      });
    }
  }

  private getItems(): Promise<IPropertyPaneDropdownOption[]> {
    let itemOptions: IPropertyPaneDropdownOption[] = [];

    return this.oSPOperations.getOperations(`${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbyid('${this.properties.selectedList}')/items?$select=Id,Title`, this.context.spHttpClient).then((listItems) => {
      listItems.result.results.forEach(item => {
        itemOptions.push({
          key: `${item.Id}#${item.Title}`,
          text: item.Title
        });
      });

      return Promise.resolve(itemOptions);
    });
  }

  private getAllLists(): Promise<IPropertyPaneDropdownOption[]> {
    let listOptions: IPropertyPaneDropdownOption[] = [];
    try {
      return this.oSPOperations.getOperations(`${this.context.pageContext.web.absoluteUrl}/_api/web/lists?$select=Id,Title&$filter=hidden eq false`, this.context.spHttpClient).then((allLists) => {
        allLists.result.results.forEach(list => {
          listOptions.push({
            key: list.Id,
            text: list.Title
          });
        });
        return Promise.resolve(listOptions);
      });
    } catch (error) {
      console.error(error);
    }
  }


  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                }),
                PropertyPaneDropdown('selectedList', {
                  label: `Please select list`,
                  options: this.listOptions
                }),
                PropertyPaneDropdown('selectedItem', {
                  label: `Please select Item`,
                  options: this.itemOptions
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
